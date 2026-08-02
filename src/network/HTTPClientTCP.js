/**
 * LXRN HTTPClientTCP Module
 * @namespace LXRN.HTTPClientTCP
 * @author LXRN
 */

const StreamPeerTCP = require('../core/StreamPeerTCP.js');

/**
 * TCP-based HTTP Client
 * @class HTTPClientTCP
 */
class HTTPClientTCP {
  #socket = new StreamPeerTCP();
  #host = '';
  #port = 80;
  #method = 'GET';
  #path = '/';
  #headers = {};
  #body = null;
  #response = '';
  #status = 0;
  #responseHeaders = {};
  #chunked = false;
  #contentLength = 0;
  #buffer = '';
  #version = 'HTTP/1.1';
  #keepAlive = true;
  #connected = false;

  /**
   * Connect to server
   * @param {string} host - Server host
   * @param {number} port - Server port
   * @returns {Promise<void>}
   */
  connect(host, port = 80) {
    this.#host = host;
    this.#port = port;
    this.#connected = true;
    return this.#socket.connect(host, port);
  }

  /**
   * Set method
   * @param {string} method - HTTP method
   * @returns {HTTPClientTCP} This instance
   */
  setMethod(method) {
    this.#method = method;
    return this;
  }

  /**
   * Set path
   * @param {string} path - Request path
   * @returns {HTTPClientTCP} This instance
   */
  setPath(path) {
    this.#path = path;
    return this;
  }

  /**
   * Set header
   * @param {string} name - Header name
   * @param {string} value - Header value
   * @returns {HTTPClientTCP} This instance
   */
  setHeader(name, value) {
    this.#headers[name] = value;
    return this;
  }

  /**
   * Set body
   * @param {*} body - Request body
   * @returns {HTTPClientTCP} This instance
   */
  setBody(body) {
    this.#body = body;
    return this;
  }

  /**
   * Send request
   * @returns {Promise<Object>}
   */
  send() {
    return new Promise((resolve, reject) => {
      if (!this.#connected || !this.#socket.isConnected) {
        reject(new Error('HTTP client not connected'));
        return;
      }
      
      // Build request
      let request = `${this.#method} ${this.#path} ${this.#version}\r\n`;
      request += `Host: ${this.#host}\r\n`;
      
      // Add headers
      for (const name in this.#headers) {
        request += `${name}: ${this.#headers[name]}\r\n`;
      }
      
      // Add connection header
      if (!this.#headers['Connection']) {
        request += `Connection: ${this.#keepAlive ? 'keep-alive' : 'close'}\r\n`;
      }
      
      // Add body
      if (this.#body) {
        const bodyStr = typeof this.#body === 'string' ? this.#body : JSON.stringify(this.#body);
        request += `Content-Length: ${Buffer.byteLength(bodyStr)}\r\n`;
        request += '\r\n';
        request += bodyStr;
      } else {
        request += '\r\n';
      }
      
      this.#socket.write(request);
      this.#buffer = '';
      
      this.#socket.readAll().then((data) => {
        this.#buffer = data.toString('utf-8');
        this.__parseResponse();
        resolve({
          status: this.#status,
          headers: this.#responseHeaders,
          body: this.#response,
        });
      }).catch(reject);
    });
  }

  /**
   * Parse response
   * @private
   */
  __parseResponse() {
    const lines = this.#buffer.split('\r\n');
    const statusLine = lines[0];
    const parts = statusLine.split(' ');
    this.#status = parseInt(parts[1], 10);
    
    let idx = 1;
    this.#responseHeaders = {};
    
    // Parse headers
    while (idx < lines.length && lines[idx] !== '') {
      const line = lines[idx];
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const name = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        this.#responseHeaders[name] = value;
      }
      idx++;
    }
    
    idx++;
    this.#response = lines.slice(idx).join('\r\n');
    
    // Handle chunked encoding
    if (this.#responseHeaders['transfer-encoding'] === 'chunked') {
      this.#response = this.__parseChunked(this.#response);
    }
  }

  /**
   * Parse chunked response
   * @private
   * @param {string} data - Chunked data
   * @returns {string}
   */
  __parseChunked(data) {
    let result = '';
    let pos = 0;
    
    while (pos < data.length) {
      const endOfLine = data.indexOf('\r\n', pos);
      if (endOfLine === -1) break;
      
      const chunkSize = parseInt(data.substring(pos, endOfLine), 16);
      if (chunkSize === 0) break;
      
      pos = endOfLine + 2;
      const chunk = data.substring(pos, pos + chunkSize);
      result += chunk;
      pos += chunkSize;
      
      if (data.substring(pos, pos + 2) === '\r\n') {
        pos += 2;
      }
    }
    return result;
  }

  /**
   * Close connection
   */
  close() {
    this.#socket.close();
    this.#connected = false;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  get isConnected() {
    return this.#connected && this.#socket.isConnected;
  }

  /**
   * Get status code
   * @returns {number}
   */
  get status() {
    return this.#status;
  }

  /**
   * Get response body
   * @returns {string}
   */
  get response() {
    return this.#response;
  }

  /**
   * Get response headers
   * @returns {Object}
   */
  get responseHeaders() {
    return this.#responseHeaders;
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

module.exports = HTTPClientTCP;
