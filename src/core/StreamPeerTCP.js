/**
 * LXRN StreamPeerTCP Module
 * @namespace LXRN.StreamPeerTCP
 * @author LXRN
 */

const StreamPeerSocket = require('./StreamPeerSocket.js');

/**
 * TCP stream peer
 * @class StreamPeerTCP
 * @extends StreamPeerSocket
 */
class StreamPeerTCP extends StreamPeerSocket {
  #host = '';
  #port = 0;

  /**
   * Connect to host:port
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @returns {Promise<void>}
   */
  connect(host, port) {
    this.#host = host;
    this.#port = port;
    return super.connect(host, port);
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
   * Convert to bytes with header
   * @returns {Uint8Array} Bytes
   */
  toBytes() {
    const result = super.toBytes();
    const header = new this.constructor();
    header.put16(0x4D54);
    header.put16(0);
    const headerBytes = header.toBytes();
    
    const combined = new Uint8Array(headerBytes.length + result.length);
    combined.set(headerBytes, 0);
    combined.set(result, headerBytes.length);
    return combined;
  }
}

module.exports = StreamPeerTCP;
