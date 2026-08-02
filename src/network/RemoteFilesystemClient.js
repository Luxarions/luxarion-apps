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
  constructor(host, port = 8080) {
    this._host = host;
    this._port = port;
    this._socket = null;
    this._connected = false;
    this._timeout = 30000;
    this._http = new HTTPClient();
    this._token = null;
    this._sessionId = null;
  }

  /**
   * Connect to remote server
   * @param {string} token - Auth token
   * @returns {Promise<RemoteFilesystemClient>}
   */
  connect(token = null) {
    this._token = token;
    return this._http.request(`http://${this._host}:${this._port}/connect`)
      .then((response) => {
        if (response.status === 200) {
          this._connected = true;
          if (response.json && response.json.sessionId) {
            this._sessionId = response.json.sessionId;
          }
          return this;
        }
        throw new Error(`Connection failed: ${response.status}`);
      });
  }

  /**
   * List directory
   * @param {string} path - Directory path
   * @returns {Promise<Object>}
   */
  listDirectory(path = '/') {
    return this.__sendRequest('list', { path });
  }

  /**
   * Get file
   * @param {string} path - File path
   * @returns {Promise<Buffer>}
   */
  getFile(path) {
    return this.__sendRequest('get', { path });
  }

  /**
   * Put file
   * @param {string} path - File path
   * @param {Uint8Array|string} data - File data
   * @returns {Promise<Object>}
   */
  putFile(path, data) {
    const encodedData = typeof data === 'string' ? data : 
      Array.from(data).map(b => String.fromCharCode(b)).join('');
    return this.__sendRequest('put', { path, data: encodedData });
  }

  /**
   * Delete file
   * @param {string} path - File path
   * @returns {Promise<Object>}
   */
  deleteFile(path) {
    return this.__sendRequest('delete', { path });
  }

  /**
   * Make directory
   * @param {string} path - Directory path
   * @returns {Promise<Object>}
   */
  makeDirectory(path) {
    return this.__sendRequest('mkdir', { path });
  }

  /**
   * Remove directory
   * @param {string} path - Directory path
   * @returns {Promise<Object>}
   */
  removeDirectory(path) {
    return this.__sendRequest('rmdir', { path });
  }

  /**
   * Rename file or directory
   * @param {string} oldPath - Old path
   * @param {string} newPath - New path
   * @returns {Promise<Object>}
   */
  rename(oldPath, newPath) {
    return this.__sendRequest('rename', { oldPath, newPath });
  }

  /**
   * Get file stats
   * @param {string} path - File path
   * @returns {Promise<Object>}
   */
  stat(path) {
    return this.__sendRequest('stat', { path });
  }

  /**
   * Check if file exists
   * @param {string} path - File path
   * @returns {Promise<Object>}
   */
  exists(path) {
    return this.__sendRequest('exists', { path });
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
      const url = `http://${this._host}:${this._port}/api/${action}`;
      const headers = {};
      if (this._token) {
        headers['Authorization'] = `Bearer ${this._token}`;
      }
      if (this._sessionId) {
        headers['X-Session-Id'] = this._sessionId;
      }
      
      this._http.setMethod(HTTPClient.METHOD_POST)
        .setHeaders(headers)
        .setJSONBody(params)
        .request(url)
        .then((response) => {
          if (response.status === 200) {
            resolve(response.json);
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
    this._connected = false;
    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }
    return this;
  }

  /**
   * Set timeout
   * @param {number} ms - Timeout in milliseconds
   * @returns {RemoteFilesystemClient} This instance
   */
  setTimeout(ms) {
    this._timeout = ms;
    this._http.setTimeout(ms);
    return this;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  get isConnected() {
    return this._connected;
  }

  /**
   * Get host
   * @returns {string}
   */
  get host() {
    return this._host;
  }

  /**
   * Get port
   * @returns {number}
   */
  get port() {
    return this._port;
  }

  /**
   * Get session ID
   * @returns {string|null}
   */
  get sessionId() {
    return this._sessionId;
  }
}

module.exports = RemoteFilesystemClient;
