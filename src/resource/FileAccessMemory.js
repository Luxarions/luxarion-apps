/**
 * LXRN FileAccessMemory Module
 * @namespace LXRN.FileAccessMemory
 * @author LXRN
 */

const FS = require('fs');
const PATH = require('path');

/**
 * In-memory file access
 * @class FileAccessMemory
 */
class FileAccessMemory {
  #files = new Map();
  #openFiles = new Map();
  #handleId = 0;
  #maxSize = 100 * 1024 * 1024; // 100MB
  #currentSize = 0;
  #readOnly = false;

  /**
   * Create file
   * @param {string} path - File path
   * @param {Uint8Array|string} data - File data
   * @param {Object} options - Create options
   * @returns {FileAccessMemory} This instance
   */
  createFile(path, data = null, options = {}) {
    if (this.#readOnly) {
      throw new Error('Memory filesystem is read-only');
    }
    
    if (data === null) {
      data = new Uint8Array(0);
    } else if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    } else if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    this.#checkSize(data.length);
    this.#files.set(path, data);
    this.#currentSize += data.length;
    return this;
  }

  /**
   * Check size limit
   * @private
   * @param {number} size - Size to add
   */
  __checkSize(size) {
    if (this.#currentSize + size > this.#maxSize) {
      throw new Error(`Memory limit exceeded: ${this.#maxSize} bytes`);
    }
  }

  /**
   * Delete file
   * @param {string} path - File path
   * @returns {boolean}
   */
  deleteFile(path) {
    if (this.#readOnly) {
      throw new Error('Memory filesystem is read-only');
    }
    
    const data = this.#files.get(path);
    if (data) {
      this.#currentSize -= data.length;
    }
    return this.#files.delete(path);
  }

  /**
   * Check if file exists
   * @param {string} path - File path
   * @returns {boolean}
   */
  fileExists(path) {
    return this.#files.has(path);
  }

  /**
   * Get file data
   * @param {string} path - File path
   * @returns {Uint8Array|null}
   */
  getFile(path) {
    const data = this.#files.get(path);
    return data ? new Uint8Array(data) : null;
  }

  /**
   * Get file as text
   * @param {string} path - File path
   * @returns {string|null}
   */
  getFileText(path) {
    const data = this.getFile(path);
    if (!data) return null;
    return new TextDecoder().decode(data);
  }

  /**
   * Set file data
   * @param {string} path - File path
   * @param {Uint8Array|string} data - File data
   * @param {Object} options - Set options
   * @returns {FileAccessMemory} This instance
   */
  setFile(path, data, options = {}) {
    if (this.#readOnly) {
      throw new Error('Memory filesystem is read-only');
    }
    
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    const oldData = this.#files.get(path);
    if (oldData) {
      this.#currentSize -= oldData.length;
    }
    this.#checkSize(data.length);
    this.#files.set(path, data);
    this.#currentSize += data.length;
    return this;
  }

  /**
   * Open file
   * @param {string} path - File path
   * @param {string} mode - Open mode ('r', 'w', 'a')
   * @returns {string} File handle
   */
  openFile(path, mode = 'r') {
    if (mode === 'r' && !this.#files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    
    let data = this.#files.get(path) || new Uint8Array(0);
    if (mode === 'w') {
      data = new Uint8Array(0);
    }
    
    const handleId = ++this.#handleId;
    const handle = {
      id: handleId,
      path: path,
      data: data,
      position: mode === 'a' ? data.length : 0,
      mode: mode,
      size: data.length,
    };
    
    this.#openFiles.set(handleId, handle);
    return String(handleId);
  }

  /**
   * Close file
   * @param {string} handle - File handle
   * @returns {boolean}
   */
  closeFile(handle) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (file) {
      // Save changes
      if (file.mode !== 'r') {
        this.#files.set(file.path, file.data);
      }
      this.#openFiles.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Read file
   * @param {string} handle - File handle
   * @param {number} size - Number of bytes to read
   * @returns {Uint8Array}
   */
  readFile(handle, size = -1) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    
    if (size === -1) {
      const result = file.data.slice(file.position);
      file.position = file.data.length;
      return result;
    }
    
    const end = Math.min(file.position + size, file.data.length);
    const result = file.data.slice(file.position, end);
    file.position = end;
    return result;
  }

  /**
   * Write to file
   * @param {string} handle - File handle
   * @param {Uint8Array|string} data - Data to write
   * @returns {FileAccessMemory} This instance
   */
  writeFile(handle, data) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    
    if (file.mode === 'r') {
      throw new Error('File opened in read-only mode');
    }
    
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    const newData = new Uint8Array(file.position + data.length);
    newData.set(file.data.slice(0, file.position), 0);
    newData.set(data, file.position);
    file.data = newData;
    file.position += data.length;
    file.size = newData.length;
    
    // Update in memory
    this.#files.set(file.path, file.data);
    return this;
  }

  /**
   * Seek to position
   * @param {string} handle - File handle
   * @param {number} position - Position
   */
  seek(handle, position) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    if (position < 0) position = 0;
    if (position > file.data.length) position = file.data.length;
    file.position = position;
  }

  /**
   * Get position
   * @param {string} handle - File handle
   * @returns {number}
   */
  getPosition(handle) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    return file.position;
  }

  /**
   * Get file size
   * @param {string} handle - File handle
   * @returns {number}
   */
  getSize(handle) {
    const id = parseInt(handle, 10);
    const file = this.#openFiles.get(id);
    if (!file) {
      throw new Error('Invalid file handle');
    }
    return file.data.length;
  }

  /**
   * List files
   * @param {string} path - Directory path
   * @param {Object} options - List options
   * @returns {Array}
   */
  listFiles(path = '', options = {}) {
    const results = [];
    const recursive = options.recursive || false;
    
    for (const key of this.#files.keys()) {
      const matchPath = path === '' || key.startsWith(path);
      if (matchPath) {
        const relative = path === '' ? key : key.substring(path.length + 1);
        if (!recursive && relative.includes('/')) continue;
        results.push(key);
      }
    }
    return results;
  }

  /**
   * Clear all files
   * @returns {FileAccessMemory} This instance
   */
  clear() {
    this.#files.clear();
    this.#openFiles.clear();
    this.#currentSize = 0;
    return this;
  }

  /**
   * Import directory
   * @param {string} dir - Directory path
   * @param {string} basePath - Base path
   * @param {Object} options - Import options
   * @returns {FileAccessMemory} This instance
   */
  importDirectory(dir, basePath = '', options = {}) {
    if (!FS.existsSync(dir)) {
      throw new Error(`Directory not found: ${dir}`);
    }
    
    const entries = FS.readdirSync(dir);
    const recursive = options.recursive !== undefined ? options.recursive : true;
    
    for (const entry of entries) {
      const fullPath = PATH.join(dir, entry);
      const stat = FS.statSync(fullPath);
      if (stat.isDirectory() && recursive) {
        this.importDirectory(fullPath, basePath ? `${basePath}/${entry}` : entry, options);
      } else if (stat.isFile()) {
        const path = basePath ? `${basePath}/${entry}` : entry;
        const data = FS.readFileSync(fullPath);
        this.setFile(path, data);
      }
    }
    return this;
  }

  /**
   * Export directory
   * @param {string} dir - Directory path
   * @param {Object} options - Export options
   * @returns {FileAccessMemory} This instance
   */
  exportDirectory(dir, options = {}) {
    if (!FS.existsSync(dir)) {
      FS.mkdirSync(dir, { recursive: true });
    }
    
    const overwrite = options.overwrite !== undefined ? options.overwrite : true;
    
    for (const [path, data] of this.#files) {
      const fullPath = PATH.join(dir, path);
      const parent = PATH.dirname(fullPath);
      if (!FS.existsSync(parent)) {
        FS.mkdirSync(parent, { recursive: true });
      }
      
      if (FS.existsSync(fullPath) && !overwrite) {
        continue;
      }
      FS.writeFileSync(fullPath, data);
    }
    return this;
  }

  /**
   * Set max memory size
   * @param {number} size - Max size in bytes
   * @returns {FileAccessMemory} This instance
   */
  setMaxSize(size) {
    this.#maxSize = size;
    return this;
  }

  /**
   * Set read-only mode
   * @param {boolean} readOnly - Read-only mode
   * @returns {FileAccessMemory} This instance
   */
  setReadOnly(readOnly) {
    this.#readOnly = readOnly;
    return this;
  }

  /**
   * Get file count
   * @returns {number}
   */
  get fileCount() {
    return this.#files.size;
  }

  /**
   * Get open file count
   * @returns {number}
   */
  get openCount() {
    return this.#openFiles.size;
  }

  /**
   * Get current memory usage
   * @returns {number}
   */
  get memoryUsage() {
    return this.#currentSize;
  }
}

module.exports = FileAccessMemory;
