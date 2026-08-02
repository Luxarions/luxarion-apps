/**
 * LXRN HTTPClient Module
 * @namespace LXRN.HTTPClient
 * @author LXRN
 */

const HTTPS = require('https');
const HTTP = require('http');
const URL = require('url');
const Zlib = require('zlib');

/**
 * HTTP Client for making HTTP requests
 * @class HTTPClient
 */
class HTTPClient {
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

  #method = HTTPClient.METHOD_GET;
  #headers = {};
  #body = null;
  #response = null;
  #status = 0;
  #responseHeaders = {};
  #responseBody = null;
  #timeout = 30000;
  #followRedirects = true;
  #maxRedirects = 10;
  #cookies = {};
  #userAgent = 'LXRN-Engine/1.0';
  #compression = true;
  #keepAlive = true;
  #verifySSL = true;
  #progressCallback = null;
  #uploadProgress = 0;
  #downloadProgress = 0;
  #requestStartTime = 0;
  #requestEndTime = 0;

  /**
   * Set HTTP method
   * @param {string} method - HTTP method
   * @returns {HTTPClient} This instance
   */
  setMethod(method) {
    this.#method = method;
    return this;
  }

  /**
   * Set header
   * @param {string} name - Header name
   * @param {string} value - Header value
   * @returns {HTTPClient} This instance
   */
  setHeader(name, value) {
    this.#headers[name.toLowerCase()] = value;
    return this;
  }

  /**
   * Set multiple headers
   * @param {Object} headers - Headers object
   * @returns {HTTPClient} This instance
   */
  setHeaders(headers) {
    for (const name in headers) {
      this.#headers[name.toLowerCase()] = headers[name];
    }
    return this;
  }

  /**
   * Set request body
   * @param {*} body - Request body
   * @returns {HTTPClient} This instance
   */
  setBody(body) {
    if (typeof body === 'object' && !(body instanceof Uint8Array) && !(body instanceof ArrayBuffer)) {
      body = JSON.stringify(body);
    }
    this.#body = body;
    if (typeof body === 'string') {
      this.#headers['content-type'] = this.#headers['content-type'] || 'text/plain';
    }
    return this;
  }

  /**
   * Set JSON body
   * @param {Object} data - JSON data
   * @returns {HTTPClient} This instance
   */
  setJSONBody(data) {
    this.#body = JSON.stringify(data);
    this.#headers['content-type'] = 'application/json';
    return this;
  }

  /**
   * Set form body
   * @param {Object} data - Form data
   * @returns {HTTPClient} This instance
   */
  setFormBody(data) {
    const params = new URLSearchParams();
    for (const key in data) {
      params.append(key, data[key]);
    }
    this.#body = params.toString();
    this.#headers['content-type'] = 'application/x-www-form-urlencoded';
    return this;
  }

  /**
   * Set multipart form data
   * @param {Object} fields - Form fields
   * @param {Object} files - File fields
   * @returns {HTTPClient} This instance
   */
  setMultipartFormData(fields, files = {}) {
    const boundary = '----LXRNBoundary' + Date.now().toString(36);
    const parts = [];
    
    // Add fields
    for (const [key, value] of Object.entries(fields)) {
      parts.push(`--${boundary}`);
      parts.push(`Content-Disposition: form-data; name="${key}"`);
      parts.push('');
      parts.push(String(value));
    }
    
    // Add files
    for (const [key, file] of Object.entries(files)) {
      parts.push(`--${boundary}`);
      const filename = file.filename || 'file';
      parts.push(`Content-Disposition: form-data; name="${key}"; filename="${filename}"`);
      parts.push(`Content-Type: ${file.contentType || 'application/octet-stream'}`);
      parts.push('');
      parts.push(file.data);
    }
    
    parts.push(`--${boundary}--`);
    
    this.#body = parts.join('\r\n');
    this.#headers['content-type'] = `multipart/form-data; boundary=${boundary}`;
    return this;
  }

  /**
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @returns {HTTPClient} This instance
   */
  setCookie(name, value) {
    this.#cookies[name] = value;
    return this;
  }

  /**
   * Set multiple cookies
   * @param {Object} cookies - Cookies object
   * @returns {HTTPClient} This instance
   */
  setCookies(cookies) {
    for (const name in cookies) {
      this.#cookies[name] = cookies[name];
    }
    return this;
  }

  /**
   * Set timeout
   * @param {number} ms - Timeout in milliseconds
   * @returns {HTTPClient} This instance
   */
  setTimeout(ms) {
    this.#timeout = ms;
    return this;
  }

  /**
   * Set follow redirects
   * @param {boolean} follow - Follow redirects
   * @returns {HTTPClient} This instance
   */
  setFollowRedirects(follow) {
    this.#followRedirects = follow;
    return this;
  }

  /**
   * Set max redirects
   * @param {number} max - Maximum redirects
   * @returns {HTTPClient} This instance
   */
  setMaxRedirects(max) {
    this.#maxRedirects = max;
    return this;
  }

  /**
   * Set user agent
   * @param {string} userAgent - User agent string
   * @returns {HTTPClient} This instance
   */
  setUserAgent(userAgent) {
    this.#userAgent = userAgent;
    return this;
  }

  /**
   * Enable/disable compression
   * @param {boolean} enable - Enable compression
   * @returns {HTTPClient} This instance
   */
  setCompression(enable) {
    this.#compression = enable;
    return this;
  }

  /**
   * Enable/disable keep-alive
   * @param {boolean} enable - Enable keep-alive
   * @returns {HTTPClient} This instance
   */
  setKeepAlive(enable) {
    this.#keepAlive = enable;
    return this;
  }

  /**
   * Set verify SSL
   * @param {boolean} verify - Verify SSL
   * @returns {HTTPClient} This instance
   */
  setVerifySSL(verify) {
    this.#verifySSL = verify;
    return this;
  }

  /**
   * Set progress callback
   * @param {Function} callback - Progress callback
   * @returns {HTTPClient} This instance
   */
  setProgressCallback(callback) {
    this.#progressCallback = callback;
    return this;
  }

  /**
   * Make HTTP request
   * @param {string} url - URL to request
   * @returns {Promise<Object>}
   */
  request(url) {
    return new Promise((resolve, reject) => {
      this.#requestStartTime = Date.now();
      this.#uploadProgress = 0;
      this.#downloadProgress = 0;
      
      const parsedUrl = new URL.URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const http = isHttps ? HTTPS : HTTP;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: this.#method,
        headers: { ...this.#headers },
        timeout: this.#timeout,
        rejectUnauthorized: this.#verifySSL,
        keepAlive: this.#keepAlive,
      };
      
      // Set default headers
      if (!options.headers['user-agent']) {
        options.headers['user-agent'] = this.#userAgent;
      }
      if (this.#compression && !options.headers['accept-encoding']) {
        options.headers['accept-encoding'] = 'gzip, deflate';
      }
      
      // Add cookies
      if (Object.keys(this.#cookies).length > 0) {
        const cookieStr = Object.entries(this.#cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
        options.headers['cookie'] = cookieStr;
      }
      
      // Set content length for body
      if (this.#method === 'POST' || this.#method === 'PUT' || this.#method === 'PATCH') {
        if (this.#body) {
          if (typeof this.#body === 'string') {
            options.headers['content-length'] = Buffer.byteLength(this.#body);
          } else if (this.#body instanceof Uint8Array || this.#body instanceof Buffer) {
            options.headers['content-length'] = this.#body.length;
          } else if (this.#body instanceof ArrayBuffer) {
            options.headers['content-length'] = this.#body.byteLength;
          }
        }
      }
      
      const request = http.request(options, (response) => {
        this.#status = response.statusCode;
        this.#responseHeaders = response.headers;
        
        const chunks = [];
        let responseLength = 0;
        const contentLength = parseInt(response.headers['content-length']) || 0;
        
        response.on('data', (chunk) => {
          chunks.push(chunk);
          responseLength += chunk.length;
          this.#downloadProgress = contentLength > 0 ? responseLength / contentLength : 0;
          
          if (this.#progressCallback) {
            this.#progressCallback({
              type: 'download',
              loaded: responseLength,
              total: contentLength,
              progress: this.#downloadProgress,
            });
          }
        });
        
        response.on('end', () => {
          this.#requestEndTime = Date.now();
          let body = Buffer.concat(chunks);
          
          // Handle compressed response
          if (this.#compression && response.headers['content-encoding']) {
            try {
              if (response.headers['content-encoding'] === 'gzip') {
                body = Zlib.gunzipSync(body);
              } else if (response.headers['content-encoding'] === 'deflate') {
                body = Zlib.inflateSync(body);
              }
            } catch (error) {
              // Fall through
            }
          }
          
          this.#responseBody = body;
          this.#response = {
            status: this.#status,
            headers: this.#responseHeaders,
            body: body,
            text: body.toString('utf-8'),
            json: null,
            duration: this.#requestEndTime - this.#requestStartTime,
          };
          
          try {
            this.#response.json = JSON.parse(this.#response.text);
          } catch (error) {
            // Not JSON
          }
          
          // Handle redirects
          if (this.#followRedirects && 
              (this.#status === 301 || this.#status === 302 || 
               this.#status === 303 || this.#status === 307 || this.#status === 308) &&
              this.#maxRedirects > 0) {
            const location = response.headers.location;
            if (location) {
              this.#maxRedirects--;
              this.#followRedirects = false;
              this.request(new URL.URL(location, url).toString())
                .then(resolve)
                .catch(reject);
              return;
            }
          }
          
          resolve(this.#response);
        });
      });
      
      request.on('error', (error) => {
        this.#requestEndTime = Date.now();
        reject(new Error(`HTTP request failed: ${error.message}`));
      });
      
      request.on('timeout', () => {
        request.destroy();
        this.#requestEndTime = Date.now();
        reject(new Error(`HTTP request timed out after ${this.#timeout}ms`));
      });
      
      // Write body with progress
      if (this.#body) {
        const bodyData = this.#body;
        let totalBytes = 0;
        
        if (typeof bodyData === 'string') {
          const buffer = Buffer.from(bodyData);
          totalBytes = buffer.length;
          request.write(buffer);
        } else if (bodyData instanceof Uint8Array || bodyData instanceof Buffer) {
          totalBytes = bodyData.length;
          request.write(bodyData);
        } else if (bodyData instanceof ArrayBuffer) {
          const buffer = Buffer.from(bodyData);
          totalBytes = buffer.length;
          request.write(buffer);
        }
        
        if (this.#progressCallback && totalBytes > 0) {
          this.#uploadProgress = 1;
          this.#progressCallback({
            type: 'upload',
            loaded: totalBytes,
            total: totalBytes,
            progress: 1,
          });
        }
      }
      
      request.end();
    });
  }

  /**
   * GET request
   * @param {string} url - URL to request
   * @returns {Promise<Object>}
   */
  get(url) {
    this.setMethod(HTTPClient.METHOD_GET);
    return this.request(url);
  }

  /**
   * POST request
   * @param {string} url - URL to request
   * @param {*} body - Request body
   * @returns {Promise<Object>}
   */
  post(url, body = null) {
    this.setMethod(HTTPClient.METHOD_POST);
    if (body) this.setBody(body);
    return this.request(url);
  }

  /**
   * PUT request
   * @param {string} url - URL to request
   * @param {*} body - Request body
   * @returns {Promise<Object>}
   */
  put(url, body = null) {
    this.setMethod(HTTPClient.METHOD_PUT);
    if (body) this.setBody(body);
    return this.request(url);
  }

  /**
   * DELETE request
   * @param {string} url - URL to request
   * @returns {Promise<Object>}
   */
  delete(url) {
    this.setMethod(HTTPClient.METHOD_DELETE);
    return this.request(url);
  }

  /**
   * PATCH request
   * @param {string} url - URL to request
   * @param {*} body - Request body
   * @returns {Promise<Object>}
   */
  patch(url, body = null) {
    this.setMethod(HTTPClient.METHOD_PATCH);
    if (body) this.setBody(body);
    return this.request(url);
  }

  /**
   * HEAD request
   * @param {string} url - URL to request
   * @returns {Promise<Object>}
   */
  head(url) {
    this.setMethod(HTTPClient.METHOD_HEAD);
    return this.request(url);
  }

  /**
   * OPTIONS request
   * @param {string} url - URL to request
   * @returns {Promise<Object>}
   */
  options(url) {
    this.setMethod(HTTPClient.METHOD_OPTIONS);
    return this.request(url);
  }

  /**
   * Get response
   * @returns {Object|null}
   */
  getResponse() {
    return this.#response;
  }

  /**
   * Get status code
   * @returns {number}
   */
  getStatus() {
    return this.#status;
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
   * Get response text
   * @returns {string}
   */
  getResponseText() {
    return this.#response ? this.#response.text : '';
  }

  /**
   * Get response JSON
   * @returns {Object|null}
   */
  getResponseJSON() {
    return this.#response ? this.#response.json : null;
  }

  /**
   * Get request duration
   * @returns {number}
   */
  getDuration() {
    return this.#response ? this.#response.duration : 0;
  }

  /**
   * Get upload progress
   * @returns {number}
   */
  getUploadProgress() {
    return this.#uploadProgress;
  }

  /**
   * Get download progress
   * @returns {number}
   */
  getDownloadProgress() {
    return this.#downloadProgress;
  }

  /**
   * Download file
   * @param {string} url - URL to download
   * @param {string} filePath - File path to save
   * @returns {Promise<void>}
   */
  downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const parsedUrl = new URL.URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const http = isHttps ? HTTPS : HTTP;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: this.#headers,
        timeout: this.#timeout,
        rejectUnauthorized: this.#verifySSL,
      };
      
      const request = http.request(options, (response) => {
        const fileStream = fs.createWriteStream(filePath);
        const totalSize = parseInt(response.headers['content-length']) || 0;
        let downloaded = 0;
        
        response.on('data', (chunk) => {
          downloaded += chunk.length;
          this.#downloadProgress = totalSize > 0 ? downloaded / totalSize : 0;
          
          if (this.#progressCallback) {
            this.#progressCallback({
              type: 'download',
              loaded: downloaded,
              total: totalSize,
              progress: this.#downloadProgress,
            });
          }
        });
        
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        
        fileStream.on('error', (error) => {
          fs.unlink(filePath, () => {});
          reject(error);
        });
      });
      
      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
      
      request.end();
    });
  }

  /**
   * Upload file
   * @param {string} url - URL to upload
   * @param {string} filePath - File path to upload
   * @param {string} fieldName - Form field name
   * @returns {Promise<Object>}
   */
  uploadFile(url, filePath, fieldName = 'file') {
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    const filename = require('path').basename(filePath);
    const data = fs.readFileSync(filePath);
    
    return this.setMultipartFormData(
      {},
      { [fieldName]: { filename, data, contentType: 'application/octet-stream' } }
    ).request(url);
  }
}

module.exports = HTTPClient;
