/**
 * LXRN FileAccessZip Module
 * @namespace LXRN.FileAccessZip
 * @author LXRN
 */

const FS = require('fs');
const JSZip = require('jszip');

/**
 * File access for ZIP archives
 * @class FileAccessZip
 */
class FileAccessZip {
  #zipFiles = [];
  #openFiles = new Map();
  #cache = new Map();
  #cacheEnabled = true;
  #maxCacheSize = 50;
  #logger = null;
  #handleId = 0;

  /**
   * Set logger
   * @param {Object} logger - Logger instance
   * @returns {FileAccessZip} This instance
   */
  setLogger(logger) {
    this.#logger = logger;
    return this;
  }

  /**
   * Log message
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Log data
   */
  __log(level, message, data = null) {
    if (this.#logger) {
      if (typeof this.#logger.log === 'function') {
        this.#logger.log(level, message, data);
      } else if (typeof this.#logger === 'function') {
        this.#logger(level, message, data);
      }
    }
  }

  /**
   * Open ZIP file
   * @param {string} path - ZIP file path
   * @param {string} password - Password
   * @returns {Promise<FileAccessZip>}
   */
  async openZip(path, password = null) {
    if (!FS.existsSync(path)) {
      throw new Error(`ZIP file not found: ${path}`);
    }
    
    try {
      const data = FS.readFileSync(path);
      const zip = await JSZip.loadAsync(data, { password });
      
      this.#zipFiles.push({
        path: path,
        zip: zip,
        entries: zip.files,
        password: password,
      });
      
      this.__log('info', `Opened ZIP: ${path}`, { files: Object.keys(zip.files).length });
      return this;
    } catch (error) {
      throw new Error(`Failed to open ZIP: ${error.message}`);
    }
  }

  /**
   * Open ZIP file synchronously
   * @param {string} path - ZIP file path
   * @param {string} password - Password
   * @returns {FileAccessZip}
   */
  openZipSync(path, password = null) {
    if (!FS.existsSync(path)) {
      throw new Error(`ZIP file not found: ${path}`);
    }
    
    try {
      const data = FS.readFileSync(path);
      const zip = JSZip.loadSync(data, { password });
      
      this.#zipFiles.push({
        path: path,
        zip: zip,
        entries: zip.files,
        password: password,
      });
      
      this.__log('info', `Opened ZIP: ${path}`, { files: Object.keys(zip.files).length });
      return this;
    } catch (error) {
      throw new Error(`Failed to open ZIP: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @param {string} path - File path
   * @returns {boolean}
   */
  fileExists(path) {
    for (const zip of this.#zipFiles) {
      if (zip.entries[path] && !zip.entries[path].dir) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get file data
   * @param {string} path - File path
   * @returns {Promise<Uint8Array|null>}
   */
  async getFile(path) {
    // Check cache
    if (this.#cacheEnabled && this.#cache.has(path)) {
      return this.#cache.get(path);
    }
    
    for (const zip of this.#zipFiles) {
      const entry = zip.entries[path];
      if (entry && !entry.dir) {
        try {
          const data = await entry.async('uint8array');
          const result = new Uint8Array(data);
          
          // Cache
          if (this.#cacheEnabled) {
            this.#cache.set(path, result);
            this.__trimCache();
          }
          
          return result;
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Get file data synchronously
   * @param {string} path - File path
   * @returns {Uint8Array|null}
   */
  getFileSync(path) {
    // Check cache
    if (this.#cacheEnabled && this.#cache.has(path)) {
      return this.#cache.get(path);
    }
    
    for (const zip of this.#zipFiles) {
      const entry = zip.entries[path];
      if (entry && !entry.dir) {
        try {
          const data = entry.asUint8Array();
          const result = new Uint8Array(data);
          
          // Cache
          if (this.#cacheEnabled) {
            this.#cache.set(path, result);
            this.__trimCache();
          }
          
          return result;
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Trim cache
   * @private
   */
  __trimCache() {
    if (this.#cache.size > this.#maxCacheSize) {
      const entries = Array.from(this.#cache.entries());
      const toRemove = entries.slice(0, Math.floor(entries.length / 2));
      for (const [key] of toRemove) {
        this.#cache.delete(key);
      }
    }
  }

  /**
   * Open file
   * @param {string} path - File path
   * @param {string} mode - Open mode ('r')
   * @returns {string} File handle
   */
  openFile(path, mode = 'r') {
    if (mode !== 'r') {
      throw new Error('ZIP files are read-only');
    }
    
    const data = this.getFileSync(path);
    if (!data) {
      throw new Error(`File not found in ZIP: ${path}`);
    }
    
    const handleId = ++this.#handleId;
    const handle = {
      id: handleId,
      path: path,
      data: data,
      position: 0,
      mode: mode,
      size: data.length,
    };
    
    this.#openFiles.set(handleId, handle);
    return String(handleId);
  }

  /**
   * Close file
   * @param {string} handle - File handle
   * @returns {boolean}
   */
  closeFile(handle) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (file) {
      this.#openFiles.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Read file
   * @param {string} handle - File handle
   * @param {number} size - Number of bytes to read
   * @returns {Uint8Array}
   */
  readFile(handle, size = -1) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    
    if (size === -1) {
      const result = file.data.slice(file.position);
      file.position = file.data.length;
      return result;
    }
    
    const end = Math.min(file.position + size, file.data.length);
    const result = file.data.slice(file.position, end);
    file.position = end;
    return result;
  }

  /**
   * Seek to position
   * @param {string} handle - File handle
   * @param {number} position - Position
   */
  seek(handle, position) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    if (position < 0 || position > file.data.length) {
      throw new Error(`Seek position out of bounds: ${position}`);
    }
    file.position = position;
  }

  /**
   * Get position
   * @param {string} handle - File handle
   * @returns {number}
   */
  getPosition(handle) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    return file.position;
  }

  /**
   * Get file size
   * @param {string} handle - File handle
   * @returns {number}
   */
  getSize(handle) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    return file.data.length;
  }

  /**
   * List files
   * @param {string} path - Directory path
   * @param {Object} options - List options
   * @returns {Array}
   */
  listFiles(path = '', options = {}) {
    const results = [];
    const recursive = options.recursive || false;
    
    for (const zip of this.#zipFiles) {
      for (const name in zip.entries) {
        if (!zip.entries[name].dir) {
          const matchPath = path === '' || name.startsWith(path);
          if (matchPath) {
            const relative = path === '' ? name : name.substring(path.length + 1);
            if (!recursive && relative.includes('/')) continue;
            results.push(name);
          }
        }
      }
    }
    return [...new Set(results)];
  }

  /**
   * List directories
   * @param {string} path - Directory path
   * @param {Object} options - List options
   * @returns {Array}
   */
  listDirectories(path = '', options = {}) {
    const results = [];
    const recursive = options.recursive || false;
    
    for (const zip of this.#zipFiles) {
      for (const name in zip.entries) {
        if (zip.entries[name].dir) {
          const matchPath = path === '' || name.startsWith(path);
          if (matchPath) {
            const relative = path === '' ? name : name.substring(path.length + 1);
            if (!recursive && relative.includes('/')) continue;
            results.push(name);
          }
        }
      }
    }
    return [...new Set(results)];
  }

  /**
   * Extract all files to directory
   * @param {string} destDir - Destination directory
   * @param {Function} progress - Progress callback
   * @param {Object} options - Extract options
   * @returns {Promise<Array>}
   */
  async extractAll(destDir, progress = null, options = {}) {
    const results = [];
    const files = this.listFiles('', options);
    
    if (!FS.existsSync(destDir)) {
      FS.mkdirSync(destDir, { recursive: true });
    }
    
    const overwrite = options.overwrite !== undefined ? options.overwrite : true;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = await this.getFile(file);
      if (data) {
        const fullPath = `${destDir}/${file}`;
        const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
        if (dir && !FS.existsSync(dir)) {
          FS.mkdirSync(dir, { recursive: true });
        }
        
        if (FS.existsSync(fullPath) && !overwrite) {
          results.push({ file, path: fullPath, success: false, error: 'File exists' });
        } else {
          FS.writeFileSync(fullPath, data);
          results.push({ file, path: fullPath, success: true });
        }
      } else {
        results.push({ file, success: false, error: 'Failed to read file' });
      }
      
      if (progress) {
        progress(i + 1, files.length, file);
      }
    }
    return results;
  }

  /**
   * Enable cache
   * @param {boolean} enable - Enable cache
   * @param {number} maxSize - Max cache size
   * @returns {FileAccessZip} This instance
   */
  setCache(enable, maxSize = 50) {
    this.#cacheEnabled = enable;
    this.#maxCacheSize = maxSize;
    if (!enable) {
      this.#cache.clear();
    }
    return this;
  }

  /**
   * Get ZIP count
   * @returns {number}
   */
  get zipCount() {
    return this.#zipFiles.length;
  }
}

module.exports = FileAccessZip;
