/**
 * LXRN ShaderGlobalsOverride Module
 * @namespace LXRN.ShaderGlobalsOverride
 * @author LXRN
 */

const Node = require('./Node.js');

/**
 * Shader globals override for runtime shader customization
 * @class ShaderGlobalsOverride
 * @extends Node
 */
class ShaderGlobalsOverride extends Node {
  #overrides = new Map();
  #enabled = true;
  #priority = 0;
  #fallback = null;
  #shaderTargets = [];
  #globalUniforms = {};
  #uniformTypes = {};
  #uniformDefaults = {};
  #activeOverrides = new Map();
  #overrideStack = [];
  #onApplyCallback = null;
  #onResetCallback = null;
  #persistent = false;
  #animationTime = 0;
  #animatedOverrides = new Map();

  constructor(name = 'ShaderGlobalsOverride') {
    super(name);
  }

  /**
   * Get enabled
   * @returns {boolean}
   */
  get enabled() {
    return this.#enabled;
  }

  /**
   * Set enabled
   * @param {boolean} value - Enabled
   */
  set enabled(value) {
    this.#enabled = value;
    if (value) {
      this.apply();
    } else {
      this.reset();
    }
  }

  /**
   * Get priority
   * @returns {number}
   */
  get priority() {
    return this.#priority;
  }

  /**
   * Set priority
   * @param {number} value - Priority
   */
  set priority(value) {
    this.#priority = value;
  }

  /**
   * Get fallback
   * @returns {ShaderGlobalsOverride|null}
   */
  get fallback() {
    return this.#fallback;
  }

  /**
   * Set fallback
   * @param {ShaderGlobalsOverride} value - Fallback
   */
  set fallback(value) {
    this.#fallback = value;
  }

  /**
   * Set override
   * @param {string} name - Override name
   * @param {*} value - Override value
   * @param {string} type - Uniform type
   * @returns {ShaderGlobalsOverride} This instance
   */
  setOverride(name, value, type = 'float') {
    this.#overrides.set(name, value);
    this.#uniformTypes[name] = type;
    this.emit('changed', name, value);
    if (this.#enabled) {
      this.apply();
    }
    return this;
  }

  /**
   * Set animated override
   * @param {string} name - Override name
   * @param {Object} animation - Animation definition
   * @returns {ShaderGlobalsOverride} This instance
   */
  setAnimatedOverride(name, animation) {
    this.#animatedOverrides.set(name, animation);
    return this;
  }

  /**
   * Get override
   * @param {string} name - Override name
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  getOverride(name, defaultValue = null) {
    if (this.#enabled && this.#overrides.has(name)) {
      return this.#overrides.get(name);
    }
    if (this.#fallback) {
      return this.#fallback.getOverride(name, defaultValue);
    }
    return defaultValue;
  }

  /**
   * Check if override exists
   * @param {string} name - Override name
   * @returns {boolean}
   */
  hasOverride(name) {
    return this.#enabled && this.#overrides.has(name);
  }

  /**
   * Remove override
   * @param {string} name - Override name
   * @returns {boolean}
   */
  removeOverride(name) {
    const removed = this.#overrides.delete(name);
    if (removed) {
      this.emit('removed', name);
      if (this.#enabled) {
        this.apply();
      }
    }
    return removed;
  }

  /**
   * Clear overrides
   * @returns {ShaderGlobalsOverride} This instance
   */
  clearOverrides() {
    this.#overrides.clear();
    this.#animatedOverrides.clear();
    this.emit('cleared');
    if (this.#enabled) {
      this.reset();
    }
    return this;
  }

  /**
   * Get overrides
   * @returns {Object}
   */
  getOverrides() {
    return Object.fromEntries(this.#overrides);
  }

  /**
   * Get override names
   * @returns {Array}
   */
  getOverrideNames() {
    return Array.from(this.#overrides.keys());
  }

  /**
   * Get uniform type
   * @param {string} name - Uniform name
   * @returns {string}
   */
  getUniformType(name) {
    return this.#uniformTypes[name] || 'float';
  }

  /**
   * Set global uniform
   * @param {string} name - Uniform name
   * @param {*} value - Uniform value
   * @param {string} type - Uniform type
   * @returns {ShaderGlobalsOverride} This instance
   */
  setGlobalUniform(name, value, type = 'float') {
    this.#globalUniforms[name] = value;
    this.#uniformTypes[name] = type;
    return this;
  }

  /**
   * Get global uniform
   * @param {string} name - Uniform name
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  getGlobalUniform(name, defaultValue = null) {
    return this.#globalUniforms.hasOwnProperty(name) ? this.#globalUniforms[name] : defaultValue;
  }

  /**
   * Add shader target
   * @param {Object} shader - Shader object
   * @returns {ShaderGlobalsOverride} This instance
   */
  addShaderTarget(shader) {
    if (!this.#shaderTargets.includes(shader)) {
      this.#shaderTargets.push(shader);
    }
    return this;
  }

  /**
   * Remove shader target
   * @param {Object} shader - Shader object
   * @returns {boolean}
   */
  removeShaderTarget(shader) {
    const idx = this.#shaderTargets.indexOf(shader);
    if (idx !== -1) {
      this.#shaderTargets.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Get shader targets
   * @returns {Array}
   */
  getShaderTargets() {
    return [...this.#shaderTargets];
  }

  /**
   * Apply overrides
   * @returns {ShaderGlobalsOverride} This instance
   */
  apply() {
    if (!this.#enabled) return this;
    
    const overrides = this.getOverrides();
    this.#activeOverrides = new Map(Object.entries(overrides));
    
    // Apply to shader targets
    for (const shader of this.#shaderTargets) {
      if (shader.setUniform) {
        for (const [name, value] of Object.entries(overrides)) {
          shader.setUniform(name, value);
        }
      }
    }
    
    // Apply global uniforms
    for (const [name, value] of Object.entries(this.#globalUniforms)) {
      for (const shader of this.#shaderTargets) {
        if (shader.setUniform) {
          shader.setUniform(name, value);
        }
      }
    }
    
    this.emit('applied', overrides);
    if (this.#onApplyCallback) {
      this.#onApplyCallback(overrides);
    }
    
    return this;
  }

  /**
   * Reset overrides
   * @returns {ShaderGlobalsOverride} This instance
   */
  reset() {
    this.#activeOverrides.clear();
    
    // Reset shader targets
    for (const shader of this.#shaderTargets) {
      if (shader.resetUniforms) {
        shader.resetUniforms();
      }
    }
    
    this.emit('reset');
    if (this.#onResetCallback) {
      this.#onResetCallback();
    }
    
    return this;
  }

  /**
   * Enable override
   * @returns {ShaderGlobalsOverride} This instance
   */
  enable() {
    this.#enabled = true;
    this.apply();
    this.emit('enabled');
    return this;
  }

  /**
   * Disable override
   * @returns {ShaderGlobalsOverride} This instance
   */
  disable() {
    this.#enabled = false;
    this.reset();
    this.emit('disabled');
    return this;
  }

  /**
   * Set fallback
   * @param {ShaderGlobalsOverride} fallback - Fallback override
   * @returns {ShaderGlobalsOverride} This instance
   */
  setFallback(fallback) {
    this.#fallback = fallback;
    return this;
  }

  /**
   * Push override state
   * @returns {ShaderGlobalsOverride} This instance
   */
  pushState() {
    this.#overrideStack.push({
      overrides: new Map(this.#overrides),
      enabled: this.#enabled,
      priority: this.#priority,
    });
    return this;
  }

  /**
   * Pop override state
   * @returns {ShaderGlobalsOverride} This instance
   */
  popState() {
    if (this.#overrideStack.length > 0) {
      const state = this.#overrideStack.pop();
      this.#overrides = state.overrides;
      this.#enabled = state.enabled;
      this.#priority = state.priority;
      if (this.#enabled) {
        this.apply();
      }
    }
    return this;
  }

  /**
   * On apply callback
   * @param {Function} callback - Callback
   * @returns {ShaderGlobalsOverride} This instance
   */
  onApply(callback) {
    this.#onApplyCallback = callback;
    return this;
  }

  /**
   * On reset callback
   * @param {Function} callback - Callback
   * @returns {ShaderGlobalsOverride} This instance
   */
  onReset(callback) {
    this.#onResetCallback = callback;
    return this;
  }

  /**
   * Process callback - animate overrides
   * @param {number} delta - Time delta
   */
  process(delta) {
    if (!this.#enabled) return;
    
    this.#animationTime += delta;
    let changed = false;
    
    for (const [name, animation] of this.#animatedOverrides) {
      if (this.#overrides.has(name)) {
        const base = this.#overrides.get(name);
        const value = this.__animateValue(base, animation, this.#animationTime);
        if (value !== undefined) {
          this.#overrides.set(name, value);
          changed = true;
        }
      }
    }
    
    if (changed) {
      this.apply();
    }
  }

  /**
   * Animate value
   * @private
   * @param {*} base - Base value
   * @param {Object} animation - Animation definition
   * @param {number} time - Animation time
   * @returns {*}
   */
  __animateValue(base, animation, time) {
    const type = animation.type || 'sine';
    const speed = animation.speed || 1;
    const amplitude = animation.amplitude || 0.1;
    const phase = animation.phase || 0;
    
    if (typeof base === 'number') {
      let value = base;
      if (type === 'sine') {
        value = base + Math.sin(time * speed + phase) * amplitude;
      } else if (type === 'cosine') {
        value = base + Math.cos(time * speed + phase) * amplitude;
      } else if (type === 'square') {
        value = base + (Math.sin(time * speed + phase) > 0 ? amplitude : -amplitude);
      } else if (type === 'triangle') {
        const t = ((time * speed + phase) % 1) * 2 - 1;
        value = base + Math.abs(t) * amplitude;
      } else if (type === 'sawtooth') {
        const t = ((time * speed + phase) % 1);
        value = base + t * amplitude * 2 - amplitude;
      }
      return value;
    }
    
    if (typeof base === 'object' && base !== null && 'r' in base && 'g' in base && 'b' in base) {
      // Animate color
      const result = { ...base };
      if (type === 'sine') {
        const r = base.r + Math.sin(time * speed + phase) * amplitude;
        const g = base.g + Math.sin(time * speed + phase + 1) * amplitude;
        const b = base.b + Math.sin(time * speed + phase + 2) * amplitude;
        result.r = Math.max(0, Math.min(1, r));
        result.g = Math.max(0, Math.min(1, g));
        result.b = Math.max(0, Math.min(1, b));
      }
      return result;
    }
    
    return base;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.overrides = Object.fromEntries(this.#overrides);
    data.uniformTypes = this.#uniformTypes;
    data.globalUniforms = this.#globalUniforms;
    data.enabled = this.#enabled;
    data.priority = this.#priority;
    data.persistent = this.#persistent;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {ShaderGlobalsOverride} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#overrides = new Map(Object.entries(data.overrides || {}));
    this.#uniformTypes = data.uniformTypes || {};
    this.#globalUniforms = data.globalUniforms || {};
    this.#enabled = data.enabled !== undefined ? data.enabled : true;
    this.#priority = data.priority || 0;
    this.#persistent = data.persistent || false;
    return this;
  }
}

module.exports = ShaderGlobalsOverride;
