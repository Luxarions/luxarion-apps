/**
 * LXRN SceneTreeFTI Module
 * @namespace LXRN.SceneTreeFTI
 * @author LXRN
 */

const SceneTree = require('./SceneTree.js');

/**
 * Scene tree with FTI (Frame Time Interpolation) support
 * @class SceneTreeFTI
 * @extends SceneTree
 */
class SceneTreeFTI extends SceneTree {
  #ftiEnabled = true;
  #ftiMode = 0;
  #ftiMaxFrames = 60;
  #ftiFrameCount = 0;
  #ftiNodes = new Map();
  #ftiUpdates = [];
  #ftiPending = [];
  #ftiThreshold = 16;
  #ftiModeFlags = 0;
  #ftiActive = false;
  #ftiTimer = null;
  #ftiInterpolation = 0;
  #ftiLastFrameTime = 0;
  #ftiDeltaAccumulator = 0;
  #ftiTickCallbacks = [];

  constructor() {
    super();
  }

  /**
   * Get FTI enabled
   * @returns {boolean}
   */
  get ftiEnabled() {
    return this.#ftiEnabled;
  }

  /**
   * Set FTI enabled
   * @param {boolean} value - FTI enabled
   */
  set ftiEnabled(value) {
    this.#ftiEnabled = value;
    if (!value) {
      this.#ftiActive = false;
      if (this.#ftiTimer) {
        clearTimeout(this.#ftiTimer);
        this.#ftiTimer = null;
      }
    }
  }

  /**
   * Get FTI mode
   * @returns {number}
   */
  get ftiMode() {
    return this.#ftiMode;
  }

  /**
   * Set FTI mode
   * @param {number} value - FTI mode
   */
  set ftiMode(value) {
    this.#ftiMode = value;
  }

  /**
   * Get FTI max frames
   * @returns {number}
   */
  get ftiMaxFrames() {
    return this.#ftiMaxFrames;
  }

  /**
   * Set FTI max frames
   * @param {number} value - Max frames
   */
  set ftiMaxFrames(value) {
    this.#ftiMaxFrames = Math.max(1, value);
  }

  /**
   * Get FTI threshold
   * @returns {number}
   */
  get ftiThreshold() {
    return this.#ftiThreshold;
  }

  /**
   * Set FTI threshold
   * @param {number} value - Threshold
   */
  set ftiThreshold(value) {
    this.#ftiThreshold = Math.max(1, value);
  }

  /**
   * Get FTI mode flags
   * @returns {number}
   */
  get ftiModeFlags() {
    return this.#ftiModeFlags;
  }

  /**
   * Set FTI mode flags
   * @param {number} value - Mode flags
   */
  set ftiModeFlags(value) {
    this.#ftiModeFlags = value;
  }

  /**
   * Check if FTI active
   * @returns {boolean}
   */
  isFtiActive() {
    return this.#ftiActive;
  }

  /**
   * Register FTI node
   * @param {Node} node - Node to register
   * @param {Object} data - FTI data
   * @returns {SceneTreeFTI} This instance
   */
  registerFTINode(node, data = {}) {
    this.#ftiNodes.set(node.getInstanceId(), {
      node: node,
      data: data,
      lastUpdate: 0,
      pending: false,
    });
    return this;
  }

  /**
   * Unregister FTI node
   * @param {Node} node - Node to unregister
   * @returns {boolean}
   */
  unregisterFTINode(node) {
    return this.#ftiNodes.delete(node.getInstanceId());
  }

  /**
   * Check if FTI node registered
   * @param {Node} node - Node to check
   * @returns {boolean}
   */
  isFTINodeRegistered(node) {
    return this.#ftiNodes.has(node.getInstanceId());
  }

  /**
   * Get FTI node data
   * @param {Node} node - Node
   * @returns {Object|null}
   */
  getFTINodeData(node) {
    const entry = this.#ftiNodes.get(node.getInstanceId());
    return entry ? entry.data : null;
  }

  /**
   * Set FTI node data
   * @param {Node} node - Node
   * @param {Object} data - FTI data
   * @returns {boolean}
   */
  setFTINodeData(node, data) {
    const entry = this.#ftiNodes.get(node.getInstanceId());
    if (entry) {
      entry.data = data;
      return true;
    }
    return false;
  }

  /**
   * Request FTI update
   * @param {Node} node - Node to update
   * @returns {SceneTreeFTI} This instance
   */
  requestFTIUpdate(node) {
    if (!this.#ftiEnabled) return this;
    const id = node.getInstanceId();
    if (this.#ftiNodes.has(id)) {
      const entry = this.#ftiNodes.get(id);
      if (!entry.pending) {
        entry.pending = true;
        this.#ftiPending.push(id);
      }
    }
    return this;
  }

  /**
   * Process FTI updates
   * @private
   */
  __processFTIUpdates() {
    if (!this.#ftiEnabled || this.#ftiPending.length === 0) return;
    
    this.#ftiActive = true;
    const now = Date.now();
    const maxUpdates = Math.min(this.#ftiPending.length, this.#ftiMaxFrames);
    
    for (let i = 0; i < maxUpdates && i < this.#ftiPending.length; i++) {
      const id = this.#ftiPending.shift();
      const entry = this.#ftiNodes.get(id);
      if (entry) {
        entry.pending = false;
        entry.lastUpdate = now;
        this.#ftiUpdates.push({ node: entry.node, data: entry.data });
      }
    }
    
    for (const update of this.#ftiUpdates) {
      this.emit('ftiUpdate', update.node, update.data);
      for (const callback of this.#ftiTickCallbacks) {
        try {
          callback(update.node, update.data);
        } catch (error) {
          // Ignore
        }
      }
    }
    this.#ftiUpdates = [];
    
    if (this.#ftiPending.length === 0) {
      this.#ftiActive = false;
    }
  }

  /**
   * Process callback
   * @param {number} delta - Time delta
   */
  process(delta) {
    super.process(delta);
    this.#ftiFrameCount++;
    this.#ftiDeltaAccumulator += delta;
    
    // Process FTI updates at threshold
    if (this.#ftiEnabled && this.#ftiFrameCount % this.#ftiThreshold === 0) {
      this.__processFTIUpdates();
    }
  }

  /**
   * Add FTI tick callback
   * @param {Function} callback - Callback
   * @returns {SceneTreeFTI} This instance
   */
  onFTIUpdate(callback) {
    this.#ftiTickCallbacks.push(callback);
    this.connect('ftiUpdate', this, callback);
    return this;
  }

  /**
   * Remove FTI tick callback
   * @param {Function} callback - Callback
   * @returns {boolean}
   */
  removeFTIUpdate(callback) {
    const idx = this.#ftiTickCallbacks.indexOf(callback);
    if (idx !== -1) {
      this.#ftiTickCallbacks.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.ftiEnabled = this.#ftiEnabled;
    data.ftiMode = this.#ftiMode;
    data.ftiMaxFrames = this.#ftiMaxFrames;
    data.ftiThreshold = this.#ftiThreshold;
    data.ftiModeFlags = this.#ftiModeFlags;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {SceneTreeFTI} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#ftiEnabled = data.ftiEnabled !== undefined ? data.ftiEnabled : true;
    this.#ftiMode = data.ftiMode || 0;
    this.#ftiMaxFrames = data.ftiMaxFrames || 60;
    this.#ftiThreshold = data.ftiThreshold || 16;
    this.#ftiModeFlags = data.ftiModeFlags || 0;
    return this;
  }
}

module.exports = SceneTreeFTI;
