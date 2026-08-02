/**
 * LXRN TCPServer Module
 * @namespace LXRN.TCPServer
 * @author LXRN
 */

const Net = require('net');
const StreamPeerSocket = require('./StreamPeerSocket.js');

/**
 * TCP Server
 * @class TCPServer
 */
class TCPServer {
  #server = null;
  #listening = false;
  #connections = [];
  #connectionCallbacks = [];
  #errorCallbacks = [];
  #closeCallbacks = [];
  #host = '';
  #port = 0;
  #maxConnections = 100;
  #backlog = 128;

  /**
   * Start listening on port
   * @param {number} port - Port to listen on
   * @param {string} host - Host to bind to
   * @returns {Promise<void>}
   */
  listen(port, host = '0.0.0.0') {
    return new Promise((resolve, reject) => {
      try {
        this.#server = Net.createServer((socket) => {
          if (this.#connections.length >= this.#maxConnections) {
            socket.destroy();
            return;
          }
          
          const peer = new StreamPeerSocket(socket);
          this.#connections.push(peer);
          
          for (const callback of this.#connectionCallbacks) {
            try {
              callback(peer);
            } catch (error) {
              // Ignore callback errors
            }
          }
        });
        
        this.#server.on('error', (error) => {
          for (const callback of this.#errorCallbacks) {
            try {
              callback(error);
            } catch (error) {
              // Ignore
            }
          }
          reject(error);
        });
        
        this.#server.on('close', () => {
          this.#listening = false;
          for (const callback of this.#closeCallbacks) {
            try {
              callback();
            } catch (error) {
              // Ignore
            }
          }
        });
        
        this.#server.maxConnections = this.#maxConnections;
        this.#server.listen(port, host, this.#backlog, () => {
          this.#listening = true;
          this.#host = host;
          this.#port = port;
          resolve();
        });
      } catch (error) {
        reject(new Error(`TCP server listen failed: ${error.message}`));
      }
    });
  }

  /**
   * Stop listening
   */
  stop() {
    if (!this.#server) return;
    
    // Close all connections
    for (const peer of this.#connections) {
      try {
        peer.close();
      } catch (error) {
        // Ignore
      }
    }
    this.#connections = [];
    
    this.#server.close();
    this.#server = null;
    this.#listening = false;
  }

  /**
   * Register connection callback
   * @param {Function} callback - Connection callback
   */
  onConnection(callback) {
    this.#connectionCallbacks.push(callback);
  }

  /**
   * Register error callback
   * @param {Function} callback - Error callback
   */
  onError(callback) {
    this.#errorCallbacks.push(callback);
  }

  /**
   * Register close callback
   * @param {Function} callback - Close callback
   */
  onClose(callback) {
    this.#closeCallbacks.push(callback);
  }

  /**
   * Set max connections
   * @param {number} max - Maximum connections
   */
  setMaxConnections(max) {
    this.#maxConnections = max;
    if (this.#server) {
      this.#server.maxConnections = max;
    }
  }

  /**
   * Check if listening
   * @returns {boolean}
   */
  get isListening() {
    return this.#listening;
  }

  /**
   * Get host
   * @returns {string}
   */
  get host() {
    return this.#host;
  }

  /**
   * Get port
   * @returns {number}
   */
  get port() {
    return this.#port;
  }

  /**
   * Get connection count
   * @returns {number}
   */
  get connectionCount() {
    return this.#connections.length;
  }
}

module.exports = TCPServer;
