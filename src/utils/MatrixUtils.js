/**
 * Matrix utility functions for Luxarion Engine.
 * Includes helpers for projection matrix modification and depth reversal.
 * 
 * @module MatrixUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

import {
    NEVER_DEPTH,
    ALWAYS_DEPTH,
    LESS_DEPTH,
    EQUAL_DEPTH,
    LESS_EQUAL_DEPTH,
    GREATER_DEPTH,
    GREATER_EQUAL_DEPTH,
    NOT_EQUAL_DEPTH
} from '../core/Constants.js';

/**
 * Convert projection matrix to normalized device coordinates.
 * This adjusts the matrix so that the depth range is [0,1] instead of [-1,1].
 * @param {Object} projectionMatrix - Matrix object with elements property.
 */
export function toNormalizedProjection(projectionMatrix) {
    const m = projectionMatrix.elements;
    m[2] = 0.5 * m[2] + 0.5 * m[3];
    m[6] = 0.5 * m[6] + 0.5 * m[7];
    m[10] = 0.5 * m[10] + 0.5 * m[11];
    m[14] = 0.5 * m[14] + 0.5 * m[15];
}

/**
 * Convert projection matrix to reversed depth.
 * This modifies the matrix to use reversed depth for better precision.
 * @param {Object} projectionMatrix - Matrix object with elements property.
 */
export function toReversedProjection(projectionMatrix) {
    const m = projectionMatrix.elements;
    const isPerspectiveMatrix = m[11] === -1;
    if (isPerspectiveMatrix) {
        m[10] = -m[10] - 1;
        m[14] = -m[14];
    } else {
        m[10] = -m[10];
        m[14] = -m[14] + 1;
    }
}

/**
 * Mapping from normal depth functions to reversed depth functions.
 */
export const REVERSED_DEPTH_MAP = {
    [NEVER_DEPTH]: ALWAYS_DEPTH,
    [LESS_DEPTH]: GREATER_DEPTH,
    [EQUAL_DEPTH]: NOT_EQUAL_DEPTH,
    [LESS_EQUAL_DEPTH]: GREATER_EQUAL_DEPTH,
    [ALWAYS_DEPTH]: NEVER_DEPTH,
    [GREATER_DEPTH]: LESS_DEPTH,
    [NOT_EQUAL_DEPTH]: EQUAL_DEPTH,
    [GREATER_EQUAL_DEPTH]: LESS_EQUAL_DEPTH,
};

/**
 * Get reversed depth function.
 * @param {number} depthFunc - Original depth function.
 * @returns {number} Reversed depth function.
 */
export function getReversedDepthFunc(depthFunc) {
    return REVERSED_DEPTH_MAP[depthFunc] !== undefined ?
        REVERSED_DEPTH_MAP[depthFunc] : depthFunc;
}

/**
 * Check if a projection matrix is perspective.
 * @param {Object} projectionMatrix - Matrix object with elements property.
 * @returns {boolean} True if perspective matrix.
 */
export function isPerspectiveMatrix(projectionMatrix) {
    const m = projectionMatrix.elements;
    return m[11] === -1;
}

/**
 * Check if a projection matrix is orthographic.
 * @param {Object} projectionMatrix - Matrix object with elements property.
 * @returns {boolean} True if orthographic matrix.
 */
export function isOrthographicMatrix(projectionMatrix) {
    const m = projectionMatrix.elements;
    return m[11] === 0;
}

/**
 * Extract camera frustum planes from a projection matrix.
 * @param {Object} projectionMatrix - Matrix object with elements property.
 * @param {Object} viewMatrix - View matrix object with elements property.
 * @returns {Object} Object containing frustum planes.
 */
export function extractFrustumPlanes(projectionMatrix, viewMatrix) {
    const pm = projectionMatrix.elements;
    const vm = viewMatrix.elements;
    
    // Combine projection and view matrices
    const m = [
        vm[0] * pm[0] + vm[1] * pm[4] + vm[2] * pm[8] + vm[3] * pm[12],
        vm[0] * pm[1] + vm[1] * pm[5] + vm[2] * pm[9] + vm[3] * pm[13],
        vm[0] * pm[2] + vm[1] * pm[6] + vm[2] * pm[10] + vm[3] * pm[14],
        vm[0] * pm[3] + vm[1] * pm[7] + vm[2] * pm[11] + vm[3] * pm[15],
        vm[4] * pm[0] + vm[5] * pm[4] + vm[6] * pm[8] + vm[7] * pm[12],
        vm[4] * pm[1] + vm[5] * pm[5] + vm[6] * pm[9] + vm[7] * pm[13],
        vm[4] * pm[2] + vm[5] * pm[6] + vm[6] * pm[10] + vm[7] * pm[14],
        vm[4] * pm[3] + vm[5] * pm[7] + vm[6] * pm[11] + vm[7] * pm[15],
        vm[8] * pm[0] + vm[9] * pm[4] + vm[10] * pm[8] + vm[11] * pm[12],
        vm[8] * pm[1] + vm[9] * pm[5] + vm[10] * pm[9] + vm[11] * pm[13],
        vm[8] * pm[2] + vm[9] * pm[6] + vm[10] * pm[10] + vm[11] * pm[14],
        vm[8] * pm[3] + vm[9] * pm[7] + vm[10] * pm[11] + vm[11] * pm[15],
        vm[12] * pm[0] + vm[13] * pm[4] + vm[14] * pm[8] + vm[15] * pm[12],
        vm[12] * pm[1] + vm[13] * pm[5] + vm[14] * pm[9] + vm[15] * pm[13],
        vm[12] * pm[2] + vm[13] * pm[6] + vm[14] * pm[10] + vm[15] * pm[14],
        vm[12] * pm[3] + vm[13] * pm[7] + vm[14] * pm[11] + vm[15] * pm[15]
    ];

    // Extract frustum planes
    return {
        left: [m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]],
        right: [m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]],
        bottom: [m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]],
        top: [m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]],
        near: [m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]],
        far: [m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]]
    };
}

/**
 * Default export for convenience.
 */
export default {
    toNormalizedProjection,
    toReversedProjection,
    REVERSED_DEPTH_MAP,
    getReversedDepthFunc,
    isPerspectiveMatrix,
    isOrthographicMatrix,
    extractFrustumPlanes
};
