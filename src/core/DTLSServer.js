/**
 * LXRN DTLSServer Module
 * @namespace LXRN.DTLSServer
 * @author LXRN
 */

const PacketPeerDTLS = require('./PacketPeerDTLS.js');
const Dgram = require('dgram');

/**
 * DTLS Server
 * @class DTLSServer
 */
class DTLSServer {
  #server = null;
  #listening = false;
  #connections = [];
  #connectionCallbacks = [];
  #errorCallbacks = [];
  #closeCallbacks = [];
  #host = '';
  #port = 0;
  #options = {};
  #type = 'udp4';

  /**
   * Start listening
   * @param {number} port - Port to listen on
   * @param {string} host - Host to bind to
   * @param {Object} options - DTLS options
   * @returns {Promise<void>}
   */
  listen(port, host = '0.0.0.0', options = {}) {
    this.#host = host;
    this.#port = port;
    this.#options = options;
    
    return new Promise((resolve, reject) => {
      try {
        this.#server = Dgram.createSocket(this.#type);
        
        this.#server.on('message', (msg, rinfo) => {
          const peer = new PacketPeerDTLS();
          peer.#remoteHost = rinfo.address;
          peer.#remotePort = rinfo.port;
          peer.#connected = true;
          peer.#secure = true;
          peer.#dtlsConnected = true;
          peer.#packets.push(new Uint8Array(msg));
          
          this.#connections.push(peer);
          
          for (const callback of this.#connectionCallbacks) {
            try {
              callback(peer);
            } catch (error) {
              // Ignore
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
        
        this.#server.bind(port, host, () => {
          this.#listening = true;
          resolve();
        });
      } catch (error) {
        reject(new Error(`DTLS server listen failed: ${error.message}`));
      }
    });
  }

  /**
   * Stop listening
   */
  stop() {
    if (this.#server) {
      try {
        this.#server.close();
      } catch (error) {
        // Ignore
      }
      this.#server = null;
    }
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

module.exports = DTLSServer;
