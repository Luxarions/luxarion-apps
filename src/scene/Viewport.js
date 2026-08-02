/**
 * LXRN Viewport Module
 * @namespace LXRN.Viewport
 * @author LXRN
 */

const CanvasItem = require('./CanvasItem.js');

/**
 * Viewport for rendering
 * @class Viewport
 * @extends CanvasItem
 */
class Viewport extends CanvasItem {
  #size = { width: 640, height: 480 };
  #world = null;
  #camera = null;
  #renderTarget = null;
  #clearColor = { r: 0, g: 0, b: 0, a: 1 };
  #updateMode = 0;
  #vSync = true;
  #transparentBg = false;
  #handleInputLocally = true;
  #guiDisableInput = false;
  #guiSnapControls = false;
  #physicsObjectPicking = false;
  #shadowAtlasSize = 0;
  #shadowAtlasQuadrants = 0;
  #renderDirectToScreen = false;
  #canvasTransform = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  #globalCanvasTransform = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  #viewScale = { x: 1, y: 1 };
  #viewOffset = { x: 0, y: 0 };
  #limitSnap = false;
  #limitSnap2D = false;
  #snapControls = false;
  #snapControls2D = false;
  #renderTargetTexture = null;
  #rendering = false;
  #frameCount = 0;
  #lastRenderTime = 0;
  #renderQueue = [];
  #postProcessEffects = [];
  #shaderEffect = null;

  constructor(name = 'Viewport') {
    super(name);
  }

  /**
   * Get size
   * @returns {Object}
   */
  get size() {
    return this.#size;
  }

  /**
   * Set size
   * @param {Object} value - Size
   */
  set size(value) {
    this.#size = value;
    this.update();
  }

  /**
   * Get width
   * @returns {number}
   */
  get width() {
    return this.#size.width;
  }

  /**
   * Set width
   * @param {number} value - Width
   */
  set width(value) {
    this.#size.width = value;
    this.update();
  }

  /**
   * Get height
   * @returns {number}
   */
  get height() {
    return this.#size.height;
  }

  /**
   * Set height
   * @param {number} value - Height
   */
  set height(value) {
    this.#size.height = value;
    this.update();
  }

  /**
   * Get world
   * @returns {Object|null}
   */
  get world() {
    return this.#world;
  }

  /**
   * Set world
   * @param {Object} value - World
   */
  set world(value) {
    this.#world = value;
  }

  /**
   * Get camera
   * @returns {Object|null}
   */
  get camera() {
    return this.#camera;
  }

  /**
   * Set camera
   * @param {Object} value - Camera
   */
  set camera(value) {
    this.#camera = value;
    if (value) {
      value._viewport = this;
    }
  }

  /**
   * Get render target
   * @returns {Object|null}
   */
  get renderTarget() {
    return this.#renderTarget;
  }

  /**
   * Set render target
   * @param {Object} value - Render target
   */
  set renderTarget(value) {
    this.#renderTarget = value;
    this.update();
  }

  /**
   * Get clear color
   * @returns {Object}
   */
  get clearColor() {
    return this.#clearColor;
  }

  /**
   * Set clear color
   * @param {Object} value - Clear color
   */
  set clearColor(value) {
    this.#clearColor = value;
  }

  /**
   * Get update mode
   * @returns {number}
   */
  get updateMode() {
    return this.#updateMode;
  }

  /**
   * Set update mode
   * @param {number} value - Update mode
   */
  set updateMode(value) {
    this.#updateMode = value;
  }

  /**
   * Get VSync
   * @returns {boolean}
   */
  get vSync() {
    return this.#vSync;
  }

  /**
   * Set VSync
   * @param {boolean} value - VSync
   */
  set vSync(value) {
    this.#vSync = value;
  }

  /**
   * Get transparent background
   * @returns {boolean}
   */
  get transparentBg() {
    return this.#transparentBg;
  }

  /**
   * Set transparent background
   * @param {boolean} value - Transparent background
   */
  set transparentBg(value) {
    this.#transparentBg = value;
  }

  /**
   * Get handle input locally
   * @returns {boolean}
   */
  get handleInputLocally() {
    return this.#handleInputLocally;
  }

  /**
   * Set handle input locally
   * @param {boolean} value - Handle input locally
   */
  set handleInputLocally(value) {
    this.#handleInputLocally = value;
  }

  /**
   * Get GUI disable input
   * @returns {boolean}
   */
  get guiDisableInput() {
    return this.#guiDisableInput;
  }

  /**
   * Set GUI disable input
   * @param {boolean} value - GUI disable input
   */
  set guiDisableInput(value) {
    this.#guiDisableInput = value;
  }

  /**
   * Get GUI snap controls
   * @returns {boolean}
   */
  get guiSnapControls() {
    return this.#guiSnapControls;
  }

  /**
   * Set GUI snap controls
   * @param {boolean} value - GUI snap controls
   */
  set guiSnapControls(value) {
    this.#guiSnapControls = value;
  }

  /**
   * Get physics object picking
   * @returns {boolean}
   */
  get physicsObjectPicking() {
    return this.#physicsObjectPicking;
  }

  /**
   * Set physics object picking
   * @param {boolean} value - Physics object picking
   */
  set physicsObjectPicking(value) {
    this.#physicsObjectPicking = value;
  }

  /**
   * Get shadow atlas size
   * @returns {number}
   */
  get shadowAtlasSize() {
    return this.#shadowAtlasSize;
  }

  /**
   * Set shadow atlas size
   * @param {number} value - Shadow atlas size
   */
  set shadowAtlasSize(value) {
    this.#shadowAtlasSize = value;
  }

  /**
   * Get shadow atlas quadrants
   * @returns {number}
   */
  get shadowAtlasQuadrants() {
    return this.#shadowAtlasQuadrants;
  }

  /**
   * Set shadow atlas quadrants
   * @param {number} value - Shadow atlas quadrants
   */
  set shadowAtlasQuadrants(value) {
    this.#shadowAtlasQuadrants = value;
  }

  /**
   * Get render direct to screen
   * @returns {boolean}
   */
  get renderDirectToScreen() {
    return this.#renderDirectToScreen;
  }

  /**
   * Set render direct to screen
   * @param {boolean} value - Render direct to screen
   */
  set renderDirectToScreen(value) {
    this.#renderDirectToScreen = value;
  }

  /**
   * Get view scale
   * @returns {Object}
   */
  get viewScale() {
    return this.#viewScale;
  }

  /**
   * Set view scale
   * @param {Object} value - View scale
   */
  set viewScale(value) {
    this.#viewScale = value;
    this.update();
  }

  /**
   * Get view offset
   * @returns {Object}
   */
  get viewOffset() {
    return this.#viewOffset;
  }

  /**
   * Set view offset
   * @param {Object} value - View offset
   */
  set viewOffset(value) {
    this.#viewOffset = value;
    this.update();
  }

  /**
   * Set size
   * @param {number} width - Width
   * @param {number} height - Height
   * @returns {Viewport} This instance
   */
  setSize(width, height) {
    this.#size = { width, height };
    this.update();
    return this;
  }

  /**
   * Get visible rectangle
   * @returns {Object}
   */
  getVisibleRect() {
    return {
      x: 0,
      y: 0,
      width: this.#size.width,
      height: this.#size.height,
    };
  }

  /**
   * Get mouse position
   * @returns {Object}
   */
  getMousePosition() {
    // In Node.js environment, return default
    return { x: 0, y: 0 };
  }

  /**
   * Get final transform
   * @returns {Object}
   */
  getFinalTransform() {
    return this.#canvasTransform;
  }

  /**
   * Render viewport
   * @returns {Viewport} This instance
   */
  render() {
    this.update();
    this.#rendering = true;
    this.#frameCount++;
    this.#lastRenderTime = Date.now();
    
    // Clear render queue
    this.#renderQueue = [];
    
    // Process camera
    if (this.#camera) {
      this.#camera.update();
    }
    
    this.#rendering = false;
    return this;
  }

  /**
   * Set clear color
   * @param {Object} color - Clear color
   * @returns {Viewport} This instance
   */
  setClearColor(color) {
    this.#clearColor = color;
    return this;
  }

  /**
   * Attach camera
   * @param {Object} camera - Camera to attach
   * @returns {Viewport} This instance
   */
  attachCamera(camera) {
    this.#camera = camera;
    if (camera) {
      camera._viewport = this;
    }
    return this;
  }

  /**
   * Detach camera
   * @returns {Viewport} This instance
   */
  detachCamera() {
    if (this.#camera) {
      this.#camera._viewport = null;
      this.#camera = null;
    }
    return this;
  }

  /**
   * Get texture
   * @returns {Object|null}
   */
  getTexture() {
    return this.#renderTarget || null;
  }

  /**
   * Get screen rectangle
   * @returns {Object}
   */
  getScreenRect() {
    return {
      x: 0,
      y: 0,
      width: this.#size.width,
      height: this.#size.height,
    };
  }

  /**
   * Add post-process effect
   * @param {Object} effect - Effect object
   * @returns {Viewport} This instance
   */
  addPostProcessEffect(effect) {
    this.#postProcessEffects.push(effect);
    return this;
  }

  /**
   * Remove post-process effect
   * @param {Object} effect - Effect object
   * @returns {Viewport} This instance
   */
  removePostProcessEffect(effect) {
    const idx = this.#postProcessEffects.indexOf(effect);
    if (idx !== -1) {
      this.#postProcessEffects.splice(idx, 1);
    }
    return this;
  }

  /**
   * Get post-process effects
   * @returns {Array}
   */
  getPostProcessEffects() {
    return [...this.#postProcessEffects];
  }

  /**
   * Set shader effect
   * @param {Object} shader - Shader object
   * @returns {Viewport} This instance
   */
  setShaderEffect(shader) {
    this.#shaderEffect = shader;
    return this;
  }

  /**
   * Get shader effect
   * @returns {Object|null}
   */
  getShaderEffect() {
    return this.#shaderEffect;
  }

  /**
   * Internal draw
   * @private
   * @param {Object} canvas - Canvas context
   */
  __draw(canvas) {
    const ctx = canvas;
    
    // Clear viewport
    if (this.#clearColor.a > 0 && !this.#transparentBg) {
      ctx.fillStyle = `rgba(${this.#clearColor.r * 255}, ${this.#clearColor.g * 255}, ${this.#clearColor.b * 255}, ${this.#clearColor.a})`;
      ctx.fillRect(0, 0, this.#size.width, this.#size.height);
    }
    
    // Apply view transform
    ctx.save();
    ctx.translate(this.#viewOffset.x, this.#viewOffset.y);
    ctx.scale(this.#viewScale.x, this.#viewScale.y);
    
    // Draw children
    for (const child of this.#children) {
      if (child.isVisible()) {
        ctx.save();
        child.draw(canvas);
        ctx.restore();
      }
    }
    
    ctx.restore();
    
    // Apply post-process effects
    for (const effect of this.#postProcessEffects) {
      if (effect.process) {
        effect.process(canvas, this.#size);
      }
    }
    
    // Apply shader effect
    if (this.#shaderEffect && this.#shaderEffect.process) {
      this.#shaderEffect.process(canvas, this.#size);
    }
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.size = this.#size;
    data.clearColor = this.#clearColor;
    data.updateMode = this.#updateMode;
    data.vSync = this.#vSync;
    data.transparentBg = this.#transparentBg;
    data.handleInputLocally = this.#handleInputLocally;
    data.guiDisableInput = this.#guiDisableInput;
    data.guiSnapControls = this.#guiSnapControls;
    data.physicsObjectPicking = this.#physicsObjectPicking;
    data.shadowAtlasSize = this.#shadowAtlasSize;
    data.shadowAtlasQuadrants = this.#shadowAtlasQuadrants;
    data.renderDirectToScreen = this.#renderDirectToScreen;
    data.viewScale = this.#viewScale;
    data.viewOffset = this.#viewOffset;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {Viewport} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#size = data.size || { width: 640, height: 480 };
    this.#clearColor = data.clearColor || { r: 0, g: 0, b: 0, a: 1 };
    this.#updateMode = data.updateMode || 0;
    this.#vSync = data.vSync !== undefined ? data.vSync : true;
    this.#transparentBg = data.transparentBg || false;
    this.#handleInputLocally = data.handleInputLocally !== undefined ? data.handleInputLocally : true;
    this.#guiDisableInput = data.guiDisableInput || false;
    this.#guiSnapControls = data.guiSnapControls || false;
    this.#physicsObjectPicking = data.physicsObjectPicking || false;
    this.#shadowAtlasSize = data.shadowAtlasSize || 0;
    this.#shadowAtlasQuadrants = data.shadowAtlasQuadrants || 0;
    this.#renderDirectToScreen = data.renderDirectToScreen || false;
    this.#viewScale = data.viewScale || { x: 1, y: 1 };
    this.#viewOffset = data.viewOffset || { x: 0, y: 0 };
    return this;
  }
}

module.exports = Viewport;
