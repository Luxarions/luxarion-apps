/**
 * LXRN Delta Encoding Module
 * @namespace LXRN.DeltaEncoding
 * @author LXRN
 */

/**
 * Delta encoding utility class for variable-length integer encoding
 * @class DeltaEncoding
 */
class DeltaEncoding {
  /**
   * Encode unsigned 32-bit integer using variable-length encoding
   * @static
   * @param {Uint8Array} buffer - Output buffer
   * @param {number} value - Value to encode
   * @returns {Uint8Array} Encoded buffer
   */
  static encodeUint32(buffer, value) {
    const view = new DataView(buffer.buffer);
    let offset = 0;
    let val = value >>> 0;
    
    while (val >= 0x80) {
      view.setUint8(offset++, (val & 0x7F) | 0x80);
      val >>= 7;
    }
    view.setUint8(offset++, val & 0x7F);
    return buffer.slice(0, offset);
  }

  /**
   * Decode unsigned 32-bit integer from variable-length encoding
   * @static
   * @param {Uint8Array} buffer - Input buffer
   * @param {number} offset - Starting offset
   * @returns {Object} {value, offset}
   */
  static decodeUint32(buffer, offset = 0) {
    const view = new DataView(buffer.buffer);
    let value = 0;
    let shift = 0;
    let byte;
    
    do {
      if (offset >= buffer.length) {
        throw new Error('Delta decode: unexpected end of buffer');
      }
      byte = view.getUint8(offset++);
      value |= (byte & 0x7F) << shift;
      shift += 7;
      if (shift > 35) {
        throw new Error('Delta decode overflow');
      }
    } while (byte & 0x80);
    
    return { value, offset };
  }

  /**
   * Encode signed 32-bit integer using zigzag + variable-length encoding
   * @static
   * @param {Uint8Array} buffer - Output buffer
   * @param {number} value - Value to encode
   * @returns {Uint8Array} Encoded buffer
   */
  static encodeSint32(buffer, value) {
    const zigzag = (value << 1) ^ (value >> 31);
    return DeltaEncoding.encodeUint32(buffer, zigzag >>> 0);
  }

  /**
   * Decode signed 32-bit integer from zigzag + variable-length encoding
   * @static
   * @param {Uint8Array} buffer - Input buffer
   * @param {number} offset - Starting offset
   * @returns {Object} {value, offset}
   */
  static decodeSint32(buffer, offset = 0) {
    const result = DeltaEncoding.decodeUint32(buffer, offset);
    const value = result.value;
    const decoded = (value >>> 1) ^ -(value & 1);
    return { value: decoded, offset: result.offset };
  }

  /**
   * Encode unsigned 64-bit integer using variable-length encoding
   * @static
   * @param {Uint8Array} buffer - Output buffer
   * @param {number|bigint} value - Value to encode
   * @returns {Uint8Array} Encoded buffer
   */
  static encodeUint64(buffer, value) {
    const view = new DataView(buffer.buffer);
    let offset = 0;
    const low = Number(value & 0xFFFFFFFFn);
    const high = Number((value >> 32n) & 0xFFFFFFFFn);
    
    if (high === 0) {
      return DeltaEncoding.encodeUint32(buffer, low);
    }
    
    view.setUint8(offset++, (low & 0x7F) | 0x80);
    view.setUint8(offset++, ((low >> 7) & 0x7F) | 0x80);
    view.setUint8(offset++, ((low >> 14) & 0x7F) | 0x80);
    view.setUint8(offset++, ((low >> 21) & 0x7F) | 0x80);
    view.setUint8(offset++, ((low >> 28) & 0x0F) | 0x80);
    
    let h = high;
    while (h >= 0x80) {
      view.setUint8(offset++, (h & 0x7F) | 0x80);
      h >>= 7;
    }
    view.setUint8(offset++, h & 0x7F);
    return buffer.slice(0, offset);
  }

  /**
   * Decode unsigned 64-bit integer from variable-length encoding
   * @static
   * @param {Uint8Array} buffer - Input buffer
   * @param {number} offset - Starting offset
   * @returns {Object} {value, offset}
   */
  static decodeUint64(buffer, offset = 0) {
    const view = new DataView(buffer.buffer);
    let value = 0n;
    let shift = 0;
    let byte;
    
    do {
      if (offset >= buffer.length) {
        throw new Error('Delta decode: unexpected end of buffer');
      }
      byte = view.getUint8(offset++);
      value |= BigInt(byte & 0x7F) << BigInt(shift);
      shift += 7;
      if (shift > 70) {
        throw new Error('Delta decode overflow');
      }
    } while (byte & 0x80);
    
    return { value, offset };
  }

  /**
   * Encode signed 64-bit integer using zigzag + variable-length encoding
   * @static
   * @param {Uint8Array} buffer - Output buffer
   * @param {number|bigint} value - Value to encode
   * @returns {Uint8Array} Encoded buffer
   */
  static encodeSint64(buffer, value) {
    const zigzag = (BigInt(value) << 1n) ^ (BigInt(value) >> 63n);
    return DeltaEncoding.encodeUint64(buffer, zigzag >>> 0n);
  }

  /**
   * Decode signed 64-bit integer from zigzag + variable-length encoding
   * @static
   * @param {Uint8Array} buffer - Input buffer
   * @param {number} offset - Starting offset
   * @returns {Object} {value, offset}
   */
  static decodeSint64(buffer, offset = 0) {
    const result = DeltaEncoding.decodeUint64(buffer, offset);
    const value = result.value;
    const decoded = (value >> 1n) ^ -(value & 1n);
    return { value: Number(decoded), offset: result.offset };
  }

  /**
   * Encode 32-bit float
   * @static
   * @param {Uint8Array} buffer - Output buffer
   * @param {number} value - Value to encode
   * @returns {Uint8Array} Encoded buffer
   */
  static encodeFloat32(buffer, value) {
    const view = new DataView(buffer.buffer);
    view.setFloat32(0, value, true);
    return buffer.slice(0, 4);
  }

  /**
   * Decode 32-bit float
   * @static
   * @param {Uint8Array} buffer - Input buffer
   * @param {number} offset - Starting offset
   * @returns {Object} {value, offset}
   */
  static decodeFloat32(buffer, offset = 0) {
    const view = new DataView(buffer.buffer);
    const value = view.getFloat32(offset, true);
    return { value, offset: offset + 4 };
  }

  /**
   * Encode 64-bit double
   * @static
   * @param {Uint8Array} buffer - Output buffer
   * @param {number} value - Value to encode
   * @returns {Uint8Array} Encoded buffer
   */
  static encodeFloat64(buffer, value) {
    const view = new DataView(buffer.buffer);
    view.setFloat64(0, value, true);
    return buffer.slice(0, 8);
  }

  /**
   * Decode 64-bit double
   * @static
   * @param {Uint8Array} buffer - Input buffer
   * @param {number} offset - Starting offset
   * @returns {Object} {value, offset}
   */
  static decodeFloat64(buffer, offset = 0) {
    const view = new DataView(buffer.buffer);
    const value = view.getFloat64(offset, true);
    return { value, offset: offset + 8 };
  }

  /**
   * Encode string with length prefix
   * @static
   * @param {Uint8Array} buffer - Output buffer
   * @param {string} value - String to encode
   * @returns {Uint8Array} Encoded buffer
   */
  static encodeString(buffer, value) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const lenBytes = DeltaEncoding.encodeUint32(new Uint8Array(5), bytes.length);
    const result = new Uint8Array(lenBytes.length + bytes.length);
    result.set(lenBytes, 0);
    result.set(bytes, lenBytes.length);
    return result;
  }

  /**
   * Decode string with length prefix
   * @static
   * @param {Uint8Array} buffer - Input buffer
   * @param {number} offset - Starting offset
   * @returns {Object} {value, offset}
   */
  static decodeString(buffer, offset = 0) {
    const lenResult = DeltaEncoding.decodeUint32(buffer, offset);
    const length = lenResult.value;
    offset = lenResult.offset;
    
    if (offset + length > buffer.length) {
      throw new Error('Delta decode: string length exceeds buffer');
    }
    
    const decoder = new TextDecoder();
    const value = decoder.decode(buffer.slice(offset, offset + length));
    return { value, offset: offset + length };
  }
}

module.exports = DeltaEncoding;
