/**
 * LXRN FileAccessPack Module
 * @namespace LXRN.FileAccessPack
 * @author LXRN
 */

const StreamPeer = require('../core/StreamPeer.js');
const Compression = require('../core/Compression.js');
const FS = require('fs');

/**
 * File access for pack files
 * @class FileAccessPack
 */
class FileAccessPack {
  #packFiles = [];
  #openFiles = new Map();
  #fileHandles = new Map();
  #handleId = 0;
  #cacheEnabled = true;
  #cache = new Map();
  #maxCacheSize = 50;
  #logger = null;

  /**
   * Set logger
   * @param {Object} logger - Logger instance
   * @returns {FileAccessPack} This instance
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
   * Add pack file
   * @param {string} path - Pack file path
   * @param {string} password - Encryption password
   * @returns {FileAccessPack} This instance
   */
  addPack(path, password = null) {
    if (!FS.existsSync(path)) {
      throw new Error(`Pack file not found: ${path}`);
    }
    
    const data = FS.readFileSync(path);
    const reader = new StreamPeer();
    reader.putData(data);
    const bytes = reader.toBytes();
    const view = new DataView(bytes.buffer);
    
    const magic = view.getUint32(0, true);
    if (magic !== 0x50434B50) {
      throw new Error(`Invalid pack file: ${path}`);
    }
    
    const version = view.getUint32(4, true);
    const fileCount = view.getUint32(8, true);
    const metaLen = view.getUint32(12, true);
    
    let offset = 16 + metaLen;
    const entries = [];
    
    const entryCount = view.getUint32(offset, true);
    offset += 4;
    
    for (let i = 0; i < entryCount; i++) {
      const pathLen = view.getUint32(offset, true);
      offset += 4;
      const pathStr = new TextDecoder().decode(bytes.slice(offset, offset + pathLen));
      offset += pathLen;
      
      const aliasLen = view.getUint32(offset, true);
      offset += 4;
      const aliasStr = new TextDecoder().decode(bytes.slice(offset, offset + aliasLen));
      offset += aliasLen;
      
      const size = view.getUint32(offset, true);
      offset += 4;
      const compressed = view.getUint32(offset, true) === 1;
      offset += 4;
      const compressedSize = view.getUint32(offset, true);
      offset += 4;
      const dataOffset = view.getUint32(offset, true);
      offset += 4;
      
      entries.push({
        path: pathStr,
        alias: aliasStr,
        size: size,
        compressed: compressed,
        compressedSize: compressedSize,
        offset: dataOffset,
        packPath: path,
      });
    }
    
    this.#packFiles.push({
      path: path,
      entries: entries,
      data: data,
      password: password,
    });
    
    this.__log('info', `Added pack: ${path}`, { files: entries.length });
    return this;
  }

  /**
   * Check if file exists
   * @param {string} path - File path
   * @returns {boolean}
   */
  fileExists(path) {
    for (const pack of this.#packFiles) {
      for (const entry of pack.entries) {
        if (entry.path === path || entry.alias === path) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get file data
   * @param {string} path - File path
   * @returns {Uint8Array|null}
   */
  getFile(path) {
    // Check cache
    if (this.#cacheEnabled && this.#cache.has(path)) {
      return this.#cache.get(path);
    }
    
    for (const pack of this.#packFiles) {
      for (const entry of pack.entries) {
        if (entry.path === path || entry.alias === path) {
          const fileData = pack.data.slice(entry.offset, entry.offset + entry.compressedSize);
          let data = new Uint8Array(fileData);
          
          // Decrypt if needed
          if (pack.password) {
            data = this.__decryptData(data, pack.password);
          }
          
          // Decompress if needed
          if (entry.compressed) {
            data = Compression.decompress(data);
          }
          
          // Cache
          if (this.#cacheEnabled) {
            this.#cache.set(path, data);
            this.__trimCache();
          }
          
          return data;
        }
      }
    }
    return null;
  }

  /**
   * Decrypt data
   * @private
   * @param {Uint8Array} data - Data to decrypt
   * @param {string} password - Password
   * @returns {Uint8Array}
   */
  __decryptData(data, password) {
    const key = new TextEncoder().encode(password);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % key.length];
    }
    return result;
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
      throw new Error('Pack files are read-only');
    }
    
    const data = this.getFile(path);
    if (!data) {
      throw new Error(`File not found in pack: ${path}`);
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
    this.#fileHandles.set(path, handleId);
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
      this.#fileHandles.delete(file.path);
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
    const includeAlias = options.includeAlias || false;
    
    for (const pack of this.#packFiles) {
      for (const entry of pack.entries) {
        const matchPath = path === '' || entry.path.startsWith(path);
        if (matchPath) {
          const relative = path === '' ? entry.path : entry.path.substring(path.length + 1);
          if (!recursive && relative.includes('/')) continue;
          results.push(includeAlias ? { path: entry.path, alias: entry.alias } : entry.path);
        }
      }
    }
    return [...new Set(results)];
  }

  /**
   * Enable cache
   * @param {boolean} enable - Enable cache
   * @param {number} maxSize - Max cache size
   * @returns {FileAccessPack} This instance
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
   * Get pack count
   * @returns {number}
   */
  get packCount() {
    return this.#packFiles.length;
  }

  /**
   * Get open file count
   * @returns {number}
   */
  get openCount() {
    return this.#openFiles.size;
  }
}

module.exports = FileAccessPack;
