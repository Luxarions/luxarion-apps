/**
 * LXRN StreamPeerGZip Module
 * @namespace LXRN.StreamPeerGZip
 * @author LXRN
 */

const StreamPeer = require('./StreamPeer.js');
const Compression = require('./Compression.js');

/**
 * Stream peer with GZip compression
 * @class StreamPeerGZip
 * @extends StreamPeer
 */
class StreamPeerGZip extends StreamPeer {
  #source = null;
  #compressed = false;
  #decompressed = false;
  #sourceData = null;

  /**
   * Create a GZip stream peer
   * @param {Uint8Array|StreamPeer} source - Source data
   */
  constructor(source = null) {
    super();
    this.#source = source;
    
    if (source) {
      this.#sourceData = source instanceof StreamPeer ? source.toBytes() : source;
    } else {
      this.#sourceData = null;
    }
  }

  /**
   * Compress data using GZip
   * @param {number} mode - Compression mode
   * @returns {StreamPeerGZip} This instance
   */
  compress(mode = Compression.MODE_DEFAULT) {
    if (this.#sourceData) {
      const compressed = Compression.compressGzip(this.#sourceData, mode);
      this.#buffer = [compressed];
      this.#size = compressed.length;
      this.#compressed = true;
      return this;
    }
    
    const data = this.toBytes();
    const compressed = Compression.compressGzip(data, mode);
    this.#buffer = [compressed];
    this.#size = compressed.length;
    this.#compressed = true;
    return this;
  }

  /**
   * Decompress GZip data
   * @returns {StreamPeerGZip} This instance
   */
  decompress() {
    const data = this.toBytes();
    const decompressed = Compression.decompressGzip(data);
    this.#buffer = [decompressed];
    this.#size = decompressed.length;
    this.#decompressed = true;
    return this;
  }

  /**
   * Convert to bytes
   * @returns {Uint8Array} Bytes
   */
  toBytes() {
    if (this.#sourceData && !this.#compressed && !this.#decompressed) {
      return this.#sourceData;
    }
    return super.toBytes();
  }

  /**
   * Check if compressed
   * @returns {boolean}
   */
  get isCompressed() {
    return this.#compressed;
  }

  /**
   * Check if decompressed
   * @returns {boolean}
   */
  get isDecompressed() {
    return this.#decompressed;
  }
}

module.exports = StreamPeerGZip;
