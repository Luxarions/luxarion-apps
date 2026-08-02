/**
 * LXRN InstancePlaceholder Module
 * @namespace LXRN.InstancePlaceholder
 * @author LXRN
 */

const Node = require('./Node.js');

/**
 * Instance placeholder for loading scenes dynamically
 * @class InstancePlaceholder
 * @extends Node
 */
class InstancePlaceholder extends Node {
  #sourcePath = '';
  #replacements = {};
  #instance = null;
  #loaded = false;
  #autoLoad = true;
  #loadAsync = false;
  #loading = false;
  #loadError = null;
  #onLoadCallback = null;
  #onErrorCallback = null;
  #cacheInstance = true;
  #instanceCache = null;
  #loadQueue = [];

  constructor(name = 'InstancePlaceholder') {
    super(name);
  }

  /**
   * Get source path
   * @returns {string}
   */
  get sourcePath() {
    return this.#sourcePath;
  }

  /**
   * Set source path
   * @param {string} value - Source path
   */
  set sourcePath(value) {
    this.#sourcePath = value;
    if (this.#autoLoad && this.#enteredTree) {
      this.loadInstance();
    }
  }

  /**
   * Get auto load
   * @returns {boolean}
   */
  get autoLoad() {
    return this.#autoLoad;
  }

  /**
   * Set auto load
   * @param {boolean} value - Auto load
   */
  set autoLoad(value) {
    this.#autoLoad = value;
  }

  /**
   * Get load async
   * @returns {boolean}
   */
  get loadAsync() {
    return this.#loadAsync;
  }

  /**
   * Set load async
   * @param {boolean} value - Load async
   */
  set loadAsync(value) {
    this.#loadAsync = value;
  }

  /**
   * Get cache instance
   * @returns {boolean}
   */
  get cacheInstance() {
    return this.#cacheInstance;
  }

  /**
   * Set cache instance
   * @param {boolean} value - Cache instance
   */
  set cacheInstance(value) {
    this.#cacheInstance = value;
  }

  /**
   * Get replacements
   * @returns {Object}
   */
  get replacements() {
    return this.#replacements;
  }

  /**
   * Set replacements
   * @param {Object} value - Replacements
   */
  set replacements(value) {
    this.#replacements = value;
    if (this.#loaded && this.#instance) {
      this.__applyReplacements();
    }
  }

  /**
   * Set replacement
   * @param {string} name - Replacement name
   * @param {*} value - Replacement value
   * @returns {InstancePlaceholder} This instance
   */
  setReplacement(name, value) {
    this.#replacements[name] = value;
    if (this.#loaded && this.#instance) {
      this.__applyReplacements();
    }
    return this;
  }

  /**
   * Get replacement
   * @param {string} name - Replacement name
   * @returns {*}
   */
  getReplacement(name) {
    return this.#replacements[name] || null;
  }

  /**
   * Load instance
   * @returns {Promise<Node>}
   */
  loadInstance() {
    if (this.#loaded && this.#instance) {
      return Promise.resolve(this.#instance);
    }
    
    if (this.#loading) {
      return new Promise((resolve, reject) => {
        this.#loadQueue.push({ resolve, reject });
      });
    }
    
    if (!this.#sourcePath) {
      const error = new Error('No source path set');
      this.#loadError = error;
      if (this.#onErrorCallback) {
        this.#onErrorCallback(error);
      }
      return Promise.reject(error);
    }
    
    this.#loading = true;
    this.emit('loading');
    
    return new Promise((resolve, reject) => {
      try {
        const fs = require('fs');
        if (!fs.existsSync(this.#sourcePath)) {
          throw new Error(`Source file not found: ${this.#sourcePath}`);
        }
        
        const data = fs.readFileSync(this.#sourcePath, 'utf-8');
        const json = JSON.parse(data);
        this.#instance = this.__createInstanceFromJSON(json);
        this.#loaded = true;
        this.#loading = false;
        this.__applyReplacements();
        this.__setupInstance();
        
        if (this.#cacheInstance) {
          this.#instanceCache = this.#instance;
        }
        
        this.emit('loaded', this.#instance);
        if (this.#onLoadCallback) {
          this.#onLoadCallback(this.#instance);
        }
        
        // Resolve queued promises
        for (const item of this.#loadQueue) {
          item.resolve(this.#instance);
        }
        this.#loadQueue = [];
        
        resolve(this.#instance);
      } catch (error) {
        this.#loading = false;
        this.#loadError = error;
        this.emit('error', error);
        if (this.#onErrorCallback) {
          this.#onErrorCallback(error);
        }
        
        // Reject queued promises
        for (const item of this.#loadQueue) {
          item.reject(error);
        }
        this.#loadQueue = [];
        
        reject(error);
      }
    });
  }

  /**
   * Create instance from JSON
   * @private
   * @param {Object} data - JSON data
   * @returns {Node}
   */
  __createInstanceFromJSON(data) {
    const node = new Node(data.name || 'Instance');
    for (const key in data) {
      if (key !== 'name' && key !== 'id' && key !== 'parentId') {
        if (typeof data[key] === 'object' && data[key] !== null) {
          // Handle nested objects
          if (Array.isArray(data[key])) {
            node[key] = [...data[key]];
          } else {
            node[key] = { ...data[key] };
          }
        } else {
          node[key] = data[key];
        }
      }
    }
    return node;
  }

  /**
   * Apply replacements
   * @private
   */
  __applyReplacements() {
    if (!this.#instance) return;
    for (const [key, value] of Object.entries(this.#replacements)) {
      if (this.#instance[key] !== undefined) {
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            this.#instance[key] = [...value];
          } else {
            this.#instance[key] = { ...value };
          }
        } else {
          this.#instance[key] = value;
        }
      }
    }
  }

  /**
   * Setup instance
   * @private
   */
  __setupInstance() {
    if (!this.#instance) return;
    
    // Copy properties from placeholder
    this.#instance._name = this._name;
    this.#instance._position = { ...this._position };
    this.#instance._rotation = this._rotation;
    this.#instance._scale = { ...this._scale };
    this.#instance._visible = this._visible;
    this.#instance._modulate = { ...this._modulate };
    this.#instance._selfModulate = { ...this._selfModulate };
    
    // Replace this node with instance
    if (this.#parent) {
      this.#parent.addChild(this.#instance);
      this.#parent.removeChild(this);
    }
    
    this.#instance._owner = this._owner;
  }

  /**
   * Get instance
   * @returns {Node|null}
   */
  getInstance() {
    return this.#instance;
  }

  /**
   * Replace instance
   * @param {Node} instance - New instance
   * @returns {InstancePlaceholder} This instance
   */
  replaceInstance(instance) {
    this.#instance = instance;
    this.#loaded = true;
    this.emit('replaced', instance);
    return this;
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
   * Get load error
   * @returns {Error|null}
   */
  getLoadError() {
    return this.#loadError;
  }

  /**
   * On load callback
   * @param {Function} callback - Callback
   * @returns {InstancePlaceholder} This instance
   */
  onLoad(callback) {
    this.#onLoadCallback = callback;
    return this;
  }

  /**
   * On error callback
   * @param {Function} callback - Callback
   * @returns {InstancePlaceholder} This instance
   */
  onError(callback) {
    this.#onErrorCallback = callback;
    return this;
  }

  /**
   * Ready callback
   */
  ready() {
    if (this.#autoLoad) {
      if (this.#loadAsync) {
        this.loadInstance().catch(() => {});
      } else {
        this.loadInstance();
      }
    }
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.sourcePath = this.#sourcePath;
    data.replacements = this.#replacements;
    data.autoLoad = this.#autoLoad;
    data.loadAsync = this.#loadAsync;
    data.cacheInstance = this.#cacheInstance;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {InstancePlaceholder} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#sourcePath = data.sourcePath || '';
    this.#replacements = data.replacements || {};
    this.#autoLoad = data.autoLoad !== undefined ? data.autoLoad : true;
    this.#loadAsync = data.loadAsync || false;
    this.#cacheInstance = data.cacheInstance !== undefined ? data.cacheInstance : true;
    return this;
  }
}

module.exports = InstancePlaceholder;
