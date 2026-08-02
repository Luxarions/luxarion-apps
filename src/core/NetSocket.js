/**
 * LXRN NetSocket Module
 * @namespace LXRN.NetSocket
 * @author LXRN
 */

const Net = require('net');

/**
 * Network socket class
 * @class NetSocket
 */
class NetSocket {
  #socket = null;
  #connected = false;
  #closed = false;
  #readBuffer = [];
  #readCallbacks = [];
  #errorCallbacks = [];
  #closeCallbacks = [];
  #bytesWritten = 0;
  #bytesRead = 0;
  #timeout = 30000;

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
          this.__setupSocket();
          resolve();
        });
        
        this.#socket.on('error', (error) => {
          this.__onError(error);
          reject(error);
        });
        
        this.#socket.on('close', () => {
          this.__onClose();
        });
        
        this.#socket.setTimeout(this.#timeout);
      } catch (error) {
        reject(new Error(`Socket connection failed: ${error.message}`));
      }
    });
  }

  /**
   * Setup socket event handlers
   * @private
   */
  __setupSocket() {
    if (!this.#socket) return;
    
    this.#socket.on('data', (data) => {
      this.#bytesRead += data.length;
      this.#readBuffer.push(data);
      this.__processReadCallbacks();
    });
    
    this.#socket.on('error', (error) => {
      this.__onError(error);
    });
    
    this.#socket.on('close', () => {
      this.__onClose();
    });
    
    this.#socket.setTimeout(this.#timeout);
    this.#socket.on('timeout', () => {
      this.close();
      this.__onError(new Error('Socket timeout'));
    });
  }

  /**
   * Process pending read callbacks
   * @private
   */
  __processReadCallbacks() {
    while (this.#readCallbacks.length > 0 && this.#readBuffer.length > 0) {
      const callback = this.#readCallbacks.shift();
      const data = this.#readBuffer.shift();
      try {
        callback(null, data);
      } catch (error) {
        callback(error, null);
      }
    }
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
        // Ignore callback errors
      }
    }
  }

  /**
   * Handle close
   * @private
   */
  __onClose() {
    this.#connected = false;
    this.#closed = true;
    
    for (const callback of this.#closeCallbacks) {
      try {
        callback();
      } catch (error) {
        // Ignore callback errors
      }
    }
    
    if (this.#socket) {
      try {
        this.#socket.destroy();
      } catch (error) {
        // Ignore destroy errors
      }
      this.#socket = null;
    }
  }

  /**
   * Write data to socket
   * @param {Uint8Array|string} data - Data to write
   * @returns {boolean} True if data was written
   */
  write(data) {
    if (!this.#connected || this.#closed) {
      throw new Error('Socket not connected');
    }
    
    const writeData = this.__prepareData(data);
    const written = this.#socket.write(writeData);
    this.#bytesWritten += writeData.length;
    return written;
  }

  /**
   * Read data from socket
   * @returns {Promise<Buffer|Uint8Array>} Data read
   */
  read() {
    return new Promise((resolve, reject) => {
      if (this.#readBuffer.length > 0) {
        const data = this.#readBuffer.shift();
        resolve(data);
        return;
      }
      
      if (this.#closed) {
        reject(new Error('Socket is closed'));
        return;
      }
      
      this.#readCallbacks.push((error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
  }

  /**
   * Read all data from socket
   * @returns {Promise<Buffer>} All data read
   */
  readAll() {
    return new Promise((resolve, reject) => {
      const chunks = [];
      
      const readNext = () => {
        this.read()
          .then(data => {
            if (data === null || data.length === 0) {
              const combined = chunks.length === 1 ? chunks[0] : 
                Buffer.concat(chunks.map(c => c instanceof Buffer ? c : Buffer.from(c)));
              resolve(combined);
              return;
            }
            chunks.push(data);
            readNext();
          })
          .catch(reject);
      };
      
      readNext();
    });
  }

  /**
   * Read until delimiter is found
   * @param {string|Buffer} delimiter - Delimiter to search for
   * @returns {Promise<Buffer>} Data read including delimiter
   */
  readUntil(delimiter) {
    return new Promise((resolve, reject) => {
      const buffer = [];
      const delimBuffer = typeof delimiter === 'string' ? Buffer.from(delimiter) : delimiter;
      
      const readNext = () => {
        this.read()
          .then(data => {
            if (data === null || data.length === 0) {
              reject(new Error('Connection closed before delimiter found'));
              return;
            }
            
            const combined = Buffer.concat(buffer.map(c => c instanceof Buffer ? c : Buffer.from(c)));
            const idx = combined.indexOf(delimBuffer);
            
            if (idx !== -1) {
              const result = combined.slice(0, idx + delimBuffer.length);
              const remaining = combined.slice(idx + delimBuffer.length);
              if (remaining.length > 0) {
                this.#readBuffer.unshift(Buffer.from(remaining));
              }
              resolve(result);
              return;
            }
            
            buffer.push(data);
            readNext();
          })
          .catch(reject);
      };
      
      readNext();
    });
  }

  /**
   * Close the socket
   */
  close() {
    if (this.#socket) {
      try {
        this.#socket.end();
      } catch (error) {
        try {
          this.#socket.destroy();
        } catch (error2) {
          // Ignore
        }
      }
      this.#socket = null;
    }
    this.#connected = false;
    this.#closed = true;
  }

  /**
   * Set socket timeout
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
   * Register close callback
   * @param {Function} callback - Close callback
   */
  onClose(callback) {
    this.#closeCallbacks.push(callback);
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
   * Get connected status
   * @returns {boolean}
   */
  get isConnected() {
    return this.#connected;
  }

  /**
   * Get closed status
   * @returns {boolean}
   */
  get isClosed() {
    return this.#closed;
  }

  /**
   * Get bytes written
   * @returns {number}
   */
  get bytesWritten() {
    return this.#bytesWritten;
  }

  /**
   * Get bytes read
   * @returns {number}
   */
  get bytesRead() {
    return this.#bytesRead;
  }
}

module.exports = NetSocket;
