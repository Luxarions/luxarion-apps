/**
 * LXRN ZipIO Module
 * @namespace LXRN.ZipIO
 * @author LXRN
 */

const FS = require('fs');
const PATH = require('path');
const JSZip = require('jszip');
const Compression = require('./Compression.js');

/**
 * ZIP I/O utilities
 * @class ZipIO
 */
class ZipIO {
  /**
   * Compress data to ZIP
   * @param {Uint8Array|string} data - Data to compress
   * @param {number} level - Compression level
   * @returns {Promise<Uint8Array>}
   */
  static async compress(data, level = 6) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    try {
      const zip = new JSZip();
      zip.file('data', data);
      const result = await zip.generateAsync({
        type: 'uint8array',
        compression: 'DEFLATE',
        compressionOptions: { level },
      });
      return result;
    } catch (error) {
      throw new Error(`ZIP compression failed: ${error.message}`);
    }
  }

  /**
   * Decompress ZIP data
   * @param {Uint8Array} data - ZIP data
   * @returns {Promise<Object>}
   */
  static async decompress(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    try {
      const zip = await JSZip.loadAsync(data);
      const files = {};
      for (const name of Object.keys(zip.files)) {
        const entry = zip.files[name];
        if (!entry.dir) {
          const content = await entry.async('uint8array');
          files[name] = new Uint8Array(content);
        }
      }
      return files;
    } catch (error) {
      throw new Error(`ZIP decompression failed: ${error.message}`);
    }
  }

  /**
   * Decompress ZIP synchronously
   * @param {Uint8Array} data - ZIP data
   * @returns {Object}
   */
  static decompressSync(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    try {
      const zip = JSZip.loadSync(data);
      const files = {};
      for (const name of Object.keys(zip.files)) {
        const entry = zip.files[name];
        if (!entry.dir) {
          files[name] = new Uint8Array(entry.asUint8Array());
        }
      }
      return files;
    } catch (error) {
      throw new Error(`ZIP decompression failed: ${error.message}`);
    }
  }

  /**
   * Compress multiple files
   * @param {Object} files - File map {name: data}
   * @param {number} level - Compression level
   * @returns {Promise<Uint8Array>}
   */
  static async compressFiles(files, level = 6) {
    try {
      const zip = new JSZip();
      for (const [name, content] of Object.entries(files)) {
        let data = content;
        if (typeof data === 'string') {
          data = new TextEncoder().encode(data);
        }
        if (!(data instanceof Uint8Array)) {
          data = new Uint8Array(data);
        }
        zip.file(name, data);
      }
      const result = await zip.generateAsync({
        type: 'uint8array',
        compression: 'DEFLATE',
        compressionOptions: { level },
      });
      return result;
    } catch (error) {
      throw new Error(`ZIP compression failed: ${error.message}`);
    }
  }

  /**
   * Decompress multiple files
   * @param {Uint8Array} data - ZIP data
   * @returns {Promise<Object>}
   */
  static async decompressFiles(data) {
    return ZipIO.decompress(data);
  }

  /**
   * Decompress multiple files synchronously
   * @param {Uint8Array} data - ZIP data
   * @returns {Object}
   */
  static decompressFilesSync(data) {
    return ZipIO.decompressSync(data);
  }

  /**
   * Archive directory
   * @param {string} dir - Directory path
   * @param {number} level - Compression level
   * @returns {Promise<Uint8Array>}
   */
  static async archiveDirectory(dir, level = 6) {
    if (!FS.existsSync(dir)) {
      throw new Error(`Directory not found: ${dir}`);
    }
    
    const files = {};
    const entries = FS.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = PATH.join(dir, entry);
      const stat = FS.statSync(fullPath);
      if (stat.isFile()) {
        files[entry] = FS.readFileSync(fullPath);
      }
    }
    return ZipIO.compressFiles(files, level);
  }

  /**
   * Extract archive to directory
   * @param {Uint8Array} data - ZIP data
   * @param {string} destDir - Destination directory
   * @returns {Promise<Object>}
   */
  static async extractArchive(data, destDir) {
    if (!FS.existsSync(destDir)) {
      FS.mkdirSync(destDir, { recursive: true });
    }
    
    const files = await ZipIO.decompress(data);
    for (const [name, content] of Object.entries(files)) {
      const path = PATH.join(destDir, name);
      const parent = PATH.dirname(path);
      if (!FS.existsSync(parent)) {
        FS.mkdirSync(parent, { recursive: true });
      }
      FS.writeFileSync(path, content);
    }
    return files;
  }

  /**
   * Extract archive synchronously
   * @param {Uint8Array} data - ZIP data
   * @param {string} destDir - Destination directory
   * @returns {Object}
   */
  static extractArchiveSync(data, destDir) {
    if (!FS.existsSync(destDir)) {
      FS.mkdirSync(destDir, { recursive: true });
    }
    
    const files = ZipIO.decompressSync(data);
    for (const [name, content] of Object.entries(files)) {
      const path = PATH.join(destDir, name);
      const parent = PATH.dirname(path);
      if (!FS.existsSync(parent)) {
        FS.mkdirSync(parent, { recursive: true });
      }
      FS.writeFileSync(path, content);
    }
    return files;
  }

  /**
   * Convert to base64
   * @param {Uint8Array} data - Data to encode
   * @returns {string}
   */
  static toBase64(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    return btoa(String.fromCharCode(...data));
  }

  /**
   * Decode from base64
   * @param {string} base64 - Base64 string
   * @returns {Uint8Array}
   */
  static fromBase64(base64) {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return bytes;
  }
}

module.exports = ZipIO;
