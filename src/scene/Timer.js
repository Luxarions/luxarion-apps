/**
 * LXRN Timer Module
 * @namespace LXRN.Timer
 * @author LXRN
 */

const Node = require('./Node.js');

/**
 * Timer node for time-based events
 * @class Timer
 * @extends Node
 */
class Timer extends Node {
  #waitTime = 1.0;
  #timeLeft = 0;
  #oneshot = true;
  #autostart = false;
  #paused = false;
  #started = false;
  #processing = true;
  #timeScale = 1.0;
  #processMode = 0; // 0 = idle, 1 = physics
  #timeoutCallback = null;
  #tickCallback = null;
  #elapsed = 0;
  #ticks = 0;
  #maxTicks = 0;
  #repeatCount = 0;
  #maxRepeats = 0;
  #remainingRepeats = 0;

  constructor(name = 'Timer') {
    super(name);
  }

  /**
   * Set wait time
   * @param {number} time - Wait time in seconds
   * @returns {Timer} This instance
   */
  setWaitTime(time) {
    this.#waitTime = Math.max(0, time);
    return this;
  }

  /**
   * Get wait time
   * @returns {number}
   */
  getWaitTime() {
    return this.#waitTime;
  }

  /**
   * Set one-shot
   * @param {boolean} oneshot - One-shot timer
   * @returns {Timer} This instance
   */
  setOneShot(oneshot) {
    this.#oneshot = oneshot;
    return this;
  }

  /**
   * Check if one-shot
   * @returns {boolean}
   */
  isOneShot() {
    return this.#oneshot;
  }

  /**
   * Set autostart
   * @param {boolean} autostart - Auto-start timer
   * @returns {Timer} This instance
   */
  setAutostart(autostart) {
    this.#autostart = autostart;
    return this;
  }

  /**
   * Check if autostart
   * @returns {boolean}
   */
  isAutostart() {
    return this.#autostart;
  }

  /**
   * Set paused
   * @param {boolean} paused - Paused state
   * @returns {Timer} This instance
   */
  setPaused(paused) {
    this.#paused = paused;
    return this;
  }

  /**
   * Check if paused
   * @returns {boolean}
   */
  isPaused() {
    return this.#paused;
  }

  /**
   * Set time scale
   * @param {number} scale - Time scale
   * @returns {Timer} This instance
   */
  setTimeScale(scale) {
    this.#timeScale = Math.max(0, scale);
    return this;
  }

  /**
   * Get time scale
   * @returns {number}
   */
  getTimeScale() {
    return this.#timeScale;
  }

  /**
   * Set process mode
   * @param {number} mode - Process mode (0=idle, 1=physics)
   * @returns {Timer} This instance
   */
  setProcessMode(mode) {
    this.#processMode = mode;
    return this;
  }

  /**
   * Get process mode
   * @returns {number}
   */
  getProcessMode() {
    return this.#processMode;
  }

  /**
   * Set max repeats
   * @param {number} max - Maximum repeats
   * @returns {Timer} This instance
   */
  setMaxRepeats(max) {
    this.#maxRepeats = max;
    this.#remainingRepeats = max;
    return this;
  }

  /**
   * Get max repeats
   * @returns {number}
   */
  getMaxRepeats() {
    return this.#maxRepeats;
  }

  /**
   * Start timer
   * @param {number} waitTime - Optional wait time
   * @returns {Timer} This instance
   */
  start(waitTime = null) {
    if (waitTime !== null) {
      this.#waitTime = waitTime;
    }
    this.#timeLeft = this.#waitTime;
    this.#started = true;
    this.#paused = false;
    this.#elapsed = 0;
    this.#ticks = 0;
    this.#repeatCount = 0;
    this.#remainingRepeats = this.#maxRepeats;
    this.emit('started');
    return this;
  }

  /**
   * Stop timer
   * @returns {Timer} This instance
   */
  stop() {
    this.#started = false;
    this.#timeLeft = 0;
    this.#paused = false;
    this.emit('stopped');
    return this;
  }

  /**
   * Pause timer
   * @returns {Timer} This instance
   */
  pause() {
    this.#paused = true;
    this.emit('paused');
    return this;
  }

  /**
   * Resume timer
   * @returns {Timer} This instance
   */
  resume() {
    this.#paused = false;
    this.emit('resumed');
    return this;
  }

  /**
   * Reset timer
   * @returns {Timer} This instance
   */
  reset() {
    this.#timeLeft = this.#waitTime;
    this.#elapsed = 0;
    this.#ticks = 0;
    this.emit('reset');
    return this;
  }

  /**
   * Get time left
   * @returns {number}
   */
  getTimeLeft() {
    return this.#timeLeft;
  }

  /**
   * Get elapsed time
   * @returns {number}
   */
  getElapsed() {
    return this.#elapsed;
  }

  /**
   * Get ticks
   * @returns {number}
   */
  getTicks() {
    return this.#ticks;
  }

  /**
   * Check if running
   * @returns {boolean}
   */
  isRunning() {
    return this.#started && !this.#paused;
  }

  /**
   * Process callback
   * @param {number} delta - Time delta
   */
  process(delta) {
    if (this.#processMode === 1) return; // Physics mode
    this.__update(delta);
  }

  /**
   * Physics process callback
   * @param {number} delta - Time delta
   */
  physicsProcess(delta) {
    if (this.#processMode === 0) return; // Idle mode
    this.__update(delta);
  }

  /**
   * Update timer
   * @private
   * @param {number} delta - Time delta
   */
  __update(delta) {
    if (!this.#started || this.#paused) return;
    
    delta *= this.#timeScale;
    this.#timeLeft -= delta;
    this.#elapsed += delta;
    
    // Check for tick
    if (this.#timeLeft <= 0) {
      this.#timeLeft = 0;
      this.#ticks++;
      this.#repeatCount++;
      
      this.emit('timeout');
      if (this.#timeoutCallback) {
        this.#timeoutCallback(this);
      }
      
      if (this.#oneshot) {
        this.#started = false;
        this.emit('finished');
      } else {
        // Check max repeats
        if (this.#maxRepeats > 0 && this.#repeatCount >= this.#maxRepeats) {
          this.#started = false;
          this.emit('finished');
        } else {
          this.#timeLeft = this.#waitTime;
          this.emit('repeat', this.#repeatCount);
        }
      }
    }
    
    // Tick event
    if (this.#tickCallback && delta > 0) {
      this.#tickCallback(this, delta);
    }
  }

  /**
   * Ready callback
   */
  ready() {
    if (this.#autostart) {
      this.start();
    }
  }

  /**
   * Set timeout callback
   * @param {Function} callback - Callback function
   * @returns {Timer} This instance
   */
  onTimeout(callback) {
    this.#timeoutCallback = callback;
    this.connect('timeout', this, callback);
    return this;
  }

  /**
   * Set tick callback
   * @param {Function} callback - Callback function
   * @returns {Timer} This instance
   */
  onTick(callback) {
    this.#tickCallback = callback;
    return this;
  }

  /**
   * Set finished callback
   * @param {Function} callback - Callback function
   * @returns {Timer} This instance
   */
  onFinished(callback) {
    this.connect('finished', this, callback);
    return this;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.waitTime = this.#waitTime;
    data.oneshot = this.#oneshot;
    data.autostart = this.#autostart;
    data.paused = this.#paused;
    data.started = this.#started;
    data.timeLeft = this.#timeLeft;
    data.timeScale = this.#timeScale;
    data.processMode = this.#processMode;
    data.maxRepeats = this.#maxRepeats;
    data.repeatCount = this.#repeatCount;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {Timer} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#waitTime = data.waitTime || 1.0;
    this.#oneshot = data.oneshot !== undefined ? data.oneshot : true;
    this.#autostart = data.autostart || false;
    this.#paused = data.paused || false;
    this.#started = data.started || false;
    this.#timeLeft = data.timeLeft || 0;
    this.#timeScale = data.timeScale || 1.0;
    this.#processMode = data.processMode || 0;
    this.#maxRepeats = data.maxRepeats || 0;
    this.#repeatCount = data.repeatCount || 0;
    return this;
  }
}

module.exports = Timer;
