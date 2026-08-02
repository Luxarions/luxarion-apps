/**
 * LXRN ResourcePreloader Module
 * @namespace LXRN.ResourcePreloader
 * @author LXRN
 */

const Node = require('../scene/Node.js');
const ResourceLoader = require('./ResourceLoader.js');

/**
 * Resource preloader node
 * @class ResourcePreloader
 * @extends Node
 */
class ResourcePreloader extends Node {
  #resources = new Map();
  #loading = new Map();
  #loaded = new Map();
  #queue = [];
  #maxConcurrent = 4;
  #activeCount = 0;
  #loadedCallback = null;
  #progressCallback = null;
  #errorCallback = null;
  #completedCallback = null;

  constructor(name = 'ResourcePreloader') {
    super(name);
  }

  /**
   * Add resource to preload
   * @param {string} name - Resource name
   * @param {string} path - File path
   * @param {Object} options - Preload options
   * @returns {ResourcePreloader} This instance
   */
  addResource(name, path, options = {}) {
    this.#resources.set(name, { path, options });
    return this;
  }

  /**
   * Remove resource
   * @param {string} name - Resource name
   * @returns {boolean}
   */
  removeResource(name) {
    const result = this.#resources.delete(name);
    this.#loaded.delete(name);
    return result;
  }

  /**
   * Check if resource exists
   * @param {string} name - Resource name
   * @returns {boolean}
   */
  hasResource(name) {
    return this.#resources.has(name);
  }

  /**
   * Get resource path
   * @param {string} name - Resource name
   * @returns {string|null}
   */
  getResourcePath(name) {
    const entry = this.#resources.get(name);
    return entry ? entry.path : null;
  }

  /**
   * Get loaded resource
   * @param {string} name - Resource name
   * @returns {*}
   */
  getResource(name) {
    return this.#loaded.get(name) || null;
  }

  /**
   * Check if loaded
   * @param {string} name - Resource name
   * @returns {boolean}
   */
  isLoaded(name) {
    return this.#loaded.has(name);
  }

  /**
   * Check if loading
   * @param {string} name - Resource name
   * @returns {boolean}
   */
  isLoading(name) {
    return this.#loading.has(name);
  }

  /**
   * Preload resource
   * @param {string} name - Resource name
   * @returns {Promise<*>}
   */
  preload(name) {
    return new Promise((resolve, reject) => {
      if (this.#loaded.has(name)) {
        resolve(this.#loaded.get(name));
        return;
      }
      
      if (this.#loading.has(name)) {
        const existing = this.#loading.get(name);
        if (existing) {
          existing.then(resolve).catch(reject);
        }
        return;
      }
      
      const entry = this.#resources.get(name);
      if (!entry) {
        reject(new Error(`Resource not found: ${name}`));
        return;
      }
      
      const promise = this.__loadResource(entry.path, entry.options);
      this.#loading.set(name, promise);
      
      promise.then((resource) => {
        this.#loading.delete(name);
        this.#loaded.set(name, resource);
        if (this.#loadedCallback) {
          this.#loadedCallback(name, resource);
        }
        resolve(resource);
      }).catch((error) => {
        this.#loading.delete(name);
        if (this.#errorCallback) {
          this.#errorCallback(name, error);
        }
        reject(error);
      });
    });
  }

  /**
   * Load resource
   * @private
   * @param {string} path - File path
   * @param {Object} options - Load options
   * @returns {Promise<*>}
   */
  __loadResource(path, options = {}) {
    return new Promise((resolve, reject) => {
      if (!ResourceLoader.exists(path)) {
        reject(new Error(`Resource file not found: ${path}`));
        return;
      }
      
      try {
        const resource = ResourceLoader.loadSync(path, '', options);
        resolve(resource);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Preload all resources
   * @param {Object} options - Preload options
   * @returns {Promise<Array>}
   */
  preloadAll(options = {}) {
    const promises = [];
    for (const [name, entry] of this.#resources) {
      const opts = { ...entry.options, ...options };
      promises.push(this.preload(name));
    }
    return Promise.all(promises);
  }

  /**
   * Preload batch
   * @param {Array} names - Resource names
   * @param {Object} options - Preload options
   * @returns {Promise<Array>}
   */
  preloadBatch(names, options = {}) {
    const promises = [];
    for (const name of names) {
      const entry = this.#resources.get(name);
      if (entry) {
        const opts = { ...entry.options, ...options };
        promises.push(this.preload(name));
      }
    }
    return Promise.all(promises);
  }

  /**
   * Preload with queue
   * @param {Object} options - Preload options
   * @returns {Promise<Array>}
   */
  preloadQueued(options = {}) {
    this.#queue = Array.from(this.#resources.keys());
    return this.__processQueue(options);
  }

  /**
   * Process queue
   * @private
   * @param {Object} options - Preload options
   * @returns {Promise<Array>}
   */
  __processQueue(options = {}) {
    return new Promise((resolve, reject) => {
      const results = [];
      const processNext = () => {
        if (this.#queue.length === 0) {
          if (this.#completedCallback) {
            this.#completedCallback(results);
          }
          resolve(results);
          return;
        }
        
        if (this.#activeCount >= this.#maxConcurrent) {
          setTimeout(processNext, 100);
          return;
        }
        
        const name = this.#queue.shift();
        this.#activeCount++;
        
        this.preload(name)
          .then((resource) => {
            results.push({ name, resource, success: true });
            if (this.#progressCallback) {
              this.#progressCallback(name, resource, results.length, this.#resources.size);
            }
          })
          .catch((error) => {
            results.push({ name, error: error.message, success: false });
            if (this.#errorCallback) {
              this.#errorCallback(name, error);
            }
          })
          .finally(() => {
            this.#activeCount--;
            processNext();
          });
      };
      
      processNext();
    });
  }

  /**
   * Get resource names
   * @returns {Array}
   */
  getResourceNames() {
    return Array.from(this.#resources.keys());
  }

  /**
   * Get loaded names
   * @returns {Array}
   */
  getLoadedNames() {
    return Array.from(this.#loaded.keys());
  }

  /**
   * Get loading names
   * @returns {Array}
   */
  getLoadingNames() {
    return Array.from(this.#loading.keys());
  }

  /**
   * Clear all resources
   * @returns {ResourcePreloader} This instance
   */
  clear() {
    this.#resources.clear();
    this.#loaded.clear();
    this.#loading.clear();
    this.#queue = [];
    return this;
  }

  /**
   * Clear loaded resources
   * @returns {ResourcePreloader} This instance
   */
  clearLoaded() {
    this.#loaded.clear();
    return this;
  }

  /**
   * Set max concurrent
   * @param {number} max - Max concurrent loads
   * @returns {ResourcePreloader} This instance
   */
  setMaxConcurrent(max) {
    this.#maxConcurrent = Math.max(1, max);
    return this;
  }

  /**
   * Get max concurrent
   * @returns {number}
   */
  getMaxConcurrent() {
    return this.#maxConcurrent;
  }

  /**
   * Get resource count
   * @returns {number}
   */
  getCount() {
    return this.#resources.size;
  }

  /**
   * Get loaded count
   * @returns {number}
   */
  getLoadedCount() {
    return this.#loaded.size;
  }

  /**
   * Check if ready
   * @returns {boolean}
   */
  isReady() {
    return this.#loading.size === 0 && this.#queue.length === 0;
  }

  /**
   * Set loaded callback
   * @param {Function} callback - Loaded callback
   * @returns {ResourcePreloader} This instance
   */
  onLoaded(callback) {
    this.#loadedCallback = callback;
    return this;
  }

  /**
   * Set progress callback
   * @param {Function} callback - Progress callback
   * @returns {ResourcePreloader} This instance
   */
  onProgress(callback) {
    this.#progressCallback = callback;
    return this;
  }

  /**
   * Set error callback
   * @param {Function} callback - Error callback
   * @returns {ResourcePreloader} This instance
   */
  onError(callback) {
    this.#errorCallback = callback;
    return this;
  }

  /**
   * Set completed callback
   * @param {Function} callback - Completed callback
   * @returns {ResourcePreloader} This instance
   */
  onCompleted(callback) {
    this.#completedCallback = callback;
    return this;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    const resources = {};
    for (const [name, entry] of this.#resources) {
      resources[name] = entry.path;
    }
    data.resources = resources;
    data.maxConcurrent = this.#maxConcurrent;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {ResourcePreloader} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    if (data.resources) {
      for (const [name, path] of Object.entries(data.resources)) {
        this.addResource(name, path);
      }
    }
    if (data.maxConcurrent) {
      this.setMaxConcurrent(data.maxConcurrent);
    }
    return this;
  }
}

module.exports = ResourcePreloader;
