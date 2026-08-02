/**
 * LXRN AESContext Module
 * @namespace LXRN.AESContext
 * @author LXRN
 */

const Crypto = require('crypto');

/**
 * AES encryption context
 * @class AESContext
 */
class AESContext {
  /**
   * AES modes
   * @static
   */
  static MODE_ECB = 'ecb';
  static MODE_CBC = 'cbc';
  static MODE_CFB = 'cfb';
  static MODE_OFB = 'ofb';
  static MODE_CTR = 'ctr';
  static MODE_GCM = 'gcm';
  static MODE_CCM = 'ccm';
  static MODE_OCB = 'ocb';

  /**
   * Key sizes
   * @static
   */
  static KEY_SIZE_128 = 16;
  static KEY_SIZE_192 = 24;
  static KEY_SIZE_256 = 32;

  #key = null;
  #mode = AESContext.MODE_CBC;
  #iv = null;
  #cipher = null;
  #decipher = null;
  #authenticated = false;
  #authTag = null;
  #aad = null;
  #encrypting = false;
  #decrypting = false;
  #keySize = 0;
  #blockSize = 16;
  #algorithm = null;

  constructor(key, mode = AESContext.MODE_CBC, iv = null) {
    this.#key = key;
    this.#mode = mode;
    this.#iv = iv;
    this.#keySize = key ? key.length : 0;
  }

  /**
   * Get cipher algorithm
   * @private
   * @returns {string}
   */
  __getAlgorithm() {
    if (this.#algorithm) return this.#algorithm;
    const keySize = this.#key ? this.#key.length : 0;
    const sizes = [16, 24, 32];
    if (!sizes.includes(keySize)) {
      throw new Error(`Invalid key size: ${keySize}`);
    }
    const bits = keySize * 8;
    this.#algorithm = `aes-${bits}-${this.#mode}`;
    return this.#algorithm;
  }

  /**
   * Create cipher
   * @private
   * @param {boolean} encrypt - Encrypt mode
   * @returns {Cipher}
   */
  __createCipher(encrypt = true) {
    const algorithm = this.__getAlgorithm();
    const key = this.#key;
    const iv = this.#iv;
    
    try {
      if (encrypt) {
        if (this.#mode === AESContext.MODE_GCM || this.#mode === AESContext.MODE_CCM) {
          return Crypto.createCipheriv(algorithm, key, iv);
        } else {
          return Crypto.createCipheriv(algorithm, key, iv);
        }
      } else {
        if (this.#mode === AESContext.MODE_GCM || this.#mode === AESContext.MODE_CCM) {
          return Crypto.createDecipheriv(algorithm, key, iv);
        } else {
          return Crypto.createDecipheriv(algorithm, key, iv);
        }
      }
    } catch (error) {
      throw new Error(`Failed to create cipher: ${error.message}`);
    }
  }

  /**
   * Encrypt data
   * @param {Uint8Array|string} data - Data to encrypt
   * @param {Uint8Array} iv - Initialization vector
   * @param {Uint8Array} authData - Authentication data (for GCM/CCM)
   * @returns {Buffer}
   */
  encrypt(data, iv = null, authData = null) {
    if (this.#decrypting) throw new Error('Context already used for decryption');
    this.#encrypting = true;
    
    const useIv = iv || this.#iv;
    if (!useIv && this.#mode !== AESContext.MODE_ECB) {
      throw new Error('IV required for this mode');
    }
    
    let buffer;
    if (typeof data === 'string') {
      buffer = Buffer.from(data, 'utf-8');
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else if (data instanceof Buffer) {
      buffer = data;
    } else if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(data);
    } else {
      buffer = Buffer.from(data);
    }
    
    const cipher = this.__createCipher(true);
    this.#cipher = cipher;
    
    if ((this.#mode === AESContext.MODE_GCM || this.#mode === AESContext.MODE_CCM) && authData) {
      cipher.setAAD(authData);
      this.#aad = authData;
    }
    
    let encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    
    if (this.#mode === AESContext.MODE_GCM || this.#mode === AESContext.MODE_CCM) {
      this.#authTag = cipher.getAuthTag();
      encrypted = Buffer.concat([encrypted, this.#authTag]);
      this.#authenticated = true;
    }
    
    return encrypted;
  }

  /**
   * Decrypt data
   * @param {Uint8Array} data - Data to decrypt
   * @param {Uint8Array} iv - Initialization vector
   * @param {Uint8Array} authTag - Authentication tag
   * @param {Uint8Array} authData - Authentication data
   * @returns {Buffer}
   */
  decrypt(data, iv = null, authTag = null, authData = null) {
    if (this.#encrypting) throw new Error('Context already used for encryption');
    this.#decrypting = true;
    
    const useIv = iv || this.#iv;
    if (!useIv && this.#mode !== AESContext.MODE_ECB) {
      throw new Error('IV required for this mode');
    }
    
    let buffer;
    if (typeof data === 'string') {
      buffer = Buffer.from(data, 'utf-8');
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else if (data instanceof Buffer) {
      buffer = data;
    } else if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(data);
    } else {
      buffer = Buffer.from(data);
    }
    
    let encryptedData = buffer;
    let authTagToSet = authTag || this.#authTag;
    
    if (this.#mode === AESContext.MODE_GCM || this.#mode === AESContext.MODE_CCM) {
      if (authTag) {
        encryptedData = buffer.slice(0, buffer.length - authTag.length);
        authTagToSet = authTag;
      } else if (this.#authTag) {
        encryptedData = buffer.slice(0, buffer.length - this.#authTag.length);
        authTagToSet = this.#authTag;
      } else {
        throw new Error('Auth tag required for GCM/CCM decryption');
      }
    }
    
    const decipher = this.__createCipher(false);
    this.#decipher = decipher;
    
    if ((this.#mode === AESContext.MODE_GCM || this.#mode === AESContext.MODE_CCM) && authTagToSet) {
      decipher.setAuthTag(authTagToSet);
      if (authData || this.#aad) {
        decipher.setAAD(authData || this.#aad);
      }
    }
    
    let decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decrypted;
  }

  /**
   * Set key
   * @param {Uint8Array} key - Encryption key
   * @returns {AESContext} This instance
   */
  setKey(key) {
    this.#key = key;
    this.#keySize = key ? key.length : 0;
    this.#algorithm = null;
    return this;
  }

  /**
   * Set IV
   * @param {Uint8Array} iv - Initialization vector
   * @returns {AESContext} This instance
   */
  setIV(iv) {
    this.#iv = iv;
    return this;
  }

  /**
   * Set authentication tag
   * @param {Uint8Array} tag - Authentication tag
   * @returns {AESContext} This instance
   */
  setAuthTag(tag) {
    this.#authTag = tag;
    this.#authenticated = true;
    return this;
  }

  /**
   * Get authentication tag
   * @returns {Buffer|null}
   */
  getAuthTag() {
    return this.#authTag;
  }

  /**
   * Get key
   * @returns {Uint8Array}
   */
  get key() {
    return this.#key;
  }

  /**
   * Get mode
   * @returns {string}
   */
  get mode() {
    return this.#mode;
  }

  /**
   * Get IV
   * @returns {Uint8Array}
   */
  get iv() {
    return this.#iv;
  }

  /**
   * Get key size
   * @returns {number}
   */
  get keySize() {
    return this.#keySize;
  }

  /**
   * Get block size
   * @returns {number}
   */
  get blockSize() {
    return this.#blockSize;
  }

  /**
   * Check if authenticated
   * @returns {boolean}
   */
  get authenticated() {
    return this.#authenticated;
  }

  /**
   * Generate random key
   * @param {number} size - Key size in bytes
   * @returns {Buffer}
   */
  static generateKey(size = AESContext.KEY_SIZE_256) {
    return Crypto.randomBytes(size);
  }

  /**
   * Generate random IV
   * @param {number} size - IV size in bytes
   * @returns {Buffer}
   */
  static generateIV(size = 16) {
    return Crypto.randomBytes(size);
  }

  /**
   * Generate random auth tag
   * @param {number} size - Auth tag size in bytes
   * @returns {Buffer}
   */
  static generateAuthTag(size = 16) {
    return Crypto.randomBytes(size);
  }

  /**
   * Get supported modes
   * @returns {Array}
   */
  static getSupportedModes() {
    return [
      AESContext.MODE_ECB,
      AESContext.MODE_CBC,
      AESContext.MODE_CFB,
      AESContext.MODE_OFB,
      AESContext.MODE_CTR,
      AESContext.MODE_GCM,
      AESContext.MODE_CCM,
      AESContext.MODE_OCB,
    ];
  }
}

module.exports = AESContext;
