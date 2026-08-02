/**
 * LXRN ResourceLoaderConstants Module
 * @namespace LXRN.ResourceLoaderConstants
 * @author LXRN
 */

/**
 * Resource loader constants
 * @class ResourceLoaderConstants
 */
class ResourceLoaderConstants {
  /**
   * Cache modes
   * @static
   */
  static CACHE_MODE_IGNORE = 0;
  static CACHE_MODE_REUSE = 1;
  static CACHE_MODE_REPLACE = 2;

  /**
   * Thread modes
   * @static
   */
  static THREAD_MODE_MAIN_THREAD = 0;
  static THREAD_MODE_SAFE = 1;
  static THREAD_MODE_ANY = 2;

  /**
   * Error codes
   * @static
   */
  static ERROR_OK = 0;
  static ERROR_ERR = 1;
  static ERROR_NOT_FOUND = 2;
  static ERROR_LOADER_NOT_FOUND = 3;
  static ERROR_FORMAT_NOT_SUPPORTED = 4;
  static ERROR_CORRUPT_FILE = 5;
  static ERROR_DEPENDENCY_NOT_FOUND = 6;
  static ERROR_DEPENDENCY_LOAD_ERROR = 7;
  static ERROR_CANT_OPEN = 8;
  static ERROR_IO_ERROR = 9;

  /**
   * Get error message
   * @param {number} code - Error code
   * @returns {string}
   */
  static getErrorMessage(code) {
    const messages = {
      [ResourceLoaderConstants.ERROR_OK]: 'OK',
      [ResourceLoaderConstants.ERROR_ERR]: 'General error',
      [ResourceLoaderConstants.ERROR_NOT_FOUND]: 'Resource not found',
      [ResourceLoaderConstants.ERROR_LOADER_NOT_FOUND]: 'No loader found',
      [ResourceLoaderConstants.ERROR_FORMAT_NOT_SUPPORTED]: 'Format not supported',
      [ResourceLoaderConstants.ERROR_CORRUPT_FILE]: 'File is corrupt',
      [ResourceLoaderConstants.ERROR_DEPENDENCY_NOT_FOUND]: 'Dependency not found',
      [ResourceLoaderConstants.ERROR_DEPENDENCY_LOAD_ERROR]: 'Dependency load error',
      [ResourceLoaderConstants.ERROR_CANT_OPEN]: 'Cannot open file',
      [ResourceLoaderConstants.ERROR_IO_ERROR]: 'I/O error',
    };
    return messages[code] || 'Unknown error';
  }

  /**
   * Get error name
   * @param {number} code - Error code
   * @returns {string}
   */
  static getErrorName(code) {
    const names = {
      [ResourceLoaderConstants.ERROR_OK]: 'ERROR_OK',
      [ResourceLoaderConstants.ERROR_ERR]: 'ERROR_ERR',
      [ResourceLoaderConstants.ERROR_NOT_FOUND]: 'ERROR_NOT_FOUND',
      [ResourceLoaderConstants.ERROR_LOADER_NOT_FOUND]: 'ERROR_LOADER_NOT_FOUND',
      [ResourceLoaderConstants.ERROR_FORMAT_NOT_SUPPORTED]: 'ERROR_FORMAT_NOT_SUPPORTED',
      [ResourceLoaderConstants.ERROR_CORRUPT_FILE]: 'ERROR_CORRUPT_FILE',
      [ResourceLoaderConstants.ERROR_DEPENDENCY_NOT_FOUND]: 'ERROR_DEPENDENCY_NOT_FOUND',
      [ResourceLoaderConstants.ERROR_DEPENDENCY_LOAD_ERROR]: 'ERROR_DEPENDENCY_LOAD_ERROR',
      [ResourceLoaderConstants.ERROR_CANT_OPEN]: 'ERROR_CANT_OPEN',
      [ResourceLoaderConstants.ERROR_IO_ERROR]: 'ERROR_IO_ERROR',
    };
    return names[code] || 'UNKNOWN_ERROR';
  }

  /**
   * Get cache mode name
   * @param {number} mode - Cache mode
   * @returns {string}
   */
  static getCacheModeName(mode) {
    const names = {
      [ResourceLoaderConstants.CACHE_MODE_IGNORE]: 'IGNORE',
      [ResourceLoaderConstants.CACHE_MODE_REUSE]: 'REUSE',
      [ResourceLoaderConstants.CACHE_MODE_REPLACE]: 'REPLACE',
    };
    return names[mode] || 'UNKNOWN';
  }

  /**
   * Get thread mode name
   * @param {number} mode - Thread mode
   * @returns {string}
   */
  static getThreadModeName(mode) {
    const names = {
      [ResourceLoaderConstants.THREAD_MODE_MAIN_THREAD]: 'MAIN_THREAD',
      [ResourceLoaderConstants.THREAD_MODE_SAFE]: 'SAFE',
      [ResourceLoaderConstants.THREAD_MODE_ANY]: 'ANY',
    };
    return names[mode] || 'UNKNOWN';
  }
}

module.exports = ResourceLoaderConstants;
