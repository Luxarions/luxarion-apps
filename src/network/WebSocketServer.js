/**
 * LXRN WebSocketServer Module
 * @namespace LXRN.WebSocketServer
 * @author LXRN
 */

const WebSocket = require('ws');
const EventEmitter = require('events');
const HTTP = require('http');

/**
 * WebSocket Server
 * @class WebSocketServer
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter {
  #server = null;
  #httpServer = null;
  #clients = new Set();
  #listening = false;
  #port = 0;
  #host = '';
  #path = '/';
  #maxPayload = 100 * 1024 * 1024; // 100MB
  #perMessageDeflate = true;
  #clientTracking = true;
  #pingInterval = 30000;
  #pingTimeout = 5000;
  #pingTimer = null;
  #connections = [];
  #connectionIdCounter = 0;
  #verifyClient = null;
  #handleProtocols = null;

  /**
   * Start listening
   * @param {number} port - Port to listen on
   * @param {string} host - Host to bind to
   * @param {Object} options - Server options
   * @returns {Promise<void>}
   */
  listen(port, host = '0.0.0.0', options = {}) {
    this.#port = port;
    this.#host = host;
    
    return new Promise((resolve, reject) => {
      try {
        this.#httpServer = HTTP.createServer();
        
        const wsOptions = {
          server: this.#httpServer,
          path: this.#path,
          maxPayload: this.#maxPayload,
          perMessageDeflate: this.#perMessageDeflate,
          clientTracking: this.#clientTracking,
          verifyClient: this.#verifyClient,
          handleProtocols: this.#handleProtocols,
          ...options,
        };
        
        this.#server = new WebSocket.Server(wsOptions);
        
        this.#server.on('connection', (ws, request) => {
          this.__handleConnection(ws, request);
        });
        
        this.#server.on('error', (error) => {
          this.emit('error', error);
        });
        
        this.#server.on('close', () => {
          this.#listening = false;
          this.__stopPing();
          this.emit('close');
        });
        
        this.#httpServer.listen(port, host, () => {
          this.#listening = true;
          this.__startPing();
          this.emit('listening', port, host);
          resolve();
        });
        
        this.#httpServer.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(new Error(`WebSocket server failed: ${error.message}`));
      }
    });
  }

  /**
   * Handle connection
   * @private
   * @param {WebSocket} ws - WebSocket connection
   * @param {http.IncomingMessage} request - HTTP request
   */
  __handleConnection(ws, request) {
    const clientId = ++this.#connectionIdCounter;
    const client = {
      id: clientId,
      ws: ws,
      request: request,
      connected: true,
      ip: request.connection.remoteAddress || request.socket.remoteAddress,
      headers: request.headers,
      lastPong: Date.now(),
      data: {},
      url: request.url,
    };
    
    this.#clients.add(client);
    this.#connections.push(client);
    
    ws.on('message', (data) => {
      this.emit('message', client, data);
    });
    
    ws.on('close', (code, reason) => {
      client.connected = false;
      this.#clients.delete(client);
      this.emit('close', client, code, reason.toString());
    });
    
    ws.on('error', (error) => {
      this.emit('error', error);
    });
    
    ws.on('pong', () => {
      client.lastPong = Date.now();
    });
    
    this.emit('connection', client);
  }

  /**
   * Start ping interval
   * @private
   */
  __startPing() {
    this.__stopPing();
    this.#pingTimer = setInterval(() => {
      const now = Date.now();
      for (const client of this.#clients) {
        if (now - client.lastPong > this.#pingInterval + this.#pingTimeout) {
          try {
            client.ws.terminate();
          } catch (error) {
            // Ignore
          }
          this.#clients.delete(client);
          this.emit('timeout', client);
        } else {
          try {
            client.ws.ping();
          } catch (error) {
            // Ignore
          }
        }
      }
    }, this.#pingInterval);
  }

  /**
   * Stop ping interval
   * @private
   */
  __stopPing() {
    if (this.#pingTimer) {
      clearInterval(this.#pingTimer);
      this.#pingTimer = null;
    }
  }

  /**
   * Send to all clients
   * @param {string|Buffer|Uint8Array|ArrayBuffer} data - Data to send
   * @param {Function} filter - Filter function
   * @returns {number}
   */
  broadcast(data, filter = null) {
    let count = 0;
    for (const client of this.#clients) {
      if (filter && !filter(client)) continue;
      try {
        client.ws.send(data);
        count++;
      } catch (error) {
        // Ignore
      }
    }
    return count;
  }

  /**
   * Send JSON to all clients
   * @param {Object} data - JSON data
   * @param {Function} filter - Filter function
   * @returns {number}
   */
  broadcastJSON(data, filter = null) {
    return this.broadcast(JSON.stringify(data), filter);
  }

  /**
   * Send to client
   * @param {number} clientId - Client ID
   * @param {string|Buffer} data - Data to send
   * @returns {boolean}
   */
  sendTo(clientId, data) {
    for (const client of this.#clients) {
      if (client.id === clientId) {
        try {
          client.ws.send(data);
          return true;
        } catch (error) {
          return false;
        }
      }
    }
    return false;
  }

  /**
   * Send JSON to client
   * @param {number} clientId - Client ID
   * @param {Object} data - JSON data
   * @returns {boolean}
   */
  sendJSONTo(clientId, data) {
    return this.sendTo(clientId, JSON.stringify(data));
  }

  /**
   * Get client by ID
   * @param {number} clientId - Client ID
   * @returns {Object|null}
   */
  getClient(clientId) {
    for (const client of this.#clients) {
      if (client.id === clientId) {
        return client;
      }
    }
    return null;
  }

  /**
   * Get all clients
   * @returns {Array}
   */
  getClients() {
    return Array.from(this.#clients);
  }

  /**
   * Get connected clients count
   * @returns {number}
   */
  getClientCount() {
    return this.#clients.size;
  }

  /**
   * Close client connection
   * @param {number} clientId - Client ID
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   * @returns {boolean}
   */
  closeClient(clientId, code = 1000, reason = '') {
    for (const client of this.#clients) {
      if (client.id === clientId) {
        try {
          client.ws.close(code, reason);
          return true;
        } catch (error) {
          return false;
        }
      }
    }
    return false;
  }

  /**
   * Stop server
   */
  close() {
    if (this.#server) {
      this.#server.close();
    }
    if (this.#httpServer) {
      this.#httpServer.close();
    }
    this.#listening = false;
    this.__stopPing();
    this.#clients.clear();
  }

  /**
   * Set path
   * @param {string} path - WebSocket path
   * @returns {WebSocketServer} This instance
   */
  setPath(path) {
    this.#path = path;
    return this;
  }

  /**
   * Set max payload
   * @param {number} bytes - Max payload in bytes
   * @returns {WebSocketServer} This instance
   */
  setMaxPayload(bytes) {
    this.#maxPayload = bytes;
    return this;
  }

  /**
   * Enable/disable per-message deflate
   * @param {boolean} enable - Enable deflate
   * @returns {WebSocketServer} This instance
   */
  setPerMessageDeflate(enable) {
    this.#perMessageDeflate = enable;
    return this;
  }

  /**
   * Set ping interval
   * @param {number} interval - Ping interval in ms
   * @param {number} timeout - Ping timeout in ms
   * @returns {WebSocketServer} This instance
   */
  setPingInterval(interval, timeout = 5000) {
    this.#pingInterval = interval;
    this.#pingTimeout = timeout;
    return this;
  }

  /**
   * Set verify client
   * @param {Function} verifyClient - Verify client function
   * @returns {WebSocketServer} This instance
   */
  setVerifyClient(verifyClient) {
    this.#verifyClient = verifyClient;
    return this;
  }

  /**
   * Set handle protocols
   * @param {Function} handleProtocols - Handle protocols function
   * @returns {WebSocketServer} This instance
   */
  setHandleProtocols(handleProtocols) {
    this.#handleProtocols = handleProtocols;
    return this;
  }

  /**
   * Check if listening
   * @returns {boolean}
   */
  get isListening() {
    return this.#listening;
  }

  /**
   * Get port
   * @returns {number}
   */
  get port() {
    return this.#port;
  }

  /**
   * Get host
   * @returns {string}
   */
  get host() {
    return this.#host;
  }

  /**
   * Get path
   * @returns {string}
   */
  get path() {
    return this.#path;
  }

  /**
   * Event: listening
   * @param {Function} callback - Callback
   * @returns {WebSocketServer} This instance
   */
  onListening(callback) {
    this.on('listening', callback);
    return this;
  }

  /**
   * Event: connection
   * @param {Function} callback - Callback
   * @returns {WebSocketServer} This instance
   */
  onConnection(callback) {
    this.on('connection', callback);
    return this;
  }

  /**
   * Event: message
   * @param {Function} callback - Callback
   * @returns {WebSocketServer} This instance
   */
  onMessage(callback) {
    this.on('message', callback);
    return this;
  }

  /**
   * Event: close
   * @param {Function} callback - Callback
   * @returns {WebSocketServer} This instance
   */
  onClose(callback) {
    this.on('close', callback);
    return this;
  }

  /**
   * Event: error
   * @param {Function} callback - Callback
   * @returns {WebSocketServer} This instance
   */
  onError(callback) {
    this.on('error', callback);
    return this;
  }

  /**
   * Event: timeout
   * @param {Function} callback - Callback
   * @returns {WebSocketServer} This instance
   */
  onTimeout(callback) {
    this.on('timeout', callback);
    return this;
  }
}

module.exports = WebSocketServer;
