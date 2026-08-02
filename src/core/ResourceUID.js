/**
 * LXRN ResourceUID Module
 * @namespace LXRN.ResourceUID
 * @author LXRN
 */

const FS = require('fs');

/**
 * Resource UID management
 * @class ResourceUID
 */
class ResourceUID {
  static _cache = {};
  static _counter = 0;
  static _maxCacheSize = 1000;

  /**
   * Generate UID
   * @returns {string}
   */
  static generate() {
    const timestamp = Date.now().toString(36);
    const counter = (ResourceUID._counter++).toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `uid_${timestamp}_${counter}_${random}`;
  }

  /**
   * Check if UID is valid
   * @param {string} uid - UID to check
   * @returns {boolean}
   */
  static isValid(uid) {
    if (typeof uid !== 'string') return false;
    return uid.startsWith('uid_') && uid.length >= 10;
  }

  /**
   * Register UID
   * @param {string} uid - UID
   * @param {string} path - Resource path
   */
  static register(uid, path) {
    ResourceUID._cache[uid] = path;
    ResourceUID.__trimCache();
  }

  /**
   * Unregister UID
   * @param {string} uid - UID
   * @returns {boolean}
   */
  static unregister(uid) {
    return delete ResourceUID._cache[uid];
  }

  /**
   * Get path by UID
   * @param {string} uid - UID
   * @returns {string|null}
   */
  static getPath(uid) {
    return ResourceUID._cache[uid] || null;
  }

  /**
   * Get UID by path
   * @param {string} path - Resource path
   * @returns {string|null}
   */
  static getUID(path) {
    for (const uid in ResourceUID._cache) {
      if (ResourceUID._cache[uid] === path) {
        return uid;
      }
    }
    return null;
  }

  /**
   * Resolve UID to path
   * @param {string} uid - UID
   * @returns {string|null}
   */
  static resolve(uid) {
    return ResourceUID.getPath(uid);
  }

  /**
   * Clear cache
   */
  static clear() {
    ResourceUID._cache = {};
  }

  /**
   * Trim cache
   * @private
   */
  static __trimCache() {
    const keys = Object.keys(ResourceUID._cache);
    if (keys.length > ResourceUID._maxCacheSize) {
      const toRemove = keys.slice(0, Math.floor(keys.length / 2));
      for (const key of toRemove) {
        delete ResourceUID._cache[key];
      }
    }
  }

  /**
   * Save cache to file
   * @param {string} filepath - File path
   */
  static saveCache(filepath) {
    const data = JSON.stringify(ResourceUID._cache);
    FS.writeFileSync(filepath, data, 'utf-8');
  }

  /**
   * Load cache from file
   * @param {string} filepath - File path
   */
  static loadCache(filepath) {
    if (!FS.existsSync(filepath)) return;
    const data = FS.readFileSync(filepath, 'utf-8');
    ResourceUID._cache = JSON.parse(data);
  }

  /**
   * Set max cache size
   * @param {number} size - Max cache size
   */
  static setMaxCacheSize(size) {
    ResourceUID._maxCacheSize = Math.max(1, size);
    ResourceUID.__trimCache();
  }

  /**
   * Get cache size
   * @returns {number}
   */
  static getCacheSize() {
    return Object.keys(ResourceUID._cache).length;
  }
}

module.exports = ResourceUID;
