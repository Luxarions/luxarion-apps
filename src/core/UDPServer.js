/**
 * LXRN UDPServer Module
 * @namespace LXRN.UDPServer
 * @author LXRN
 */

const Dgram = require('dgram');

/**
 * UDP Server
 * @class UDPServer
 */
class UDPServer {
  #socket = null;
  #listening = false;
  #host = '';
  #port = 0;
  #readCallbacks = [];
  #errorCallbacks = [];
  #closeCallbacks = [];
  #buffer = [];
  #type = 'udp4';
  #broadcast = false;
  #reuseAddr = true;

  /**
   * Start listening on port
   * @param {number} port - Port to listen on
   * @param {string} host - Host to bind to
   * @param {string} type - Socket type ('udp4' or 'udp6')
   * @returns {Promise<void>}
   */
  listen(port, host = '0.0.0.0', type = 'udp4') {
    this.#type = type;
    
    return new Promise((resolve, reject) => {
      try {
        this.#socket = Dgram.createSocket(type);
        this.#socket.setBroadcast(this.#broadcast);
        this.#socket.setReuseAddress(this.#reuseAddr);
        
        this.#socket.on('message', (msg, rinfo) => {
          const data = new Uint8Array(msg);
          this.#buffer.push({ data, from: rinfo.address, port: rinfo.port });
          this.__processReadCallbacks();
        });
        
        this.#socket.on('error', (error) => {
          for (const callback of this.#errorCallbacks) {
            try {
              callback(error);
            } catch (error) {
              // Ignore
            }
          }
        });
        
        this.#socket.on('close', () => {
          this.#listening = false;
          for (const callback of this.#closeCallbacks) {
            try {
              callback();
            } catch (error) {
              // Ignore
            }
          }
        });
        
        this.#socket.bind(port, host, () => {
          this.#listening = true;
          this.#host = host;
          this.#port = port;
          resolve();
        });
      } catch (error) {
        reject(new Error(`UDP server listen failed: ${error.message}`));
      }
    });
  }

  /**
   * Process read callbacks
   * @private
   */
  __processReadCallbacks() {
    while (this.#readCallbacks.length > 0 && this.#buffer.length > 0) {
      const callback = this.#readCallbacks.shift();
      const packet = this.#buffer.shift();
      try {
        callback(null, packet);
      } catch (error) {
        callback(error, null);
      }
    }
  }

  /**
   * Send data
   * @param {Uint8Array|string} data - Data to send
   * @param {string} host - Destination host
   * @param {number} port - Destination port
   * @returns {Promise<void>}
   */
  send(data, host, port) {
    if (!this.#listening || !this.#socket) {
      throw new Error('UDP server not listening');
    }
    
    const sendData = this.__prepareData(data);
    
    return new Promise((resolve, reject) => {
      this.#socket.send(sendData, 0, sendData.length, port, host, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Receive data
   * @returns {Promise<Object>} Packet with data, from, port
   */
  receive() {
    return new Promise((resolve, reject) => {
      if (this.#buffer.length > 0) {
        const packet = this.#buffer.shift();
        resolve(packet);
        return;
      }
      
      if (!this.#listening) {
        reject(new Error('UDP server not listening'));
        return;
      }
      
      this.#readCallbacks.push((error, packet) => {
        if (error) reject(error);
        else resolve(packet);
      });
    });
  }

  /**
   * Close server
   */
  close() {
    if (this.#socket) {
      try {
        this.#socket.close();
      } catch (error) {
        // Ignore
      }
      this.#socket = null;
    }
    this.#listening = false;
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
   * Set broadcast
   * @param {boolean} enable - Enable broadcast
   */
  setBroadcast(enable) {
    this.#broadcast = enable;
    if (this.#socket) {
      this.#socket.setBroadcast(enable);
    }
  }

  /**
   * Set reuse address
   * @param {boolean} enable - Enable reuse
   */
  setReuseAddress(enable) {
    this.#reuseAddr = enable;
    if (this.#socket) {
      this.#socket.setReuseAddress(enable);
    }
  }

  /**
   * Prepare data for sending
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
}

module.exports = UDPServer;
