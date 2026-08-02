/**
 * LXRN StatusIndicator Module
 * @namespace LXRN.StatusIndicator
 * @author LXRN
 */

const Node = require('./Node.js');

/**
 * Status indicator for showing status information
 * @class StatusIndicator
 * @extends Node
 */
class StatusIndicator extends Node {
  #status = 'idle';
  #message = '';
  #progress = 0;
  #color = { r: 0, g: 0.5, b: 0, a: 1 };
  #icon = null;
  #text = '';
  #visible = true;
  #autoHide = true;
  #timeout = 3000;
  #timer = null;
  #indicators = new Map();
  #currentIndicators = [];
  #style = 'default';
  #animation = 'none';
  #pulseSpeed = 1;
  #indicatorType = 'bar'; // 'bar', 'spinner', 'dots', 'progress'
  #maxProgress = 1;
  #minProgress = 0;
  #showPercentage = true;
  #showIcon = true;
  #showMessage = true;
  #statusHistory = [];
  #maxHistory = 50;
  #persistent = false;
  #onUpdateCallback = null;
  #onCompleteCallback = null;
  #onErrorCallback = null;

  constructor(name = 'StatusIndicator') {
    super(name);
  }

  /**
   * Get status
   * @returns {string}
   */
  get status() {
    return this.#status;
  }

  /**
   * Set status
   * @param {string} value - Status
   */
  set status(value) {
    this.#status = value;
    this.update();
  }

  /**
   * Get message
   * @returns {string}
   */
  get message() {
    return this.#message;
  }

  /**
   * Set message
   * @param {string} value - Message
   */
  set message(value) {
    this.#message = value;
    this.update();
  }

  /**
   * Get progress
   * @returns {number}
   */
  get progress() {
    return this.#progress;
  }

  /**
   * Set progress
   * @param {number} value - Progress (0-1)
   */
  set progress(value) {
    this.#progress = Math.max(this.#minProgress, Math.min(this.#maxProgress, value));
    this.update();
  }

  /**
   * Get color
   * @returns {Object}
   */
  get color() {
    return this.#color;
  }

  /**
   * Set color
   * @param {Object} value - Color
   */
  set color(value) {
    this.#color = value;
    this.update();
  }

  /**
   * Get icon
   * @returns {Object|null}
   */
  get icon() {
    return this.#icon;
  }

  /**
   * Set icon
   * @param {Object} value - Icon
   */
  set icon(value) {
    this.#icon = value;
    this.update();
  }

  /**
   * Get text
   * @returns {string}
   */
  get text() {
    return this.#text;
  }

  /**
   * Set text
   * @param {string} value - Text
   */
  set text(value) {
    this.#text = value;
    this.update();
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
    this.update();
  }

  /**
   * Get auto hide
   * @returns {boolean}
   */
  get autoHide() {
    return this.#autoHide;
  }

  /**
   * Set auto hide
   * @param {boolean} value - Auto hide
   */
  set autoHide(value) {
    this.#autoHide = value;
  }

  /**
   * Get timeout
   * @returns {number}
   */
  get timeout() {
    return this.#timeout;
  }

  /**
   * Set timeout
   * @param {number} value - Timeout in milliseconds
   */
  set timeout(value) {
    this.#timeout = value;
  }

  /**
   * Get style
   * @returns {string}
   */
  get style() {
    return this.#style;
  }

  /**
   * Set style
   * @param {string} value - Style
   */
  set style(value) {
    this.#style = value;
    this.update();
  }

  /**
   * Get animation
   * @returns {string}
   */
  get animation() {
    return this.#animation;
  }

  /**
   * Set animation
   * @param {string} value - Animation
   */
  set animation(value) {
    this.#animation = value;
    this.update();
  }

  /**
   * Get indicator type
   * @returns {string}
   */
  get indicatorType() {
    return this.#indicatorType;
  }

  /**
   * Set indicator type
   * @param {string} value - Indicator type
   */
  set indicatorType(value) {
    const valid = ['bar', 'spinner', 'dots', 'progress'];
    if (!valid.includes(value)) {
      throw new Error(`Invalid indicator type: ${value}`);
    }
    this.#indicatorType = value;
    this.update();
  }

  /**
   * Set status
   * @param {string} status - Status
   * @param {string} message - Message
   * @param {number} progress - Progress
   * @returns {StatusIndicator} This instance
   */
  setStatus(status, message = '', progress = 0) {
    // Save to history
    if (this.#statusHistory.length >= this.#maxHistory) {
      this.#statusHistory.shift();
    }
    this.#statusHistory.push({
      status: this.#status,
      message: this.#message,
      progress: this.#progress,
      timestamp: Date.now(),
    });
    
    this.#status = status;
    this.#message = message;
    this.#progress = Math.max(this.#minProgress, Math.min(this.#maxProgress, progress));
    this.update();
    
    if (this.#autoHide && (status === 'success' || status === 'error' || status === 'complete')) {
      this.__startHideTimer();
    }
    
    return this;
  }

  /**
   * Set progress
   * @param {number} progress - Progress
   * @returns {StatusIndicator} This instance
   */
  setProgress(progress) {
    this.#progress = Math.max(this.#minProgress, Math.min(this.#maxProgress, progress));
    this.update();
    return this;
  }

  /**
   * Set message
   * @param {string} message - Message
   * @returns {StatusIndicator} This instance
   */
  setMessage(message) {
    this.#message = message;
    this.update();
    return this;
  }

  /**
   * Set color
   * @param {number} r - Red (0-1)
   * @param {number} g - Green (0-1)
   * @param {number} b - Blue (0-1)
   * @param {number} a - Alpha (0-1)
   * @returns {StatusIndicator} This instance
   */
  setColor(r, g, b, a = 1) {
    this.#color = { r, g, b, a };
    this.update();
    return this;
  }

  /**
   * Show indicator
   * @returns {StatusIndicator} This instance
   */
  show() {
    this.#visible = true;
    this.update();
    return this;
  }

  /**
   * Hide indicator
   * @returns {StatusIndicator} This instance
   */
  hide() {
    this.#visible = false;
    this.update();
    return this;
  }

  /**
   * Update indicator
   * @returns {StatusIndicator} This instance
   */
  update() {
    const data = {
      status: this.#status,
      message: this.#message,
      progress: this.#progress,
      color: this.#color,
      icon: this.#icon,
      text: this.#text,
      visible: this.#visible,
      style: this.#style,
      animation: this.#animation,
      indicatorType: this.#indicatorType,
      showPercentage: this.#showPercentage,
      showIcon: this.#showIcon,
      showMessage: this.#showMessage,
    };
    
    this.emit('updated', data);
    if (this.#onUpdateCallback) {
      this.#onUpdateCallback(data);
    }
    return this;
  }

  /**
   * Start hide timer
   * @private
   */
  __startHideTimer() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
    this.#timer = setTimeout(() => {
      if (this.#autoHide) {
        this.hide();
      }
      this.#timer = null;
    }, this.#timeout);
  }

  /**
   * Add indicator
   * @param {string} id - Indicator ID
   * @param {Object} indicator - Indicator object
   * @returns {StatusIndicator} This instance
   */
  addIndicator(id, indicator) {
    this.#indicators.set(id, indicator);
    this.#currentIndicators.push(id);
    this.update();
    return this;
  }

  /**
   * Remove indicator
   * @param {string} id - Indicator ID
   * @returns {boolean}
   */
  removeIndicator(id) {
    const removed = this.#indicators.delete(id);
    const idx = this.#currentIndicators.indexOf(id);
    if (idx !== -1) {
      this.#currentIndicators.splice(idx, 1);
    }
    if (removed) {
      this.update();
    }
    return removed;
  }

  /**
   * Get indicator
   * @param {string} id - Indicator ID
   * @returns {Object|null}
   */
  getIndicator(id) {
    return this.#indicators.get(id) || null;
  }

  /**
   * Get indicators
   * @returns {Array}
   */
  getIndicators() {
    return this.#currentIndicators.map(id => ({ id, indicator: this.#indicators.get(id) }));
  }

  /**
   * Clear indicators
   * @returns {StatusIndicator} This instance
   */
  clearIndicators() {
    this.#indicators.clear();
    this.#currentIndicators = [];
    this.update();
    return this;
  }

  /**
   * Reset indicator
   * @returns {StatusIndicator} This instance
   */
  reset() {
    this.#status = 'idle';
    this.#message = '';
    this.#progress = 0;
    this.#visible = true;
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
    this.update();
    return this;
  }

  /**
   * Complete indicator
   * @param {string} message - Completion message
   * @returns {StatusIndicator} This instance
   */
  complete(message = 'Complete') {
    this.setStatus('complete', message, 1);
    if (this.#onCompleteCallback) {
      this.#onCompleteCallback(this);
    }
    return this;
  }

  /**
   * Error indicator
   * @param {string} message - Error message
   * @returns {StatusIndicator} This instance
   */
  error(message = 'Error') {
    this.setStatus('error', message);
    this.setColor(1, 0, 0, 1);
    if (this.#onErrorCallback) {
      this.#onErrorCallback(this);
    }
    return this;
  }

  /**
   * Success indicator
   * @param {string} message - Success message
   * @returns {StatusIndicator} This instance
   */
  success(message = 'Success') {
    this.setStatus('success', message, 1);
    this.setColor(0, 1, 0, 1);
    return this;
  }

  /**
   * Warning indicator
   * @param {string} message - Warning message
   * @returns {StatusIndicator} This instance
   */
  warning(message = 'Warning') {
    this.setStatus('warning', message);
    this.setColor(1, 0.8, 0, 1);
    return this;
  }

  /**
   * Info indicator
   * @param {string} message - Info message
   * @returns {StatusIndicator} This instance
   */
  info(message = 'Info') {
    this.setStatus('info', message);
    this.setColor(0, 0.5, 1, 1);
    return this;
  }

  /**
   * Get progress percentage
   * @returns {string}
   */
  getPercentage() {
    const percent = (this.#progress - this.#minProgress) / (this.#maxProgress - this.#minProgress) * 100;
    return `${Math.round(percent)}%`;
  }

  /**
   * Get status history
   * @param {number} limit - Limit
   * @returns {Array}
   */
  getHistory(limit = 10) {
    return this.#statusHistory.slice(-limit);
  }

  /**
   * Clear history
   * @returns {StatusIndicator} This instance
   */
  clearHistory() {
    this.#statusHistory = [];
    return this;
  }

  /**
   * Set on update callback
   * @param {Function} callback - Callback
   * @returns {StatusIndicator} This instance
   */
  onUpdate(callback) {
    this.#onUpdateCallback = callback;
    return this;
  }

  /**
   * Set on complete callback
   * @param {Function} callback - Callback
   * @returns {StatusIndicator} This instance
   */
  onComplete(callback) {
    this.#onCompleteCallback = callback;
    return this;
  }

  /**
   * Set on error callback
   * @param {Function} callback - Callback
   * @returns {StatusIndicator} This instance
   */
  onError(callback) {
    this.#onErrorCallback = callback;
    return this;
  }

  /**
   * Process callback - animate indicator
   * @param {number} delta - Time delta
   */
  process(delta) {
    if (this.#animation === 'pulse' && this.#visible) {
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * this.#pulseSpeed * Math.PI * 2) * 0.5 + 0.5;
      this._opacity = 0.5 + pulse * 0.5;
      this.update();
    }
    
    if (this.#indicatorType === 'spinner' && this.#visible) {
      this.emit('spin', delta);
    }
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.status = this.#status;
    data.message = this.#message;
    data.progress = this.#progress;
    data.color = this.#color;
    data.text = this.#text;
    data.visible = this.#visible;
    data.autoHide = this.#autoHide;
    data.timeout = this.#timeout;
    data.style = this.#style;
    data.animation = this.#animation;
    data.indicatorType = this.#indicatorType;
    data.showPercentage = this.#showPercentage;
    data.showIcon = this.#showIcon;
    data.showMessage = this.#showMessage;
    data.persistent = this.#persistent;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {StatusIndicator} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#status = data.status || 'idle';
    this.#message = data.message || '';
    this.#progress = data.progress || 0;
    this.#color = data.color || { r: 0, g: 0.5, b: 0, a: 1 };
    this.#text = data.text || '';
    this.#visible = data.visible !== undefined ? data.visible : true;
    this.#autoHide = data.autoHide !== undefined ? data.autoHide : true;
    this.#timeout = data.timeout || 3000;
    this.#style = data.style || 'default';
    this.#animation = data.animation || 'none';
    this.#indicatorType = data.indicatorType || 'bar';
    this.#showPercentage = data.showPercentage !== undefined ? data.showPercentage : true;
    this.#showIcon = data.showIcon !== undefined ? data.showIcon : true;
    this.#showMessage = data.showMessage !== undefined ? data.showMessage : true;
    this.#persistent = data.persistent || false;
    return this;
  }
}

module.exports = StatusIndicator;
