/**
 * LXRN RemoteFilesystemClient Module
 * @namespace LXRN.RemoteFilesystemClient
 * @author LXRN
 */

const HTTPClient = require('./HTTPClient.js');

/**
 * Remote filesystem client
 * @class RemoteFilesystemClient
 */
class RemoteFilesystemClient {
  #host = '';
  #port = 8080;
  #socket = null;
  #connected = false;
  #timeout = 30000;
  #http = new HTTPClient();
  #token = null;
  #sessionId = null;
  #username = '';
  #protocol = 'http';
  #apiVersion = 'v1';

  /**
   * Create remote filesystem client
   * @param {string} host - Server host
   * @param {number} port - Server port
   * @param {string} protocol - Protocol (http/https)
   */
  constructor(host, port = 8080, protocol = 'http') {
    this.#host = host;
    this.#port = port;
    this.#protocol = protocol;
  }

  /**
   * Connect to remote server
   * @param {string} token - Auth token
   * @param {string} username - Username
   * @returns {Promise<RemoteFilesystemClient>}
   */
  connect(token = null, username = '') {
    this.#token = token;
    this.#username = username;
    
    return this.#http.request(`${this.#protocol}://${this.#host}:${this.#port}/api/${this.#apiVersion}/connect`)
      .then((response) => {
        if (response.status === 200) {
          this.#connected = true;
          if (response.json && response.json.sessionId) {
            this.#sessionId = response.json.sessionId;
          }
          this.#http.setTimeout(this.#timeout);
          return this;
        }
        throw new Error(`Connection failed: ${response.status}`);
      });
  }

  /**
   * Authenticate with username/password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<RemoteFilesystemClient>}
   */
  authenticate(username, password) {
    this.#username = username;
    
    return this.#http.post(
      `${this.#protocol}://${this.#host}:${this.#port}/api/${this.#apiVersion}/auth`,
      { username, password }
    ).then((response) => {
      if (response.status === 200 && response.json && response.json.token) {
        this.#token = response.json.token;
        this.#connected = true;
        this.#http.setTimeout(this.#timeout);
        return this;
      }
      throw new Error(`Authentication failed: ${response.status}`);
    });
  }

  /**
   * List directory
   * @param {string} path - Directory path
   * @param {Object} options - List options
   * @returns {Promise<Object>}
   */
  listDirectory(path = '/', options = {}) {
    return this.__sendRequest('list', { path, ...options });
  }

  /**
   * Get file
   * @param {string} path - File path
   * @param {Object} options - Get options
   * @returns {Promise<Buffer>}
   */
  getFile(path, options = {}) {
    return this.__sendRequest('get', { path, ...options });
  }

  /**
   * Put file
   * @param {string} path - File path
   * @param {Uint8Array|string} data - File data
   * @param {Object} options - Put options
   * @returns {Promise<Object>}
   */
  putFile(path, data, options = {}) {
    const encodedData = typeof data === 'string' ? data : 
      Array.from(data).map(b => String.fromCharCode(b)).join('');
    return this.__sendRequest('put', { path, data: encodedData, ...options });
  }

  /**
   * Delete file
   * @param {string} path - File path
   * @param {Object} options - Delete options
   * @returns {Promise<Object>}
   */
  deleteFile(path, options = {}) {
    return this.__sendRequest('delete', { path, ...options });
  }

  /**
   * Make directory
   * @param {string} path - Directory path
   * @param {Object} options - Mkdir options
   * @returns {Promise<Object>}
   */
  makeDirectory(path, options = {}) {
    return this.__sendRequest('mkdir', { path, ...options });
  }

  /**
   * Remove directory
   * @param {string} path - Directory path
   * @param {Object} options - Rmdir options
   * @returns {Promise<Object>}
   */
  removeDirectory(path, options = {}) {
    return this.__sendRequest('rmdir', { path, ...options });
  }

  /**
   * Rename file or directory
   * @param {string} oldPath - Old path
   * @param {string} newPath - New path
   * @param {Object} options - Rename options
   * @returns {Promise<Object>}
   */
  rename(oldPath, newPath, options = {}) {
    return this.__sendRequest('rename', { oldPath, newPath, ...options });
  }

  /**
   * Get file stats
   * @param {string} path - File path
   * @param {Object} options - Stat options
   * @returns {Promise<Object>}
   */
  stat(path, options = {}) {
    return this.__sendRequest('stat', { path, ...options });
  }

  /**
   * Check if file exists
   * @param {string} path - File path
   * @param {Object} options - Exists options
   * @returns {Promise<Object>}
   */
  exists(path, options = {}) {
    return this.__sendRequest('exists', { path, ...options });
  }

  /**
   * Upload file from disk
   * @param {string} remotePath - Remote path
   * @param {string} localPath - Local file path
   * @param {Object} options - Upload options
   * @returns {Promise<Object>}
   */
  uploadFile(remotePath, localPath, options = {}) {
    const fs = require('fs');
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found: ${localPath}`);
    }
    const data = fs.readFileSync(localPath);
    return this.putFile(remotePath, data, options);
  }

  /**
   * Download file to disk
   * @param {string} remotePath - Remote path
   * @param {string} localPath - Local file path
   * @param {Object} options - Download options
   * @returns {Promise<void>}
   */
  downloadFile(remotePath, localPath, options = {}) {
    return this.getFile(remotePath, options).then((data) => {
      const fs = require('fs');
      const dir = require('path').dirname(localPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(localPath, data);
    });
  }

  /**
   * Send request
   * @private
   * @param {string} action - Action
   * @param {Object} params - Parameters
   * @returns {Promise<Object>}
   */
  __sendRequest(action, params) {
    return new Promise((resolve, reject) => {
      const url = `${this.#protocol}://${this.#host}:${this.#port}/api/${this.#apiVersion}/${action}`;
      const headers = {};
      if (this.#token) {
        headers['Authorization'] = `Bearer ${this.#token}`;
      }
      if (this.#sessionId) {
        headers['X-Session-Id'] = this.#sessionId;
      }
      if (this.#username) {
        headers['X-Username'] = this.#username;
      }
      
      this.#http.setMethod(HTTPClient.METHOD_POST)
        .setHeaders(headers)
        .setJSONBody(params)
        .setTimeout(this.#timeout)
        .request(url)
        .then((response) => {
          if (response.status === 200) {
            resolve(response.json);
          } else if (response.status === 401) {
            this.#connected = false;
            reject(new Error('Unauthorized: Token expired'));
          } else {
            reject(new Error(`Request failed: ${response.status} - ${response.text}`));
          }
        })
        .catch(reject);
    });
  }

  /**
   * Disconnect
   * @returns {RemoteFilesystemClient} This instance
   */
  disconnect() {
    this.#connected = false;
    if (this.#socket) {
      this.#socket.close();
      this.#socket = null;
    }
    return this;
  }

  /**
   * Set timeout
   * @param {number} ms - Timeout in milliseconds
   * @returns {RemoteFilesystemClient} This instance
   */
  setTimeout(ms) {
    this.#timeout = ms;
    this.#http.setTimeout(ms);
    return this;
  }

  /**
   * Set API version
   * @param {string} version - API version
   * @returns {RemoteFilesystemClient} This instance
   */
  setAPIVersion(version) {
    this.#apiVersion = version;
    return this;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  get isConnected() {
    return this.#connected;
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
   * Get token
   * @returns {string|null}
   */
  get token() {
    return this.#token;
  }

  /**
   * Get session ID
   * @returns {string|null}
   */
  get sessionId() {
    return this.#sessionId;
  }

  /**
   * Get username
   * @returns {string}
   */
  get username() {
    return this.#username;
  }
}

module.exports = RemoteFilesystemClient;
