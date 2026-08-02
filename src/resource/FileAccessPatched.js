/**
 * LXRN FileAccessPatched Module
 * @namespace LXRN.FileAccessPatched
 * @author LXRN
 */

const FS = require('fs');

/**
 * Patched file access for applying patches
 * @class FileAccessPatched
 */
class FileAccessPatched {
  #patches = new Map();
  #originalFiles = new Map();
  #backup = new Map();
  #patchMode = 'insert'; // 'insert', 'replace', 'xor'
  #backupEnabled = true;
  #verifyPatches = true;
  #logger = null;

  /**
   * Set logger
   * @param {Object} logger - Logger instance
   * @returns {FileAccessPatched} This instance
   */
  setLogger(logger) {
    this.#logger = logger;
    return this;
  }

  /**
   * Log message
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Log data
   */
  __log(level, message, data = null) {
    if (this.#logger) {
      if (typeof this.#logger.log === 'function') {
        this.#logger.log(level, message, data);
      } else if (typeof this.#logger === 'function') {
        this.#logger(level, message, data);
      }
    }
  }

  /**
   * Register patch
   * @param {string} path - File path
   * @param {Uint8Array|string} patchData - Patch data
   * @param {Object} options - Patch options
   * @returns {FileAccessPatched} This instance
   */
  registerPatch(path, patchData, options = {}) {
    if (typeof patchData === 'string') {
      patchData = new TextEncoder().encode(patchData);
    }
    if (!(patchData instanceof Uint8Array)) {
      patchData = new Uint8Array(patchData);
    }
    this.#patches.set(path, { data: patchData, options });
    this.__log('info', `Registered patch: ${path}`, { size: patchData.length });
    return this;
  }

  /**
   * Register patch from file
   * @param {string} path - File path
   * @param {string} patchPath - Patch file path
   * @param {Object} options - Patch options
   * @returns {FileAccessPatched} This instance
   */
  registerPatchFile(path, patchPath, options = {}) {
    if (!FS.existsSync(patchPath)) {
      throw new Error(`Patch file not found: ${patchPath}`);
    }
    const data = FS.readFileSync(patchPath);
    return this.registerPatch(path, data, options);
  }

  /**
   * Register patch from memory
   * @param {string} path - File path
   * @param {Uint8Array|string} data - Patch data
   * @param {Object} options - Patch options
   * @returns {FileAccessPatched} This instance
   */
  registerPatchFromMemory(path, data, options = {}) {
    return this.registerPatch(path, data, options);
  }

  /**
   * Apply patch
   * @param {string} path - File path
   * @param {Uint8Array|string} originalData - Original data
   * @param {Object} options - Apply options
   * @returns {Uint8Array}
   */
  applyPatch(path, originalData, options = {}) {
    if (typeof originalData === 'string') {
      originalData = new TextEncoder().encode(originalData);
    }
    if (!(originalData instanceof Uint8Array)) {
      originalData = new Uint8Array(originalData);
    }
    
    const patchEntry = this.#patches.get(path);
    if (!patchEntry) {
      throw new Error(`No patch registered for: ${path}`);
    }
    
    const patch = patchEntry.data;
    const patchOptions = { ...patchEntry.options, ...options };
    const mode = patchOptions.mode || this.#patchMode;
    
    let result;
    switch (mode) {
      case 'insert':
        result = this.__insertPatch(originalData, patch, patchOptions);
        break;
      case 'replace':
        result = this.__replacePatch(originalData, patch, patchOptions);
        break;
      case 'xor':
        result = this.__xorPatch(originalData, patch, patchOptions);
        break;
      default:
        result = this.__insertPatch(originalData, patch, patchOptions);
    }
    
    // Backup original
    if (this.#backupEnabled) {
      this.#originalFiles.set(path, originalData);
      this.#backup.set(path, result);
    }
    
    this.__log('info', `Applied patch: ${path}`, { mode, originalSize: originalData.length, patchedSize: result.length });
    return result;
  }

  /**
   * Insert patch
   * @private
   * @param {Uint8Array} original - Original data
   * @param {Uint8Array} patch - Patch data
   * @param {Object} options - Patch options
   * @returns {Uint8Array}
   */
  __insertPatch(original, patch, options = {}) {
    const offset = options.offset !== undefined ? options.offset : 
      Math.floor(Math.random() * Math.max(1, original.length - patch.length + 1));
    const result = new Uint8Array(original.length + patch.length);
    result.set(original.slice(0, offset), 0);
    result.set(patch, offset);
    result.set(original.slice(offset + patch.length), offset + patch.length);
    return result;
  }

  /**
   * Replace patch
   * @private
   * @param {Uint8Array} original - Original data
   * @param {Uint8Array} patch - Patch data
   * @param {Object} options - Patch options
   * @returns {Uint8Array}
   */
  __replacePatch(original, patch, options = {}) {
    const offset = options.offset !== undefined ? options.offset : 
      Math.floor(Math.random() * Math.max(1, original.length - patch.length + 1));
    const result = new Uint8Array(original.length);
    result.set(original.slice(0, offset), 0);
    result.set(patch, offset);
    result.set(original.slice(offset + patch.length), offset + patch.length);
    return result;
  }

  /**
   * XOR patch
   * @private
   * @param {Uint8Array} original - Original data
   * @param {Uint8Array} patch - Patch data
   * @param {Object} options - Patch options
   * @returns {Uint8Array}
   */
  __xorPatch(original, patch, options = {}) {
    const result = new Uint8Array(original.length);
    const repeat = options.repeat !== undefined ? options.repeat : true;
    for (let i = 0; i < original.length; i++) {
      const p = repeat ? patch[i % patch.length] : (i < patch.length ? patch[i] : 0);
      result[i] = original[i] ^ p;
    }
    return result;
  }

  /**
   * Apply patch to file
   * @param {string} path - File path
   * @param {Object} options - Apply options
   * @returns {FileAccessPatched} This instance
   */
  applyPatchToFile(path, options = {}) {
    if (!FS.existsSync(path)) {
      throw new Error(`File not found: ${path}`);
    }
    const data = FS.readFileSync(path);
    const patched = this.applyPatch(path, data, options);
    FS.writeFileSync(path, patched);
    this.__log('info', `Applied patch to file: ${path}`);
    return this;
  }

  /**
   * Revert patch
   * @param {string} path - File path
   * @param {Object} options - Revert options
   * @returns {FileAccessPatched} This instance
   */
  revertPatch(path, options = {}) {
    const original = this.#originalFiles.get(path);
    if (!original) {
      throw new Error(`No original data found for: ${path}`);
    }
    
    const backup = options.backup !== undefined ? options.backup : true;
    if (backup && FS.existsSync(path)) {
      const backupPath = path + '.bak';
      FS.copyFileSync(path, backupPath);
    }
    
    FS.writeFileSync(path, original);
    this.#originalFiles.delete(path);
    this.#backup.delete(path);
    this.__log('info', `Reverted patch: ${path}`);
    return this;
  }

  /**
   * Get patch
   * @param {string} path - File path
   * @returns {Uint8Array|null}
   */
  getPatch(path) {
    const entry = this.#patches.get(path);
    return entry ? entry.data : null;
  }

  /**
   * Get original data
   * @param {string} path - File path
   * @returns {Uint8Array|null}
   */
  getOriginal(path) {
    return this.#originalFiles.get(path) || null;
  }

  /**
   * Get patched data
   * @param {string} path - File path
   * @returns {Uint8Array|null}
   */
  getPatched(path) {
    return this.#backup.get(path) || null;
  }

  /**
   * Check if patch exists
   * @param {string} path - File path
   * @returns {boolean}
   */
  hasPatch(path) {
    return this.#patches.has(path);
  }

  /**
   * Clear all patches
   * @returns {FileAccessPatched} This instance
   */
  clear() {
    this.#patches.clear();
    this.#originalFiles.clear();
    this.#backup.clear();
    this.__log('info', 'Cleared all patches');
    return this;
  }

  /**
   * Set patch mode
   * @param {string} mode - Patch mode ('insert', 'replace', 'xor')
   * @returns {FileAccessPatched} This instance
   */
  setPatchMode(mode) {
    const valid = ['insert', 'replace', 'xor'];
    if (!valid.includes(mode)) {
      throw new Error(`Invalid patch mode: ${mode}`);
    }
    this.#patchMode = mode;
    this.__log('info', `Patch mode set to: ${mode}`);
    return this;
  }

  /**
   * Enable backup
   * @param {boolean} enable - Enable backup
   * @returns {FileAccessPatched} This instance
   */
  setBackupEnabled(enable) {
    this.#backupEnabled = enable;
    this.__log('info', `Backup ${enable ? 'enabled' : 'disabled'}`);
    return this;
  }

  /**
   * Verify patch
   * @param {string} path - File path
   * @param {Uint8Array} expected - Expected data
   * @returns {boolean}
   */
  verifyPatch(path, expected) {
    const patched = this.#backup.get(path);
    if (!patched) return false;
    if (patched.length !== expected.length) return false;
    
    for (let i = 0; i < patched.length; i++) {
      if (patched[i] !== expected[i]) return false;
    }
    this.__log('info', `Patch verified: ${path}`);
    return true;
  }

  /**
   * Get patch count
   * @returns {number}
   */
  get patchCount() {
    return this.#patches.size;
  }
}

module.exports = FileAccessPatched;
