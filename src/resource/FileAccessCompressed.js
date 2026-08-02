/**
 * LXRN FileAccessCompressed Module
 * @namespace LXRN.FileAccessCompressed
 * @author LXRN
 */

const FS = require('fs');
const Compression = require('../core/Compression.js');

/**
 * Compressed file access
 * @class FileAccessCompressed
 */
class FileAccessCompressed {
  #mode = Compression.MODE_DEFAULT;
  #algorithm = 'deflate';
  #level = 6;
  #files = [];
  #cache = new Map();
  #cacheEnabled = true;
  #maxCacheSize = 50;

  /**
   * Set compression mode
   * @param {number} mode - Compression mode
   * @returns {FileAccessCompressed} This instance
   */
  setMode(mode) {
    this.#mode = mode;
    return this;
  }

  /**
   * Set algorithm
   * @param {string} algorithm - Compression algorithm ('deflate', 'gzip', 'zstd')
   * @returns {FileAccessCompressed} This instance
   */
  setAlgorithm(algorithm) {
    const valid = ['deflate', 'gzip', 'zstd'];
    if (!valid.includes(algorithm)) {
      throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }
    this.#algorithm = algorithm;
    return this;
  }

  /**
   * Set compression level
   * @param {number} level - Compression level (1-9 for deflate/gzip, 1-22 for zstd)
   * @returns {FileAccessCompressed} This instance
   */
  setLevel(level) {
    this.#level = Math.max(1, Math.min(22, level));
    return this;
  }

  /**
   * Compress data
   * @param {Uint8Array|string} data - Data to compress
   * @returns {Uint8Array}
   */
  compress(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    let result;
    const mode = this.#mode;
    const level = this.#level;
    
    if (this.#algorithm === 'gzip') {
      result = Compression.compressGzip(data, mode);
    } else if (this.#algorithm === 'zstd') {
      const zstdLevel = level <= 3 ? 1 : level <= 9 ? 3 : level <= 15 ? 6 : 9;
      result = Compression.compressZstd(data, zstdLevel);
    } else {
      result = Compression.compress(data, mode);
    }
    
    // Add header with original size
    const header = new Uint8Array(4);
    const view = new DataView(header.buffer);
    view.setUint32(0, data.length, true);
    
    const combined = new Uint8Array(header.length + result.length);
    combined.set(header, 0);
    combined.set(result, header.length);
    return combined;
  }

  /**
   * Decompress data
   * @param {Uint8Array} data - Data to decompress
   * @returns {Uint8Array}
   */
  decompress(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    if (data.length < 4) {
      throw new Error('Invalid compressed data');
    }
    
    const view = new DataView(data.buffer);
    const originalSize = view.getUint32(0, true);
    const compressed = data.slice(4);
    
    let result;
    if (this.#algorithm === 'gzip') {
      result = Compression.decompressGzip(compressed);
    } else if (this.#algorithm === 'zstd') {
      result = Compression.decompressZstd(compressed);
    } else {
      result = Compression.decompress(compressed);
    }
    
    // Ensure result matches original size
    if (result.length !== originalSize) {
      const resized = new Uint8Array(originalSize);
      const copyLen = Math.min(result.length, originalSize);
      resized.set(result.slice(0, copyLen), 0);
      result = resized;
    }
    
    return result;
  }

  /**
   * Compress and save to file
   * @param {string} path - File path
   * @param {Uint8Array|string} data - Data to compress
   * @returns {FileAccessCompressed} This instance
   */
  compressToFile(path, data) {
    const compressed = this.compress(data);
    FS.writeFileSync(path, compressed);
    return this;
  }

  /**
   * Load and decompress from file
   * @param {string} path - File path
   * @param {Object} options - Load options
   * @returns {Uint8Array}
   */
  decompressFromFile(path, options = {}) {
    // Check cache
    if (this.#cacheEnabled && this.#cache.has(path)) {
      return this.#cache.get(path);
    }
    
    if (!FS.existsSync(path)) {
      throw new Error(`Compressed file not found: ${path}`);
    }
    const data = FS.readFileSync(path);
    const result = this.decompress(data);
    
    // Cache
    if (this.#cacheEnabled && options.cache !== false) {
      this.#cache.set(path, result);
      this.__trimCache();
    }
    
    return result;
  }

  /**
   * Compress text
   * @param {string} text - Text to compress
   * @returns {Uint8Array}
   */
  compressText(text) {
    return this.compress(new TextEncoder().encode(text));
  }

  /**
   * Decompress to text
   * @param {Uint8Array} data - Data to decompress
   * @returns {string}
   */
  decompressText(data) {
    const bytes = this.decompress(data);
    return new TextDecoder().decode(bytes);
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
   * Enable cache
   * @param {boolean} enable - Enable cache
   * @param {number} maxSize - Max cache size
   * @returns {FileAccessCompressed} This instance
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
   * Get mode
   * @returns {number}
   */
  get mode() {
    return this.#mode;
  }

  /**
   * Get algorithm
   * @returns {string}
   */
  get algorithm() {
    return this.#algorithm;
  }

  /**
   * Get level
   * @returns {number}
   */
  get level() {
    return this.#level;
  }
}

module.exports = FileAccessCompressed;
