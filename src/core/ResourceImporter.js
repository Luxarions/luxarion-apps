/**
 * LXRN ResourceImporter Module
 * @namespace LXRN.ResourceImporter
 * @author LXRN
 */

const FS = require('fs');
const PATH = require('path');
const Logger = require('../utils/Logger.js');

/**
 * Resource importer
 * @class ResourceImporter
 */
class ResourceImporter {
  constructor() {
    this._importers = {};
    this._options = {};
    this._logger = new Logger('ResourceImporter');
    this._importQueue = [];
    this._processing = false;
    this._results = [];
    this._errorCount = 0;
    this._successCount = 0;
  }

  /**
   * Register importer
   * @param {string} extension - File extension
   * @param {Function} importer - Importer function
   * @returns {ResourceImporter} This instance
   */
  registerImporter(extension, importer) {
    this._importers[extension.toLowerCase()] = importer;
    return this;
  }

  /**
   * Set option
   * @param {string} name - Option name
   * @param {*} value - Option value
   * @returns {ResourceImporter} This instance
   */
  setOption(name, value) {
    this._options[name] = value;
    return this;
  }

  /**
   * Get option
   * @param {string} name - Option name
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  getOption(name, defaultValue = null) {
    return this._options[name] !== undefined ? this._options[name] : defaultValue;
  }

  /**
   * Import file
   * @param {string} path - File path
   * @param {Object} options - Import options
   * @returns {Promise<Object>}
   */
  import(path, options = {}) {
    const ext = PATH.extname(path).toLowerCase().substring(1);
    const importer = this._importers[ext];
    if (!importer) {
      throw new Error(`No importer registered for: ${ext}`);
    }
    
    const mergedOptions = { ...this._options, ...options };
    this._logger.info(`Importing: ${path}`, { extension: ext, options: mergedOptions });
    
    try {
      const result = importer(path, mergedOptions);
      this._successCount++;
      this._logger.info(`Import complete: ${path}`);
      return result;
    } catch (error) {
      this._errorCount++;
      this._logger.error(`Import failed: ${path}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Import directory
   * @param {string} dir - Directory path
   * @param {Object} options - Import options
   * @param {Function} progress - Progress callback
   * @returns {Promise<Array>}
   */
  async importDirectory(dir, options = {}, progress = null) {
    if (!FS.existsSync(dir)) {
      throw new Error(`Directory not found: ${dir}`);
    }
    
    const results = [];
    const entries = FS.readdirSync(dir);
    this._importQueue = [];
    this._results = [];
    this._errorCount = 0;
    this._successCount = 0;
    
    // Collect files
    const collectFiles = (currentDir) => {
      const items = FS.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = PATH.join(currentDir, item);
        const stat = FS.statSync(fullPath);
        if (stat.isDirectory()) {
          collectFiles(fullPath);
        } else {
          const ext = PATH.extname(item).toLowerCase().substring(1);
          if (this._importers[ext]) {
            this._importQueue.push(fullPath);
          }
        }
      }
    };
    collectFiles(dir);
    
    // Process queue
    const mergedOptions = { ...this._options, ...options };
    const total = this._importQueue.length;
    
    for (let i = 0; i < total; i++) {
      const filePath = this._importQueue[i];
      try {
        const result = this.import(filePath, mergedOptions);
        results.push({ path: filePath, result, success: true });
        this._results.push({ path: filePath, result, success: true });
        this._successCount++;
      } catch (error) {
        results.push({ path: filePath, error: error.message, success: false });
        this._results.push({ path: filePath, error: error.message, success: false });
        this._errorCount++;
      }
      
      if (progress) {
        progress(i + 1, total, filePath);
      }
    }
    
    return results;
  }

  /**
   * Check if format is supported
   * @param {string} extension - File extension
   * @returns {boolean}
   */
  isSupported(extension) {
    return extension.toLowerCase() in this._importers;
  }

  /**
   * Get supported extensions
   * @returns {Array}
   */
  getSupportedExtensions() {
    return Object.keys(this._importers);
  }

  /**
   * Get results
   * @returns {Array}
   */
  getResults() {
    return this._results;
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    return {
      total: this._importQueue.length,
      success: this._successCount,
      error: this._errorCount,
    };
  }

  /**
   * Get logger
   * @returns {Logger}
   */
  get logger() {
    return this._logger;
  }

  /**
   * Create default importer
   * @returns {ResourceImporter}
   */
  static getDefault() {
    if (!ResourceImporter._default) {
      ResourceImporter._default = new ResourceImporter();
      ResourceImporter._default.registerImporter('png', (path) => {
        const Image = require('../graphics/Image.js');
        return Image.load(path);
      });
      ResourceImporter._default.registerImporter('jpg', (path) => {
        const Image = require('../graphics/Image.js');
        return Image.load(path);
      });
      ResourceImporter._default.registerImporter('jpeg', (path) => {
        const Image = require('../graphics/Image.js');
        return Image.load(path);
      });
      ResourceImporter._default.registerImporter('json', (path) => {
        const JSONParser = require('../utils/JSONParser.js');
        return JSONParser.parseFile(path);
      });
      ResourceImporter._default.registerImporter('xml', (path) => {
        const XMLParser = require('../utils/XMLParser.js');
        return XMLParser.parseFile(path);
      });
      ResourceImporter._default.registerImporter('plist', (path) => {
        const PlistParser = require('../utils/PlistParser.js');
        return PlistParser.parseFile(path);
      });
      ResourceImporter._default.registerImporter('po', (path) => {
        const TranslationLoaderPO = require('../i18n/TranslationLoaderPO.js');
        return TranslationLoaderPO.load(path);
      });
    }
    return ResourceImporter._default;
  }
}

module.exports = ResourceImporter;
