/**
 * LXRN DirAccess Module
 * @namespace LXRN.DirAccess
 * @author LXRN
 */

const FS = require('fs');
const PATH = require('path');

/**
 * Directory access utilities
 * @class DirAccess
 */
class DirAccess {
  #currentDir = process.cwd();
  #separator = PATH.sep;

  /**
   * Get path separator
   * @returns {string}
   */
  static getSeparator() {
    return PATH.sep;
  }

  /**
   * Get current directory
   * @returns {string}
   */
  static getCurrentDir() {
    return process.cwd();
  }

  /**
   * Set current directory
   * @param {string} path - Directory path
   * @returns {boolean}
   */
  static setCurrentDir(path) {
    try {
      process.chdir(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if path exists
   * @param {string} path - File or directory path
   * @returns {boolean}
   */
  static exists(path) {
    return FS.existsSync(path);
  }

  /**
   * Check if path is directory
   * @param {string} path - Directory path
   * @returns {boolean}
   */
  static isDir(path) {
    try {
      const stat = FS.statSync(path);
      return stat.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if path is file
   * @param {string} path - File path
   * @returns {boolean}
   */
  static isFile(path) {
    try {
      const stat = FS.statSync(path);
      return stat.isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if path is symlink
   * @param {string} path - Path to check
   * @returns {boolean}
   */
  static isSymlink(path) {
    try {
      const stat = FS.lstatSync(path);
      return stat.isSymbolicLink();
    } catch (error) {
      return false;
    }
  }

  /**
   * Create directory
   * @param {string} path - Directory path
   * @param {boolean} recursive - Create parent directories
   * @param {number} mode - Directory mode
   * @returns {boolean}
   */
  static makeDir(path, recursive = true, mode = 0o777) {
    try {
      FS.mkdirSync(path, { recursive, mode });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove directory
   * @param {string} path - Directory path
   * @param {boolean} recursive - Remove recursively
   * @returns {boolean}
   */
  static removeDir(path, recursive = true) {
    try {
      FS.rmdirSync(path, { recursive });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * List directory contents
   * @param {string} path - Directory path
   * @param {Object} options - List options
   * @returns {Array}
   */
  static listDir(path, options = {}) {
    try {
      const entries = FS.readdirSync(path);
      const includeHidden = options.includeHidden || false;
      const includeDirs = options.includeDirs !== undefined ? options.includeDirs : true;
      const includeFiles = options.includeFiles !== undefined ? options.includeFiles : true;
      const fullPath = options.fullPath || false;
      
      let results = entries;
      if (!includeHidden) {
        results = results.filter(entry => !entry.startsWith('.'));
      }
      
      return results.map(entry => {
        const full = PATH.join(path, entry);
        const stat = FS.statSync(full);
        if (!includeDirs && stat.isDirectory()) return null;
        if (!includeFiles && stat.isFile()) return null;
        return fullPath ? full : entry;
      }).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  /**
   * List directory recursively
   * @param {string} path - Directory path
   * @param {Object} options - List options
   * @returns {Array}
   */
  static listDirRecursive(path, options = {}) {
    const results = [];
    const includeHidden = options.includeHidden || false;
    const basePath = options.basePath || '';
    
    try {
      const entries = FS.readdirSync(path);
      for (const entry of entries) {
        if (!includeHidden && entry.startsWith('.')) continue;
        const fullPath = PATH.join(path, entry);
        const relPath = basePath ? PATH.join(basePath, entry) : entry;
        const stat = FS.statSync(fullPath);
        if (stat.isDirectory()) {
          results.push({ path: fullPath, relPath, isDirectory: true });
          results.push(...DirAccess.listDirRecursive(fullPath, { ...options, basePath: relPath }));
        } else {
          results.push({ path: fullPath, relPath, isDirectory: false });
        }
      }
    } catch (error) {
      // Ignore
    }
    return results;
  }

  /**
   * Get file size
   * @param {string} path - File path
   * @returns {number}
   */
  static getSize(path) {
    try {
      const stat = FS.statSync(path);
      return stat.size;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Get directory size
   * @param {string} path - Directory path
   * @param {Object} options - Get options
   * @returns {number}
   */
  static getDirSize(path, options = {}) {
    let total = 0;
    const recursive = options.recursive !== undefined ? options.recursive : true;
    
    try {
      const entries = FS.readdirSync(path);
      for (const entry of entries) {
        const fullPath = PATH.join(path, entry);
        const stat = FS.statSync(fullPath);
        if (stat.isDirectory() && recursive) {
          total += DirAccess.getDirSize(fullPath, options);
        } else if (stat.isFile()) {
          total += stat.size;
        }
      }
    } catch (error) {
      // Ignore
    }
    return total;
  }

  /**
   * Get modification time
   * @param {string} path - File path
   * @returns {number}
   */
  static getModifiedTime(path) {
    try {
      const stat = FS.statSync(path);
      return stat.mtimeMs;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Get access time
   * @param {string} path - File path
   * @returns {number}
   */
  static getAccessTime(path) {
    try {
      const stat = FS.statSync(path);
      return stat.atimeMs;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Get creation time
   * @param {string} path - File path
   * @returns {number}
   */
  static getCreationTime(path) {
    try {
      const stat = FS.statSync(path);
      return stat.birthtimeMs;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Copy file
   * @param {string} source - Source path
   * @param {string} dest - Destination path
   * @param {Object} options - Copy options
   * @returns {boolean}
   */
  static copy(source, dest, options = {}) {
    try {
      const overwrite = options.overwrite !== undefined ? options.overwrite : true;
      if (!overwrite && FS.existsSync(dest)) {
        return false;
      }
      FS.copyFileSync(source, dest);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Copy directory recursively
   * @param {string} source - Source directory
   * @param {string} dest - Destination directory
   * @param {Object} options - Copy options
   * @returns {boolean}
   */
  static copyDir(source, dest, options = {}) {
    try {
      if (!FS.existsSync(dest)) {
        FS.mkdirSync(dest, { recursive: true });
      }
      
      const entries = FS.readdirSync(source);
      const overwrite = options.overwrite !== undefined ? options.overwrite : true;
      
      for (const entry of entries) {
        const srcPath = PATH.join(source, entry);
        const dstPath = PATH.join(dest, entry);
        const stat = FS.statSync(srcPath);
        if (stat.isDirectory()) {
          DirAccess.copyDir(srcPath, dstPath, options);
        } else {
          if (!overwrite && FS.existsSync(dstPath)) {
            continue;
          }
          FS.copyFileSync(srcPath, dstPath);
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Move file or directory
   * @param {string} source - Source path
   * @param {string} dest - Destination path
   * @param {Object} options - Move options
   * @returns {boolean}
   */
  static move(source, dest, options = {}) {
    try {
      const overwrite = options.overwrite !== undefined ? options.overwrite : true;
      if (!overwrite && FS.existsSync(dest)) {
        return false;
      }
      FS.renameSync(source, dest);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove file or directory
   * @param {string} path - File or directory path
   * @param {Object} options - Remove options
   * @returns {boolean}
   */
  static remove(path, options = {}) {
    try {
      const stat = FS.statSync(path);
      if (stat.isDirectory()) {
        FS.rmdirSync(path, { recursive: options.recursive !== undefined ? options.recursive : true });
      } else {
        FS.unlinkSync(path);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file extension
   * @param {string} path - File path
   * @returns {string}
   */
  static getFileExtension(path) {
    const parts = path.split('.');
    if (parts.length < 2) return '';
    return parts[parts.length - 1];
  }

  /**
   * Get base name without extension
   * @param {string} path - File path
   * @returns {string}
   */
  static getBaseName(path) {
    const filename = PATH.basename(path);
    const dotIdx = filename.lastIndexOf('.');
    if (dotIdx === -1) return filename;
    return filename.substring(0, dotIdx);
  }

  /**
   * Get directory name
   * @param {string} path - File path
   * @returns {string}
   */
  static getDirName(path) {
    return PATH.dirname(path);
  }

  /**
   * Normalize path
   * @param {string} path - File path
   * @returns {string}
   */
  static normalizePath(path) {
    return PATH.normalize(path);
  }

  /**
   * Join paths
   * @param {Array} parts - Path parts
   * @returns {string}
   */
  static joinPath(...parts) {
    return PATH.join(...parts);
  }

  /**
   * Check if path is absolute
   * @param {string} path - File path
   * @returns {boolean}
   */
  static isAbsolute(path) {
    return PATH.isAbsolute(path);
  }

  /**
   * Get relative path
   * @param {string} from - From path
   * @param {string} to - To path
   * @returns {string}
   */
  static getRelativePath(from, to) {
    return PATH.relative(from, to);
  }

  /**
   * Resolve path
   * @param {Array} paths - Paths to resolve
   * @returns {string}
   */
  static resolve(...paths) {
    return PATH.resolve(...paths);
  }

  /**
   * Get current directory
   * @returns {string}
   */
  get currentDir() {
    return this.#currentDir;
  }
}

module.exports = DirAccess;
