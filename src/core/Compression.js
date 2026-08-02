/**
 * LXRN Compression Module
 * @namespace LXRN.Compression
 * @author LXRN
 */

const Pako = require('pako');
const ZstdCodec = require('zstd-codec');

/**
 * Compression utility class
 * @class Compression
 */
class Compression {
  /**
   * Compression modes
   * @static
   */
  static MODE_FAST = 1;
  static MODE_DEFAULT = 2;
  static MODE_BEST = 3;

  /**
   * Compress data using deflate
   * @static
   * @param {Uint8Array|string} data - Data to compress
   * @param {number} mode - Compression mode
   * @returns {Uint8Array} Compressed data
   */
  static compress(data, mode = Compression.MODE_DEFAULT) {
    const inputData = Compression.__prepareData(data);
    let level = 6;
    if (mode === Compression.MODE_FAST) level = 1;
    if (mode === Compression.MODE_BEST) level = 9;
    
    try {
      const compressed = Pako.deflate(inputData, { level: level });
      return compressed;
    } catch (error) {
      throw new Error(`Compression failed: ${error.message}`);
    }
  }

  /**
   * Decompress data using inflate
   * @static
   * @param {Uint8Array|string} data - Data to decompress
   * @returns {Uint8Array} Decompressed data
   */
  static decompress(data) {
    const inputData = Compression.__prepareData(data);
    
    try {
      const decompressed = Pako.inflate(inputData);
      return decompressed;
    } catch (error) {
      throw new Error(`Decompression failed: ${error.message}`);
    }
  }

  /**
   * Compress data using gzip
   * @static
   * @param {Uint8Array|string} data - Data to compress
   * @param {number} mode - Compression mode
   * @returns {Uint8Array} Compressed data
   */
  static compressGzip(data, mode = Compression.MODE_DEFAULT) {
    const inputData = Compression.__prepareData(data);
    let level = 6;
    if (mode === Compression.MODE_FAST) level = 1;
    if (mode === Compression.MODE_BEST) level = 9;
    
    try {
      const compressed = Pako.gzip(inputData, { level: level });
      return compressed;
    } catch (error) {
      throw new Error(`GZip compression failed: ${error.message}`);
    }
  }

  /**
   * Decompress gzip data
   * @static
   * @param {Uint8Array|string} data - Data to decompress
   * @returns {Uint8Array} Decompressed data
   */
  static decompressGzip(data) {
    const inputData = Compression.__prepareData(data);
    
    try {
      const decompressed = Pako.ungzip(inputData);
      return decompressed;
    } catch (error) {
      throw new Error(`GZip decompression failed: ${error.message}`);
    }
  }

  /**
   * Compress data using Zstandard
   * @static
   * @param {Uint8Array|string} data - Data to compress
   * @param {number} level - Compression level (1-22)
   * @returns {Uint8Array} Compressed data
   */
  static compressZstd(data, level = 3) {
    const inputData = Compression.__prepareData(data);
    
    try {
      const compressed = ZstdCodec.compress(inputData, level);
      return compressed;
    } catch (error) {
      throw new Error(`Zstd compression failed: ${error.message}`);
    }
  }

  /**
   * Decompress Zstandard data
   * @static
   * @param {Uint8Array|string} data - Data to decompress
   * @returns {Uint8Array} Decompressed data
   */
  static decompressZstd(data) {
    const inputData = Compression.__prepareData(data);
    
    try {
      const decompressed = ZstdCodec.decompress(inputData);
      return decompressed;
    } catch (error) {
      throw new Error(`Zstd decompression failed: ${error.message}`);
    }
  }

  /**
   * Prepare data for compression
   * @private
   * @static
   * @param {Uint8Array|string} data - Input data
   * @returns {Uint8Array} Prepared data
   */
  static __prepareData(data) {
    if (typeof data === 'string') {
      return new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      return new Uint8Array(data);
    }
    return data;
  }

  /**
   * Get compression level from mode
   * @private
   * @static
   * @param {number} mode - Compression mode
   * @returns {number} Compression level
   */
  static __getCompressionLevel(mode) {
    if (mode === Compression.MODE_FAST) return 1;
    if (mode === Compression.MODE_BEST) return 9;
    return 6;
  }
}

module.exports = Compression;
