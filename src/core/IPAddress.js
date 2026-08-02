/**
 * LXRN IP Address Module
 * @namespace LXRN.IPAddress
 * @author LXRN
 */

/**
 * IP Address class supporting IPv4 and IPv6
 * @class IPAddress
 */
class IPAddress {
  #address = '';
  #bytes = null;
  #isIPv6 = false;

  /**
   * Create an IP address
   * @param {string} address - IP address string
   */
  constructor(address = '0.0.0.0') {
    this.#address = address;
    this.__parse(address);
  }

  /**
   * Parse IP address string
   * @private
   * @param {string} address - IP address string
   */
  __parse(address) {
    if (address.includes(':')) {
      this.#isIPv6 = true;
      this.#bytes = this.__parseIPv6(address);
    } else {
      this.#isIPv6 = false;
      this.#bytes = this.__parseIPv4(address);
    }
  }

  /**
   * Parse IPv4 address
   * @private
   * @param {string} address - IPv4 address string
   * @returns {Uint8Array} Bytes array
   */
  __parseIPv4(address) {
    const parts = address.split('.');
    if (parts.length !== 4) {
      throw new Error(`Invalid IPv4 address: ${address}`);
    }
    
    const bytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      const val = parseInt(parts[i], 10);
      if (isNaN(val) || val < 0 || val > 255) {
        throw new Error(`Invalid IPv4 octet: ${parts[i]}`);
      }
      bytes[i] = val;
    }
    return bytes;
  }

  /**
   * Parse IPv6 address
   * @private
   * @param {string} address - IPv6 address string
   * @returns {Uint8Array} Bytes array
   */
  __parseIPv6(address) {
    let parts = address.split(':');
    if (parts.length < 3 || parts.length > 8) {
      throw new Error(`Invalid IPv6 address: ${address}`);
    }
    
    const bytes = new Uint8Array(16);
    let idx = 0;
    let skipIdx = -1;
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '') {
        if (skipIdx !== -1) {
          throw new Error(`Invalid IPv6 address: ${address}`);
        }
        skipIdx = idx;
        continue;
      }
      
      const val = parseInt(parts[i], 16);
      if (isNaN(val) || val < 0 || val > 0xFFFF) {
        throw new Error(`Invalid IPv6 hex: ${parts[i]}`);
      }
      bytes[idx++] = (val >> 8) & 0xFF;
      bytes[idx++] = val & 0xFF;
    }
    
    if (skipIdx !== -1) {
      const remaining = 16 - idx;
      const end = skipIdx + remaining;
      const segment = bytes.slice(skipIdx, idx);
      bytes.set(segment, end);
      for (let i = skipIdx; i < end; i++) {
        bytes[i] = 0;
      }
    }
    return bytes;
  }

  /**
   * Find longest zero run in IPv6 parts
   * @private
   * @param {Array} parts - IPv6 parts
   * @returns {Object} {start, length}
   */
  __findLongestZeroRun(parts) {
    let longestStart = -1;
    let longestLen = 0;
    let currentStart = -1;
    let currentLen = 0;
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 0) {
        if (currentStart === -1) {
          currentStart = i;
          currentLen = 1;
        } else {
          currentLen++;
        }
      } else {
        if (currentLen > longestLen) {
          longestStart = currentStart;
          longestLen = currentLen;
        }
        currentStart = -1;
        currentLen = 0;
      }
    }
    
    if (currentLen > longestLen) {
      longestStart = currentStart;
      longestLen = currentLen;
    }
    return { start: longestStart, length: longestLen };
  }

  /**
   * Check if IPv4
   * @returns {boolean}
   */
  get isIPv4() {
    return !this.#isIPv6;
  }

  /**
   * Check if IPv6
   * @returns {boolean}
   */
  get isIPv6() {
    return this.#isIPv6;
  }

  /**
   * Convert to string
   * @returns {string} IP address string
   */
  toString() {
    if (this.#isIPv6) {
      const parts = [];
      for (let i = 0; i < 16; i += 2) {
        parts.push((this.#bytes[i] << 8) | this.#bytes[i + 1]);
      }
      
      let str = parts.map(p => p.toString(16)).join(':');
      const longestZero = this.__findLongestZeroRun(parts);
      
      if (longestZero.length >= 2) {
        const before = parts.slice(0, longestZero.start);
        const after = parts.slice(longestZero.start + longestZero.length);
        str = before.map(p => p.toString(16)).join(':');
        str += '::';
        str += after.map(p => p.toString(16)).join(':');
      }
      return str;
    }
    return this.#bytes.join('.');
  }

  /**
   * Get bytes representation
   * @returns {Uint8Array} Bytes
   */
  toBytes() {
    return new Uint8Array(this.#bytes);
  }

  /**
   * Check equality with another IP address
   * @param {IPAddress} other - Other IP address
   * @returns {boolean} True if equal
   */
  equals(other) {
    if (!(other instanceof IPAddress)) return false;
    if (this.#isIPv6 !== other.#isIPv6) return false;
    if (this.#bytes.length !== other.#bytes.length) return false;
    
    for (let i = 0; i < this.#bytes.length; i++) {
      if (this.#bytes[i] !== other.#bytes[i]) return false;
    }
    return true;
  }

  /**
   * Check if loopback address
   * @returns {boolean}
   */
  isLoopback() {
    if (this.#isIPv6) {
      return this.#bytes.every(b => b === 0) || 
             (this.#bytes[0] === 0 && this.#bytes[1] === 0 && 
              this.#bytes[2] === 0 && this.#bytes[3] === 0 && 
              this.#bytes[4] === 0 && this.#bytes[5] === 0 && 
              this.#bytes[6] === 0 && this.#bytes[7] === 0 && 
              this.#bytes[8] === 0 && this.#bytes[9] === 0 && 
              this.#bytes[10] === 0 && this.#bytes[11] === 0 && 
              this.#bytes[12] === 0 && this.#bytes[13] === 0 && 
              this.#bytes[14] === 0 && this.#bytes[15] === 1);
    }
    return this.#bytes[0] === 127;
  }

  /**
   * Check if multicast address
   * @returns {boolean}
   */
  isMulticast() {
    if (this.#isIPv6) {
      return this.#bytes[0] === 0xFF;
    }
    return (this.#bytes[0] & 0xF0) === 0xE0;
  }

  /**
   * Check if broadcast address
   * @returns {boolean}
   */
  isBroadcast() {
    if (this.#isIPv6) return false;
    return this.#bytes.every(b => b === 255);
  }

  /**
   * Check if link-local address
   * @returns {boolean}
   */
  isLinkLocal() {
    if (this.#isIPv6) {
      return this.#bytes[0] === 0xFE && (this.#bytes[1] & 0xC0) === 0x80;
    }
    return this.#bytes[0] === 169 && this.#bytes[1] === 254;
  }

  /**
   * Check if site-local address
   * @returns {boolean}
   */
  isSiteLocal() {
    if (this.#isIPv6) {
      return this.#bytes[0] === 0xFE && (this.#bytes[1] & 0xC0) === 0xC0;
    }
    return (this.#bytes[0] === 10) ||
           (this.#bytes[0] === 172 && this.#bytes[1] >= 16 && this.#bytes[1] <= 31) ||
           (this.#bytes[0] === 192 && this.#bytes[1] === 168);
  }

  /**
   * Parse IP address from string
   * @static
   * @param {string} address - IP address string
   * @returns {IPAddress} IPAddress instance
   */
  static parse(address) {
    return new IPAddress(address);
  }

  /**
   * Create IP address from bytes
   * @static
   * @param {Uint8Array} bytes - IP address bytes
   * @returns {IPAddress} IPAddress instance
   */
  static fromBytes(bytes) {
    if (bytes.length === 4) {
      const parts = Array.from(bytes);
      return new IPAddress(parts.join('.'));
    } else if (bytes.length === 16) {
      const parts = [];
      for (let i = 0; i < 16; i += 2) {
        parts.push((bytes[i] << 8) | bytes[i + 1]);
      }
      let str = parts.map(p => p.toString(16)).join(':');
      return new IPAddress(str);
    }
    throw new Error('Invalid byte length for IP address');
  }
}

module.exports = IPAddress;
