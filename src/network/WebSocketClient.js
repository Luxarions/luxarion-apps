/**
 * LXRN WebSocketClient Module
 * @namespace LXRN.WebSocketClient
 * @author LXRN
 */

const WebSocket = require('ws');
const EventEmitter = require('events');

/**
 * WebSocket Client
 * @class WebSocketClient
 * @extends EventEmitter
 */
class WebSocketClient extends EventEmitter {
  #ws = null;
  #connected = false;
  #url = '';
  #protocols = [];
  #options = {};
  #reconnect = false;
  #reconnectDelay = 1000;
  #maxReconnectAttempts = 10;
  #reconnectAttempts = 0;
  #pingInterval = null;
  #pingTimeout = 30000;
  #lastPong = Date.now();
  #messageQueue = [];
  #binaryType = 'arraybuffer';
  #maxMessageSize = 1024 * 1024 * 10; // 10MB
  #heartbeatInterval = 30000;
  #heartbeatTimer = null;
  #closeCode = 0;
  #closeReason = '';

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket URL
   * @param {Array} protocols - Subprotocols
   * @param {Object} options - Connection options
   * @returns {Promise<void>}
   */
  connect(url, protocols = [], options = {}) {
    this.#url = url;
    this.#protocols = protocols;
    this.#options = options;
    
    return new Promise((resolve, reject) => {
      try {
        const wsOptions = {
          ...options,
          protocols: protocols,
          maxPayload: this.#maxMessageSize,
        };
        
        this.#ws = new WebSocket(url, protocols, wsOptions);
        this.#ws.binaryType = this.#binaryType;
        
        this.#ws.on('open', () => {
          this.#connected = true;
          this.#reconnectAttempts = 0;
          this.#lastPong = Date.now();
          this.__startHeartbeat();
          this.__startPing();
          this.emit('connected');
          resolve();
        });
        
        this.#ws.on('message', (data) => {
          this.emit('message', data);
        });
        
        this.#ws.on('close', (code, reason) => {
          this.#connected = false;
          this.#closeCode = code;
          this.#closeReason = reason.toString();
          this.__stopHeartbeat();
          this.__stopPing();
          this.emit('disconnected', code, reason.toString());
          
          if (this.#reconnect) {
            this.__reconnect();
          }
        });
        
        this.#ws.on('error', (error) => {
          this.emit('error', error);
          reject(error);
        });
        
        this.#ws.on('ping', (data) => {
          this.__handlePing(data);
        });
        
        this.#ws.on('pong', (data) => {
          this.#lastPong = Date.now();
          this.emit('pong', data);
        });
      } catch (error) {
        reject(new Error(`WebSocket connection failed: ${error.message}`));
      }
    });
  }

  /**
   * Start heartbeat
   * @private
   */
  __startHeartbeat() {
    this.__stopHeartbeat();
    this.#heartbeatTimer = setInterval(() => {
      if (this.#connected && this.#ws) {
        try {
          this.#ws.ping();
        } catch (error) {
          // Ignore
        }
      }
    }, this.#heartbeatInterval);
  }

  /**
   * Stop heartbeat
   * @private
   */
  __stopHeartbeat() {
    if (this.#heartbeatTimer) {
      clearInterval(this.#heartbeatTimer);
      this.#heartbeatTimer = null;
    }
  }

  /**
   * Start ping
   * @private
   */
  __startPing() {
    this.__stopPing();
    this.#pingInterval = setInterval(() => {
      if (this.#connected && this.#ws) {
        if (Date.now() - this.#lastPong > this.#pingTimeout) {
          this.close();
          this.emit('timeout');
          return;
        }
        try {
          this.#ws.ping();
        } catch (error) {
          // Ignore
        }
      }
    }, this.#pingTimeout / 2);
  }

  /**
   * Stop ping
   * @private
   */
  __stopPing() {
    if (this.#pingInterval) {
      clearInterval(this.#pingInterval);
      this.#pingInterval = null;
    }
  }

  /**
   * Handle ping
   * @private
   * @param {Buffer} data - Ping data
   */
  __handlePing(data) {
    try {
      this.#ws.pong(data);
    } catch (error) {
      // Ignore
    }
  }

  /**
   * Reconnect
   * @private
   */
  __reconnect() {
    if (this.#reconnectAttempts >= this.#maxReconnectAttempts) {
      this.emit('reconnect_failed');
      return;
    }
    
    this.#reconnectAttempts++;
    this.emit('reconnecting', this.#reconnectAttempts);
    
    setTimeout(() => {
      this.connect(this.#url, this.#protocols, this.#options)
        .then(() => {
          this.emit('reconnected');
        })
        .catch((error) => {
          this.emit('reconnect_error', error);
        });
    }, this.#reconnectDelay * this.#reconnectAttempts);
  }

  /**
   * Send data
   * @param {string|Buffer|Uint8Array|ArrayBuffer} data - Data to send
   * @returns {boolean}
   */
  send(data) {
    if (!this.#connected || !this.#ws) {
      if (this.#messageQueue.length < 1000) {
        this.#messageQueue.push(data);
      }
      return false;
    }
    
    try {
      this.#ws.send(data);
      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Send JSON data
   * @param {Object} data - JSON data
   * @returns {boolean}
   */
  sendJSON(data) {
    return this.send(JSON.stringify(data));
  }

  /**
   * Close connection
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   */
  close(code = 1000, reason = '') {
    if (this.#ws) {
      try {
        this.#ws.close(code, reason);
      } catch (error) {
        // Ignore
      }
      this.#ws = null;
    }
    this.#connected = false;
    this.__stopHeartbeat();
    this.__stopPing();
  }

  /**
   * Enable auto-reconnect
   * @param {boolean} enable - Enable reconnect
   * @param {number} delay - Reconnect delay in ms
   * @param {number} maxAttempts - Maximum reconnect attempts
   * @returns {WebSocketClient} This instance
   */
  setReconnect(enable, delay = 1000, maxAttempts = 10) {
    this.#reconnect = enable;
    this.#reconnectDelay = delay;
    this.#maxReconnectAttempts = maxAttempts;
    return this;
  }

  /**
   * Set binary type
   * @param {string} type - Binary type ('arraybuffer', 'blob', 'nodebuffer')
   * @returns {WebSocketClient} This instance
   */
  setBinaryType(type) {
    this.#binaryType = type;
    if (this.#ws) {
      this.#ws.binaryType = type;
    }
    return this;
  }

  /**
   * Set ping timeout
   * @param {number} ms - Timeout in milliseconds
   * @returns {WebSocketClient} This instance
   */
  setPingTimeout(ms) {
    this.#pingTimeout = ms;
    return this;
  }

  /**
   * Set heartbeat interval
   * @param {number} ms - Interval in milliseconds
   * @returns {WebSocketClient} This instance
   */
  setHeartbeatInterval(ms) {
    this.#heartbeatInterval = ms;
    return this;
  }

  /**
   * Set max message size
   * @param {number} bytes - Max message size in bytes
   * @returns {WebSocketClient} This instance
   */
  setMaxMessageSize(bytes) {
    this.#maxMessageSize = bytes;
    return this;
  }

  /**
   * Process pending messages
   * @returns {number}
   */
  flushPendingMessages() {
    let count = 0;
    while (this.#messageQueue.length > 0 && this.#connected) {
      const data = this.#messageQueue.shift();
      if (this.send(data)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get pending message count
   * @returns {number}
   */
  getPendingMessageCount() {
    return this.#messageQueue.length;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  get isConnected() {
    return this.#connected;
  }

  /**
   * Get URL
   * @returns {string}
   */
  get url() {
    return this.#url;
  }

  /**
   * Get protocols
   * @returns {Array}
   */
  get protocols() {
    return this.#protocols;
  }

  /**
   * Get close code
   * @returns {number}
   */
  get closeCode() {
    return this.#closeCode;
  }

  /**
   * Get close reason
   * @returns {string}
   */
  get closeReason() {
    return this.#closeReason;
  }

  /**
   * Event: connected
   * @param {Function} callback - Callback
   * @returns {WebSocketClient} This instance
   */
  onConnected(callback) {
    this.on('connected', callback);
    return this;
  }

  /**
   * Event: disconnected
   * @param {Function} callback - Callback
   * @returns {WebSocketClient} This instance
   */
  onDisconnected(callback) {
    this.on('disconnected', callback);
    return this;
  }

  /**
   * Event: message
   * @param {Function} callback - Callback
   * @returns {WebSocketClient} This instance
   */
  onMessage(callback) {
    this.on('message', callback);
    return this;
  }

  /**
   * Event: error
   * @param {Function} callback - Callback
   * @returns {WebSocketClient} This instance
   */
  onError(callback) {
    this.on('error', callback);
    return this;
  }

  /**
   * Event: reconnecting
   * @param {Function} callback - Callback
   * @returns {WebSocketClient} This instance
   */
  onReconnecting(callback) {
    this.on('reconnecting', callback);
    return this;
  }

  /**
   * Event: reconnected
   * @param {Function} callback - Callback
   * @returns {WebSocketClient} This instance
   */
  onReconnected(callback) {
    this.on('reconnected', callback);
    return this;
  }

  /**
   * Event: reconnect_failed
   * @param {Function} callback - Callback
   * @returns {WebSocketClient} This instance
   */
  onReconnectFailed(callback) {
    this.on('reconnect_failed', callback);
    return this;
  }
}

module.exports = WebSocketClient;
