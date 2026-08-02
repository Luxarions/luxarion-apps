/**
 * LXRN Resource Module
 * @namespace LXRN.Resource
 * @author LXRN
 */

/**
 * Base resource class
 * @class Resource
 */
class Resource {
  #path = '';
  #type = 'Resource';
  #uid = '';
  #modified = false;
  #metadata = {};
  #subresources = [];
  #dependencies = [];
  #loaded = false;
  #loading = false;
  #data = null;
  #cacheable = true;
  #version = 1;

  constructor() {
    this.#uid = this.__generateUID();
  }

  /**
   * Generate UID
   * @private
   * @returns {string}
   */
  __generateUID() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `uid_${timestamp}_${random}`;
  }

  /**
   * Get path
   * @returns {string}
   */
  get path() {
    return this.#path;
  }

  /**
   * Set path
   * @param {string} value - Path
   */
  set path(value) {
    this.#path = value;
  }

  /**
   * Get type
   * @returns {string}
   */
  get type() {
    return this.#type;
  }

  /**
   * Set type
   * @param {string} value - Type
   */
  set type(value) {
    this.#type = value;
  }

  /**
   * Get UID
   * @returns {string}
   */
  get uid() {
    return this.#uid;
  }

  /**
   * Get modified status
   * @returns {boolean}
   */
  get modified() {
    return this.#modified;
  }

  /**
   * Set modified status
   * @param {boolean} value - Modified status
   */
  set modified(value) {
    this.#modified = value;
  }

  /**
   * Get version
   * @returns {number}
   */
  get version() {
    return this.#version;
  }

  /**
   * Set version
   * @param {number} value - Version
   */
  set version(value) {
    this.#version = value;
  }

  /**
   * Get metadata
   * @param {string} key - Metadata key
   * @returns {*}
   */
  getMetadata(key) {
    return this.#metadata[key];
  }

  /**
   * Set metadata
   * @param {string} key - Metadata key
   * @param {*} value - Metadata value
   * @returns {Resource} This instance
   */
  setMetadata(key, value) {
    this.#metadata[key] = value;
    this.#modified = true;
    return this;
  }

  /**
   * Remove metadata
   * @param {string} key - Metadata key
   * @returns {boolean}
   */
  removeMetadata(key) {
    if (this.#metadata.hasOwnProperty(key)) {
      delete this.#metadata[key];
      this.#modified = true;
      return true;
    }
    return false;
  }

  /**
   * Get all metadata
   * @returns {Object}
   */
  getAllMetadata() {
    return { ...this.#metadata };
  }

  /**
   * Add subresource
   * @param {Resource} resource - Subresource
   * @returns {Resource} This instance
   */
  addSubresource(resource) {
    this.#subresources.push(resource);
    this.#modified = true;
    return this;
  }

  /**
   * Get subresources
   * @returns {Array}
   */
  getSubresources() {
    return [...this.#subresources];
  }

  /**
   * Remove subresource
   * @param {Resource} resource - Subresource to remove
   * @returns {boolean}
   */
  removeSubresource(resource) {
    const idx = this.#subresources.indexOf(resource);
    if (idx !== -1) {
      this.#subresources.splice(idx, 1);
      this.#modified = true;
      return true;
    }
    return false;
  }

  /**
   * Add dependency
   * @param {string} path - Dependency path
   * @returns {Resource} This instance
   */
  addDependency(path) {
    if (!this.#dependencies.includes(path)) {
      this.#dependencies.push(path);
      this.#modified = true;
    }
    return this;
  }

  /**
   * Get dependencies
   * @returns {Array}
   */
  getDependencies() {
    return [...this.#dependencies];
  }

  /**
   * Remove dependency
   * @param {string} path - Dependency path
   * @returns {boolean}
   */
  removeDependency(path) {
    const idx = this.#dependencies.indexOf(path);
    if (idx !== -1) {
      this.#dependencies.splice(idx, 1);
      this.#modified = true;
      return true;
    }
    return false;
  }

  /**
   * Set cacheable
   * @param {boolean} cacheable - Cacheable
   * @returns {Resource} This instance
   */
  setCacheable(cacheable) {
    this.#cacheable = cacheable;
    return this;
  }

  /**
   * Check if cacheable
   * @returns {boolean}
   */
  isCacheable() {
    return this.#cacheable;
  }

  /**
   * Set data
   * @param {*} data - Resource data
   * @returns {Resource} This instance
   */
  setData(data) {
    this.#data = data;
    this.#loaded = true;
    this.#modified = true;
    return this;
  }

  /**
   * Get data
   * @returns {*}
   */
  getData() {
    return this.#data;
  }

  /**
   * Check if loaded
   * @returns {boolean}
   */
  isLoaded() {
    return this.#loaded;
  }

  /**
   * Check if loading
   * @returns {boolean}
   */
  isLoading() {
    return this.#loading;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      type: this.#type,
      uid: this.#uid,
      version: this.#version,
      metadata: this.#metadata,
      dependencies: this.#dependencies,
      cacheable: this.#cacheable,
      path: this.#path,
    };
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {Resource} This instance
   */
  fromJSON(data) {
    this.#type = data.type || this.#type;
    this.#uid = data.uid || this.__generateUID();
    this.#version = data.version || 1;
    this.#metadata = data.metadata || {};
    this.#dependencies = data.dependencies || [];
    this.#cacheable = data.cacheable !== undefined ? data.cacheable : true;
    this.#path = data.path || '';
    return this;
  }

  /**
   * Clone resource
   * @returns {Resource}
   */
  clone() {
    const clone = new this.constructor();
    clone.#type = this.#type;
    clone.#uid = this.__generateUID();
    clone.#version = this.#version;
    clone.#metadata = { ...this.#metadata };
    clone.#dependencies = [...this.#dependencies];
    clone.#cacheable = this.#cacheable;
    clone.#path = this.#path;
    if (this.#data) {
      clone.#data = this.__cloneData(this.#data);
    }
    return clone;
  }

  /**
   * Clone data
   * @private
   * @param {*} data - Data to clone
   * @returns {*}
   */
  __cloneData(data) {
    if (data === null || data === undefined) return data;
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.__cloneData(item));
      }
      const result = {};
      for (const key in data) {
        result[key] = this.__cloneData(data[key]);
      }
      return result;
    }
    return data;
  }

  /**
   * Load resource from file
   * @param {string} path - File path
   * @param {Object} options - Load options
   * @returns {Resource}
   */
  static load(path, options = {}) {
    const fs = require('fs');
    if (!fs.existsSync(path)) {
      throw new Error(`Resource not found: ${path}`);
    }
    
    const ext = path.split('.').pop().toLowerCase();
    const ResourceFormatJSON = require('./ResourceFormatJSON.js');
    const ResourceFormatBinary = require('./ResourceFormatBinary.js');
    
    if (ext === 'json') {
      const data = ResourceFormatJSON.load(path, options);
      const resource = new Resource();
      resource.#path = path;
      resource.fromJSON(data);
      resource.#loaded = true;
      return resource;
    } else if (ext === 'res' || ext === 'bin') {
      const resource = ResourceFormatBinary.load(path, options);
      resource.#path = path;
      return resource;
    }
    
    throw new Error(`Unsupported resource format: ${ext}`);
  }

  /**
   * Save resource to file
   * @param {string} path - File path
   * @param {Resource} resource - Resource to save
   * @param {Object} options - Save options
   * @returns {boolean}
   */
  static save(path, resource, options = {}) {
    const ext = path.split('.').pop().toLowerCase();
    const ResourceFormatJSON = require('./ResourceFormatJSON.js');
    const ResourceFormatBinary = require('./ResourceFormatBinary.js');
    
    if (ext === 'json') {
      ResourceFormatJSON.save(path, resource.toJSON(), options);
      resource.#path = path;
      resource.#modified = false;
      return true;
    } else if (ext === 'res' || ext === 'bin') {
      ResourceFormatBinary.save(path, resource, options);
      resource.#path = path;
      resource.#modified = false;
      return true;
    }
    
    throw new Error(`Unsupported resource format: ${ext}`);
  }

  /**
   * To string
   * @returns {string}
   */
  toString() {
    return `[Resource type=${this.#type} uid=${this.#uid} path=${this.#path}]`;
  }
}

module.exports = Resource;
