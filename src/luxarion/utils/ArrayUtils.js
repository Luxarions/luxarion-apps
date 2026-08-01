/**
 * Array manipulation utilities for Luxarion Engine.
 * 
 * @module ArrayUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

export const ArrayUtils = {
    chunk(array, size) {
        if (!Array.isArray(array) || size <= 0) return [];
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    },

    compact(array) {
        if (!Array.isArray(array)) return [];
        return array.filter(Boolean);
    },

    unique(array) {
        if (!Array.isArray(array)) return [];
        return Array.from(new Set(array));
    },

    flatten(array, depth = 1) {
        if (!Array.isArray(array)) return [];
        return array.flat(depth);
    },

    sample(array) {
        if (!Array.isArray(array) || array.length === 0) return undefined;
        return array[Math.floor(Math.random() * array.length)];
    },

    shuffle(array) {
        if (!Array.isArray(array)) return [];
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    range(start, stop, step = 1) {
        if (stop === undefined) {
            stop = start;
            start = 0;
        }
        const result = [];
        for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
            result.push(i);
        }
        return result;
    }
};

export default ArrayUtils;
