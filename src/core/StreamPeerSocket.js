/**
 * LXRN StreamPeerSocket Module
 * @namespace LXRN.StreamPeerSocket
 * @author LXRN
 */

const StreamPeer = require('./StreamPeer.js');
const Net = require('net');

/**
 * Stream peer with socket support
 * @class StreamPeerSocket
 * @extends StreamPeer
 */
class StreamPeerSocket extends StreamPeer {
  #socket = null;
  #connected = false;
  #timeout = 30000;
  #errorCallbacks = [];

  /**
   * Create a socket stream peer
   * @param {net.Socket} socket - Socket to use
   */
  constructor(socket = null) {
    super();
    this.#socket = socket;
    
    if (socket) {
      this.#connected = true;
      this.__readFromSocket();
    }
  }

  /**
   * Read from socket
   * @private
   */
  __readFromSocket() {
    if (!this.#socket) return;
    
    this.#socket.on('data', (data) => {
      this.#buffer.push(data);
      this.#size += data.length;
    });
    
    this.#socket.on('error', (error) => {
      this.__onError(error);
    });
    
    this.#socket.on('close', () => {
      this.#connected = false;
    });
    
    this.#socket.setTimeout(this.#timeout);
    this.#socket.on('timeout', () => {
      this.close();
      this.__onError(new Error('Socket timeout'));
    });
  }

  /**
   * Handle error
   * @private
   * @param {Error} error - Error object
   */
  __onError(error) {
    for (const callback of this.#errorCallbacks) {
      try {
        callback(error);
      } catch (error) {
        // Ignore
      }
    }
  }

  /**
   * Connect to host:port
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @returns {Promise<void>}
   */
  connect(host, port) {
    return new Promise((resolve, reject) => {
      try {
        this.#socket = Net.createConnection(port, host, () => {
          this.#connected = true;
          this.__readFromSocket();
          resolve();
        });
        
        this.#socket.on('error', (error) => {
          reject(error);
        });
        
        this.#socket.setTimeout(this.#timeout);
      } catch (error) {
        reject(new Error(`Socket connection failed: ${error.message}`));
      }
    });
  }

  /**
   * Write data to socket
   * @param {Uint8Array|string} data - Data to write
   * @returns {StreamPeerSocket} This instance
   */
  writeToSocket(data) {
    if (!this.#connected || !this.#socket) {
      throw new Error('Socket not connected');
    }
    
    const writeData = this.__prepareData(data);
    this.#socket.write(writeData);
    return this;
  }

  /**
   * Read data from socket
   * @returns {Promise<Buffer|Uint8Array>} Data read
   */
  readFromSocket() {
    return new Promise((resolve, reject) => {
      if (this.#size > 0) {
        const data = this.#buffer.shift();
        this.#size -= data.length;
        resolve(data);
        return;
      }
      
      if (!this.#connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      
      this.#socket.once('data', (data) => {
        resolve(data);
      });
      
      this.#socket.once('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Close socket
   */
  close() {
    if (this.#socket) {
      try {
        this.#socket.end();
        this.#socket.destroy();
      } catch (error) {
        // Ignore
      }
      this.#socket = null;
    }
    this.#connected = false;
  }

  /**
   * Set timeout
   * @param {number} ms - Timeout in milliseconds
   */
  setTimeout(ms) {
    this.#timeout = ms;
    if (this.#socket) {
      this.#socket.setTimeout(ms);
    }
  }

  /**
   * Register error callback
   * @param {Function} callback - Error callback
   */
  onError(callback) {
    this.#errorCallbacks.push(callback);
  }

  /**
   * Prepare data for writing
   * @private
   * @param {Uint8Array|string} data - Data to prepare
   * @returns {Buffer} Prepared data
   */
  __prepareData(data) {
    if (typeof data === 'string') {
      return Buffer.from(data);
    }
    if (data instanceof Uint8Array) {
      return Buffer.from(data);
    }
    if (data instanceof Buffer) {
      return data;
    }
    return Buffer.from(data);
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  get isConnected() {
    return this.#connected;
  }
}

module.exports = StreamPeerSocket;
