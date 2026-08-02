/**
 * LXRN StreamPeerUDS Module
 * @namespace LXRN.StreamPeerUDS
 * @author LXRN
 */

const StreamPeerSocket = require('./StreamPeerSocket.js');
const Net = require('net');

/**
 * Unix Domain Socket stream peer
 * @class StreamPeerUDS
 * @extends StreamPeerSocket
 */
class StreamPeerUDS extends StreamPeerSocket {
  #path = '';

  /**
   * Connect to Unix domain socket
   * @param {string} path - Socket path
   * @returns {Promise<void>}
   */
  connect(path) {
    this.#path = path;
    
    return new Promise((resolve, reject) => {
      try {
        this.#socket = Net.createConnection(path, () => {
          this.#connected = true;
          this.__readFromSocket();
          resolve();
        });
        
        this.#socket.on('error', (error) => {
          reject(error);
        });
        
        this.#socket.setTimeout(this.#timeout);
      } catch (error) {
        reject(new Error(`UDS connection failed: ${error.message}`));
      }
    });
  }

  /**
   * Get socket path
   * @returns {string}
   */
  get path() {
    return this.#path;
  }
}

module.exports = StreamPeerUDS;
