/**
 * LXRN CanvasLayer Module
 * @namespace LXRN.CanvasLayer
 * @author LXRN
 */

const CanvasItem = require('./CanvasItem.js');

/**
 * Canvas layer for 2D rendering layers
 * @class CanvasLayer
 * @extends CanvasItem
 */
class CanvasLayer extends CanvasItem {
  #layer = 0;
  #offset = { x: 0, y: 0 };
  #layerScale = { x: 1, y: 1 };
  #layerRotation = 0;
  #transform = null;
  #items = [];
  #followViewport = false;
  #viewportRect = null;
  #customViewport = null;
  #scaleMode = 0; // 0 = none, 1 = 2d, 2 = viewport
  #stretchMode = 0; // 0 = disabled, 1 = 2d, 2 = viewport

  constructor(name = 'CanvasLayer') {
    super(name);
  }

  /**
   * Get layer
   * @returns {number}
   */
  get layer() {
    return this.#layer;
  }

  /**
   * Set layer
   * @param {number} value - Layer
   */
  set layer(value) {
    this.#layer = value;
  }

  /**
   * Get offset
   * @returns {Object}
   */
  get offset() {
    return this.#offset;
  }

  /**
   * Set offset
   * @param {Object} value - Offset
   */
  set offset(value) {
    this.#offset = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get layer scale
   * @returns {Object}
   */
  get layerScale() {
    return this.#layerScale;
  }

  /**
   * Set layer scale
   * @param {Object} value - Layer scale
   */
  set layerScale(value) {
    this.#layerScale = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get layer rotation
   * @returns {number}
   */
  get layerRotation() {
    return this.#layerRotation;
  }

  /**
   * Set layer rotation
   * @param {number} value - Layer rotation
   */
  set layerRotation(value) {
    this.#layerRotation = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get follow viewport
   * @returns {boolean}
   */
  get followViewport() {
    return this.#followViewport;
  }

  /**
   * Set follow viewport
   * @param {boolean} value - Follow viewport
   */
  set followViewport(value) {
    this.#followViewport = value;
    this.update();
  }

  /**
   * Get scale mode
   * @returns {number}
   */
  get scaleMode() {
    return this.#scaleMode;
  }

  /**
   * Set scale mode
   * @param {number} value - Scale mode
   */
  set scaleMode(value) {
    this.#scaleMode = value;
    this.update();
  }

  /**
   * Get stretch mode
   * @returns {number}
   */
  get stretchMode() {
    return this.#stretchMode;
  }

  /**
   * Set stretch mode
   * @param {number} value - Stretch mode
   */
  set stretchMode(value) {
    this.#stretchMode = value;
    this.update();
  }

  /**
   * Add item to layer
   * @param {CanvasItem} item - Item to add
   * @returns {CanvasLayer} This instance
   */
  addItem(item) {
    this.#items.push(item);
    this.addChild(item);
    return this;
  }

  /**
   * Remove item from layer
   * @param {CanvasItem} item - Item to remove
   * @returns {CanvasLayer} This instance
   */
  removeItem(item) {
    const idx = this.#items.indexOf(item);
    if (idx !== -1) {
      this.#items.splice(idx, 1);
      this.removeChild(item);
    }
    return this;
  }

  /**
   * Get items
   * @returns {Array}
   */
  getItems() {
    return [...this.#items];
  }

  /**
   * Clear layer
   * @returns {CanvasLayer} This instance
   */
  clear() {
    for (const item of this.#items) {
      this.removeChild(item);
    }
    this.#items = [];
    return this;
  }

  /**
   * Set custom viewport
   * @param {Object} viewport - Viewport
   * @returns {CanvasLayer} This instance
   */
  setCustomViewport(viewport) {
    this.#customViewport = viewport;
    return this;
  }

  /**
   * Get custom viewport
   * @returns {Object|null}
   */
  getCustomViewport() {
    return this.#customViewport;
  }

  /**
   * Internal draw
   * @private
   * @param {Object} canvas - Canvas context
   */
  __draw(canvas) {
    const ctx = canvas;
    
    // Save context
    ctx.save();
    
    // Apply layer transform
    const cos = Math.cos(this.#layerRotation);
    const sin = Math.sin(this.#layerRotation);
    ctx.translate(this.#offset.x, this.#offset.y);
    ctx.scale(this.#layerScale.x, this.#layerScale.y);
    ctx.rotate(this.#layerRotation);
    
    // Draw layer items
    for (const item of this.#items) {
      if (item.isVisible()) {
        ctx.save();
        item.draw(canvas);
        ctx.restore();
      }
    }
    
    // Restore context
    ctx.restore();
  }

  /**
   * Get global transform
   * @returns {Object}
   */
  getGlobalTransform() {
    const cos = Math.cos(this.#layerRotation);
    const sin = Math.sin(this.#layerRotation);
    return {
      x: this.#offset.x,
      y: this.#offset.y,
      scaleX: this.#layerScale.x * cos,
      scaleY: this.#layerScale.y * sin,
      rotation: this.#layerRotation,
    };
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.layer = this.#layer;
    data.offset = this.#offset;
    data.layerScale = this.#layerScale;
    data.layerRotation = this.#layerRotation;
    data.followViewport = this.#followViewport;
    data.scaleMode = this.#scaleMode;
    data.stretchMode = this.#stretchMode;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {CanvasLayer} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#layer = data.layer || 0;
    this.#offset = data.offset || { x: 0, y: 0 };
    this.#layerScale = data.layerScale || { x: 1, y: 1 };
    this.#layerRotation = data.layerRotation || 0;
    this.#followViewport = data.followViewport || false;
    this.#scaleMode = data.scaleMode || 0;
    this.#stretchMode = data.stretchMode || 0;
    return this;
  }
}

module.exports = CanvasLayer;
