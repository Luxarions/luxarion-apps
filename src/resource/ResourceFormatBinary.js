/**
 * LXRN ResourceLoader Module
 * @namespace LXRN.ResourceLoader
 * @author LXRN
 */

const FS = require('fs');
const PATH = require('path');
const Resource = require('./Resource.js');
const ResourceFormatJSON = require('./ResourceFormatJSON.js');
const ResourceFormatBinary = require('./ResourceFormatBinary.js');
const ResourceLoaderConstants = require('./ResourceLoaderConstants.js');

/**
 * Resource loader
 * @class ResourceLoader
 */
class ResourceLoader {
  static #loaders = {};
  static #cache = new Map();
  static #loading = new Map();
  static #maxCacheSize = 100;
  static #cacheEnabled = true;
  static #logger = null;
  static #errorCallbacks = [];

  /**
   * Set logger
   * @param {Object} logger - Logger instance
   */
  static setLogger(logger) {
    ResourceLoader.#logger = logger;
  }

  /**
   * Log message
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Log data
   */
  static __log(level, message, data = null) {
    if (ResourceLoader.#logger) {
      if (typeof ResourceLoader.#logger.log === 'function') {
        ResourceLoader.#logger.log(level, message, data);
      } else if (typeof ResourceLoader.#logger === 'function') {
        ResourceLoader.#logger(level, message, data);
      }
    }
  }

  /**
   * Register loader
   * @param {string} extension - File extension
   * @param {Object} loader - Loader object
   */
  static registerLoader(extension, loader) {
    ResourceLoader.#loaders[extension.toLowerCase()] = loader;
  }

  /**
   * Load resource
   * @param {string} path - File path
   * @param {string} typeHint - Type hint
   * @param {Object} options - Load options
   * @returns {Promise<Resource>}
   */
  static load(path, typeHint = '', options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const result = ResourceLoader.loadSync(path, typeHint, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Load resource synchronously
   * @param {string} path - File path
   * @param {string} typeHint - Type hint
   * @param {Object} options - Load options
   * @returns {Resource}
   */
  static loadSync(path, typeHint = '', options = {}) {
    const cache = options.cache !== undefined ? options.cache : true;
    
    if (!FS.existsSync(path)) {
      const error = new Error(`Resource not found: ${path}`);
      ResourceLoader.__log('error', error.message, { path });
      throw error;
    }
    
    // Check cache
    if (cache && ResourceLoader.#cacheEnabled && ResourceLoader.#cache.has(path)) {
      ResourceLoader.__log('debug', `Cache hit: ${path}`);
      return ResourceLoader.#cache.get(path);
    }
    
    // Check if already loading
    if (ResourceLoader.#loading.has(path)) {
      ResourceLoader.__log('debug', `Already loading: ${path}`);
      return ResourceLoader.#loading.get(path);
    }
    
    const ext = PATH.extname(path).toLowerCase().substring(1);
    const loader = ResourceLoader.#loaders[ext];
    
    if (!loader) {
      const error = new Error(`No loader registered for extension: ${ext}`);
      ResourceLoader.__log('error', error.message, { path, ext });
      throw error;
    }
    
    let resource;
    const startTime = Date.now();
    ResourceLoader.__log('info', `Loading: ${path}`, { ext });
    
    try {
      if (loader.loadSync) {
        resource = loader.loadSync(path, options);
      } else {
        resource = loader.load(path, options);
      }
    } catch (error) {
      ResourceLoader.__log('error', `Failed to load: ${path}`, { error: error.message });
      
      // Call error callbacks
      for (const callback of ResourceLoader.#errorCallbacks) {
        try {
          callback(error, path);
        } catch (e) {
          // Ignore
        }
      }
      
      throw error;
    }
    
    if (!(resource instanceof Resource)) {
      // Wrap in Resource if not already
      const wrapper = new Resource();
      wrapper.path = path;
      wrapper.type = typeHint || 'Resource';
      wrapper._data = resource;
      wrapper._loaded = true;
      resource = wrapper;
    }
    
    if (typeHint && resource.type !== typeHint) {
      const error = new Error(`Resource type mismatch: expected ${typeHint}, got ${resource.type}`);
      ResourceLoader.__log('error', error.message, { path, expected: typeHint, got: resource.type });
      throw error;
    }
    
    resource.path = path;
    resource._loaded = true;
    
    const duration = Date.now() - startTime;
    ResourceLoader.__log('info', `Loaded: ${path}`, { duration, type: resource.type });
    
    // Cache
    if (cache && ResourceLoader.#cacheEnabled) {
      ResourceLoader.#cache.set(path, resource);
      ResourceLoader.__trimCache();
    }
    
    return resource;
  }

  /**
   * Trim cache
   * @private
   */
  static __trimCache() {
    if (ResourceLoader.#cache.size > ResourceLoader.#maxCacheSize) {
      const entries = Array.from(ResourceLoader.#cache.entries());
      const toRemove = entries.slice(0, Math.floor(entries.length / 2));
      for (const [key] of toRemove) {
        ResourceLoader.#cache.delete(key);
        ResourceLoader.__log('debug', `Cache evicted: ${key}`);
      }
    }
  }

  /**
   * Check if resource exists
   * @param {string} path - File path
   * @returns {boolean}
   */
  static exists(path) {
    return FS.existsSync(path);
  }

  /**
   * Get resource type
   * @param {string} path - File path
   * @returns {string}
   */
  static getResourceType(path) {
    if (!FS.existsSync(path)) return '';
    
    const ext = PATH.extname(path).toLowerCase().substring(1);
    if (ext === 'json') {
      try {
        const data = ResourceFormatJSON.load(path, { validate: false });
        return data.type || 'Resource';
      } catch (error) {
        return '';
      }
    }
    if (ext === 'res' || ext === 'bin') {
      try {
        const resource = ResourceFormatBinary.load(path);
        return resource.type;
      } catch (error) {
        return '';
      }
    }
    return '';
  }

  /**
   * Get dependencies
   * @param {string} path - File path
   * @returns {Array}
   */
  static getDependencies(path) {
    if (!FS.existsSync(path)) return [];
    
    const ext = PATH.extname(path).toLowerCase().substring(1);
    if (ext === 'json') {
      try {
        const data = ResourceFormatJSON.load(path, { validate: false });
        return data.dependencies || [];
      } catch (error) {
        return [];
      }
    }
    if (ext === 'res' || ext === 'bin') {
      try {
        const resource = ResourceFormatBinary.load(path);
        return resource._dependencies || [];
      } catch (error) {
        return [];
      }
    }
    return [];
  }

  /**
   * Load all resources in directory
   * @param {string} directory - Directory path
   * @param {Object} options - Load options
   * @param {boolean} recursive - Recursive
   * @returns {Array}
   */
  static loadAll(directory, options = {}, recursive = true) {
    const results = [];
    if (!FS.existsSync(directory)) return results;
    
    const entries = FS.readdirSync(directory);
    for (const entry of entries) {
      const fullPath = PATH.join(directory, entry);
      const stat = FS.statSync(fullPath);
      if (stat.isDirectory() && recursive) {
        results.push(...ResourceLoader.loadAll(fullPath, options, recursive));
      } else if (stat.isFile()) {
        try {
          const resource = ResourceLoader.loadSync(fullPath, '', options);
          results.push(resource);
        } catch (error) {
          // Skip invalid resources
          ResourceLoader.__log('warn', `Skipped: ${fullPath}`, { error: error.message });
        }
      }
    }
    return results;
  }

  /**
   * Clear cache
   */
  static clearCache() {
    const size = ResourceLoader.#cache.size;
    ResourceLoader.#cache.clear();
    ResourceLoader.__log('info', `Cache cleared: ${size} entries`);
  }

  /**
   * Get cache size
   * @returns {number}
   */
  static getCacheSize() {
    return ResourceLoader.#cache.size;
  }

  /**
   * Enable cache
   * @param {boolean} enable - Enable cache
   */
  static setCacheEnabled(enable) {
    ResourceLoader.#cacheEnabled = enable;
    if (!enable) {
      ResourceLoader.clearCache();
    }
    ResourceLoader.__log('info', `Cache ${enable ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set max cache size
   * @param {number} size - Max cache size
   */
  static setMaxCacheSize(size) {
    ResourceLoader.#maxCacheSize = Math.max(1, size);
    ResourceLoader.__trimCache();
    ResourceLoader.__log('info', `Max cache size set to ${size}`);
  }

  /**
   * Preload resource
   * @param {string} path - File path
   * @param {Object} options - Preload options
   * @returns {Promise<Resource>}
   */
  static preload(path, options = {}) {
    return ResourceLoader.load(path, '', options);
  }

  /**
   * Preload all in directory
   * @param {string} directory - Directory path
   * @param {Function} progress - Progress callback
   * @param {Object} options - Preload options
   * @returns {Promise<Array>}
   */
  static async preloadAll(directory, progress = null, options = {}) {
    const files = [];
    const collectFiles = (dir) => {
      if (!FS.existsSync(dir)) return;
      const entries = FS.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = PATH.join(dir, entry);
        const stat = FS.statSync(fullPath);
        if (stat.isDirectory()) {
          collectFiles(fullPath);
        } else if (stat.isFile()) {
          const ext = PATH.extname(entry).toLowerCase().substring(1);
          if (ext === 'json' || ext === 'res' || ext === 'bin') {
            files.push(fullPath);
          }
        }
      }
    };
    
    collectFiles(directory);
    ResourceLoader.__log('info', `Preloading ${files.length} files from ${directory}`);
    
    const results = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const resource = await ResourceLoader.load(files[i], '', options);
        results.push(resource);
        if (progress) {
          progress(i + 1, files.length, files[i]);
        }
      } catch (error) {
        ResourceLoader.__log('error', `Preload failed: ${files[i]}`, { error: error.message });
        if (progress) {
          progress(i + 1, files.length, files[i], error);
        }
      }
    }
    return results;
  }

  /**
   * Add error callback
   * @param {Function} callback - Error callback
   */
  static onError(callback) {
    ResourceLoader.#errorCallbacks.push(callback);
  }

  /**
   * Remove error callback
   * @param {Function} callback - Error callback
   * @returns {boolean}
   */
  static removeErrorCallback(callback) {
    const idx = ResourceLoader.#errorCallbacks.indexOf(callback);
    if (idx !== -1) {
      ResourceLoader.#errorCallbacks.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Get supported extensions
   * @returns {Array}
   */
  static getSupportedExtensions() {
    return Object.keys(ResourceLoader.#loaders);
  }

  /**
   * Check if extension is supported
   * @param {string} extension - File extension
   * @returns {boolean}
   */
  static isSupported(extension) {
    return extension.toLowerCase() in ResourceLoader.#loaders;
  }
}

// Register default loaders
ResourceLoader.registerLoader('json', ResourceFormatJSON);
ResourceLoader.registerLoader('res', ResourceFormatBinary);
ResourceLoader.registerLoader('bin', ResourceFormatBinary);

module.exports = ResourceLoader;
