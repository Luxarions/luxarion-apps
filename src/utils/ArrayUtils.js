/**
 * Array utility functions for Luxarion Engine.
 * All functions are pure and stateless.
 * 
 * @module ArrayUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * Typed array constructors mapping for dynamic creation.
 */
const TYPED_ARRAYS = {
    Int8Array: Int8Array,
    Uint8Array: Uint8Array,
    Uint8ClampedArray: Uint8ClampedArray,
    Int16Array: Int16Array,
    Uint16Array: Uint16Array,
    Int32Array: Int32Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array
};

/**
 * Find minimum value in array.
 * @param {number[]|Float32Array|Float64Array} array - Array of numbers.
 * @returns {number} Minimum value, or Infinity if array is empty.
 */
export function min(array) {
    if (array.length === 0) return Infinity;
    let result = array[0];
    for (let i = 1; i < array.length; ++i) {
        if (array[i] < result) result = array[i];
    }
    return result;
}

/**
 * Find maximum value in array.
 * @param {number[]|Float32Array|Float64Array} array - Array of numbers.
 * @returns {number} Maximum value, or -Infinity if array is empty.
 */
export function max(array) {
    if (array.length === 0) return -Infinity;
    let result = array[0];
    for (let i = 1; i < array.length; ++i) {
        if (array[i] > result) result = array[i];
    }
    return result;
}

/**
 * Check if array needs Uint32 indices (contains values >= 65535).
 * @param {number[]|Uint16Array|Uint32Array} array - Array of indices.
 * @returns {boolean} True if array contains values >= 65535.
 */
export function needsUint32(array) {
    for (let i = array.length - 1; i >= 0; --i) {
        if (array[i] >= 65535) return true;
    }
    return false;
}

/**
 * Get typed array from buffer.
 * @param {string} type - Typed array constructor name.
 * @param {ArrayBuffer} buffer - Buffer to create view from.
 * @param {number} [byteOffset=0] - Byte offset.
 * @param {number} [length] - Length of the view.
 * @returns {TypedArray} Typed array view.
 * @throws {Error} If type is unknown.
 */
export function getTypedArray(type, buffer, byteOffset = 0, length = undefined) {
    const Constructor = TYPED_ARRAYS[type];
    if (!Constructor) {
        throw new Error(`Unknown typed array type: ${type}`);
    }
    return new Constructor(buffer, byteOffset, length);
}

/**
 * Check if value is a typed array.
 * @param {*} value - Value to check.
 * @returns {boolean} True if value is a typed array.
 */
export function isTypedArray(value) {
    return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

/**
 * Calculate sum of array elements.
 * @param {number[]|Float32Array|Float64Array} array - Array of numbers.
 * @returns {number} Sum of all elements.
 */
export function sum(array) {
    let result = 0;
    for (let i = 0; i < array.length; i++) {
        result += array[i];
    }
    return result;
}

/**
 * Calculate average of array elements.
 * @param {number[]|Float32Array|Float64Array} array - Array of numbers.
 * @returns {number} Average of all elements, or 0 if array is empty.
 */
export function average(array) {
    if (array.length === 0) return 0;
    return sum(array) / array.length;
}

/**
 * Create a new array with unique values.
 * @param {Array} array - Array to deduplicate.
 * @returns {Array} Array with unique values.
 */
export function unique(array) {
    return [...new Set(array)];
}

/**
 * Chunk an array into smaller arrays of specified size.
 * @param {Array} array - Array to chunk.
 * @param {number} size - Chunk size.
 * @returns {Array<Array>} Array of chunks.
 */
export function chunk(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

/**
 * Flatten an array of arrays.
 * @param {Array} array - Array to flatten.
 * @param {number} [depth=1] - Depth to flatten.
 * @returns {Array} Flattened array.
 */
export function flatten(array, depth = 1) {
    return array.flat(depth);
}

/**
 * Get the last element of an array.
 * @param {Array} array - Array to get last element from.
 * @returns {*} Last element, or undefined if empty.
 */
export function last(array) {
    return array[array.length - 1];
}

/**
 * Check if an array is empty.
 * @param {Array} array - Array to check.
 * @returns {boolean} True if array is empty.
 */
export function isEmpty(array) {
    return !array || array.length === 0;
}

/**
 * Create a range array from start to end (exclusive).
 * @param {number} start - Start value.
 * @param {number} end - End value (exclusive).
 * @param {number} [step=1] - Step value.
 * @returns {Array} Range array.
 */
export function range(start, end, step = 1) {
    const result = [];
    if (step > 0) {
        for (let i = start; i < end; i += step) {
            result.push(i);
        }
    } else {
        for (let i = start; i > end; i += step) {
            result.push(i);
        }
    }
    return result;
}

/**
 * Default export for convenience.
 */
export default {
    min,
    max,
    needsUint32,
    getTypedArray,
    isTypedArray,
    sum,
    average,
    unique,
    chunk,
    flatten,
    last,
    isEmpty,
    range
};
