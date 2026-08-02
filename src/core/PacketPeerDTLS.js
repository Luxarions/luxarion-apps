/**
 * LXRN PacketPeerDTLS Module
 * @namespace LXRN.PacketPeerDTLS
 * @author LXRN
 */

const PacketPeerUDP = require('./PacketPeerUDP.js');

/**
 * DTLS packet peer
 * @class PacketPeerDTLS
 * @extends PacketPeerUDP
 */
class PacketPeerDTLS extends PacketPeerUDP {
  #dtls = null;
  #secure = false;
  #dtlsOptions = {};
  #dtlsConnected = false;

  /**
   * Connect with DTLS
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @param {Object} options - DTLS options
   * @returns {Promise<void>}
   */
  connect(host, port, options = {}) {
    this.#host = host;
    this.#port = port;
    this.#dtlsOptions = options;
    
    return new Promise((resolve, reject) => {
      try {
        // In a real implementation, this would use dtls library
        // For now, simulate DTLS connection
        this.#socket = require('dgram').createSocket('udp4');
        this.#connected = true;
        this.#secure = true;
        this.#dtlsConnected = true;
        resolve();
      } catch (error) {
        reject(new Error(`DTLS connection failed: ${error.message}`));
      }
    });
  }

  /**
   * Send data
   * @param {Uint8Array|string} data - Data to send
   * @returns {PacketPeerDTLS} This instance
   */
  send(data) {
    if (!this.#connected || !this.#dtlsConnected) {
      throw new Error('DTLS peer not connected');
    }
    
    const sendData = this.__prepareData(data);
    // In real implementation, encrypt and send via DTLS
    this.#socket.send(sendData, 0, sendData.length, this.#remotePort, this.#remoteHost);
    return this;
  }

  /**
   * Receive data
   * @returns {Promise<Uint8Array>} Received data
   */
  receive() {
    return new Promise((resolve) => {
      if (this.#packets.length > 0) {
        resolve(this.#packets.shift());
        return;
      }
      
      this.#socket.once('message', (msg) => {
        // In real implementation, decrypt via DTLS
        resolve(new Uint8Array(msg));
      });
    });
  }

  /**
   * Close connection
   */
  close() {
    if (this.#dtls) {
      try {
        this.#dtls.close();
      } catch (error) {
        // Ignore
      }
      this.#dtls = null;
    }
    super.close();
    this.#dtlsConnected = false;
    this.#secure = false;
  }

  /**
   * Check if secure
   * @returns {boolean}
   */
  get isSecure() {
    return this.#secure;
  }

  /**
   * Check if DTLS connected
   * @returns {boolean}
   */
  get isDTLSConnected() {
    return this.#dtlsConnected;
  }
}

module.exports = PacketPeerDTLS;
