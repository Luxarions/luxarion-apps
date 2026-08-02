/**
 * LXRN CryptoResourceFormat Module
 * @namespace LXRN.CryptoResourceFormat
 * @author LXRN
 */

const FS = require('fs');
const AESContext = require('./AESContext.js');
const Crypto = require('./Crypto.js');

/**
 * Encrypted resource format
 * @class CryptoResourceFormat
 */
class CryptoResourceFormat {
  static TYPE = 'encrypted_resource';
  static MAGIC = 0x43525950; // 'CRYP'
  static VERSION = 1;

  /**
   * Save encrypted resource
   * @param {string} path - File path
   * @param {Object} resource - Resource data
   * @param {Uint8Array} key - Encryption key
   * @param {Uint8Array} iv - Initialization vector
   * @param {string} mode - AES mode
   * @param {Object} options - Additional options
   * @returns {boolean}
   */
  static save(path, resource, key, iv = null, mode = AESContext.MODE_CBC, options = {}) {
    // Serialize resource to JSON
    const json = JSON.stringify(resource);
    const data = Buffer.from(json, 'utf-8');
    
    // Generate IV if not provided
    let useIv = iv;
    if (!useIv && mode !== AESContext.MODE_ECB) {
      useIv = Crypto.generateIV();
    }
    
    // Encrypt
    const ctx = new AESContext(key, mode, useIv);
    let encrypted;
    let authTag = null;
    
    if (mode === AESContext.MODE_GCM || mode === AESContext.MODE_CCM) {
      const result = ctx.encrypt(data, useIv, options.authData || null);
      // For GCM, result includes auth tag at the end
      authTag = ctx.getAuthTag();
      encrypted = result;
    } else {
      encrypted = ctx.encrypt(data, useIv);
    }
    
    // Build file format
    const header = Buffer.alloc(4 + 4 + 2);
    header.writeUInt32BE(0x43525950, 0); // 'CRYP'
    header.writeUInt32BE(0x00000001, 4); // Version
    header.writeUInt16BE(mode === AESContext.MODE_GCM ? 1 : 0, 8); // Mode flag
    
    let output = Buffer.concat([header]);
    
    // Write IV
    if (useIv) {
      const ivLen = Buffer.alloc(2);
      ivLen.writeUInt16BE(useIv.length, 0);
      output = Buffer.concat([output, ivLen, useIv]);
    }
    
    // Write auth tag for GCM/CCM
    if (authTag) {
      const tagLen = Buffer.alloc(2);
      tagLen.writeUInt16BE(authTag.length, 0);
      output = Buffer.concat([output, tagLen, authTag]);
    }
    
    // Write encrypted data
    output = Buffer.concat([output, encrypted]);
    
    FS.writeFileSync(path, output);
    return true;
  }

  /**
   * Load encrypted resource
   * @param {string} path - File path
   * @param {Uint8Array} key - Encryption key
   * @param {Uint8Array} iv - Initialization vector
   * @param {string} mode - AES mode
   * @returns {Object}
   */
  static load(path, key, iv = null, mode = AESContext.MODE_CBC) {
    const data = FS.readFileSync(path);
    let offset = 0;
    
    // Read header
    const magic = data.readUInt32BE(offset);
    offset += 4;
    if (magic !== 0x43525950) {
      throw new Error('Invalid encrypted resource header');
    }
    
    const version = data.readUInt32BE(offset);
    offset += 4;
    if (version > 0x00000001) {
      throw new Error(`Unsupported encrypted resource version: ${version}`);
    }
    
    const modeFlag = data.readUInt16BE(offset);
    offset += 2;
    let actualMode = mode;
    if (modeFlag === 1) actualMode = AESContext.MODE_GCM;
    
    // Read IV
    let actualIv = iv;
    if (offset < data.length) {
      const ivLen = data.readUInt16BE(offset);
      offset += 2;
      if (ivLen > 0) {
        actualIv = data.slice(offset, offset + ivLen);
        offset += ivLen;
      }
    }
    
    // Read auth tag for GCM
    let authTag = null;
    if (actualMode === AESContext.MODE_GCM) {
      if (offset < data.length) {
        const tagLen = data.readUInt16BE(offset);
        offset += 2;
        authTag = data.slice(offset, offset + tagLen);
        offset += tagLen;
      }
    }
    
    // Read encrypted data
    const encrypted = data.slice(offset);
    
    // Decrypt
    const ctx = new AESContext(key, actualMode, actualIv);
    let decrypted;
    
    if (actualMode === AESContext.MODE_GCM) {
      decrypted = ctx.decrypt(encrypted, actualIv, authTag);
    } else {
      decrypted = ctx.decrypt(encrypted, actualIv);
    }
    
    const json = decrypted.toString('utf-8');
    return JSON.parse(json);
  }

  /**
   * Encrypt resource in memory
   * @param {Object} resource - Resource data
   * @param {Uint8Array} key - Encryption key
   * @param {Uint8Array} iv - Initialization vector
   * @param {string} mode - AES mode
   * @returns {Object}
   */
  static encryptResource(resource, key, iv = null, mode = AESContext.MODE_CBC) {
    const json = JSON.stringify(resource);
    const data = Buffer.from(json, 'utf-8');
    const ctx = new AESContext(key, mode, iv);
    const encrypted = ctx.encrypt(data);
    const result = { encrypted, iv: ctx.iv, authTag: ctx.getAuthTag() };
    return result;
  }

  /**
   * Decrypt resource in memory
   * @param {Uint8Array} encryptedData - Encrypted data
   * @param {Uint8Array} key - Encryption key
   * @param {Uint8Array} iv - Initialization vector
   * @param {Uint8Array} authTag - Authentication tag
   * @param {string} mode - AES mode
   * @returns {Object}
   */
  static decryptResource(encryptedData, key, iv, authTag = null, mode = AESContext.MODE_CBC) {
    const ctx = new AESContext(key, mode, iv);
    let decrypted;
    if (mode === AESContext.MODE_GCM) {
      decrypted = ctx.decrypt(encryptedData, iv, authTag);
    } else {
      decrypted = ctx.decrypt(encryptedData, iv);
    }
    const json = decrypted.toString('utf-8');
    return JSON.parse(json);
  }

  /**
   * Validate encrypted data
   * @param {Uint8Array} data - Data to validate
   * @returns {boolean}
   */
  static validate(data) {
    if (!(data instanceof Buffer) && !(data instanceof Uint8Array)) return false;
    if (data.length < 10) return false;
    
    const magic = data.readUInt32BE(0);
    if (magic !== 0x43525950) return false;
    
    const version = data.readUInt32BE(4);
    if (version > 0x00000001) return false;
    
    return true;
  }

  /**
   * Get encryption info
   * @param {string} path - File path
   * @returns {Object}
   */
  static getInfo(path) {
    const data = FS.readFileSync(path);
    let offset = 0;
    
    const magic = data.readUInt32BE(offset);
    offset += 4;
    if (magic !== 0x43525950) {
      throw new Error('Invalid encrypted resource header');
    }
    
    const version = data.readUInt32BE(offset);
    offset += 4;
    
    const modeFlag = data.readUInt16BE(offset);
    offset += 2;
    
    let ivLen = 0;
    if (offset < data.length) {
      ivLen = data.readUInt16BE(offset);
      offset += 2;
    }
    const iv = ivLen > 0 ? data.slice(offset, offset + ivLen) : null;
    offset += ivLen;
    
    let tagLen = 0;
    let authTag = null;
    if (modeFlag === 1 && offset < data.length) {
      tagLen = data.readUInt16BE(offset);
      offset += 2;
      authTag = tagLen > 0 ? data.slice(offset, offset + tagLen) : null;
      offset += tagLen;
    }
    
    const encrypted = data.slice(offset);
    
    return {
      magic: magic.toString(16),
      version: version,
      mode: modeFlag === 1 ? 'gcm' : 'cbc',
      ivLength: ivLen,
      iv: iv,
      tagLength: tagLen,
      authTag: authTag,
      encryptedLength: encrypted.length,
      totalSize: data.length,
    };
  }
}

module.exports = CryptoResourceFormat;
