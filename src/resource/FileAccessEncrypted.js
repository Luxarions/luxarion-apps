/**
 * LXRN FileAccessEncrypted Module
 * @namespace LXRN.FileAccessEncrypted
 * @author LXRN
 */

const FS = require('fs');
const Crypto = require('crypto');

/**
 * Encrypted file access
 * @class FileAccessEncrypted
 */
class FileAccessEncrypted {
  #files = [];
  #openFiles = new Map();
  #key = null;
  #salt = null;
  #algorithm = 'aes-256-cbc';
  #keyDerivationIterations = 10000;
  #keyDerivationDigest = 'sha256';
  #handleId = 0;

  /**
   * Set encryption key
   * @param {string|Uint8Array} key - Encryption key
   * @param {string|Uint8Array} salt - Salt
   * @returns {FileAccessEncrypted} This instance
   */
  setKey(key, salt = null) {
    if (typeof key === 'string') {
      key = new TextEncoder().encode(key);
    }
    if (!(key instanceof Uint8Array)) {
      key = new Uint8Array(key);
    }
    this.#key = key;
    
    if (salt) {
      if (typeof salt === 'string') {
        salt = new TextEncoder().encode(salt);
      }
      if (!(salt instanceof Uint8Array)) {
        salt = new Uint8Array(salt);
      }
      this.#salt = salt;
    }
    return this;
  }

  /**
   * Derive encryption key
   * @private
   * @param {number} keyLength - Key length
   * @returns {Buffer}
   */
  __deriveKey(keyLength = 32) {
    if (!this.#key) {
      throw new Error('Encryption key not set');
    }
    
    const salt = this.#salt || Buffer.alloc(16);
    const keyBuffer = Buffer.isBuffer(this.#key) ? this.#key : Buffer.from(this.#key);
    
    return Crypto.pbkdf2Sync(
      keyBuffer,
      salt,
      this.#keyDerivationIterations,
      keyLength,
      this.#keyDerivationDigest
    );
  }

  /**
   * Encrypt data
   * @private
   * @param {Uint8Array} data - Data to encrypt
   * @returns {Uint8Array}
   */
  __encrypt(data) {
    const key = this.__deriveKey(32);
    const iv = Crypto.randomBytes(16);
    const cipher = Crypto.createCipheriv(this.#algorithm, key, iv);
    
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const result = new Uint8Array(4 + 16 + encrypted.length);
    const view = new DataView(result.buffer);
    view.setUint32(0, 0x454E4352, true); // 'ENCR'
    result.set(iv, 4);
    result.set(new Uint8Array(encrypted), 20);
    
    return result;
  }

  /**
   * Decrypt data
   * @private
   * @param {Uint8Array} data - Data to decrypt
   * @returns {Uint8Array}
   */
  __decrypt(data) {
    if (data.length < 20) {
      throw new Error('Invalid encrypted data');
    }
    
    const view = new DataView(data.buffer);
    const magic = view.getUint32(0, true);
    if (magic !== 0x454E4352) {
      throw new Error('Invalid encrypted file header');
    }
    
    const iv = data.slice(4, 20);
    const encrypted = data.slice(20);
    
    const key = this.__deriveKey(32);
    const decipher = Crypto.createDecipheriv(this.#algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return new Uint8Array(decrypted);
  }

  /**
   * Save encrypted file
   * @param {string} path - File path
   * @param {Uint8Array} data - Data to save
   * @returns {FileAccessEncrypted} This instance
   */
  save(path, data) {
    const encrypted = this.__encrypt(data);
    FS.writeFileSync(path, encrypted);
    return this;
  }

  /**
   * Load encrypted file
   * @param {string} path - File path
   * @returns {Uint8Array}
   */
  load(path) {
    if (!FS.existsSync(path)) {
      throw new Error(`Encrypted file not found: ${path}`);
    }
    const data = FS.readFileSync(path);
    return this.__decrypt(data);
  }

  /**
   * Save text
   * @param {string} path - File path
   * @param {string} text - Text to save
   * @returns {FileAccessEncrypted} This instance
   */
  saveText(path, text) {
    const data = new TextEncoder().encode(text);
    return this.save(path, data);
  }

  /**
   * Load text
   * @param {string} path - File path
   * @returns {string}
   */
  loadText(path) {
    const data = this.load(path);
    return new TextDecoder().decode(data);
  }

  /**
   * Save JSON
   * @param {string} path - File path
   * @param {Object} obj - JSON object
   * @returns {FileAccessEncrypted} This instance
   */
  saveJSON(path, obj) {
    const text = JSON.stringify(obj);
    return this.saveText(path, text);
  }

  /**
   * Load JSON
   * @param {string} path - File path
   * @returns {Object}
   */
  loadJSON(path) {
    const text = this.loadText(path);
    return JSON.parse(text);
  }

  /**
   * Encrypt data
   * @param {Uint8Array} data - Data to encrypt
   * @returns {Uint8Array}
   */
  encryptData(data) {
    return this.__encrypt(data);
  }

  /**
   * Decrypt data
   * @param {Uint8Array} data - Data to decrypt
   * @returns {Uint8Array}
   */
  decryptData(data) {
    return this.__decrypt(data);
  }

  /**
   * Set algorithm
   * @param {string} algorithm - Encryption algorithm
   * @returns {FileAccessEncrypted} This instance
   */
  setAlgorithm(algorithm) {
    this.#algorithm = algorithm;
    return this;
  }

  /**
   * Set key derivation iterations
   * @param {number} iterations - Iterations
   * @returns {FileAccessEncrypted} This instance
   */
  setKeyDerivationIterations(iterations) {
    this.#keyDerivationIterations = iterations;
    return this;
  }

  /**
   * Get key
   * @returns {Uint8Array}
   */
  get key() {
    return this.#key;
  }

  /**
   * Get salt
   * @returns {Uint8Array}
   */
  get salt() {
    return this.#salt;
  }

  /**
   * Get algorithm
   * @returns {string}
   */
  get algorithm() {
    return this.#algorithm;
  }
}

module.exports = FileAccessEncrypted;
