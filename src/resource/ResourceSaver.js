/**
 * LXRN ResourceSaver Module
 * @namespace LXRN.ResourceSaver
 * @author LXRN
 */

const FS = require('fs');
const PATH = require('path');
const Resource = require('./Resource.js');
const ResourceFormatJSON = require('./ResourceFormatJSON.js');
const ResourceFormatBinary = require('./ResourceFormatBinary.js');

/**
 * Resource saver
 * @class ResourceSaver
 */
class ResourceSaver {
  static #savers = {};
  static #backupEnabled = true;
  static #compressionEnabled = false;
  static #logger = null;
  static #backupExtension = '.bak';
  static #tempExtension = '.tmp';

  /**
   * Set logger
   * @param {Object} logger - Logger instance
   */
  static setLogger(logger) {
    ResourceSaver.#logger = logger;
  }

  /**
   * Log message
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Log data
   */
  static __log(level, message, data = null) {
    if (ResourceSaver.#logger) {
      if (typeof ResourceSaver.#logger.log === 'function') {
        ResourceSaver.#logger.log(level, message, data);
      } else if (typeof ResourceSaver.#logger === 'function') {
        ResourceSaver.#logger(level, message, data);
      }
    }
  }

  /**
   * Register saver
   * @param {string} extension - File extension
   * @param {Object} saver - Saver object
   */
  static registerSaver(extension, saver) {
    ResourceSaver.#savers[extension.toLowerCase()] = saver;
  }

  /**
   * Save resource
   * @param {string} path - File path
   * @param {Resource} resource - Resource to save
   * @param {Object} options - Save options
   * @returns {boolean}
   */
  static save(path, resource, options = {}) {
    const ext = PATH.extname(path).toLowerCase().substring(1);
    const saver = ResourceSaver.#savers[ext];
    
    if (!saver) {
      throw new Error(`No saver registered for extension: ${ext}`);
    }
    
    // Create directory if needed
    const dir = PATH.dirname(path);
    if (!FS.existsSync(dir)) {
      FS.mkdirSync(dir, { recursive: true });
    }
    
    // Backup existing file
    if (ResourceSaver.#backupEnabled && FS.existsSync(path)) {
      const backupPath = path + ResourceSaver.#backupExtension;
      FS.copyFileSync(path, backupPath);
      ResourceSaver.__log('debug', `Backup created: ${backupPath}`);
    }
    
    // Write to temp file first
    const tempPath = path + ResourceSaver.#tempExtension;
    
    try {
      const saveOptions = {
        ...options,
        compression: options.compression !== undefined ? options.compression : ResourceSaver.#compressionEnabled,
      };
      
      saver.save(tempPath, resource, saveOptions);
      
      // Move temp to target
      if (FS.existsSync(path)) {
        FS.unlinkSync(path);
      }
      FS.renameSync(tempPath, path);
      
      resource.path = path;
      resource._modified = false;
      
      ResourceSaver.__log('info', `Saved: ${path}`, { type: resource.type });
      return true;
    } catch (error) {
      // Restore backup
      if (ResourceSaver.#backupEnabled && FS.existsSync(path + ResourceSaver.#backupExtension)) {
        FS.copyFileSync(path + ResourceSaver.#backupExtension, path);
      }
      
      // Clean up temp
      if (FS.existsSync(tempPath)) {
        FS.unlinkSync(tempPath);
      }
      
      ResourceSaver.__log('error', `Save failed: ${path}`, { error: error.message });
      throw new Error(`Failed to save resource ${path}: ${error.message}`);
    }
  }

  /**
   * Save all resources
   * @param {Array} resources - Resources to save
   * @param {string} directory - Directory path
   * @param {Function} progress - Progress callback
   * @param {Object} options - Save options
   * @returns {Promise<Array>}
   */
  static async saveAll(resources, directory, progress = null, options = {}) {
    if (!FS.existsSync(directory)) {
      FS.mkdirSync(directory, { recursive: true });
    }
    
    const results = [];
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      const path = resource.path || 
        PATH.join(directory, `${resource.type}_${Date.now()}_${i}.json`);
      
      try {
        ResourceSaver.save(path, resource, options);
        results.push({ path, resource, success: true });
      } catch (error) {
        results.push({ path, resource, success: false, error: error.message });
        ResourceSaver.__log('error', `Save all failed: ${path}`, { error: error.message });
      }
      
      if (progress) {
        progress(i + 1, resources.length, resource);
      }
    }
    return results;
  }

  /**
   * Check if resource exists
   * @param {string} path - File path
   * @returns {boolean}
   */
  static exists(path) {
    return FS.existsSync(path);
  }

  /**
   * Get saver for extension
   * @param {string} extension - File extension
   * @returns {Object|null}
   */
  static getSaverForExtension(extension) {
    return ResourceSaver.#savers[extension.toLowerCase()] || null;
  }

  /**
   * Get available extensions
   * @returns {Array}
   */
  static getAvailableExtensions() {
    return Object.keys(ResourceSaver.#savers);
  }

  /**
   * Enable backup
   * @param {boolean} enable - Enable backup
   */
  static setBackupEnabled(enable) {
    ResourceSaver.#backupEnabled = enable;
    ResourceSaver.__log('info', `Backup ${enable ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable compression
   * @param {boolean} enable - Enable compression
   */
  static setCompressionEnabled(enable) {
    ResourceSaver.#compressionEnabled = enable;
    ResourceSaver.__log('info', `Compression ${enable ? 'enabled' : 'disabled'}`);
  }

  /**
   * Save with compression
   * @param {string} path - File path
   * @param {Resource} resource - Resource to save
   * @param {number} level - Compression level
   * @param {Object} options - Save options
   * @returns {boolean}
   */
  static saveCompressed(path, resource, level = 6, options = {}) {
    return ResourceSaver.save(path, resource, { ...options, compression: true, compressionLevel: level });
  }

  /**
   * Load compressed resource
   * @param {string} path - File path
   * @param {Object} options - Load options
   * @returns {Resource}
   */
  static loadCompressed(path, options = {}) {
    const ResourceLoader = require('./ResourceLoader.js');
    return ResourceLoader.loadSync(path, '', options);
  }

  /**
   * Set backup extension
   * @param {string} extension - Backup extension
   */
  static setBackupExtension(extension) {
    ResourceSaver.#backupExtension = extension;
  }

  /**
   * Set temp extension
   * @param {string} extension - Temp extension
   */
  static setTempExtension(extension) {
    ResourceSaver.#tempExtension = extension;
  }
}

// Register default savers
ResourceSaver.registerSaver('json', ResourceFormatJSON);
ResourceSaver.registerSaver('res', ResourceFormatBinary);
ResourceSaver.registerSaver('bin', ResourceFormatBinary);

module.exports = ResourceSaver;
