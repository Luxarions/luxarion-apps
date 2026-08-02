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
  #originalPath = '';
  #originalType = '';
  #error = '';
  #canRecover = false;
  #recoveryData = null;
  #fallbackResource = null;
  #recoveryAttempts = 0;
  #maxRecoveryAttempts = 3;

  constructor(originalPath = '', originalType = '') {
    super();
    this._type = 'MissingResource';
    this.#originalPath = originalPath;
    this.#originalType = originalType;
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
   * Get original type
   * @returns {string}
   */
  get originalType() {
    return this.#originalType;
  }

  /**
   * Set original type
   * @param {string} value - Original type
   */
  set originalType(value) {
    this.#originalType = value;
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
   * Check if can recover
   * @returns {boolean}
   */
  canRecover() {
    return this.#canRecover;
  }

  /**
   * Get recovery data
   * @returns {Object|null}
   */
  get recoveryData() {
    return this.#recoveryData;
  }

  /**
   * Set recovery data
   * @param {Object} value - Recovery data
   */
  set recoveryData(value) {
    this.#recoveryData = value;
    this.#canRecover = true;
  }

  /**
   * Set fallback resource
   * @param {Resource} resource - Fallback resource
   * @returns {MissingResource} This instance
   */
  setFallback(resource) {
    this.#fallbackResource = resource;
    return this;
  }

  /**
   * Get fallback resource
   * @returns {Resource|null}
   */
  getFallback() {
    return this.#fallbackResource;
  }

  /**
   * Attempt recovery
   * @param {Function} loader - Loader function
   * @returns {Promise<Resource>}
   */
  async recover(loader = null) {
    if (this.#recoveryAttempts >= this.#maxRecoveryAttempts) {
      throw new Error('Max recovery attempts exceeded');
    }
    
    this.#recoveryAttempts++;
    
    if (loader && this.#originalPath) {
      try {
        const resource = await loader(this.#originalPath);
        this.#canRecover = true;
        this.emit('recovered', resource);
        return resource;
      } catch (error) {
        this.#error = error.message;
        this.#canRecover = false;
        throw error;
      }
    }
    
    if (this.#fallbackResource) {
      this.#canRecover = true;
      this.emit('recovered', this.#fallbackResource);
      return this.#fallbackResource;
    }
    
    throw new Error('No recovery method available');
  }

  /**
   * Check if recovered
   * @returns {boolean}
   */
  isRecovered() {
    return this.#canRecover;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.originalPath = this.#originalPath;
    data.originalType = this.#originalType;
    data.error = this.#error;
    data.recoveryData = this.#recoveryData;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {MissingResource} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#originalPath = data.originalPath || '';
    this.#originalType = data.originalType || '';
    this.#error = data.error || '';
    this.#recoveryData = data.recoveryData || null;
    this.#canRecover = !!this.#recoveryData;
    return this;
  }
}

module.exports = MissingResource;
