/**
 * Error utility functions for Luxarion Engine.
 * Provides error name lookup and a custom error class.
 * 
 * @module ErrorUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * Error name mapping from error codes.
 */
export const ERROR_NAMES = {
    0: 'OK',
    1: 'FAILED',
    2: 'ERR_UNAVAILABLE',
    3: 'ERR_UNCONFIGURED',
    4: 'ERR_UNAUTHORIZED',
    5: 'ERR_PARAMETER_RANGE_ERROR',
    6: 'ERR_OUT_OF_MEMORY',
    7: 'ERR_FILE_NOT_FOUND',
    8: 'ERR_FILE_BAD_DRIVE',
    9: 'ERR_FILE_BAD_PATH',
    10: 'ERR_FILE_NO_PERMISSION',
    11: 'ERR_FILE_ALREADY_IN_USE',
    12: 'ERR_FILE_CANT_OPEN',
    13: 'ERR_FILE_CANT_WRITE',
    14: 'ERR_FILE_CANT_READ',
    15: 'ERR_FILE_UNRECOGNIZED',
    16: 'ERR_FILE_CORRUPT',
    17: 'ERR_FILE_MISSING_DEPENDENCIES',
    18: 'ERR_FILE_EOF',
    19: 'ERR_CANT_OPEN',
    20: 'ERR_CANT_CREATE',
    21: 'ERR_QUERY_FAILED',
    22: 'ERR_ALREADY_IN_USE',
    23: 'ERR_LOCKED',
    24: 'ERR_TIMEOUT',
    25: 'ERR_CANT_CONNECT',
    26: 'ERR_CANT_RESOLVE',
    27: 'ERR_CONNECTION_ERROR',
    28: 'ERR_CANT_ACQUIRE_RESOURCE',
    29: 'ERR_CANT_FORK',
    30: 'ERR_INVALID_DATA',
    31: 'ERR_INVALID_PARAMETER',
    32: 'ERR_ALREADY_EXISTS',
    33: 'ERR_DOES_NOT_EXIST',
    34: 'ERR_DATABASE_CANT_READ',
    35: 'ERR_DATABASE_CANT_WRITE',
    36: 'ERR_COMPILATION_FAILED',
    37: 'ERR_METHOD_NOT_FOUND',
    38: 'ERR_LINK_FAILED',
    39: 'ERR_SCRIPT_FAILED',
    40: 'ERR_CYCLIC_LINK',
    41: 'ERR_INVALID_DECLARATION',
    42: 'ERR_DUPLICATE_SYMBOL',
    43: 'ERR_PARSE_ERROR',
    44: 'ERR_BUSY',
    45: 'ERR_SKIP',
    46: 'ERR_HELP',
    47: 'ERR_BUG',
    48: 'ERR_PRINTER_ON_FIRE'
};

/**
 * Get error name from error code.
 * @param {number} errorCode - Error code.
 * @returns {string} Error name, or '(invalid error code)' if not found.
 */
export function getErrorName(errorCode) {
    return ERROR_NAMES[errorCode] || '(invalid error code)';
}

/**
 * Check if error code indicates success.
 * @param {number} errorCode - Error code.
 * @returns {boolean} True if code is OK.
 */
export function isOk(errorCode) {
    return errorCode === 0;
}

/**
 * Check if error code indicates failure.
 * @param {number} errorCode - Error code.
 * @returns {boolean} True if code is not OK.
 */
export function isError(errorCode) {
    return errorCode !== 0;
}

/**
 * Check if error code is fatal.
 * @param {number} errorCode - Error code.
 * @returns {boolean} True if code >= 2.
 */
export function isFatal(errorCode) {
    return errorCode >= 2;
}

/**
 * Get error severity level.
 * @param {number} errorCode - Error code.
 * @returns {string} Severity level: 'ok', 'warning', 'error', 'fatal'.
 */
export function getErrorSeverity(errorCode) {
    if (errorCode === 0) return 'ok';
    if (errorCode === 1) return 'warning';
    if (errorCode >= 2) return 'fatal';
    return 'error';
}

/**
 * Custom Luxarion Error class.
 */
export class LuxarionError extends Error {
    /**
     * @param {number} code - Error code.
     * @param {string} [message] - Error message.
     * @param {*} [cause] - Underlying cause.
     */
    constructor(code, message, cause = null) {
        super(message || getErrorName(code));
        this.code = code;
        this.name = 'LuxarionError';
        this.cause = cause;
        
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, LuxarionError);
        }
    }

    /**
     * Check if error is OK (no error).
     * @returns {boolean} True if code is OK.
     */
    isOk() {
        return this.code === 0;
    }

    /**
     * Check if error is fatal.
     * @returns {boolean} True if code >= 2.
     */
    isFatal() {
        return this.code >= 2;
    }

    /**
     * Get the error severity level.
     * @returns {string} Severity level.
     */
    getSeverity() {
        return getErrorSeverity(this.code);
    }

    /**
     * Get the error name.
     * @returns {string} Error name.
     */
    getErrorName() {
        return getErrorName(this.code);
    }

    /**
     * Convert to string.
     * @returns {string} String representation.
     */
    toString() {
        let result = `${this.name} [${this.code}]: ${this.message}`;
        if (this.cause) {
            result += `\nCaused by: ${this.cause}`;
        }
        return result;
    }

    /**
     * Convert to JSON.
     * @returns {Object} JSON representation.
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            severity: this.getSeverity(),
            cause: this.cause,
            stack: this.stack
        };
    }

    /**
     * Create an error from a code.
     * @param {number} code - Error code.
     * @param {string} [message] - Error message.
     * @param {*} [cause] - Underlying cause.
     * @returns {LuxarionError} Error instance.
     */
    static fromCode(code, message = null, cause = null) {
        return new LuxarionError(code, message, cause);
    }

    /**
     * Create an error from a standard Error.
     * @param {Error} error - Standard error.
     * @param {number} [code=1] - Error code.
     * @returns {LuxarionError} Luxarion error.
     */
    static fromError(error, code = 1) {
        return new LuxarionError(code, error.message, error);
    }
}

/**
 * Default export for convenience.
 */
export default {
    ERROR_NAMES,
    getErrorName,
    isOk,
    isError,
    isFatal,
    getErrorSeverity,
    LuxarionError
};
