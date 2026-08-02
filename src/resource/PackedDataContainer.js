/**
 * LXRN PackedDataContainer Module
 * @namespace LXRN.PackedDataContainer
 * @author LXRN
 */

const PacketPeer = require('../core/PacketPeer.js');
const Compression = require('../core/Compression.js');
const FS = require('fs');

/**
 * Packed data container
 * @class PackedDataContainer
 */
class PackedDataContainer {
  #data = new Map();
  #modified = false;
  #version = 1;
  #compression = false;
  #compressionLevel = 6;
  #encryption = false;
  #encryptionKey = null;

  /**
   * Set value
   * @param {string} key - Key
   * @param {*} value - Value
   * @returns {PackedDataContainer} This instance
   */
  set(key, value) {
    this.#data.set(key, value);
    this.#modified = true;
    return this;
  }

  /**
   * Get value
   * @param {string} key - Key
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  get(key, defaultValue = null) {
    return this.#data.has(key) ? this.#data.get(key) : defaultValue;
  }

  /**
   * Check if key exists
   * @param {string} key - Key
   * @returns {boolean}
   */
  has(key) {
    return this.#data.has(key);
  }

  /**
   * Remove key
   * @param {string} key - Key
   * @returns {boolean}
   */
  remove(key) {
    const removed = this.#data.delete(key);
    if (removed) this.#modified = true;
    return removed;
  }

  /**
   * Get keys
   * @returns {Array}
   */
  keys() {
    return Array.from(this.#data.keys());
  }

  /**
   * Get values
   * @returns {Array}
   */
  values() {
    return Array.from(this.#data.values());
  }

  /**
   * Get entries
   * @returns {Array}
   */
  entries() {
    return Array.from(this.#data.entries());
  }

  /**
   * Get size
   * @returns {number}
   */
  size() {
    return this.#data.size;
  }

  /**
   * Clear data
   * @returns {PackedDataContainer} This instance
   */
  clear() {
    this.#data.clear();
    this.#modified = true;
    return this;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const obj = {};
    for (const [key, value] of this.#data) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {PackedDataContainer} This instance
   */
  fromJSON(data) {
    this.#data.clear();
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        this.#data.set(key, data[key]);
      }
    }
    this.#modified = false;
    return this;
  }

  /**
   * Convert to bytes
   * @returns {Uint8Array}
   */
  toBytes() {
    const peer = new PacketPeer();
    const obj = this.toJSON();
    peer.putVar(obj);
    let data = peer.encode();
    
    if (this.#compression) {
      const mode = this.#compressionLevel >= 8 ? Compression.MODE_BEST :
                   this.#compressionLevel >= 4 ? Compression.MODE_DEFAULT : Compression.MODE_FAST;
      data = Compression.compress(data, mode);
    }
    
    if (this.#encryption && this.#encryptionKey) {
      const key = this.#encryptionKey;
      const encrypted = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        encrypted[i] = data[i] ^ key[i % key.length];
      }
      data = encrypted;
    }
    
    // Add header
    const header = new Uint8Array(4);
    const view = new DataView(header.buffer);
    view.setUint32(0, this.#version, true);
    const combined = new Uint8Array(header.length + data.length);
    combined.set(header, 0);
    combined.set(data, header.length);
    return combined;
  }

  /**
   * Load from bytes
   * @param {Uint8Array} data - Bytes data
   * @returns {PackedDataContainer} This instance
   */
  fromBytes(data) {
    if (data.length < 4) {
      throw new Error('Invalid packed data: too short');
    }
    
    const view = new DataView(data.buffer);
    this.#version = view.getUint32(0, true);
    let bytes = data.slice(4);
    
    // Decrypt if needed
    if (this.#encryption && this.#encryptionKey) {
      const key = this.#encryptionKey;
      const decrypted = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        decrypted[i] = bytes[i] ^ key[i % key.length];
      }
      bytes = decrypted;
    }
    
    // Decompress if needed
    if (this.#compression) {
      try {
        bytes = Compression.decompress(bytes);
      } catch (error) {
        // Not compressed or invalid, continue
      }
    }
    
    const peer = new PacketPeer();
    peer.decode(bytes);
    const obj = peer.getVar();
    if (typeof obj === 'object' && obj !== null) {
      this.fromJSON(obj);
    }
    return this;
  }

  /**
   * Save to file
   * @param {string} path - File path
   * @returns {PackedDataContainer} This instance
   */
  save(path) {
    const data = this.toBytes();
    FS.writeFileSync(path, data);
    this.#modified = false;
    return this;
  }

  /**
   * Load from file
   * @param {string} path - File path
   * @returns {PackedDataContainer} This instance
   */
  load(path) {
    if (!FS.existsSync(path)) {
      throw new Error(`Packed data file not found: ${path}`);
    }
    const data = FS.readFileSync(path);
    this.fromBytes(data);
    return this;
  }

  /**
   * Save as JSON
   * @param {string} path - File path
   * @param {Object} options - JSON options
   * @returns {PackedDataContainer} This instance
   */
  saveJSON(path, options = {}) {
    const pretty = options.pretty !== undefined ? options.pretty : true;
    const space = options.space || 2;
    FS.writeFileSync(path, JSON.stringify(this.toJSON(), null, pretty ? space : 0), 'utf-8');
    this.#modified = false;
    return this;
  }

  /**
   * Load from JSON
   * @param {string} path - File path
   * @returns {PackedDataContainer} This instance
   */
  loadJSON(path) {
    if (!FS.existsSync(path)) {
      throw new Error(`JSON file not found: ${path}`);
    }
    const data = FS.readFileSync(path, 'utf-8');
    this.fromJSON(JSON.parse(data));
    return this;
  }

  /**
   * Enable compression
   * @param {boolean} enable - Enable compression
   * @param {number} level - Compression level
   * @returns {PackedDataContainer} This instance
   */
  setCompression(enable, level = 6) {
    this.#compression = enable;
    this.#compressionLevel = level;
    return this;
  }

  /**
   * Enable encryption
   * @param {boolean} enable - Enable encryption
   * @param {Uint8Array} key - Encryption key
   * @returns {PackedDataContainer} This instance
   */
  setEncryption(enable, key = null) {
    this.#encryption = enable;
    this.#encryptionKey = key;
    return this;
  }

  /**
   * Check if modified
   * @returns {boolean}
   */
  get modified() {
    return this.#modified;
  }

  /**
   * Get version
   * @returns {number}
   */
  get version() {
    return this.#version;
  }

  /**
   * Create from object
   * @param {Object} obj - Object data
   * @returns {PackedDataContainer}
   */
  static fromObject(obj) {
    const container = new PackedDataContainer();
    return container.fromJSON(obj);
  }

  /**
   * Create from bytes
   * @param {Uint8Array} data - Bytes data
   * @returns {PackedDataContainer}
   */
  static fromBytes(data) {
    const container = new PackedDataContainer();
    return container.fromBytes(data);
  }

  /**
   * Load from file
   * @param {string} path - File path
   * @returns {PackedDataContainer}
   */
  static loadFromFile(path) {
    const container = new PackedDataContainer();
    return container.load(path);
  }

  /**
   * Load from JSON
   * @param {string} path - File path
   * @returns {PackedDataContainer}
   */
  static loadFromJSON(path) {
    const container = new PackedDataContainer();
    return container.loadJSON(path);
  }
}

module.exports = PackedDataContainer;
