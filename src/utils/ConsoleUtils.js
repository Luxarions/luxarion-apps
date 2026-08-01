/**
 * Console utility functions for Luxarion Engine.
 * Provides logging with override support and warning deduplication.
 * 
 * @module ConsoleUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * Private state using module closure.
 */
const state = {
    consoleOverride: null,
    warningCache: {},
    logLevel: 'info',
    levels: ['debug', 'info', 'warn', 'error', 'none']
};

/**
 * Set custom console function override.
 * @param {Function} fn - Custom console function (type, message, ...params).
 */
export function setConsoleOverride(fn) {
    state.consoleOverride = fn;
}

/**
 * Get current console override function.
 * @returns {Function|null} Current console override or null.
 */
export function getConsoleOverride() {
    return state.consoleOverride;
}

/**
 * Set the minimum log level.
 * @param {string} level - Log level ('debug', 'info', 'warn', 'error', 'none').
 */
export function setLogLevel(level) {
    if (state.levels.includes(level)) {
        state.logLevel = level;
    }
}

/**
 * Get the current log level.
 * @returns {string} Current log level.
 */
export function getLogLevel() {
    return state.logLevel;
}

/**
 * Check if a log level is enabled.
 * @param {string} level - Level to check.
 * @returns {boolean} True if enabled.
 */
function isLevelEnabled(level) {
    const current = state.levels.indexOf(state.logLevel);
    const target = state.levels.indexOf(level);
    return target >= current;
}

/**
 * Internal logging function.
 * @private
 * @param {string} type - Console method name.
 * @param {string} message - Message to log.
 * @param {Array} params - Additional parameters.
 */
function logInternal(type, message, params) {
    if (!isLevelEnabled(type)) return;
    
    if (state.consoleOverride) {
        state.consoleOverride(type, message, ...params);
    } else {
        console[type](message, ...params);
    }
}

/**
 * Log debug message to console.
 * @param {string} message - Message to log.
 * @param {...*} params - Additional parameters.
 */
export function debug(message, ...params) {
    logInternal('debug', message, params);
}

/**
 * Log message to console.
 * @param {string} message - Message to log.
 * @param {...*} params - Additional parameters.
 */
export function log(message, ...params) {
    logInternal('info', message, params);
}

/**
 * Log warning message to console.
 * @param {string} message - Warning message.
 * @param {...*} params - Additional parameters.
 */
export function warn(message, ...params) {
    logInternal('warn', message, params);
}

/**
 * Log error message to console.
 * @param {string} message - Error message.
 * @param {...*} params - Additional parameters.
 */
export function error(message, ...params) {
    logInternal('error', message, params);
}

/**
 * Log warning message only once (deduplicated by message).
 * @param {string} message - Warning message.
 * @param {...*} params - Additional parameters.
 */
export function warnOnce(message, ...params) {
    const key = String(message);
    if (key in state.warningCache) return;
    state.warningCache[key] = true;
    warn(message, ...params);
}

/**
 * Clear warning cache.
 */
export function clearWarnCache() {
    for (const key in state.warningCache) {
        delete state.warningCache[key];
    }
}

/**
 * Create a namespaced logger.
 * @param {string} namespace - Namespace for the logger.
 * @returns {Object} Logger instance with namespace prefix.
 */
export function createLogger(namespace) {
    return {
        debug: (message, ...params) => debug(`[${namespace}] ${message}`, ...params),
        log: (message, ...params) => log(`[${namespace}] ${message}`, ...params),
        warn: (message, ...params) => warn(`[${namespace}] ${message}`, ...params),
        error: (message, ...params) => error(`[${namespace}] ${message}`, ...params),
        warnOnce: (message, ...params) => warnOnce(`[${namespace}] ${message}`, ...params)
    };
}

/**
 * Default export for convenience.
 */
export default {
    setConsoleOverride,
    getConsoleOverride,
    setLogLevel,
    getLogLevel,
    debug,
    log,
    warn,
    error,
    warnOnce,
    clearWarnCache,
    createLogger
};
