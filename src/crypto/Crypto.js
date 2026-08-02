/**
 * LXRN Crypto Module
 * @namespace LXRN.Crypto
 * @author LXRN
 */

const Crypto = require('crypto');
const AESContext = require('./AESContext.js');
const HashingContext = require('./HashingContext.js');
const CryptoCore = require('./CryptoCore.js');

/**
 * High-level cryptographic utilities
 * @class Crypto
 */
class Crypto {
  /**
   * Encrypt data with AES
   * @param {Uint8Array} key - Encryption key
   * @param {Uint8Array} data - Data to encrypt
   * @param {string} mode - AES mode
   * @param {Uint8Array} iv - Initialization vector
   * @returns {Buffer}
   */
  static encrypt(key, data, mode = AESContext.MODE_CBC, iv = null) {
    const ctx = new AESContext(key, mode, iv);
    return ctx.encrypt(data);
  }

  /**
   * Decrypt data with AES
   * @param {Uint8Array} key - Encryption key
   * @param {Uint8Array} data - Data to decrypt
   * @param {string} mode - AES mode
   * @param {Uint8Array} iv - Initialization vector
   * @param {Uint8Array} authTag - Authentication tag
   * @returns {Buffer}
   */
  static decrypt(key, data, mode = AESContext.MODE_CBC, iv = null, authTag = null) {
    const ctx = new AESContext(key, mode, iv);
    return ctx.decrypt(data, null, authTag);
  }

  /**
   * Encrypt with GCM
   * @param {Uint8Array} key - Encryption key
   * @param {Uint8Array} data - Data to encrypt
   * @param {Uint8Array} iv - Initialization vector
   * @param {Uint8Array} authData - Authentication data
   * @returns {Object}
   */
  static encryptGCM(key, data, iv, authData = null) {
    const ctx = new AESContext(key, AESContext.MODE_GCM, iv);
    const encrypted = ctx.encrypt(data, iv, authData);
    const tag = ctx.getAuthTag();
    return { encrypted, tag };
  }

  /**
   * Decrypt with GCM
   * @param {Uint8Array} key - Encryption key
   * @param {Uint8Array} data - Data to decrypt
   * @param {Uint8Array} iv - Initialization vector
   * @param {Uint8Array} authTag - Authentication tag
   * @param {Uint8Array} authData - Authentication data
   * @returns {Buffer}
   */
  static decryptGCM(key, data, iv, authTag, authData = null) {
    const ctx = new AESContext(key, AESContext.MODE_GCM, iv);
    return ctx.decrypt(data, iv, authTag, authData);
  }

  /**
   * Generate random key
   * @param {number} size - Key size in bytes
   * @returns {Buffer}
   */
  static generateKey(size = 32) {
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
   * Generate random salt
   * @param {number} size - Salt size in bytes
   * @returns {Buffer}
   */
  static generateSalt(size = 16) {
    return Crypto.randomBytes(size);
  }

  /**
   * Hash data
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array} data - Data to hash
   * @returns {Buffer}
   */
  static hash(algorithm, data) {
    return HashingContext.hash(algorithm, data);
  }

  /**
   * Hash data to hex
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array} data - Data to hash
   * @returns {string}
   */
  static hashHex(algorithm, data) {
    return HashingContext.hashHex(algorithm, data);
  }

  /**
   * Hash data to base64
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array} data - Data to hash
   * @returns {string}
   */
  static hashBase64(algorithm, data) {
    return HashingContext.hashBase64(algorithm, data);
  }

  /**
   * Sign data with RSA
   * @param {Uint8Array} message - Message to sign
   * @param {string} privateKey - Private key (PEM)
   * @param {string} algorithm - Hash algorithm
   * @returns {Buffer}
   */
  static sign(message, privateKey, algorithm = 'sha256') {
    const sign = Crypto.createSign(algorithm);
    sign.update(message);
    sign.end();
    return sign.sign(privateKey);
  }

  /**
   * Verify RSA signature
   * @param {Uint8Array} message - Original message
   * @param {Uint8Array} signature - Signature to verify
   * @param {string} publicKey - Public key (PEM)
   * @param {string} algorithm - Hash algorithm
   * @returns {boolean}
   */
  static verify(message, signature, publicKey, algorithm = 'sha256') {
    const verify = Crypto.createVerify(algorithm);
    verify.update(message);
    verify.end();
    return verify.verify(publicKey, signature);
  }

  /**
   * Generate RSA key pair
   * @param {number} modulusLength - Key length in bits
   * @returns {Object}
   */
  static generateRSAKeyPair(modulusLength = 2048) {
    return Crypto.generateKeyPairSync('rsa', {
      modulusLength: modulusLength,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });
  }

  /**
   * Generate ECDSA key pair
   * @param {string} curve - Elliptic curve
   * @returns {Object}
   */
  static generateECDSAKeyPair(curve = 'prime256v1') {
    return Crypto.generateKeyPairSync('ec', {
      namedCurve: curve,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
  }

  /**
   * RSA encrypt
   * @param {Uint8Array} data - Data to encrypt
   * @param {string} publicKey - Public key (PEM)
   * @returns {Buffer}
   */
  static encryptRSA(data, publicKey) {
    return Crypto.publicEncrypt(publicKey, data);
  }

  /**
   * RSA decrypt
   * @param {Uint8Array} data - Data to decrypt
   * @param {string} privateKey - Private key (PEM)
   * @returns {Buffer}
   */
  static decryptRSA(data, privateKey) {
    return Crypto.privateDecrypt(privateKey, data);
  }

  /**
   * RSA encrypt with OAEP padding
   * @param {Uint8Array} data - Data to encrypt
   * @param {string} publicKey - Public key (PEM)
   * @param {Uint8Array} label - Optional label
   * @returns {Buffer}
   */
  static encryptRSAOAEP(data, publicKey, label = null) {
    const options = { padding: Crypto.constants.RSA_PKCS1_OAEP_PADDING };
    if (label) options.label = label;
    return Crypto.publicEncrypt(options, publicKey, data);
  }

  /**
   * RSA decrypt with OAEP padding
   * @param {Uint8Array} data - Data to decrypt
   * @param {string} privateKey - Private key (PEM)
   * @param {Uint8Array} label - Optional label
   * @returns {Buffer}
   */
  static decryptRSAOAEP(data, privateKey, label = null) {
    const options = { padding: Crypto.constants.RSA_PKCS1_OAEP_PADDING };
    if (label) options.label = label;
    return Crypto.privateDecrypt(options, privateKey, data);
  }

  /**
   * RSA sign
   * @param {Uint8Array} data - Data to sign
   * @param {string} privateKey - Private key (PEM)
   * @param {string} algorithm - Hash algorithm
   * @returns {Buffer}
   */
  static signRSA(data, privateKey, algorithm = 'sha256') {
    return Crypto.sign(data, privateKey, algorithm);
  }

  /**
   * RSA verify
   * @param {Uint8Array} data - Original data
   * @param {Uint8Array} signature - Signature to verify
   * @param {string} publicKey - Public key (PEM)
   * @param {string} algorithm - Hash algorithm
   * @returns {boolean}
   */
  static verifyRSA(data, signature, publicKey, algorithm = 'sha256') {
    return Crypto.verify(data, signature, publicKey, algorithm);
  }

  /**
   * Generate UUID v4
   * @returns {string}
   */
  static generateUUID() {
    return Crypto.randomUUID();
  }

  /**
   * Get random bytes as hex
   * @param {number} length - Number of bytes
   * @returns {string}
   */
  static randomHex(length = 16) {
    return Crypto.randomBytes(length).toString('hex');
  }

  /**
   * Get random bytes as base64
   * @param {number} length - Number of bytes
   * @returns {string}
   */
  static randomBase64(length = 16) {
    return Crypto.randomBytes(length).toString('base64');
  }
}

module.exports = Crypto;
