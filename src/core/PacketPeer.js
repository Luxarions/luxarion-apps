/**
 * LXRN PacketPeer Module
 * @namespace LXRN.PacketPeer
 * @author LXRN
 */

const StreamPeer = require('./StreamPeer.js');
const DeltaEncoding = require('./DeltaEncoding.js');

/**
 * Packet peer for handling packets
 * @class PacketPeer
 */
class PacketPeer {
  #packets = [];
  #encodeBuffer = new StreamPeer();
  #decodeBuffer = new StreamPeer();
  #encodePosition = 0;
  #decodePosition = 0;

  /**
   * Put packet
   * @param {Uint8Array|string} data - Packet data
   * @returns {PacketPeer} This instance
   */
  putPacket(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    this.#packets.push(data);
    return this;
  }

  /**
   * Get packet
   * @returns {Uint8Array|null} Packet data or null
   */
  getPacket() {
    if (this.#packets.length === 0) {
      return null;
    }
    return this.#packets.shift();
  }

  /**
   * Get available packet count
   * @returns {number}
   */
  getAvailablePacketCount() {
    return this.#packets.length;
  }

  /**
   * Put variable type
   * @param {*} data - Data to encode
   * @returns {PacketPeer} This instance
   */
  putVar(data) {
    if (typeof data === 'string') {
      const encoded = DeltaEncoding.encodeString(new Uint8Array(1024), data);
      this.#encodeBuffer.putData(encoded);
    } else if (typeof data === 'number') {
      if (Number.isInteger(data)) {
        if (data >= 0 && data <= 0xFFFFFFFF) {
          const encoded = DeltaEncoding.encodeUint32(new Uint8Array(5), data);
          this.#encodeBuffer.putData(encoded);
        } else {
          const encoded = DeltaEncoding.encodeUint64(new Uint8Array(10), BigInt(data));
          this.#encodeBuffer.putData(encoded);
        }
      } else {
        const arr = new Uint8Array(8);
        const view = new DataView(arr.buffer);
        view.setFloat64(0, data, true);
        this.#encodeBuffer.putData(arr);
      }
    } else if (typeof data === 'boolean') {
      this.#encodeBuffer.put8(data ? 1 : 0);
    } else if (data instanceof Uint8Array) {
      const len = DeltaEncoding.encodeUint32(new Uint8Array(5), data.length);
      this.#encodeBuffer.putData(len);
      this.#encodeBuffer.putData(data);
    } else if (data === null || data === undefined) {
      this.#encodeBuffer.put8(0);
    } else if (Array.isArray(data)) {
      const len = DeltaEncoding.encodeUint32(new Uint8Array(5), data.length);
      this.#encodeBuffer.putData(len);
      for (const item of data) {
        this.putVar(item);
      }
    } else if (typeof data === 'object') {
      const keys = Object.keys(data);
      const len = DeltaEncoding.encodeUint32(new Uint8Array(5), keys.length);
      this.#encodeBuffer.putData(len);
      for (const key of keys) {
        this.putVar(key);
        this.putVar(data[key]);
      }
    } else {
      throw new Error(`Unsupported type for putVar: ${typeof data}`);
    }
    return this;
  }

  /**
   * Get variable type
   * @returns {*} Decoded data
   */
  getVar() {
    if (this.#decodeBuffer.size === 0) {
      return null;
    }
    
    const data = this.#decodeBuffer.toBytes();
    this.#decodeBuffer.clear();
    
    const type = data[0];
    const offset = 1;
    
    if (type === 0) return null;
    if (type === 1) return true;
    if (type === 2) return false;
    
    if (type === 3) {
      const result = DeltaEncoding.decodeUint32(data, offset);
      return result.value;
    }
    
    if (type === 4) {
      const result = DeltaEncoding.decodeUint64(data, offset);
      return Number(result.value);
    }
    
    if (type === 5) {
      const view = new DataView(data.buffer);
      return view.getFloat64(offset, true);
    }
    
    if (type === 6) {
      const result = DeltaEncoding.decodeString(data, offset);
      return result.value;
    }
    
    if (type === 7) {
      const lenResult = DeltaEncoding.decodeUint32(data, offset);
      const len = lenResult.value;
      const start = lenResult.offset;
      return data.slice(start, start + len);
    }
    
    if (type === 8) {
      const lenResult = DeltaEncoding.decodeUint32(data, offset);
      const len = lenResult.value;
      const arr = [];
      let pos = lenResult.offset;
      for (let i = 0; i < len; i++) {
        const item = this.getVar();
        arr.push(item);
      }
      return arr;
    }
    
    if (type === 9) {
      const lenResult = DeltaEncoding.decodeUint32(data, offset);
      const len = lenResult.value;
      const obj = {};
      for (let i = 0; i < len; i++) {
        const key = this.getVar();
        const value = this.getVar();
        obj[key] = value;
      }
      return obj;
    }
    
    throw new Error(`Unknown var type: ${type}`);
  }

  /**
   * Encode data
   * @returns {Uint8Array} Encoded data
   */
  encode() {
    const data = this.#encodeBuffer.toBytes();
    this.#encodeBuffer.clear();
    return data;
  }

  /**
   * Decode data
   * @param {Uint8Array|string} data - Data to decode
   * @returns {PacketPeer} This instance
   */
  decode(data) {
    if (typeof data === 'string') {
      data = new TextEncoder().encode(data);
    }
    if (!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }
    this.#decodeBuffer.clear();
    this.#decodeBuffer.putData(data);
    return this;
  }

  /**
   * Clear buffers
   * @returns {PacketPeer} This instance
   */
  clear() {
    this.#packets = [];
    this.#encodeBuffer.clear();
    this.#decodeBuffer.clear();
    return this;
  }

  /**
   * Get packet count
   * @returns {number}
   */
  get packetCount() {
    return this.#packets.length;
  }
}

module.exports = PacketPeer;
