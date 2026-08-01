/**
 * Runtime type-checking and identification helpers for Luxarion Engine.
 * 
 * @module TypeUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

export const TypeUtils = {
    getType(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return 'array';
        if (value instanceof Map) return 'map';
        if (value instanceof Set) return 'set';
        if (value instanceof Date) return 'date';
        if (value instanceof RegExp) return 'regexp';
        if (ArrayBuffer.isView(value)) return 'typedarray';
        return typeof value;
    },

    isString(value) {
        return typeof value === 'string';
    },

    isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    },

    isBoolean(value) {
        return typeof value === 'boolean';
    },

    isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },

    isFunction(value) {
        return typeof value === 'function';
    },

    isArray(value) {
        return Array.isArray(value);
    },

    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
        if (value instanceof Map || value instanceof Set) return value.size === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    isTypedArray(value) {
        return ArrayBuffer.isView(value) && !(value instanceof DataView);
    }
};

export default TypeUtils;
