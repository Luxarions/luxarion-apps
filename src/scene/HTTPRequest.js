/**
 * LXRN HTTPRequest Module
 * @namespace LXRN.HTTPRequest
 * @author LXRN
 */

const Node = require('./Node.js');

/**
 * HTTP request node
 * @class HTTPRequest
 * @extends Node
 */
class HTTPRequest extends Node {
  /**
   * HTTP methods
   * @static
   */
  static METHOD_GET = 'GET';
  static METHOD_POST = 'POST';
  static METHOD_PUT = 'PUT';
  static METHOD_DELETE = 'DELETE';
  static METHOD_PATCH = 'PATCH';
  static METHOD_HEAD = 'HEAD';
  static METHOD_OPTIONS = 'OPTIONS';

  /**
   * Result codes
   * @static
   */
  static RESULT_SUCCESS = 0;
  static RESULT_CHUNKED_BODY = 1;
  static RESULT_CONNECTION_ERROR = 2;
  static RESULT_SSL_HANDSHAKE_ERROR = 3;
  static RESULT_NO_RESPONSE = 4;
  static RESULT_BODY_SIZE_LIMIT = 5;
  static RESULT_REQUEST_FAILED = 6;
  static RESULT_DOWNLOAD_FILE_ERROR = 7;
  static RESULT_REDIRECT_LIMIT_REACHED = 8;

  #host = '';
  #port = 0;
  #useSSL = false;
  #method = HTTPRequest.METHOD_GET;
  #headers = {};
  #body = null;
  #responseCode = 0;
  #responseHeaders = {};
  #responseBody = null;
  #responseLength = 0;
  #downloadFile = '';
  #downloadBuffer = null;
  #maxRedirects = 8;
  #timeout = 30000;
  #bodySizeLimit = -1;
  #followRedirects = true;
  #requesting = false;
  #result = 0;
  #completed = true;
  #progress = 0;
  #status = 0;
  #http = null;
  #userAgent = 'LXRN-Engine/1.0';
  #compression = true;
  #keepAlive = true;
  #verifySSL = true;
  #cookies = {};
  #signalRequestCompleted = 'requestCompleted';
  #signalProgress = 'progress';
  #signalError = 'error';
  #pendingRequests = [];
  #maxConcurrent = 4;
  #activeRequests = 0;

  constructor(name = 'HTTPRequest') {
    super(name);
  }

  /**
   * Make HTTP request
   * @param {string} url - URL to request
   * @param {string} method - HTTP method
   * @param {Object} headers - Request headers
   * @param {*} body - Request body
   * @returns {Promise<Object>}
   */
  request(url, method = HTTPRequest.METHOD_GET, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
      if (this.#requesting) {
        reject(new Error('Request already in progress'));
        return;
      }
      
      // Set up request
      this.#requesting = true;
      this.#completed = false;
      this.#progress = 0;
      this.#status = 0;
      this.#responseCode = 0;
      this.#responseHeaders = {};
      this.#responseBody = null;
      this.#result = HTTPRequest.RESULT_SUCCESS;

      const parsedUrl = new URL(url);
      this.#host = parsedUrl.hostname;
      this.#port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80);
      this.#useSSL = parsedUrl.protocol === 'https:';
      this.#method = method || this.#method;

      const allHeaders = { ...this.#headers, ...headers };
      
      // Set default headers
      if (!allHeaders['user-agent']) {
        allHeaders['user-agent'] = this.#userAgent;
      }
      if (this.#compression && !allHeaders['accept-encoding']) {
        allHeaders['accept-encoding'] = 'gzip, deflate';
      }
      
      // Add cookies
      if (Object.keys(this.#cookies).length > 0) {
        const cookieStr = Object.entries(this.#cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
        allHeaders['cookie'] = cookieStr;
      }

      const options = {
        hostname: this.#host,
        port: this.#port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: this.#method,
        headers: allHeaders,
        timeout: this.#timeout,
        rejectUnauthorized: this.#verifySSL,
        keepAlive: this.#keepAlive,
      };

      // Set content length for body
      if (this.#method === 'POST' || this.#method === 'PUT' || this.#method === 'PATCH') {
        const requestBody = body || this.#body;
        if (requestBody) {
          if (typeof requestBody === 'string') {
            options.headers['content-length'] = Buffer.byteLength(requestBody);
          } else if (requestBody instanceof Uint8Array || requestBody instanceof Buffer) {
            options.headers['content-length'] = requestBody.length;
          } else if (requestBody instanceof ArrayBuffer) {
            options.headers['content-length'] = requestBody.byteLength;
          } else if (typeof requestBody === 'object') {
            options.headers['content-type'] = options.headers['content-type'] || 'application/json';
          }
        }
      }

      this.__doRequest(options, parsedUrl, body, resolve, reject);
    });
  }

  /**
   * Execute request
   * @private
   * @param {Object} options - Request options
   * @param {URL} parsedUrl - Parsed URL
   * @param {*} body - Request body
   * @param {Function} resolve - Resolve callback
   * @param {Function} reject - Reject callback
   */
  __doRequest(options, parsedUrl, body, resolve, reject) {
    const http = this.#useSSL ? require('https') : require('http');
    const request = http.request(options, (response) => {
      this.#responseCode = response.statusCode;
      this.#responseHeaders = response.headers;
      this.#status = response.statusCode;
      this.#progress = 0.5;

      const chunks = [];
      let responseLength = 0;
      let bodySize = 0;

      response.on('data', (chunk) => {
        chunks.push(chunk);
        responseLength += chunk.length;
        bodySize += chunk.length;
        this.#responseLength = responseLength;
        this.#progress = 0.5 + (responseLength / (response.headers['content-length'] || 1)) * 0.5;
        
        // Check body size limit
        if (this.#bodySizeLimit > 0 && bodySize > this.#bodySizeLimit) {
          request.destroy();
          this.#result = HTTPRequest.RESULT_BODY_SIZE_LIMIT;
          this.#requesting = false;
          this.#completed = true;
          this.emit(this.#signalError, 'Body size limit exceeded');
          reject(new Error('Body size limit exceeded'));
          return;
        }
      });

      response.on('end', () => {
        let responseBody = Buffer.concat(chunks);
        
        // Handle compressed response
        if (this.#compression && response.headers['content-encoding']) {
          try {
            const zlib = require('zlib');
            if (response.headers['content-encoding'] === 'gzip') {
              responseBody = zlib.gunzipSync(responseBody);
            } else if (response.headers['content-encoding'] === 'deflate') {
              responseBody = zlib.inflateSync(responseBody);
            }
          } catch (error) {
            // Fall through
          }
        }
        
        this.#responseBody = responseBody;
        this.#responseLength = responseBody.length;
        this.#progress = 1;
        this.#requesting = false;
        this.#completed = true;
        this.#result = HTTPRequest.RESULT_SUCCESS;
        
        // Handle redirects
        if (this.#followRedirects && 
            (this.#responseCode === 301 || this.#responseCode === 302 || 
             this.#responseCode === 303 || this.#responseCode === 307 || this.#responseCode === 308) &&
            this.#maxRedirects > 0) {
          const location = response.headers.location;
          if (location) {
            this.#maxRedirects--;
            this.#followRedirects = false;
            this.request(new URL(location, parsedUrl).toString())
              .then(resolve)
              .catch(reject);
            return;
          }
        }
        
        // Save to file if download file is set
        if (this.#downloadFile) {
          const fs = require('fs');
          try {
            fs.writeFileSync(this.#downloadFile, responseBody);
          } catch (error) {
            this.#result = HTTPRequest.RESULT_DOWNLOAD_FILE_ERROR;
            this.emit(this.#signalError, error.message);
            reject(error);
            return;
          }
        }
        
        const result = {
          result: this.#result,
          responseCode: this.#responseCode,
          headers: this.#responseHeaders,
          body: this.#responseBody,
          text: this.#responseBody.toString('utf-8'),
        };
        
        try {
          result.json = JSON.parse(result.text);
        } catch (error) {
          // Not JSON
        }
        
        this.emit(this.#signalRequestCompleted, this.#result, this.#responseCode, this.#responseHeaders, this.#responseBody);
        resolve(result);
      });
    });

    request.on('error', (error) => {
      this.#result = HTTPRequest.RESULT_CONNECTION_ERROR;
      this.#requesting = false;
      this.#completed = true;
      this.emit(this.#signalError, error.message);
      reject(error);
    });

    request.on('timeout', () => {
      request.destroy();
      this.#result = HTTPRequest.RESULT_NO_RESPONSE;
      this.#requesting = false;
      this.#completed = true;
      this.emit(this.#signalError, 'Request timeout');
      reject(new Error(`HTTP request timed out after ${this.#timeout}ms`));
    });

    // Write body
    const requestBody = body || this.#body;
    if (requestBody) {
      if (typeof requestBody === 'string') {
        request.write(requestBody);
      } else if (requestBody instanceof Uint8Array || requestBody instanceof Buffer) {
        request.write(requestBody);
      } else if (requestBody instanceof ArrayBuffer) {
        request.write(Buffer.from(requestBody));
      } else if (typeof requestBody === 'object') {
        request.write(JSON.stringify(requestBody));
      }
    }
    
    request.end();
  }

  /**
   * GET request
   * @param {string} url - URL to request
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>}
   */
  get(url, headers = {}) {
    return this.request(url, HTTPRequest.METHOD_GET, headers);
  }

  /**
   * POST request
   * @param {string} url - URL to request
   * @param {*} body - Request body
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>}
   */
  post(url, body = null, headers = {}) {
    return this.request(url, HTTPRequest.METHOD_POST, headers, body);
  }

  /**
   * PUT request
   * @param {string} url - URL to request
   * @param {*} body - Request body
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>}
   */
  put(url, body = null, headers = {}) {
    return this.request(url, HTTPRequest.METHOD_PUT, headers, body);
  }

  /**
   * DELETE request
   * @param {string} url - URL to request
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>}
   */
  delete(url, headers = {}) {
    return this.request(url, HTTPRequest.METHOD_DELETE, headers);
  }

  /**
   * PATCH request
   * @param {string} url - URL to request
   * @param {*} body - Request body
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>}
   */
  patch(url, body = null, headers = {}) {
    return this.request(url, HTTPRequest.METHOD_PATCH, headers, body);
  }

  /**
   * HEAD request
   * @param {string} url - URL to request
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>}
   */
  head(url, headers = {}) {
    return this.request(url, HTTPRequest.METHOD_HEAD, headers);
  }

  /**
   * OPTIONS request
   * @param {string} url - URL to request
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>}
   */
  options(url, headers = {}) {
    return this.request(url, HTTPRequest.METHOD_OPTIONS, headers);
  }

  /**
   * Set header
   * @param {string} name - Header name
   * @param {string} value - Header value
   * @returns {HTTPRequest} This instance
   */
  setHeader(name, value) {
    this.#headers[name] = value;
    return this;
  }

  /**
   * Set headers
   * @param {Object} headers - Headers
   * @returns {HTTPRequest} This instance
   */
  setHeaders(headers) {
    for (const name in headers) {
      this.#headers[name] = headers[name];
    }
    return this;
  }

  /**
   * Set timeout
   * @param {number} ms - Timeout in milliseconds
   * @returns {HTTPRequest} This instance
   */
  setTimeout(ms) {
    this.#timeout = ms;
    return this;
  }

  /**
   * Set max redirects
   * @param {number} max - Maximum redirects
   * @returns {HTTPRequest} This instance
   */
  setMaxRedirects(max) {
    this.#maxRedirects = max;
    return this;
  }

  /**
   * Set follow redirects
   * @param {boolean} follow - Follow redirects
   * @returns {HTTPRequest} This instance
   */
  setFollowRedirects(follow) {
    this.#followRedirects = follow;
    return this;
  }

  /**
   * Set body size limit
   * @param {number} limit - Body size limit in bytes
   * @returns {HTTPRequest} This instance
   */
  setBodySizeLimit(limit) {
    this.#bodySizeLimit = limit;
    return this;
  }

  /**
   * Set download file
   * @param {string} path - File path
   * @returns {HTTPRequest} This instance
   */
  setDownloadFile(path) {
    this.#downloadFile = path;
    return this;
  }

  /**
   * Set user agent
   * @param {string} userAgent - User agent
   * @returns {HTTPRequest} This instance
   */
  setUserAgent(userAgent) {
    this.#userAgent = userAgent;
    return this;
  }

  /**
   * Set compression
   * @param {boolean} enable - Enable compression
   * @returns {HTTPRequest} This instance
   */
  setCompression(enable) {
    this.#compression = enable;
    return this;
  }

  /**
   * Set keep alive
   * @param {boolean} enable - Enable keep alive
   * @returns {HTTPRequest} This instance
   */
  setKeepAlive(enable) {
    this.#keepAlive = enable;
    return this;
  }

  /**
   * Set verify SSL
   * @param {boolean} verify - Verify SSL
   * @returns {HTTPRequest} This instance
   */
  setVerifySSL(verify) {
    this.#verifySSL = verify;
    return this;
  }

  /**
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @returns {HTTPRequest} This instance
   */
  setCookie(name, value) {
    this.#cookies[name] = value;
    return this;
  }

  /**
   * Set cookies
   * @param {Object} cookies - Cookies
   * @returns {HTTPRequest} This instance
   */
  setCookies(cookies) {
    for (const name in cookies) {
      this.#cookies[name] = cookies[name];
    }
    return this;
  }

  /**
   * Cancel request
   * @returns {HTTPRequest} This instance
   */
  cancel() {
    this.#requesting = false;
    this.#completed = true;
    return this;
  }

  /**
   * Get response code
   * @returns {number}
   */
  getResponseCode() {
    return this.#responseCode;
  }

  /**
   * Get response headers
   * @returns {Object}
   */
  getResponseHeaders() {
    return this.#responseHeaders;
  }

  /**
   * Get response body
   * @returns {Buffer}
   */
  getResponseBody() {
    return this.#responseBody;
  }

  /**
   * Get response body as text
   * @returns {string}
   */
  getResponseBodyAsText() {
    return this.#responseBody ? this.#responseBody.toString('utf-8') : '';
  }

  /**
   * Get response body as JSON
   * @returns {Object|null}
   */
  getResponseBodyAsJSON() {
    try {
      return JSON.parse(this.getResponseBodyAsText());
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if requesting
   * @returns {boolean}
   */
  isRequesting() {
    return this.#requesting;
  }

  /**
   * Get progress
   * @returns {number}
   */
  getProgress() {
    return this.#progress;
  }

  /**
   * Get result
   * @returns {number}
   */
  getResult() {
    return this.#result;
  }

  /**
   * Get status
   * @returns {number}
   */
  getStatus() {
    return this.#status;
  }

  /**
   * On request completed
   * @param {Function} callback - Callback
   * @returns {HTTPRequest} This instance
   */
  onRequestCompleted(callback) {
    this.connect(this.#signalRequestCompleted, this, callback);
    return this;
  }

  /**
   * On progress
   * @param {Function} callback - Callback
   * @returns {HTTPRequest} This instance
   */
  onProgress(callback) {
    this.connect(this.#signalProgress, this, callback);
    return this;
  }

  /**
   * On error
   * @param {Function} callback - Callback
   * @returns {HTTPRequest} This instance
   */
  onError(callback) {
    this.connect(this.#signalError, this, callback);
    return this;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.host = this.#host;
    data.port = this.#port;
    data.useSSL = this.#useSSL;
    data.method = this.#method;
    data.headers = this.#headers;
    data.maxRedirects = this.#maxRedirects;
    data.timeout = this.#timeout;
    data.bodySizeLimit = this.#bodySizeLimit;
    data.followRedirects = this.#followRedirects;
    data.downloadFile = this.#downloadFile;
    data.userAgent = this.#userAgent;
    data.compression = this.#compression;
    data.keepAlive = this.#keepAlive;
    data.verifySSL = this.#verifySSL;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {HTTPRequest} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#host = data.host || '';
    this.#port = data.port || 0;
    this.#useSSL = data.useSSL || false;
    this.#method = data.method || HTTPRequest.METHOD_GET;
    this.#headers = data.headers || {};
    this.#maxRedirects = data.maxRedirects || 8;
    this.#timeout = data.timeout || 30000;
    this.#bodySizeLimit = data.bodySizeLimit || -1;
    this.#followRedirects = data.followRedirects !== undefined ? data.followRedirects : true;
    this.#downloadFile = data.downloadFile || '';
    this.#userAgent = data.userAgent || 'LXRN-Engine/1.0';
    this.#compression = data.compression !== undefined ? data.compression : true;
    this.#keepAlive = data.keepAlive !== undefined ? data.keepAlive : true;
    this.#verifySSL = data.verifySSL !== undefined ? data.verifySSL : true;
    return this;
  }
}

module.exports = HTTPRequest;
