/**
 * LXRN MissingNode Module
 * @namespace LXRN.MissingNode
 * @author LXRN
 */

const Node = require('./Node.js');

/**
 * Missing node for handling missing classes
 * @class MissingNode
 * @extends Node
 */
class MissingNode extends Node {
  #originalClass = '';
  #originalPath = '';
  #error = '';
  #properties = {};
  #restoreData = null;
  #canRestore = false;
  #restoredNode = null;
  #restoreAttempts = 0;
  #maxRestoreAttempts = 3;
  #fallbackNode = null;
  #recoveryMode = 'auto'; // 'auto', 'manual', 'fallback'
  #recoveryCallbacks = [];

  constructor(name = 'MissingNode') {
    super(name);
  }

  /**
   * Get original class
   * @returns {string}
   */
  get originalClass() {
    return this.#originalClass;
  }

  /**
   * Set original class
   * @param {string} value - Original class
   */
  set originalClass(value) {
    this.#originalClass = value;
  }

  /**
   * Get original path
   * @returns {string}
   */
  get originalPath() {
    return this.#originalPath;
  }

  /**
   * Set original path
   * @param {string} value - Original path
   */
  set originalPath(value) {
    this.#originalPath = value;
  }

  /**
   * Get error
   * @returns {string}
   */
  get error() {
    return this.#error;
  }

  /**
   * Set error
   * @param {string} value - Error
   */
  set error(value) {
    this.#error = value;
  }

  /**
   * Get properties
   * @returns {Object}
   */
  get properties() {
    return this.#properties;
  }

  /**
   * Set properties
   * @param {Object} value - Properties
   */
  set properties(value) {
    this.#properties = value;
  }

  /**
   * Get restore data
   * @returns {Object|null}
   */
  get restoreData() {
    return this.#restoreData;
  }

  /**
   * Set restore data
   * @param {Object} value - Restore data
   */
  set restoreData(value) {
    this.#restoreData = value;
  }

  /**
   * Get recovery mode
   * @returns {string}
   */
  get recoveryMode() {
    return this.#recoveryMode;
  }

  /**
   * Set recovery mode
   * @param {string} value - Recovery mode
   */
  set recoveryMode(value) {
    const valid = ['auto', 'manual', 'fallback'];
    if (!valid.includes(value)) {
      throw new Error(`Invalid recovery mode: ${value}`);
    }
    this.#recoveryMode = value;
  }

  /**
   * Set property
   * @param {string} name - Property name
   * @param {*} value - Property value
   * @returns {MissingNode} This instance
   */
  setProperty(name, value) {
    this.#properties[name] = value;
    return this;
  }

  /**
   * Get property
   * @param {string} name - Property name
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  getProperty(name, defaultValue = null) {
    return this.#properties.hasOwnProperty(name) ? this.#properties[name] : defaultValue;
  }

  /**
   * Check if property exists
   * @param {string} name - Property name
   * @returns {boolean}
   */
  hasProperty(name) {
    return this.#properties.hasOwnProperty(name);
  }

  /**
   * Remove property
   * @param {string} name - Property name
   * @returns {boolean}
   */
  removeProperty(name) {
    return delete this.#properties[name];
  }

  /**
   * Get property names
   * @returns {Array}
   */
  getPropertyNames() {
    return Object.keys(this.#properties);
  }

  /**
   * Check if can restore
   * @returns {boolean}
   */
  canRestore() {
    return this.#canRestore;
  }

  /**
   * Restore original node
   * @param {Function} classLoader - Class loader function
   * @returns {Node|null}
   */
  restore(classLoader = null) {
    if (this.#restoredNode) {
      return this.#restoredNode;
    }
    
    this.#restoreAttempts++;
    
    try {
      let node = null;
      
      // Try to create original class
      if (classLoader) {
        const OriginalClass = classLoader(this.#originalClass);
        if (OriginalClass) {
          node = new OriginalClass();
        }
      } else {
        // Try to use global scope
        const globalObj = global || window;
        const OriginalClass = globalObj[this.#originalClass];
        if (OriginalClass && typeof OriginalClass === 'function') {
          node = new OriginalClass();
        }
      }
      
      if (node) {
        // Apply properties
        for (const [key, value] of Object.entries(this.#properties)) {
          if (node[key] !== undefined) {
            node[key] = value;
          }
        }
        node._name = this._name;
        node._position = { ...this._position };
        node._rotation = this._rotation;
        node._scale = { ...this._scale };
        node._visible = this._visible;
        node._modulate = { ...this._modulate };
        node._selfModulate = { ...this._selfModulate };
        
        // Replace this node
        if (this.#parent) {
          this.#parent.addChild(node);
          this.#parent.removeChild(this);
        }
        
        this.#restoredNode = node;
        this.#canRestore = true;
        this.emit('restored', node);
        
        for (const callback of this.#recoveryCallbacks) {
          try {
            callback(node);
          } catch (error) {
            // Ignore
          }
        }
        
        return node;
      }
      
      // Check if should use fallback
      if (this.#recoveryMode === 'fallback' && this.#fallbackNode) {
        if (this.#parent) {
          this.#parent.addChild(this.#fallbackNode);
          this.#parent.removeChild(this);
        }
        this.#restoredNode = this.#fallbackNode;
        this.#canRestore = true;
        return this.#fallbackNode;
      }
      
      throw new Error(`Cannot restore missing node: ${this.#originalClass}`);
    } catch (error) {
      this.#error = error.message;
      this.#canRestore = false;
      
      if (this.#restoreAttempts < this.#maxRestoreAttempts) {
        // Retry
        return this.restore(classLoader);
      }
      
      this.emit('restoreFailed', error);
      return null;
    }
  }

  /**
   * Set fallback node
   * @param {Node} node - Fallback node
   * @returns {MissingNode} This instance
   */
  setFallback(node) {
    this.#fallbackNode = node;
    return this;
  }

  /**
   * Get fallback node
   * @returns {Node|null}
   */
  getFallback() {
    return this.#fallbackNode;
  }

  /**
   * On restore callback
   * @param {Function} callback - Callback
   * @returns {MissingNode} This instance
   */
  onRestore(callback) {
    this.#recoveryCallbacks.push(callback);
    return this;
  }

  /**
   * Check if restored
   * @returns {boolean}
   */
  isRestored() {
    return this.#restoredNode !== null;
  }

  /**
   * Get restored node
   * @returns {Node|null}
   */
  getRestoredNode() {
    return this.#restoredNode;
  }

  /**
   * Process callback - logs warning
   * @param {number} delta - Time delta
   */
  process(delta) {
    // Missing node doesn't process
    if (this.#restoredNode) {
      this.#restoredNode.process(delta);
    }
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.originalClass = this.#originalClass;
    data.originalPath = this.#originalPath;
    data.error = this.#error;
    data.properties = this.#properties;
    data.restoreData = this.#restoreData;
    data.recoveryMode = this.#recoveryMode;
    data.maxRestoreAttempts = this.#maxRestoreAttempts;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {MissingNode} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#originalClass = data.originalClass || '';
    this.#originalPath = data.originalPath || '';
    this.#error = data.error || '';
    this.#properties = data.properties || {};
    this.#restoreData = data.restoreData || null;
    this.#recoveryMode = data.recoveryMode || 'auto';
    this.#maxRestoreAttempts = data.maxRestoreAttempts || 3;
    return this;
  }
}

module.exports = MissingNode;
