/**
 * LXRN CryptoCore Module
 * @namespace LXRN.CryptoCore
 * @author LXRN
 */

const Crypto = require('crypto');

/**
 * Core cryptographic utilities
 * @class CryptoCore
 */
class CryptoCore {
  /**
   * Get random bytes
   * @param {number} length - Number of bytes
   * @returns {Buffer}
   */
  static getRandomBytes(length) {
    return Crypto.randomBytes(length);
  }

  /**
   * Get random 32-bit unsigned integer
   * @returns {number}
   */
  static getRandomU32() {
    return Crypto.randomBytes(4).readUInt32BE(0);
  }

  /**
   * Get random 64-bit unsigned integer
   * @returns {bigint}
   */
  static getRandomU64() {
    return Crypto.randomBytes(8).readBigUInt64BE(0);
  }

  /**
   * Get random float (0-1)
   * @returns {number}
   */
  static getRandomFloat() {
    return CryptoCore.getRandomU32() / 0xFFFFFFFF;
  }

  /**
   * Get random double (0-1)
   * @returns {number}
   */
  static getRandomDouble() {
    return Number(CryptoCore.getRandomU64()) / 0xFFFFFFFFFFFFFFFFn;
  }

  /**
   * Constant-time comparison
   * @param {Uint8Array} a - First buffer
   * @param {Uint8Array} b - Second buffer
   * @returns {boolean}
   */
  static constantTimeCompare(a, b) {
    if (!(a instanceof Buffer)) a = Buffer.from(a);
    if (!(b instanceof Buffer)) b = Buffer.from(b);
    if (a.length !== b.length) return false;
    return Crypto.timingSafeEqual(a, b);
  }

  /**
   * Constant-time select
   * @param {boolean} condition - Selection condition
   * @param {*} a - Value if true
   * @param {*} b - Value if false
   * @returns {*}
   */
  static constantTimeSelect(condition, a, b) {
    return condition ? a : b;
  }

  /**
   * Zeroize buffer
   * @param {Uint8Array} buffer - Buffer to zeroize
   * @returns {Uint8Array}
   */
  static zeroize(buffer) {
    if (buffer instanceof Buffer) {
      buffer.fill(0);
    } else if (buffer instanceof Uint8Array) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = 0;
      }
    } else if (Array.isArray(buffer)) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = 0;
      }
    }
    return buffer;
  }

  /**
   * Securely free buffer
   * @param {Uint8Array} buffer - Buffer to free
   */
  static secureFree(buffer) {
    CryptoCore.zeroize(buffer);
    // Let GC handle the rest
  }

  /**
   * PBKDF2 key derivation
   * @param {string|Buffer} password - Password
   * @param {Buffer} salt - Salt
   * @param {number} iterations - Iterations
   * @param {number} keyLength - Key length
   * @param {string} algorithm - Hash algorithm
   * @returns {Buffer}
   */
  static pbkdf2(password, salt, iterations, keyLength, algorithm = 'sha256') {
    return Crypto.pbkdf2Sync(password, salt, iterations, keyLength, algorithm);
  }

  /**
   * PBKDF2 key derivation (async)
   * @param {string|Buffer} password - Password
   * @param {Buffer} salt - Salt
   * @param {number} iterations - Iterations
   * @param {number} keyLength - Key length
   * @param {string} algorithm - Hash algorithm
   * @returns {Promise<Buffer>}
   */
  static pbkdf2Async(password, salt, iterations, keyLength, algorithm = 'sha256') {
    return new Promise((resolve, reject) => {
      Crypto.pbkdf2(password, salt, iterations, keyLength, algorithm, (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      });
    });
  }

  /**
   * Scrypt key derivation
   * @param {string|Buffer} password - Password
   * @param {Buffer} salt - Salt
   * @param {number} keyLength - Key length
   * @param {Object} options - Options
   * @returns {Buffer}
   */
  static scrypt(password, salt, keyLength, options = {}) {
    const defaultOptions = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };
    const opts = { ...defaultOptions, ...options };
    return Crypto.scryptSync(password, salt, keyLength, opts);
  }

  /**
   * Scrypt key derivation (async)
   * @param {string|Buffer} password - Password
   * @param {Buffer} salt - Salt
   * @param {number} keyLength - Key length
   * @param {Object} options - Options
   * @returns {Promise<Buffer>}
   */
  static scryptAsync(password, salt, keyLength, options = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };
      const opts = { ...defaultOptions, ...options };
      Crypto.scrypt(password, salt, keyLength, opts, (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      });
    });
  }

  /**
   * HMAC calculation
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array} key - HMAC key
   * @param {Uint8Array} data - Data to HMAC
   * @returns {Buffer}
   */
  static hmac(algorithm, key, data) {
    const hmac = Crypto.createHmac(algorithm, key);
    hmac.update(data);
    return hmac.digest();
  }

  /**
   * HMAC hex
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array} key - HMAC key
   * @param {Uint8Array} data - Data to HMAC
   * @returns {string}
   */
  static hmacHex(algorithm, key, data) {
    return CryptoCore.hmac(algorithm, key, data).toString('hex');
  }

  /**
   * HMAC base64
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array} key - HMAC key
   * @param {Uint8Array} data - Data to HMAC
   * @returns {string}
   */
  static hmacBase64(algorithm, key, data) {
    return CryptoCore.hmac(algorithm, key, data).toString('base64');
  }

  /**
   * Get supported hash algorithms
   * @returns {Array}
   */
  static getSupportedHashes() {
    return Crypto.getHashes();
  }

  /**
   * Get supported ciphers
   * @returns {Array}
   */
  static getSupportedCiphers() {
    return Crypto.getCiphers();
  }

  /**
   * Generate secure password
   * @param {number} length - Password length
   * @param {string} charset - Character set
   * @returns {string}
   */
  static generatePassword(length = 32, charset = 'alphanumeric') {
    const chars = {
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      numeric: '0123456789',
      alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      hex: '0123456789abcdef',
      base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      special: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=',
    };
    
    const set = chars[charset] || chars.alphanumeric;
    let result = '';
    const bytes = Crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += set[bytes[i] % set.length];
    }
    return result;
  }
}

module.exports = CryptoCore;
