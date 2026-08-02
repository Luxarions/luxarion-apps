/**
 * LXRN IP Module
 * @namespace LXRN.IP
 * @author LXRN
 */

const IPAddress = require('./IPAddress.js');
const DNS = require('dns');

/**
 * IP utility class
 * @class IP
 */
class IP {
  /**
   * IP types
   */
  static TYPE_IPV4 = 1;
  static TYPE_IPV6 = 2;
  static TYPE_ANY = 3;

  /**
   * Resolve hostname to IP addresses
   * @static
   * @param {string} hostname - Hostname to resolve
   * @param {number} type - IP type filter
   * @returns {Promise<Array<IPAddress>>} Array of IP addresses
   */
  static resolveHostname(hostname, type = IP.TYPE_ANY) {
    return new Promise((resolve, reject) => {
      // Handle localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        resolve([new IPAddress('127.0.0.1')]);
        return;
      }
      if (hostname === '::1') {
        resolve([new IPAddress('::1')]);
        return;
      }

      // Check if already an IP address
      try {
        const addr = new IPAddress(hostname);
        resolve([addr]);
        return;
      } catch (error) {
        // Not an IP address, continue with DNS
      }

      // DNS lookup
      try {
        const family = type === IP.TYPE_IPV4 ? 4 : type === IP.TYPE_IPV6 ? 6 : 0;
        DNS.lookup(hostname, { family, all: true }, (error, addresses) => {
          if (error) {
            reject(new Error(`DNS lookup failed for ${hostname}: ${error.message}`));
            return;
          }
          const results = addresses.map(addr => new IPAddress(addr.address));
          resolve(results);
        });
      } catch (error) {
        reject(new Error(`DNS resolution not available: ${error.message}`));
      }
    });
  }

  /**
   * Synchronously resolve hostname to IP addresses
   * @static
   * @param {string} hostname - Hostname to resolve
   * @param {number} type - IP type filter
   * @returns {Array<IPAddress>} Array of IP addresses
   */
  static resolveHostnameSync(hostname, type = IP.TYPE_ANY) {
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return [new IPAddress('127.0.0.1')];
    }
    if (hostname === '::1') {
      return [new IPAddress('::1')];
    }

    try {
      const addr = new IPAddress(hostname);
      return [addr];
    } catch (error) {
      // Not an IP address
    }

    throw new Error(`Synchronous DNS resolution not available for ${hostname}`);
  }

  /**
   * Get local IP addresses
   * @static
   * @returns {Array<IPAddress>} Array of IP addresses
   */
  static getLocalAddresses() {
    const addresses = [];
    try {
      const OS = require('os');
      const ifaces = OS.networkInterfaces();
      
      for (const name in ifaces) {
        for (const iface of ifaces[name]) {
          if (iface.internal) continue;
          try {
            const addr = new IPAddress(iface.address);
            addresses.push(addr);
          } catch (error) {
            // Skip invalid addresses
          }
        }
      }
    } catch (error) {
      // Fallback to localhost
    }

    if (addresses.length === 0) {
      addresses.push(new IPAddress('127.0.0.1'));
    }
    return addresses;
  }

  /**
   * Check if string is valid IPv4 address
   * @static
   * @param {string} address - IP address string
   * @returns {boolean} True if valid IPv4
   */
  static isIPv4(address) {
    try {
      const addr = new IPAddress(address);
      return addr.isIPv4;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if string is valid IPv6 address
   * @static
   * @param {string} address - IP address string
   * @returns {boolean} True if valid IPv6
   */
  static isIPv6(address) {
    try {
      const addr = new IPAddress(address);
      return addr.isIPv6;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if address is loopback
   * @static
   * @param {string} address - IP address string
   * @returns {boolean} True if loopback
   */
  static isLoopback(address) {
    try {
      const addr = new IPAddress(address);
      return addr.isLoopback();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if address is multicast
   * @static
   * @param {string} address - IP address string
   * @returns {boolean} True if multicast
   */
  static isMulticast(address) {
    try {
      const addr = new IPAddress(address);
      return addr.isMulticast();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if address is broadcast
   * @static
   * @param {string} address - IP address string
   * @returns {boolean} True if broadcast
   */
  static isBroadcast(address) {
    try {
      const addr = new IPAddress(address);
      return addr.isBroadcast();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if address is link-local
   * @static
   * @param {string} address - IP address string
   * @returns {boolean} True if link-local
   */
  static isLinkLocal(address) {
    try {
      const addr = new IPAddress(address);
      return addr.isLinkLocal();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if address is site-local
   * @static
   * @param {string} address - IP address string
   * @returns {boolean} True if site-local
   */
  static isSiteLocal(address) {
    try {
      const addr = new IPAddress(address);
      return addr.isSiteLocal();
    } catch (error) {
      return false;
    }
  }
}

module.exports = IP;
