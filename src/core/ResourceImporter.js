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
  #importers = {};
  #options = {};
  #logger = new Logger('ResourceImporter');
  #importQueue = [];
  #processing = false;
  #results = [];
  #errorCount = 0;
  #successCount = 0;
  static #default = null;

  /**
   * Register importer
   * @param {string} extension - File extension
   * @param {Function} importer - Importer function
   * @returns {ResourceImporter} This instance
   */
  registerImporter(extension, importer) {
    this.#importers[extension.toLowerCase()] = importer;
    return this;
  }

  /**
   * Set option
   * @param {string} name - Option name
   * @param {*} value - Option value
   * @returns {ResourceImporter} This instance
   */
  setOption(name, value) {
    this.#options[name] = value;
    return this;
  }

  /**
   * Get option
   * @param {string} name - Option name
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  getOption(name, defaultValue = null) {
    return this.#options[name] !== undefined ? this.#options[name] : defaultValue;
  }

  /**
   * Import file
   * @param {string} path - File path
   * @param {Object} options - Import options
   * @returns {Promise<Object>}
   */
  import(path, options = {}) {
    const ext = PATH.extname(path).toLowerCase().substring(1);
    const importer = this.#importers[ext];
    if (!importer) {
      throw new Error(`No importer registered for: ${ext}`);
    }
    
    const mergedOptions = { ...this.#options, ...options };
    this.#logger.info(`Importing: ${path}`, { extension: ext, options: mergedOptions });
    
    try {
      const result = importer(path, mergedOptions);
      this.#successCount++;
      this.#logger.info(`Import complete: ${path}`);
      return result;
    } catch (error) {
      this.#errorCount++;
      this.#logger.error(`Import failed: ${path}`, { error: error.message });
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
    this.#importQueue = [];
    this.#results = [];
    this.#errorCount = 0;
    this.#successCount = 0;
    
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
          if (this.#importers[ext]) {
            this.#importQueue.push(fullPath);
          }
        }
      }
    };
    collectFiles(dir);
    
    // Process queue
    const mergedOptions = { ...this.#options, ...options };
    const total = this.#importQueue.length;
    
    for (let i = 0; i < total; i++) {
      const filePath = this.#importQueue[i];
      try {
        const result = this.import(filePath, mergedOptions);
        results.push({ path: filePath, result, success: true });
        this.#results.push({ path: filePath, result, success: true });
        this.#successCount++;
      } catch (error) {
        results.push({ path: filePath, error: error.message, success: false });
        this.#results.push({ path: filePath, error: error.message, success: false });
        this.#errorCount++;
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
    return extension.toLowerCase() in this.#importers;
  }

  /**
   * Get supported extensions
   * @returns {Array}
   */
  getSupportedExtensions() {
    return Object.keys(this.#importers);
  }

  /**
   * Get results
   * @returns {Array}
   */
  getResults() {
    return this.#results;
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    return {
      total: this.#importQueue.length,
      success: this.#successCount,
      error: this.#errorCount,
    };
  }

  /**
   * Get logger
   * @returns {Logger}
   */
  get logger() {
    return this.#logger;
  }

  /**
   * Create default importer
   * @returns {ResourceImporter}
   */
  static getDefault() {
    if (!ResourceImporter.#default) {
      ResourceImporter.#default = new ResourceImporter();
      ResourceImporter.#default.registerImporter('png', (path) => {
        const Image = require('../graphics/Image.js');
        return Image.load(path);
      });
      ResourceImporter.#default.registerImporter('jpg', (path) => {
        const Image = require('../graphics/Image.js');
        return Image.load(path);
      });
      ResourceImporter.#default.registerImporter('jpeg', (path) => {
        const Image = require('../graphics/Image.js');
        return Image.load(path);
      });
      ResourceImporter.#default.registerImporter('json', (path) => {
        const JSONParser = require('../utils/JSONParser.js');
        return JSONParser.parseFile(path);
      });
      ResourceImporter.#default.registerImporter('xml', (path) => {
        const XMLParser = require('../utils/XMLParser.js');
        return XMLParser.parseFile(path);
      });
      ResourceImporter.#default.registerImporter('plist', (path) => {
        const PlistParser = require('../utils/PlistParser.js');
        return PlistParser.parseFile(path);
      });
      ResourceImporter.#default.registerImporter('po', (path) => {
        const TranslationLoaderPO = require('../i18n/TranslationLoaderPO.js');
        return TranslationLoaderPO.load(path);
      });
    }
    return ResourceImporter.#default;
  }
}

module.exports = ResourceImporter;
