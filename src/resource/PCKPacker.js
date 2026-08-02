/**
 * LXRN PCKPacker Module
 * @namespace LXRN.PCKPacker
 * @author LXRN
 */

const StreamPeer = require('../core/StreamPeer.js');
const Compression = require('../core/Compression.js');
const FS = require('fs');
const PATH = require('path');

/**
 * PCK packer for packing resources
 * @class PCKPacker
 */
class PCKPacker {
  #files = [];
  #outputPath = '';
  #compressed = false;
  #compressionLevel = 6;
  #version = 1;
  #metadata = {};
  #encryption = false;
  #encryptionKey = null;
  #alignment = 16;

  /**
   * Add file
   * @param {string} path - File path
   * @param {Uint8Array|string} data - File data
   * @param {string} alias - Alias path
   * @returns {PCKPacker} This instance
   */
  addFile(path, data, alias = '') {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    
    const entry = {
      path: path,
      alias: alias || path,
      data: data,
      size: data.length,
      compressed: false,
      compressedSize: data.length,
      offset: 0,
    };
    this.#files.push(entry);
    return this;
  }

  /**
   * Add file from disk
   * @param {string} path - File path
   * @param {string} alias - Alias path
   * @returns {PCKPacker} This instance
   */
  addFileFromDisk(path, alias = '') {
    if (!FS.existsSync(path)) {
      throw new Error(`File not found: ${path}`);
    }
    const data = FS.readFileSync(path);
    this.addFile(alias || path, data);
    return this;
  }

  /**
   * Add directory
   * @param {string} dir - Directory path
   * @param {string} basePath - Base path
   * @param {Object} options - Add options
   * @returns {PCKPacker} This instance
   */
  addDirectory(dir, basePath = '', options = {}) {
    if (!FS.existsSync(dir)) {
      throw new Error(`Directory not found: ${dir}`);
    }
    
    const entries = FS.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = PATH.join(dir, entry);
      const stat = FS.statSync(fullPath);
      if (stat.isDirectory()) {
        if (options.recursive !== false) {
          this.addDirectory(fullPath, basePath ? `${basePath}/${entry}` : entry, options);
        }
      } else {
        const alias = basePath ? `${basePath}/${entry}` : entry;
        this.addFileFromDisk(fullPath, alias);
      }
    }
    return this;
  }

  /**
   * Set compression
   * @param {boolean} enabled - Enable compression
   * @param {number} level - Compression level
   * @returns {PCKPacker} This instance
   */
  setCompression(enabled, level = 6) {
    this.#compressed = enabled;
    this.#compressionLevel = level;
    return this;
  }

  /**
   * Set encryption
   * @param {boolean} enabled - Enable encryption
   * @param {Uint8Array} key - Encryption key
   * @returns {PCKPacker} This instance
   */
  setEncryption(enabled, key = null) {
    this.#encryption = enabled;
    this.#encryptionKey = key;
    return this;
  }

  /**
   * Set metadata
   * @param {string} key - Metadata key
   * @param {*} value - Metadata value
   * @returns {PCKPacker} This instance
   */
  setMetadata(key, value) {
    this.#metadata[key] = value;
    return this;
  }

  /**
   * Set version
   * @param {number} version - Version
   * @returns {PCKPacker} This instance
   */
  setVersion(version) {
    this.#version = version;
    return this;
  }

  /**
   * Set alignment
   * @param {number} alignment - Alignment
   * @returns {PCKPacker} This instance
   */
  setAlignment(alignment) {
    this.#alignment = Math.max(1, alignment);
    return this;
  }

  /**
   * Pack files
   * @param {string} outputPath - Output path
   * @returns {PCKPacker} This instance
   */
  pack(outputPath) {
    this.#outputPath = outputPath;
    const writer = new StreamPeer();
    
    // Write header
    writer.put32(0x50434B50); // 'PCKP'
    writer.put32(this.#version);
    writer.put32(this.#files.length);
    
    // Write metadata
    const metadataJson = JSON.stringify(this.#metadata);
    const metadataBytes = new TextEncoder().encode(metadataJson);
    writer.put32(metadataBytes.length);
    writer.putData(metadataBytes);
    
    // Calculate offsets
    let dataOffset = 16 + 8 + 4 + metadataBytes.length + (this.#files.length * 16);
    const fileEntries = [];
    
    for (const file of this.#files) {
      let data = file.data;
      let compressed = false;
      let compressedSize = data.length;
      
      // Compress if enabled
      if (this.#compressed) {
        try {
          const mode = this.#compressionLevel >= 8 ? Compression.MODE_BEST :
                       this.#compressionLevel >= 4 ? Compression.MODE_DEFAULT : Compression.MODE_FAST;
          const compressedData = Compression.compress(data, mode);
          if (compressedData.length < data.length) {
            data = compressedData;
            compressed = true;
            compressedSize = data.length;
          }
        } catch (error) {
          // Compression failed, use uncompressed
        }
      }
      
      // Encrypt if enabled
      if (this.#encryption && this.#encryptionKey) {
        const key = this.#encryptionKey;
        const encrypted = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
          encrypted[i] = data[i] ^ key[i % key.length];
        }
        data = encrypted;
      }
      
      const pathBytes = new TextEncoder().encode(file.path);
      const aliasBytes = new TextEncoder().encode(file.alias);
      
      // Align offset
      if (dataOffset % this.#alignment !== 0) {
        dataOffset += this.#alignment - (dataOffset % this.#alignment);
      }
      
      const entry = {
        path: file.path,
        alias: file.alias,
        data: data,
        size: file.size,
        compressed: compressed,
        compressedSize: compressedSize,
        offset: dataOffset,
        pathLen: pathBytes.length,
        aliasLen: aliasBytes.length,
      };
      
      fileEntries.push(entry);
      dataOffset += 4 + pathBytes.length + 4 + aliasBytes.length + 4 + data.length;
    }
    
    // Write file entries
    writer.put32(fileEntries.length);
    for (const entry of fileEntries) {
      writer.put32(entry.pathLen);
      writer.putString(entry.path);
      writer.put32(entry.aliasLen);
      writer.putString(entry.alias);
      writer.put32(entry.size);
      writer.put32(entry.compressed ? 1 : 0);
      writer.put32(entry.compressedSize);
      writer.put32(entry.offset);
    }
    
    // Write file data
    for (const entry of fileEntries) {
      writer.put32(entry.data.length);
      writer.putData(entry.data);
    }
    
    // Write to file
    FS.writeFileSync(outputPath, writer.toBytes());
    return this;
  }

  /**
   * Get file count
   * @returns {number}
   */
  get fileCount() {
    return this.#files.length;
  }

  /**
   * Get output path
   * @returns {string}
   */
  get outputPath() {
    return this.#outputPath;
  }

  /**
   * Get total size
   * @returns {number}
   */
  get totalSize() {
    let total = 0;
    for (const file of this.#files) {
      total += file.data.length;
    }
    return total;
  }
}

module.exports = PCKPacker;
