/**
 * LXRN MissingResource Module
 * @namespace LXRN.MissingResource
 * @author LXRN
 */

const Resource = require('../resource/Resource.js');

/**
 * Missing resource for handling missing resources
 * @class MissingResource
 * @extends Resource
 */
class MissingResource extends Resource {
  constructor(originalPath = '', originalType = '') {
    super();
    this._type = 'MissingResource';
    this._originalPath = originalPath;
    this._originalType = originalType;
    this._error = '';
    this._canRecover = false;
    this._recoveryData = null;
    this._fallbackResource = null;
    this._recoveryAttempts = 0;
    this._maxRecoveryAttempts = 3;
  }

  /**
   * Get original path
   * @returns {string}
   */
  get originalPath() {
    return this._originalPath;
  }

  /**
   * Set original path
   * @param {string} value - Original path
   */
  set originalPath(value) {
    this._originalPath = value;
  }

  /**
   * Get original type
   * @returns {string}
   */
  get originalType() {
    return this._originalType;
  }

  /**
   * Set original type
   * @param {string} value - Original type
   */
  set originalType(value) {
    this._originalType = value;
  }

  /**
   * Get error
   * @returns {string}
   */
  get error() {
    return this._error;
  }

  /**
   * Set error
   * @param {string} value - Error
   */
  set error(value) {
    this._error = value;
  }

  /**
   * Check if can recover
   * @returns {boolean}
   */
  canRecover() {
    return this._canRecover;
  }

  /**
   * Get recovery data
   * @returns {Object|null}
   */
  get recoveryData() {
    return this._recoveryData;
  }

  /**
   * Set recovery data
   * @param {Object} value - Recovery data
   */
  set recoveryData(value) {
    this._recoveryData = value;
    this._canRecover = true;
  }

  /**
   * Set fallback resource
   * @param {Resource} resource - Fallback resource
   * @returns {MissingResource} This instance
   */
  setFallback(resource) {
    this._fallbackResource = resource;
    return this;
  }

  /**
   * Get fallback resource
   * @returns {Resource|null}
   */
  getFallback() {
    return this._fallbackResource;
  }

  /**
   * Attempt recovery
   * @param {Function} loader - Loader function
   * @returns {Promise<Resource>}
   */
  async recover(loader = null) {
    if (this._recoveryAttempts >= this._maxRecoveryAttempts) {
      throw new Error('Max recovery attempts exceeded');
    }
    
    this._recoveryAttempts++;
    
    if (loader && this._originalPath) {
      try {
        const resource = await loader(this._originalPath);
        this._canRecover = true;
        this.emit('recovered', resource);
        return resource;
      } catch (error) {
        this._error = error.message;
        this._canRecover = false;
        throw error;
      }
    }
    
    if (this._fallbackResource) {
      this._canRecover = true;
      this.emit('recovered', this._fallbackResource);
      return this._fallbackResource;
    }
    
    throw new Error('No recovery method available');
  }

  /**
   * Check if recovered
   * @returns {boolean}
   */
  isRecovered() {
    return this._canRecover;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.originalPath = this._originalPath;
    data.originalType = this._originalType;
    data.error = this._error;
    data.recoveryData = this._recoveryData;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {MissingResource} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this._originalPath = data.originalPath || '';
    this._originalType = data.originalType || '';
    this._error = data.error || '';
    this._recoveryData = data.recoveryData || null;
    this._canRecover = !!this._recoveryData;
    return this;
  }
}

module.exports = MissingResource;
