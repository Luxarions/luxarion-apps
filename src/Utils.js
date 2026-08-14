import { ERRORS } from './Constants.js';

export function isClass(value) {
    return typeof value === 'function' && value.toString().startsWith('class ');
}

export function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

export function isTypedArray(array) {
    return ArrayBuffer.isView(array) && !(array instanceof DataView);
}

export function isPromise(value) {
    return value && typeof value.then === 'function';
}

export function isDisposable(instance) {
    return instance && typeof instance.dispose === 'function';
}

export function isInitializable(instance) {
    return instance && typeof instance.initialize === 'function';
}

export function deepFreeze(obj) {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== null && typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });
    return obj;
}

export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Map) return new Map(Array.from(obj.entries(), ([k, v]) => [k, deepClone(v)]));
    if (obj instanceof Set) return new Set(Array.from(obj.values(), v => deepClone(v)));
    if (Array.isArray(obj)) return obj.map(v => deepClone(v));
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

export function sanitizeName(name) {
    return name.trim().replace(/\s+/g, '_');
}

export function validateVersion(version) {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(version);
}

export function generateVersion() {
    return '1.0.0';
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function isString(value) {
    return typeof value === 'string';
}

export function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value) {
    return typeof value === 'boolean';
}

export function isFunction(value) {
    return typeof value === 'function';
}

export function isObject(value) {
    return value !== null && typeof value === 'object';
}

export function isArray(value) {
    return Array.isArray(value);
}

export function isNullOrUndefined(value) {
    return value === null || value === undefined;
}

export function isEmpty(value) {
    if (isNullOrUndefined(value)) return true;
    if (isArray(value)) return value.length === 0;
    if (isObject(value)) return Object.keys(value).length === 0;
    if (isString(value)) return value.trim().length === 0;
    return false;
}

export function createError(message, code, details = null) {
    const error = new Error(message);
    error.name = 'LuxarionError';
    error.code = code;
    error.details = details;
    error.timestamp = new Date().toISOString();
    return error;
}

export function noop() {}

export function identity(value) {
    return value;
}

export function getType(value) {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

export function warn(message) {
    console.warn(`[Luxarion] ${message}`);
}

export function log(message) {
    console.log(`[Luxarion] ${message}`);
}

export function error(message) {
    console.error(`[Luxarion] ${message}`);
}

export function warnOnce(message) {
    const cache = {};
    if (cache[message]) return;
    cache[message] = true;
    warn(message);
}
