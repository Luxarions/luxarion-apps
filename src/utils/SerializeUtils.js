/**
 * Serialization utilities for Luxarion Engine.
 * Provides functions to convert between JSON, strings, and bytes with support for BigInt, Error, Map, Set.
 * 
 * @module SerializeUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * Convert value to JSON string.
 * @param {*} value - Value to serialize.
 * @param {Function} [replacer] - Custom replacer function.
 * @param {number} [space=0] - Number of spaces for indentation.
 * @returns {string} JSON string.
 */
export function toString(value, replacer = null, space = 0) {
    return JSON.stringify(value, (key, val) => {
        // Handle BigInt
        if (typeof val === 'bigint') {
            return { __bigint: val.toString() };
        }
        
        // Handle Error
        if (val instanceof Error) {
            return {
                __error: true,
                name: val.name,
                message: val.message,
                stack: val.stack,
                cause: val.cause
            };
        }
        
        // Handle Map
        if (val instanceof Map) {
            return {
                __map: true,
                entries: Array.from(val.entries())
            };
        }
        
        // Handle Set
        if (val instanceof Set) {
            return {
                __set: true,
                values: Array.from(val.values())
            };
        }
        
        // Handle RegExp
        if (val instanceof RegExp) {
            return {
                __regexp: true,
                source: val.source,
                flags: val.flags
            };
        }
        
        // Handle Date
        if (val instanceof Date) {
            return {
                __date: true,
                value: val.toISOString()
            };
        }
        
        // Call custom replacer
        if (replacer) {
            return replacer(key, val);
        }
        
        return val;
    }, space);
}

/**
 * Parse JSON string to value.
 * @param {string} str - JSON string.
 * @param {Function} [reviver] - Custom reviver function.
 * @returns {*} Parsed value.
 * @throws {SyntaxError} If JSON is malformed.
 */
export function fromString(str, reviver = null) {
    return JSON.parse(str, (key, val) => {
        if (val && typeof val === 'object') {
            // Handle BigInt
            if (val.__bigint !== undefined) {
                return BigInt(val.__bigint);
            }
            
            // Handle Error
            if (val.__error) {
                const err = new Error(val.message);
                err.name = val.name;
                err.stack = val.stack;
                if (val.cause) err.cause = val.cause;
                return err;
            }
            
            // Handle Map
            if (val.__map) {
                return new Map(val.entries);
            }
            
            // Handle Set
            if (val.__set) {
                return new Set(val.values);
            }
            
            // Handle RegExp
            if (val.__regexp) {
                return new RegExp(val.source, val.flags);
            }
            
            // Handle Date
            if (val.__date) {
                return new Date(val.value);
            }
        }
        
        // Call custom reviver
        if (reviver) {
            return reviver(key, val);
        }
        
        return val;
    });
}

/**
 * Convert value to Uint8Array bytes.
 * @param {*} value - Value to serialize.
 * @param {Function} [replacer] - Custom replacer function.
 * @returns {Uint8Array} Serialized bytes.
 */
export function toBytes(value, replacer = null) {
    const str = toString(value, replacer);
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

/**
 * Convert bytes to value.
 * @param {Uint8Array|ArrayBuffer} bytes - Bytes to deserialize.
 * @param {Function} [reviver] - Custom reviver function.
 * @returns {*} Deserialized value.
 * @throws {SyntaxError} If JSON is malformed.
 * @throws {TypeError} If bytes cannot be decoded.
 */
export function fromBytes(bytes, reviver = null) {
    const decoder = new TextDecoder();
    const str = bytes instanceof ArrayBuffer ? 
        decoder.decode(bytes) : 
        decoder.decode(bytes);
    return fromString(str, reviver);
}

/**
 * Clone a value using serialization.
 * @param {*} value - Value to clone.
 * @returns {*} Cloned value.
 */
export function clone(value) {
    return fromString(toString(value));
}

/**
 * Check if a value is serializable.
 * @param {*} value - Value to check.
 * @returns {boolean} True if serializable.
 */
export function isSerializable(value) {
    try {
        toString(value);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Default export for convenience.
 */
export default {
    toString,
    fromString,
    toBytes,
    fromBytes,
    clone,
    isSerializable
};
