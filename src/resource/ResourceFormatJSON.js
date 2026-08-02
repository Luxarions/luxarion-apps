/**
 * LXRN ResourceFormatJSON Module
 * @namespace LXRN.ResourceFormatJSON
 * @author LXRN
 */

const FS = require('fs');

/**
 * JSON resource format handler
 * @class ResourceFormatJSON
 */
class ResourceFormatJSON {
  static TYPE = 'json_resource';
  static EXTENSION = 'json';

  /**
   * Load JSON resource
   * @param {string} path - File path
   * @param {Object} options - Load options
   * @returns {Object}
   */
  static load(path, options = {}) {
    const data = FS.readFileSync(path, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Validate if needed
    if (options.validate !== false) {
      ResourceFormatJSON.validate(parsed);
    }
    
    return parsed;
  }

  /**
   * Save JSON resource
   * @param {string} path - File path
   * @param {Object} resource - Resource data
   * @param {Object} options - Save options
   * @returns {boolean}
   */
  static save(path, resource, options = {}) {
    const pretty = options.pretty !== undefined ? options.pretty : true;
    const space = options.space || 2;
    const data = JSON.stringify(resource, options.replacer || null, pretty ? space : 0);
    FS.writeFileSync(path, data, 'utf-8');
    return true;
  }

  /**
   * Load from string
   * @param {string} text - JSON text
   * @param {Object} options - Load options
   * @returns {Object}
   */
  static loadFromString(text, options = {}) {
    const parsed = JSON.parse(text);
    if (options.validate !== false) {
      ResourceFormatJSON.validate(parsed);
    }
    return parsed;
  }

  /**
   * Save to string
   * @param {Object} resource - Resource data
   * @param {Object} options - Save options
   * @returns {string}
   */
  static saveToString(resource, options = {}) {
    const pretty = options.pretty !== undefined ? options.pretty : true;
    const space = options.space || 2;
    return JSON.stringify(resource, options.replacer || null, pretty ? space : 0);
  }

  /**
   * Validate JSON data
   * @param {Object} data - Data to validate
   * @returns {boolean}
   */
  static validate(data) {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid JSON resource: must be an object');
    }
    if (data.type === undefined) {
      throw new Error('Invalid JSON resource: missing type field');
    }
    return true;
  }

  /**
   * Merge resources
   * @param {Object} base - Base resource
   * @param {Object} override - Override resource
   * @param {Object} options - Merge options
   * @returns {Object}
   */
  static merge(base, override, options = {}) {
    const deep = options.deep !== undefined ? options.deep : true;
    const arrayMerge = options.arrayMerge || 'concat';
    
    if (typeof base !== 'object' || base === null) return override;
    if (typeof override !== 'object' || override === null) return base;
    
    const result = { ...base };
    for (const key in override) {
      if (override[key] !== undefined) {
        if (deep && typeof override[key] === 'object' && override[key] !== null &&
            typeof base[key] === 'object' && base[key] !== null) {
          if (Array.isArray(override[key]) && Array.isArray(base[key])) {
            if (arrayMerge === 'concat') {
              result[key] = [...base[key], ...override[key]];
            } else if (arrayMerge === 'replace') {
              result[key] = override[key];
            } else {
              result[key] = ResourceFormatJSON.merge(base[key], override[key], options);
            }
          } else {
            result[key] = ResourceFormatJSON.merge(base[key], override[key], options);
          }
        } else {
          result[key] = override[key];
        }
      }
    }
    return result;
  }

  /**
   * Check if file is valid JSON resource
   * @param {string} path - File path
   * @returns {boolean}
   */
  static isValid(path) {
    try {
      const data = ResourceFormatJSON.load(path, { validate: false });
      return ResourceFormatJSON.validate(data);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get resource info
   * @param {string} path - File path
   * @returns {Object}
   */
  static getInfo(path) {
    const stats = FS.statSync(path);
    const data = ResourceFormatJSON.load(path, { validate: false });
    return {
      path: path,
      type: data.type || 'unknown',
      version: data.version || 1,
      size: stats.size,
      modified: stats.mtime,
      dependencies: data.dependencies || [],
    };
  }
}

module.exports = ResourceFormatJSON;
