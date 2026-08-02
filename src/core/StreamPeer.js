/**
 * LXRN StreamPeer Module
 * @namespace LXRN.StreamPeer
 * @author LXRN
 */

/**
 * Stream peer for binary data serialization
 * @class StreamPeer
 */
class StreamPeer {
  #buffer = [];
  #position = 0;
  #size = 0;

  /**
   * Put 8-bit integer
   * @param {number} value - Value to put
   * @returns {StreamPeer} This instance
   */
  put8(value) {
    const arr = new Uint8Array(1);
    arr[0] = value & 0xFF;
    this.#buffer.push(arr);
    this.#size += 1;
    return this;
  }

  /**
   * Put 16-bit integer
   * @param {number} value - Value to put
   * @param {boolean} bigEndian - Use big endian
   * @returns {StreamPeer} This instance
   */
  put16(value, bigEndian = false) {
    const arr = new Uint8Array(2);
    if (bigEndian) {
      arr[0] = (value >> 8) & 0xFF;
      arr[1] = value & 0xFF;
    } else {
      arr[0] = value & 0xFF;
      arr[1] = (value >> 8) & 0xFF;
    }
    this.#buffer.push(arr);
    this.#size += 2;
    return this;
  }

  /**
   * Put 32-bit integer
   * @param {number} value - Value to put
   * @param {boolean} bigEndian - Use big endian
   * @returns {StreamPeer} This instance
   */
  put32(value, bigEndian = false) {
    const arr = new Uint8Array(4);
    if (bigEndian) {
      arr[0] = (value >> 24) & 0xFF;
      arr[1] = (value >> 16) & 0xFF;
      arr[2] = (value >> 8) & 0xFF;
      arr[3] = value & 0xFF;
    } else {
      arr[0] = value & 0xFF;
      arr[1] = (value >> 8) & 0xFF;
      arr[2] = (value >> 16) & 0xFF;
      arr[3] = (value >> 24) & 0xFF;
    }
    this.#buffer.push(arr);
    this.#size += 4;
    return this;
  }

  /**
   * Put 64-bit integer
   * @param {number|bigint} value - Value to put
   * @param {boolean} bigEndian - Use big endian
   * @returns {StreamPeer} This instance
   */
  put64(value, bigEndian = false) {
    const arr = new Uint8Array(8);
    const num = BigInt(value);
    const low = Number(num & 0xFFFFFFFFn);
    const high = Number((num >> 32n) & 0xFFFFFFFFn);
    
    if (bigEndian) {
      arr[0] = (high >> 24) & 0xFF;
      arr[1] = (high >> 16) & 0xFF;
      arr[2] = (high >> 8) & 0xFF;
      arr[3] = high & 0xFF;
      arr[4] = (low >> 24) & 0xFF;
      arr[5] = (low >> 16) & 0xFF;
      arr[6] = (low >> 8) & 0xFF;
      arr[7] = low & 0xFF;
    } else {
      arr[0] = low & 0xFF;
      arr[1] = (low >> 8) & 0xFF;
      arr[2] = (low >> 16) & 0xFF;
      arr[3] = (low >> 24) & 0xFF;
      arr[4] = high & 0xFF;
      arr[5] = (high >> 8) & 0xFF;
      arr[6] = (high >> 16) & 0xFF;
      arr[7] = (high >> 24) & 0xFF;
    }
    this.#buffer.push(arr);
    this.#size += 8;
    return this;
  }

  /**
   * Put 32-bit float
   * @param {number} value - Value to put
   * @param {boolean} bigEndian - Use big endian
   * @returns {StreamPeer} This instance
   */
  putFloat(value, bigEndian = false) {
    const arr = new Uint8Array(4);
    const view = new DataView(arr.buffer);
    view.setFloat32(0, value, !bigEndian);
    this.#buffer.push(arr);
    this.#size += 4;
    return this;
  }

  /**
   * Put 64-bit double
   * @param {number} value - Value to put
   * @param {boolean} bigEndian - Use big endian
   * @returns {StreamPeer} This instance
   */
  putDouble(value, bigEndian = false) {
    const arr = new Uint8Array(8);
    const view = new DataView(arr.buffer);
    view.setFloat64(0, value, !bigEndian);
    this.#buffer.push(arr);
    this.#size += 8;
    return this;
  }

  /**
   * Put string
   * @param {string} value - String to put
   * @param {string} encoding - Encoding to use
   * @returns {StreamPeer} This instance
   */
  putString(value, encoding = 'utf-8') {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    this.#buffer.push(bytes);
    this.#size += bytes.length;
    return this;
  }

  /**
   * Put Pascal-style string (length prefixed)
   * @param {string} value - String to put
   * @returns {StreamPeer} This instance
   */
  putPascalString(value) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    if (bytes.length > 255) {
      throw new Error('Pascal string exceeds 255 bytes');
    }
    const arr = new Uint8Array(1 + bytes.length);
    arr[0] = bytes.length;
    arr.set(bytes, 1);
    this.#buffer.push(arr);
    this.#size += 1 + bytes.length;
    return this;
  }

  /**
   * Put arbitrary data
   * @param {Uint8Array|string} data - Data to put
   * @returns {StreamPeer} This instance
   */
  putData(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    this.#buffer.push(data);
    this.#size += data.length;
    return this;
  }

  /**
   * Convert to bytes
   * @returns {Uint8Array} Bytes
   */
  toBytes() {
    if (this.#buffer.length === 0) {
      return new Uint8Array(0);
    }
    if (this.#buffer.length === 1) {
      return this.#buffer[0];
    }
    
    const total = this.#size;
    const result = new Uint8Array(total);
    let offset = 0;
    
    for (const chunk of this.#buffer) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  /**
   * Clear buffer
   * @returns {StreamPeer} This instance
   */
  clear() {
    this.#buffer = [];
    this.#position = 0;
    this.#size = 0;
    return this;
  }

  /**
   * Get current size
   * @returns {number}
   */
  get size() {
    return this.#size;
  }

  /**
   * Get current position
   * @returns {number}
   */
  get position() {
    return this.#position;
  }
}

module.exports = StreamPeer;
