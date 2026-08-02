/**
 * LXRN ProcessID Module
 * @namespace LXRN.ProcessID
 * @author LXRN
 */

/**
 * Process ID utilities
 * @class ProcessID
 */
class ProcessID {
  /**
   * Get process ID
   * @returns {number}
   */
  static getPID() {
    return process.pid;
  }

  /**
   * Get parent process ID
   * @returns {number}
   */
  static getPPID() {
    return process.ppid || -1;
  }

  /**
   * Get process name
   * @returns {string}
   */
  static getProcessName() {
    return process.title || process.argv[0];
  }

  /**
   * Get process arguments
   * @returns {Array}
   */
  static getProcessArguments() {
    return process.argv.slice(2);
  }

  /**
   * Get environment variables
   * @returns {Object}
   */
  static getEnvironment() {
    return process.env;
  }

  /**
   * Get environment variable
   * @param {string} key - Variable name
   * @param {string} defaultValue - Default value
   * @returns {string}
   */
  static getEnvironmentValue(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  /**
   * Set environment variable
   * @param {string} key - Variable name
   * @param {string} value - Variable value
   */
  static setEnvironmentValue(key, value) {
    process.env[key] = value;
  }

  /**
   * Get process ID (alias)
   * @returns {number}
   */
  static getProcessID() {
    return ProcessID.getPID();
  }

  /**
   * Get working directory
   * @returns {string}
   */
  static getWorkingDirectory() {
    return process.cwd();
  }

  /**
   * Get process uptime (seconds)
   * @returns {number}
   */
  static getProcessUptime() {
    return process.uptime();
  }

  /**
   * Get process memory usage
   * @returns {Object}
   */
  static getMemoryUsage() {
    return process.memoryUsage();
  }

  /**
   * Get CPU usage
   * @returns {Object}
   */
  static getCPUUsage() {
    return process.cpuUsage();
  }

  /**
   * Get process group ID
   * @returns {number}
   */
  static getPGID() {
    try {
      return process.getgid();
    } catch (error) {
      return -1;
    }
  }

  /**
   * Get user ID
   * @returns {number}
   */
  static getUID() {
    try {
      return process.getuid();
    } catch (error) {
      return -1;
    }
  }

  /**
   * Get group ID
   * @returns {number}
   */
  static getGID() {
    try {
      return process.getgid();
    } catch (error) {
      return -1;
    }
  }
}

module.exports = ProcessID;
