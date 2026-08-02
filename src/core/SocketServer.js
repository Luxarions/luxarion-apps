/**
 * LXRN SocketServer Module
 * @namespace LXRN.SocketServer
 * @author LXRN
 */

const TCPServer = require('./TCPServer.js');
const UDPServer = require('./UDPServer.js');
const StreamPeerTLS = require('./StreamPeerTLS.js');
const PacketPeerUDP = require('./PacketPeerUDP.js');
const TLS = require('tls');

/**
 * Multi-protocol socket server
 * @class SocketServer
 */
class SocketServer {
  #tcpServer = new TCPServer();
  #udpServer = new UDPServer();
  #tlsServer = null;
  #listening = false;
  #type = 'tcp';
  #host = '';
  #port = 0;
  #options = {};

  /**
   * Start listening
   * @param {number} port - Port to listen on
   * @param {string} host - Host to bind to
   * @param {string} type - Server type ('tcp', 'udp', 'tls')
   * @param {Object} options - Server options
   * @returns {Promise<void>}
   */
  listen(port, host = '0.0.0.0', type = 'tcp', options = {}) {
    this.#type = type;
    this.#host = host;
    this.#port = port;
    this.#options = options;
    
    return new Promise((resolve, reject) => {
      if (type === 'tcp') {
        this.#tcpServer.listen(port, host)
          .then(resolve)
          .catch(reject);
      } else if (type === 'udp') {
        this.#udpServer.listen(port, host)
          .then(resolve)
          .catch(reject);
      } else if (type === 'tls') {
        this.__setupTLSServer(port, host, options)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Unknown socket type: ${type}`));
      }
    });
  }

  /**
   * Setup TLS server
   * @private
   * @param {number} port - Port to listen on
   * @param {string} host - Host to bind to
   * @param {Object} options - TLS options
   * @returns {Promise<void>}
   */
  __setupTLSServer(port, host, options) {
    return new Promise((resolve, reject) => {
      try {
        this.#tlsServer = new TCPServer();
        
        const tlsOpts = {
          key: options.key || '',
          cert: options.cert || '',
          ca: options.ca || [],
          rejectUnauthorized: options.rejectUnauthorized !== false,
        };
        
        this.#tlsServer.#server = TLS.createServer(tlsOpts, (socket) => {
          const peer = new StreamPeerTLS();
          peer.#socket = socket;
          peer.#connected = true;
          peer.#secure = true;
          peer.__readFromSocket();
          
          for (const callback of this.#tcpServer.#connectionCallbacks) {
            try {
              callback(peer);
            } catch (error) {
              // Ignore
            }
          }
        });
        
        this.#tlsServer.#server.on('error', (error) => {
          for (const callback of this.#tcpServer.#errorCallbacks) {
            try {
              callback(error);
            } catch (error) {
              // Ignore
            }
          }
          reject(error);
        });
        
        this.#tlsServer.#server.on('close', () => {
          this.#listening = false;
          for (const callback of this.#tcpServer.#closeCallbacks) {
            try {
              callback();
            } catch (error) {
              // Ignore
            }
          }
        });
        
        this.#tlsServer.#server.listen(port, host, () => {
          this.#listening = true;
          this.#tlsServer.#listening = true;
          resolve();
        });
      } catch (error) {
        reject(new Error(`TLS server setup failed: ${error.message}`));
      }
    });
  }

  /**
   * Stop server
   */
  stop() {
    if (this.#tcpServer) this.#tcpServer.stop();
    if (this.#udpServer) this.#udpServer.close();
    if (this.#tlsServer) this.#tlsServer.stop();
    this.#listening = false;
  }

  /**
   * Register connection callback
   * @param {Function} callback - Connection callback
   */
  onConnection(callback) {
    if (this.#type === 'tcp' || this.#type === 'tls') {
      this.#tcpServer.onConnection(callback);
    } else if (this.#type === 'udp') {
      this.#udpServer.#readCallbacks.push((error, packet) => {
        if (!error) {
          const peer = new PacketPeerUDP();
          peer.#host = packet.from;
          peer.#port = packet.port;
          peer.#connected = true;
          peer.#packets.push(packet.data);
          callback(peer);
        }
      });
    }
  }

  /**
   * Register error callback
   * @param {Function} callback - Error callback
   */
  onError(callback) {
    if (this.#type === 'tcp' || this.#type === 'tls') {
      this.#tcpServer.onError(callback);
    } else if (this.#type === 'udp') {
      this.#udpServer.onError(callback);
    }
  }

  /**
   * Register close callback
   * @param {Function} callback - Close callback
   */
  onClose(callback) {
    if (this.#type === 'tcp' || this.#type === 'tls') {
      this.#tcpServer.onClose(callback);
    } else if (this.#type === 'udp') {
      this.#udpServer.onClose(callback);
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
   * Get server type
   * @returns {string}
   */
  get type() {
    return this.#type;
  }
}

module.exports = SocketServer;
