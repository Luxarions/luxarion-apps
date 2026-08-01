/**
 * Advanced object serialization and cloning utilities for Luxarion Engine.
 * Supports BigInt, Map, Set, TypedArrays, Date, RegExp, Error.
 * 
 * @module SerializeUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

export const SerializeUtils = {
    serialize(data, indent = 2) {
        return JSON.stringify(data, (key, value) => {
            if (typeof value === 'bigint') {
                return { $type: 'BigInt', value: value.toString() };
            }
            if (value instanceof Map) {
                return { $type: 'Map', value: Array.from(value.entries()) };
            }
            if (value instanceof Set) {
                return { $type: 'Set', value: Array.from(value.values()) };
            }
            if (value instanceof Date) {
                return { $type: 'Date', value: value.toISOString() };
            }
            if (value instanceof RegExp) {
                return { $type: 'RegExp', source: value.source, flags: value.flags };
            }
            if (value instanceof Error) {
                return { $type: 'Error', name: value.name, message: value.message, stack: value.stack };
            }
            if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
                return { $type: 'TypedArray', ctor: value.constructor.name, value: Array.from(value) };
            }
            return value;
        }, indent);
    },

    deserialize(jsonString) {
        if (!jsonString) return null;
        return JSON.parse(jsonString, (key, value) => {
            if (value && typeof value === 'object' && value.$type) {
                switch (value.$type) {
                    case 'BigInt':
                        return BigInt(value.value);
                    case 'Map':
                        return new Map(value.value);
                    case 'Set':
                        return new Set(value.value);
                    case 'Date':
                        return new Date(value.value);
                    case 'RegExp':
                        return new RegExp(value.source, value.flags);
                    case 'Error': {
                        const err = new Error(value.message);
                        err.name = value.name;
                        err.stack = value.stack;
                        return err;
                    }
                    case 'TypedArray': {
                        const globalObj = typeof window !== 'undefined' ? window : globalThis;
                        const Ctor = globalObj[value.ctor] || Float32Array;
                        return new Ctor(value.value);
                    }
                }
            }
            return value;
        });
    },

    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        return this.deserialize(this.serialize(obj));
    }
};

export default SerializeUtils;
