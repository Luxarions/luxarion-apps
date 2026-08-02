/**
 * LXRN StreamPeerTLS Module
 * @namespace LXRN.StreamPeerTLS
 * @author LXRN
 */

const StreamPeerSocket = require('./StreamPeerSocket.js');
const TLS = require('tls');

/**
 * TLS stream peer
 * @class StreamPeerTLS
 * @extends StreamPeerSocket
 */
class StreamPeerTLS extends StreamPeerSocket {
  #tlsOptions = {};
  #secure = false;
  #host = '';
  #port = 0;

  /**
   * Connect to host:port with TLS
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @param {Object} options - TLS options
   * @returns {Promise<void>}
   */
  connect(host, port, options = {}) {
    this.#host = host;
    this.#port = port;
    this.#tlsOptions = options;
    
    return new Promise((resolve, reject) => {
      try {
        const opts = {
          host: host,
          port: port,
          rejectUnauthorized: options.rejectUnauthorized !== false,
          ca: options.ca || [],
          cert: options.cert || '',
          key: options.key || '',
          passphrase: options.passphrase || '',
        };
        
        this.#socket = TLS.connect(opts, () => {
          this.#connected = true;
          this.#secure = this.#socket.authorized || !opts.rejectUnauthorized;
          this.__readFromSocket();
          resolve();
        });
        
        this.#socket.on('error', (error) => {
          reject(error);
        });
        
        this.#socket.setTimeout(this.#timeout);
      } catch (error) {
        reject(new Error(`TLS connection failed: ${error.message}`));
      }
    });
  }

  /**
   * Check if secure
   * @returns {boolean}
   */
  get isSecure() {
    return this.#secure;
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
   * Get peer certificate
   * @returns {Object|null} Certificate or null
   */
  getPeerCertificate() {
    if (!this.#socket) return null;
    try {
      return this.#socket.getPeerCertificate();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get cipher information
   * @returns {Object|null} Cipher info or null
   */
  getCipher() {
    if (!this.#socket) return null;
    try {
      return this.#socket.getCipher();
    } catch (error) {
      return null;
    }
  }
}

module.exports = StreamPeerTLS;
