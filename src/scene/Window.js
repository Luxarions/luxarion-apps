/**
 * LXRN Window Module
 * @namespace LXRN.Window
 * @author LXRN
 */

const Viewport = require('./Viewport.js');

/**
 * Window for application display
 * @class Window
 * @extends Viewport
 */
class Window extends Viewport {
  #title = 'LXRN Window';
  #position = { x: 0, y: 0 };
  #size = { width: 640, height: 480 };
  #minSize = { width: 0, height: 0 };
  #maxSize = { width: 0, height: 0 };
  #resizable = true;
  #borderless = false;
  #fullscreen = false;
  #maximized = false;
  #minimized = false;
  #alwaysOnTop = false;
  #transparent = false;
  #perPixelTransparency = false;
  #modal = false;
  #exclusive = false;
  #mousePassthrough = false;
  #wrapControls = false;
  #focusStealing = true;
  #unfocusWhenMinimized = true;
  #flags = 0;
  #mode = 0;
  #guiEmbedding = false;
  #canvasItem = null;
  #nativeHandle = null;
  #eventCallbacks = {};
  #windowId = null;
  #screen = 0;
  #dpi = 96;
  #scale = 1;
  #hasFocus = false;
  #visible = true;
  #closed = false;
  #onCloseCallback = null;
  #onResizeCallback = null;
  #onMoveCallback = null;
  #onFocusCallback = null;
  #onBlurCallback = null;
  #keyboardModifiers = {
    shift: false,
    control: false,
    alt: false,
    meta: false,
  };
  #mouseButtons = {};
  #mousePosition = { x: 0, y: 0 };

  constructor(name = 'Window') {
    super(name);
  }

  /**
   * Get title
   * @returns {string}
   */
  get title() {
    return this.#title;
  }

  /**
   * Set title
   * @param {string} value - Title
   */
  set title(value) {
    this.#title = value;
    this.emitEvent('titleChanged', value);
  }

  /**
   * Get window position
   * @returns {Object}
   */
  get windowPosition() {
    return this.#position;
  }

  /**
   * Set window position
   * @param {Object} value - Window position
   */
  set windowPosition(value) {
    this.#position = value;
    this.emitEvent('moved', value.x, value.y);
  }

  /**
   * Get window size
   * @returns {Object}
   */
  get windowSize() {
    return this.#size;
  }

  /**
   * Set window size
   * @param {Object} value - Window size
   */
  set windowSize(value) {
    this.#size = value;
    this.emitEvent('resized', value.width, value.height);
  }

  /**
   * Get min size
   * @returns {Object}
   */
  get minSize() {
    return this.#minSize;
  }

  /**
   * Set min size
   * @param {Object} value - Min size
   */
  set minSize(value) {
    this.#minSize = value;
  }

  /**
   * Get max size
   * @returns {Object}
   */
  get maxSize() {
    return this.#maxSize;
  }

  /**
   * Set max size
   * @param {Object} value - Max size
   */
  set maxSize(value) {
    this.#maxSize = value;
  }

  /**
   * Get resizable
   * @returns {boolean}
   */
  get resizable() {
    return this.#resizable;
  }

  /**
   * Set resizable
   * @param {boolean} value - Resizable
   */
  set resizable(value) {
    this.#resizable = value;
  }

  /**
   * Get borderless
   * @returns {boolean}
   */
  get borderless() {
    return this.#borderless;
  }

  /**
   * Set borderless
   * @param {boolean} value - Borderless
   */
  set borderless(value) {
    this.#borderless = value;
  }

  /**
   * Get fullscreen
   * @returns {boolean}
   */
  get fullscreen() {
    return this.#fullscreen;
  }

  /**
   * Set fullscreen
   * @param {boolean} value - Fullscreen
   */
  set fullscreen(value) {
    this.#fullscreen = value;
    this.emitEvent('fullscreen', value);
  }

  /**
   * Get maximized
   * @returns {boolean}
   */
  get maximized() {
    return this.#maximized;
  }

  /**
   * Set maximized
   * @param {boolean} value - Maximized
   */
  set maximized(value) {
    this.#maximized = value;
    this.emitEvent('maximized', value);
  }

  /**
   * Get minimized
   * @returns {boolean}
   */
  get minimized() {
    return this.#minimized;
  }

  /**
   * Set minimized
   * @param {boolean} value - Minimized
   */
  set minimized(value) {
    this.#minimized = value;
    this.emitEvent('minimized', value);
  }

  /**
   * Get always on top
   * @returns {boolean}
   */
  get alwaysOnTop() {
    return this.#alwaysOnTop;
  }

  /**
   * Set always on top
   * @param {boolean} value - Always on top
   */
  set alwaysOnTop(value) {
    this.#alwaysOnTop = value;
    this.emitEvent('alwaysOnTopChanged', value);
  }

  /**
   * Get transparent
   * @returns {boolean}
   */
  get transparent() {
    return this.#transparent;
  }

  /**
   * Set transparent
   * @param {boolean} value - Transparent
   */
  set transparent(value) {
    this.#transparent = value;
  }

  /**
   * Get per-pixel transparency
   * @returns {boolean}
   */
  get perPixelTransparency() {
    return this.#perPixelTransparency;
  }

  /**
   * Set per-pixel transparency
   * @param {boolean} value - Per-pixel transparency
   */
  set perPixelTransparency(value) {
    this.#perPixelTransparency = value;
  }

  /**
   * Get modal
   * @returns {boolean}
   */
  get modal() {
    return this.#modal;
  }

  /**
   * Set modal
   * @param {boolean} value - Modal
   */
  set modal(value) {
    this.#modal = value;
  }

  /**
   * Get exclusive
   * @returns {boolean}
   */
  get exclusive() {
    return this.#exclusive;
  }

  /**
   * Set exclusive
   * @param {boolean} value - Exclusive
   */
  set exclusive(value) {
    this.#exclusive = value;
  }

  /**
   * Get mouse passthrough
   * @returns {boolean}
   */
  get mousePassthrough() {
    return this.#mousePassthrough;
  }

  /**
   * Set mouse passthrough
   * @param {boolean} value - Mouse passthrough
   */
  set mousePassthrough(value) {
    this.#mousePassthrough = value;
  }

  /**
   * Get wrap controls
   * @returns {boolean}
   */
  get wrapControls() {
    return this.#wrapControls;
  }

  /**
   * Set wrap controls
   * @param {boolean} value - Wrap controls
   */
  set wrapControls(value) {
    this.#wrapControls = value;
  }

  /**
   * Get focus stealing
   * @returns {boolean}
   */
  get focusStealing() {
    return this.#focusStealing;
  }

  /**
   * Set focus stealing
   * @param {boolean} value - Focus stealing
   */
  set focusStealing(value) {
    this.#focusStealing = value;
  }

  /**
   * Get unfocus when minimized
   * @returns {boolean}
   */
  get unfocusWhenMinimized() {
    return this.#unfocusWhenMinimized;
  }

  /**
   * Set unfocus when minimized
   * @param {boolean} value - Unfocus when minimized
   */
  set unfocusWhenMinimized(value) {
    this.#unfocusWhenMinimized = value;
  }

  /**
   * Get mode
   * @returns {number}
   */
  get mode() {
    return this.#mode;
  }

  /**
   * Set mode
   * @param {number} value - Mode
   */
  set mode(value) {
    this.#mode = value;
  }

  /**
   * Get GUI embedding
   * @returns {boolean}
   */
  get guiEmbedding() {
    return this.#guiEmbedding;
  }

  /**
   * Set GUI embedding
   * @param {boolean} value - GUI embedding
   */
  set guiEmbedding(value) {
    this.#guiEmbedding = value;
  }

  /**
   * Get native handle
   * @returns {Object|null}
   */
  get nativeHandle() {
    return this.#nativeHandle;
  }

  /**
   * Get window ID
   * @returns {string}
   */
  get windowId() {
    return this.#windowId;
  }

  /**
   * Get DPI
   * @returns {number}
   */
  get dpi() {
    return this.#dpi;
  }

  /**
   * Get scale
   * @returns {number}
   */
  get scale() {
    return this.#scale;
  }

  /**
   * Get visible
   * @returns {boolean}
   */
  get visible() {
    return this.#visible;
  }

  /**
   * Set visible
   * @param {boolean} value - Visible
   */
  set visible(value) {
    this.#visible = value;
    if (value) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Get closed
   * @returns {boolean}
   */
  get closed() {
    return this.#closed;
  }

  /**
   * Show window
   * @returns {Window} This instance
   */
  show() {
    this.#visible = true;
    this.emitEvent('shown');
    return this;
  }

  /**
   * Hide window
   * @returns {Window} This instance
   */
  hide() {
    this.#visible = false;
    this.emitEvent('hidden');
    return this;
  }

  /**
   * Focus window
   * @returns {Window} This instance
   */
  focus() {
    this.#hasFocus = true;
    this.emitEvent('focused');
    return this;
  }

  /**
   * Unfocus window
   * @returns {Window} This instance
   */
  unfocus() {
    this.#hasFocus = false;
    this.emitEvent('unfocused');
    return this;
  }

  /**
   * Set position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Window} This instance
   */
  setPosition(x, y) {
    this.#position = { x, y };
    this.emitEvent('moved', x, y);
    return this;
  }

  /**
   * Set size
   * @param {number} width - Width
   * @param {number} height - Height
   * @returns {Window} This instance
   */
  setSize(width, height) {
    this.#size = { width, height };
    this.emitEvent('resized', width, height);
    return this;
  }

  /**
   * Set maximized
   * @param {boolean} maximized - Maximized
   * @returns {Window} This instance
   */
  setMaximized(maximized) {
    this.#maximized = maximized;
    this.emitEvent('maximized', maximized);
    return this;
  }

  /**
   * Set minimized
   * @param {boolean} minimized - Minimized
   * @returns {Window} This instance
   */
  setMinimized(minimized) {
    this.#minimized = minimized;
    this.emitEvent('minimized', minimized);
    return this;
  }

  /**
   * Set fullscreen
   * @param {boolean} fullscreen - Fullscreen
   * @returns {Window} This instance
   */
  setFullscreen(fullscreen) {
    this.#fullscreen = fullscreen;
    this.emitEvent('fullscreen', fullscreen);
    return this;
  }

  /**
   * Set always on top
   * @param {boolean} alwaysOnTop - Always on top
   * @returns {Window} This instance
   */
  setAlwaysOnTop(alwaysOnTop) {
    this.#alwaysOnTop = alwaysOnTop;
    this.emitEvent('alwaysOnTopChanged', alwaysOnTop);
    return this;
  }

  /**
   * Set resizable
   * @param {boolean} resizable - Resizable
   * @returns {Window} This instance
   */
  setResizable(resizable) {
    this.#resizable = resizable;
    return this;
  }

  /**
   * Set borderless
   * @param {boolean} borderless - Borderless
   * @returns {Window} This instance
   */
  setBorderless(borderless) {
    this.#borderless = borderless;
    return this;
  }

  /**
   * Set title
   * @param {string} title - Title
   * @returns {Window} This instance
   */
  setTitle(title) {
    this.#title = title;
    this.emitEvent('titleChanged', title);
    return this;
  }

  /**
   * Get window ID
   * @returns {string}
   */
  getWindowId() {
    return this.#windowId || this.#instanceId;
  }

  /**
   * Check if visible
   * @returns {boolean}
   */
  isVisible() {
    return this.#visible && !this.#closed;
  }

  /**
   * Check if focused
   * @returns {boolean}
   */
  isFocused() {
    return this.#hasFocus;
  }

  /**
   * Register event callback
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Window} This instance
   */
  onEvent(event, callback) {
    if (!this.#eventCallbacks[event]) {
      this.#eventCallbacks[event] = [];
    }
    this.#eventCallbacks[event].push(callback);
    return this;
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {Array} args - Arguments
   * @returns {Window} This instance
   */
  emitEvent(event, ...args) {
    const callbacks = this.#eventCallbacks[event] || [];
    for (const callback of callbacks) {
      try {
        callback(...args);
      } catch (error) {
        // Ignore
      }
    }
    this.emit(event, ...args);
    return this;
  }

  /**
   * Set on close callback
   * @param {Function} callback - Callback
   * @returns {Window} This instance
   */
  onClose(callback) {
    this.#onCloseCallback = callback;
    return this;
  }

  /**
   * Set on resize callback
   * @param {Function} callback - Callback
   * @returns {Window} This instance
   */
  onResize(callback) {
    this.#onResizeCallback = callback;
    return this;
  }

  /**
   * Set on move callback
   * @param {Function} callback - Callback
   * @returns {Window} This instance
   */
  onMove(callback) {
    this.#onMoveCallback = callback;
    return this;
  }

  /**
   * Set on focus callback
   * @param {Function} callback - Callback
   * @returns {Window} This instance
   */
  onFocus(callback) {
    this.#onFocusCallback = callback;
    return this;
  }

  /**
   * Set on blur callback
   * @param {Function} callback - Callback
   * @returns {Window} This instance
   */
  onBlur(callback) {
    this.#onBlurCallback = callback;
    return this;
  }

  /**
   * Close window
   * @returns {Window} This instance
   */
  close() {
    this.#closed = true;
    this.#visible = false;
    if (this.#onCloseCallback) {
      this.#onCloseCallback(this);
    }
    this.emitEvent('closed');
    return this;
  }

  /**
   * Internal draw
   * @private
   * @param {Object} canvas - Canvas context
   */
  __draw(canvas) {
    const ctx = canvas;
    
    // Draw window background
    if (!this.#transparent) {
      ctx.fillStyle = `rgba(${this.#clearColor.r * 255}, ${this.#clearColor.g * 255}, ${this.#clearColor.b * 255}, ${this.#clearColor.a})`;
      ctx.fillRect(0, 0, this.#size.width, this.#size.height);
    }
    
    // Draw window border if not borderless
    if (!this.#borderless && this.#visible) {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, this.#size.width, this.#size.height);
    }
    
    // Draw children
    super.__draw(canvas);
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.title = this.#title;
    data.windowPosition = this.#position;
    data.windowSize = this.#size;
    data.minSize = this.#minSize;
    data.maxSize = this.#maxSize;
    data.resizable = this.#resizable;
    data.borderless = this.#borderless;
    data.fullscreen = this.#fullscreen;
    data.maximized = this.#maximized;
    data.minimized = this.#minimized;
    data.alwaysOnTop = this.#alwaysOnTop;
    data.transparent = this.#transparent;
    data.perPixelTransparency = this.#perPixelTransparency;
    data.modal = this.#modal;
    data.exclusive = this.#exclusive;
    data.mousePassthrough = this.#mousePassthrough;
    data.wrapControls = this.#wrapControls;
    data.focusStealing = this.#focusStealing;
    data.unfocusWhenMinimized = this.#unfocusWhenMinimized;
    data.mode = this.#mode;
    data.guiEmbedding = this.#guiEmbedding;
    data.screen = this.#screen;
    data.dpi = this.#dpi;
    data.scale = this.#scale;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {Window} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#title = data.title || 'LXRN Window';
    this.#position = data.windowPosition || { x: 0, y: 0 };
    this.#size = data.windowSize || { width: 640, height: 480 };
    this.#minSize = data.minSize || { width: 0, height: 0 };
    this.#maxSize = data.maxSize || { width: 0, height: 0 };
    this.#resizable = data.resizable !== undefined ? data.resizable : true;
    this.#borderless = data.borderless || false;
    this.#fullscreen = data.fullscreen || false;
    this.#maximized = data.maximized || false;
    this.#minimized = data.minimized || false;
    this.#alwaysOnTop = data.alwaysOnTop || false;
    this.#transparent = data.transparent || false;
    this.#perPixelTransparency = data.perPixelTransparency || false;
    this.#modal = data.modal || false;
    this.#exclusive = data.exclusive || false;
    this.#mousePassthrough = data.mousePassthrough || false;
    this.#wrapControls = data.wrapControls || false;
    this.#focusStealing = data.focusStealing !== undefined ? data.focusStealing : true;
    this.#unfocusWhenMinimized = data.unfocusWhenMinimized !== undefined ? data.unfocusWhenMinimized : true;
    this.#mode = data.mode || 0;
    this.#guiEmbedding = data.guiEmbedding || false;
    this.#screen = data.screen || 0;
    this.#dpi = data.dpi || 96;
    this.#scale = data.scale || 1;
    return this;
  }
}

module.exports = Window;
