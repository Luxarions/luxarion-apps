/**
 * Type utility functions for Luxarion Engine.
 * Provides type detection and name lookup based on internal type IDs.
 * 
 * @module TypeUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * Type ID mapping (matches Constants.TYPE_*)
 */
export const TYPE_IDS = {
    NIL: 0,
    BOOL: 1,
    INT: 2,
    FLOAT: 3,
    STRING: 4,
    VECTOR2: 5,
    VECTOR2I: 6,
    RECT2: 7,
    RECT2I: 8,
    VECTOR3: 9,
    VECTOR3I: 10,
    TRANSFORM2D: 11,
    VECTOR4: 12,
    VECTOR4I: 13,
    PLANE: 14,
    QUATERNION: 15,
    AABB: 16,
    BASIS: 17,
    TRANSFORM3D: 18,
    PROJECTION: 19,
    COLOR: 20,
    STRING_NAME: 21,
    NODE_PATH: 22,
    RID: 23,
    OBJECT: 24,
    CALLABLE: 25,
    SIGNAL: 26,
    DICTIONARY: 27,
    ARRAY: 28,
    PACKED_BYTE_ARRAY: 29,
    PACKED_INT32_ARRAY: 30,
    PACKED_INT64_ARRAY: 31,
    PACKED_FLOAT32_ARRAY: 32,
    PACKED_FLOAT64_ARRAY: 33,
    PACKED_STRING_ARRAY: 34,
    PACKED_VECTOR2_ARRAY: 35,
    PACKED_VECTOR3_ARRAY: 36,
    PACKED_COLOR_ARRAY: 37,
    PACKED_VECTOR4_ARRAY: 38
};

/**
 * Type name mapping.
 */
export const TYPE_NAMES = {
    0: 'nil',
    1: 'bool',
    2: 'int',
    3: 'float',
    4: 'string',
    5: 'vector2',
    6: 'vector2i',
    7: 'rect2',
    8: 'rect2i',
    9: 'vector3',
    10: 'vector3i',
    11: 'transform2d',
    12: 'vector4',
    13: 'vector4i',
    14: 'plane',
    15: 'quaternion',
    16: 'aabb',
    17: 'basis',
    18: 'transform3d',
    19: 'projection',
    20: 'color',
    21: 'string_name',
    22: 'node_path',
    23: 'rid',
    24: 'object',
    25: 'callable',
    26: 'signal',
    27: 'dictionary',
    28: 'array',
    29: 'packed_byte_array',
    30: 'packed_int32_array',
    31: 'packed_int64_array',
    32: 'packed_float32_array',
    33: 'packed_float64_array',
    34: 'packed_string_array',
    35: 'packed_vector2_array',
    36: 'packed_vector3_array',
    37: 'packed_color_array',
    38: 'packed_vector4_array'
};

/**
 * Reverse mapping from names to type IDs.
 */
export const TYPE_NAME_TO_ID = {};
for (const [id, name] of Object.entries(TYPE_NAMES)) {
    TYPE_NAME_TO_ID[name] = parseInt(id, 10);
}

/**
 * Get Luxarion type ID for a value.
 * Uses constructor.name and property detection to classify objects.
 * @param {*} value - Value to check.
 * @returns {number} Type ID.
 */
export function getTypeId(value) {
    // Handle null/undefined
    if (value === null || value === undefined) return TYPE_IDS.NIL;
    
    // Handle primitives
    if (typeof value === 'boolean') return TYPE_IDS.BOOL;
    if (typeof value === 'number') {
        if (Number.isInteger(value)) return TYPE_IDS.INT;
        return TYPE_IDS.FLOAT;
    }
    if (typeof value === 'string') return TYPE_IDS.STRING;
    if (typeof value === 'function') return TYPE_IDS.CALLABLE;
    
    // Handle objects
    if (value && typeof value === 'object') {
        const constructorName = value.constructor ? value.constructor.name : '';

        // Typed arrays
        if (value instanceof Int8Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray) {
            return TYPE_IDS.PACKED_BYTE_ARRAY;
        }
        if (value instanceof Int16Array || value instanceof Uint16Array ||
            value instanceof Int32Array || value instanceof Uint32Array) {
            return TYPE_IDS.PACKED_INT32_ARRAY;
        }
        if (value instanceof Float32Array) return TYPE_IDS.PACKED_FLOAT32_ARRAY;
        if (value instanceof Float64Array) return TYPE_IDS.PACKED_FLOAT64_ARRAY;

        // Map and Set
        if (value instanceof Map) return TYPE_IDS.DICTIONARY;
        if (value instanceof Set) return TYPE_IDS.ARRAY;

        // Custom objects by constructor name
        if (constructorName === 'Quaternion') return TYPE_IDS.QUATERNION;
        if (constructorName === 'Matrix3' || constructorName === 'Basis') return TYPE_IDS.BASIS;
        if (constructorName === 'Matrix4' || constructorName === 'Transform3D') return TYPE_IDS.TRANSFORM3D;
        if (constructorName === 'Color') return TYPE_IDS.COLOR;
        if (constructorName === 'Vector2') return TYPE_IDS.VECTOR2;
        if (constructorName === 'Vector2i') return TYPE_IDS.VECTOR2I;
        if (constructorName === 'Vector3') return TYPE_IDS.VECTOR3;
        if (constructorName === 'Vector3i') return TYPE_IDS.VECTOR3I;
        if (constructorName === 'Vector4') return TYPE_IDS.VECTOR4;
        if (constructorName === 'Vector4i') return TYPE_IDS.VECTOR4I;
        if (constructorName === 'Rect2') return TYPE_IDS.RECT2;
        if (constructorName === 'Rect2i') return TYPE_IDS.RECT2I;
        if (constructorName === 'Plane') return TYPE_IDS.PLANE;
        if (constructorName === 'AABB') return TYPE_IDS.AABB;
        if (constructorName === 'Transform2D') return TYPE_IDS.TRANSFORM2D;
        if (constructorName === 'Projection') return TYPE_IDS.PROJECTION;

        // Fallback detection based on property presence
        const hasX = 'x' in value;
        const hasY = 'y' in value;
        const hasZ = 'z' in value;
        const hasW = 'w' in value;
        const hasR = 'r' in value;
        const hasG = 'g' in value;
        const hasB = 'b' in value;

        if (hasR && hasG && hasB) return TYPE_IDS.COLOR;
        if (hasX && hasY && hasZ && hasW) return TYPE_IDS.VECTOR4;
        if (hasX && hasY && hasZ) return TYPE_IDS.VECTOR3;
        if (hasX && hasY) return TYPE_IDS.VECTOR2;

        // Array detection
        if (Array.isArray(value)) {
            if (value.length > 0) {
                const first = value[0];
                if (typeof first === 'string') return TYPE_IDS.PACKED_STRING_ARRAY;
                if (first && typeof first === 'object' && 'x' in first && 'y' in first) {
                    return TYPE_IDS.PACKED_VECTOR2_ARRAY;
                }
                if (first && typeof first === 'object' && 'r' in first && 'g' in first && 'b' in first) {
                    return TYPE_IDS.PACKED_COLOR_ARRAY;
                }
                if (first && typeof first === 'object' && 'x' in first && 'y' in first && 'z' in first) {
                    return TYPE_IDS.PACKED_VECTOR3_ARRAY;
                }
            }
            return TYPE_IDS.ARRAY;
        }

        return TYPE_IDS.OBJECT;
    }

    return TYPE_IDS.NIL;
}

/**
 * Get type name from type ID.
 * @param {number} typeId - Type ID.
 * @returns {string} Type name.
 */
export function getTypeName(typeId) {
    return TYPE_NAMES[typeId] || 'unknown';
}

/**
 * Get type ID from type name.
 * @param {string} typeName - Type name.
 * @returns {number} Type ID, or -1 if not found.
 */
export function getTypeIdFromName(typeName) {
    return TYPE_NAME_TO_ID[typeName] !== undefined ? TYPE_NAME_TO_ID[typeName] : -1;
}

/**
 * Check if value is of a specific type.
 * @param {*} value - Value to check.
 * @param {number} typeId - Type ID to compare against.
 * @returns {boolean} True if value is of the specified type.
 */
export function isType(value, typeId) {
    return getTypeId(value) === typeId;
}

/**
 * Check if value is a numeric type (int or float).
 * @param {*} value - Value to check.
 * @returns {boolean} True if value is numeric.
 */
export function isNumeric(value) {
    const id = getTypeId(value);
    return id === TYPE_IDS.INT || id === TYPE_IDS.FLOAT;
}

/**
 * Check if value is an array type.
 * @param {*} value - Value to check.
 * @returns {boolean} True if value is an array.
 */
export function isArray(value) {
    const id = getTypeId(value);
    return id === TYPE_IDS.ARRAY || 
           (id >= TYPE_IDS.PACKED_BYTE_ARRAY && id <= TYPE_IDS.PACKED_VECTOR4_ARRAY);
}

/**
 * Check if value is a vector type.
 * @param {*} value - Value to check.
 * @returns {boolean} True if value is a vector.
 */
export function isVector(value) {
    const id = getTypeId(value);
    return id === TYPE_IDS.VECTOR2 || 
           id === TYPE_IDS.VECTOR2I || 
           id === TYPE_IDS.VECTOR3 || 
           id === TYPE_IDS.VECTOR3I || 
           id === TYPE_IDS.VECTOR4 || 
           id === TYPE_IDS.VECTOR4I;
}

/**
 * Default export for convenience.
 */
export default {
    TYPE_IDS,
    TYPE_NAMES,
    TYPE_NAME_TO_ID,
    getTypeId,
    getTypeName,
    getTypeIdFromName,
    isType,
    isNumeric,
    isArray,
    isVector
};
