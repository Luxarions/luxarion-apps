/**
 * LXRN HashingContext Module
 * @namespace LXRN.HashingContext
 * @author LXRN
 */

const Crypto = require('crypto');

/**
 * Hashing context for cryptographic hashing
 * @class HashingContext
 */
class HashingContext {
  /**
   * Hash algorithms
   * @static
   */
  static HASH_MD5 = 'md5';
  static HASH_SHA1 = 'sha1';
  static HASH_SHA256 = 'sha256';
  static HASH_SHA384 = 'sha384';
  static HASH_SHA512 = 'sha512';
  static HASH_SHA3_224 = 'sha3-224';
  static HASH_SHA3_256 = 'sha3-256';
  static HASH_SHA3_384 = 'sha3-384';
  static HASH_SHA3_512 = 'sha3-512';
  static HASH_BLAKE2B_256 = 'blake2b256';
  static HASH_BLAKE2B_512 = 'blake2b512';

  #algorithm = HashingContext.HASH_SHA256;
  #hash = null;
  #finished = false;
  #result = null;
  #started = false;
  #updateCount = 0;
  #totalBytes = 0;

  constructor(algorithm = HashingContext.HASH_SHA256) {
    this.#algorithm = algorithm;
  }

  /**
   * Start hashing
   * @param {string} algorithm - Hash algorithm
   * @returns {HashingContext} This instance
   */
  start(algorithm = this.#algorithm) {
    this.#algorithm = algorithm;
    try {
      let algo = algorithm;
      // Map BLAKE2 to Node.js supported
      if (algo === HashingContext.HASH_BLAKE2B_256) algo = 'blake2b256';
      if (algo === HashingContext.HASH_BLAKE2B_512) algo = 'blake2b512';
      this.#hash = Crypto.createHash(algo);
      this.#finished = false;
      this.#result = null;
      this.#started = true;
      this.#updateCount = 0;
      this.#totalBytes = 0;
    } catch (error) {
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
    }
    return this;
  }

  /**
   * Update hash with data
   * @param {Uint8Array|string} data - Data to hash
   * @returns {HashingContext} This instance
   */
  update(data) {
    if (this.#finished) throw new Error('Hashing context already finished');
    if (!this.#hash) this.start();
    
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
    
    this.#hash.update(buffer);
    this.#updateCount++;
    this.#totalBytes += buffer.length;
    return this;
  }

  /**
   * Finish hashing
   * @returns {Buffer} Hash result
   */
  finish() {
    if (this.#finished) return this.#result;
    if (!this.#hash) this.start();
    this.#result = this.#hash.digest();
    this.#finished = true;
    return this.#result;
  }

  /**
   * Finish and return hex string
   * @returns {string}
   */
  finishHex() {
    const bytes = this.finish();
    return bytes.toString('hex');
  }

  /**
   * Finish and return base64 string
   * @returns {string}
   */
  finishBase64() {
    const bytes = this.finish();
    return bytes.toString('base64');
  }

  /**
   * Get algorithm
   * @returns {string}
   */
  get algorithm() {
    return this.#algorithm;
  }

  /**
   * Check if finished
   * @returns {boolean}
   */
  get finished() {
    return this.#finished;
  }

  /**
   * Get result
   * @returns {Buffer|null}
   */
  get result() {
    return this.#result;
  }

  /**
   * Get update count
   * @returns {number}
   */
  get updateCount() {
    return this.#updateCount;
  }

  /**
   * Get total bytes
   * @returns {number}
   */
  get totalBytes() {
    return this.#totalBytes;
  }

  /**
   * Reset context
   * @returns {HashingContext} This instance
   */
  reset() {
    this.#hash = null;
    this.#finished = false;
    this.#result = null;
    this.#started = false;
    this.#updateCount = 0;
    this.#totalBytes = 0;
    return this;
  }

  /**
   * Static hash
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array|string} data - Data to hash
   * @returns {Buffer}
   */
  static hash(algorithm, data) {
    const ctx = new HashingContext(algorithm);
    return ctx.update(data).finish();
  }

  /**
   * Static hash hex
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array|string} data - Data to hash
   * @returns {string}
   */
  static hashHex(algorithm, data) {
    return HashingContext.hash(algorithm, data).toString('hex');
  }

  /**
   * Static hash base64
   * @param {string} algorithm - Hash algorithm
   * @param {Uint8Array|string} data - Data to hash
   * @returns {string}
   */
  static hashBase64(algorithm, data) {
    return HashingContext.hash(algorithm, data).toString('base64');
  }

  /**
   * Get supported algorithms
   * @returns {Array}
   */
  static getSupportedAlgorithms() {
    return Crypto.getHashes();
  }
}

module.exports = HashingContext;
