/**
 * Matrix operations and 3D projection utilities for Luxarion Engine.
 * Supports 4x4, 3x3 matrices, camera matrices, perspective/orthographic projections,
 * reversed depth buffer conversions, and frustum plane extraction.
 * 
 * @module MatrixUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { MATH_CONSTANTS } from '../core/Constants.js';

export const MatrixUtils = {
    /**
     * Create identity 4x4 matrix
     */
    identity4() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    },

    /**
     * Multiply 4x4 matrix A by B (out = A * B)
     */
    multiply4(a, b, out = new Float32Array(16)) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return out;
    },

    /**
     * Perspective projection matrix
     */
    perspective(fovyRad, aspect, near, far, out = new Float32Array(16)) {
        const f = 1.0 / Math.tan(fovyRad / 2);
        const nf = 1 / (near - far);

        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;

        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;

        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;

        out[12] = 0;
        out[13] = 0;
        out[14] = 2 * far * near * nf;
        out[15] = 0;

        return out;
    },

    /**
     * Orthographic projection matrix
     */
    ortho(left, right, bottom, top, near, far, out = new Float32Array(16)) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);

        out[0] = -2 * lr;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;

        out[4] = 0;
        out[5] = -2 * bt;
        out[6] = 0;
        out[7] = 0;

        out[8] = 0;
        out[9] = 0;
        out[10] = 2 * nf;
        out[11] = 0;

        out[12] = (left + right) * lr;
        out[13] = (top + bottom) * bt;
        out[14] = (far + near) * nf;
        out[15] = 1;

        return out;
    },

    /**
     * Convert standard projection matrix to Reversed Depth Z-Buffer projection matrix
     */
    toReversedProjection(projMatrix, out = new Float32Array(16)) {
        out.set(projMatrix);
        // Reverse z mapping: z = -1 -> z = 1, z = 1 -> z = 0
        out[10] = -out[10];
        out[14] = -out[14];
        return out;
    },

    /**
     * Convert WebGL (-1 to 1) Z depth projection to WebGPU / normalized Z (0 to 1) depth
     */
    toNormalizedProjection(projMatrix, out = new Float32Array(16)) {
        out.set(projMatrix);
        out[10] = projMatrix[10] * 0.5;
        out[14] = projMatrix[14] * 0.5 + 0.5;
        return out;
    },

    /**
     * Look-at camera view matrix
     */
    lookAt(eye, center, up, out = new Float32Array(16)) {
        const [eyex, eyey, eyez] = eye;
        const [centerx, centery, centerz] = center;
        const [upx, upy, upz] = up;

        let z0 = eyex - centerx;
        let z1 = eyey - centery;
        let z2 = eyez - centerz;
        let len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len; z1 *= len; z2 *= len;

        let x0 = upy * z2 - upz * z1;
        let x1 = upz * z0 - upx * z2;
        let x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
            x0 = 0; x1 = 0; x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len; x1 *= len; x2 *= len;
        }

        let y0 = z1 * x2 - z2 * x1;
        let y1 = z2 * x0 - z0 * x2;
        let y2 = z0 * x1 - z1 * x0;
        len = Math.hypot(y0, y1, y2);
        if (!len) {
            y0 = 0; y1 = 0; y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len; y1 *= len; y2 *= len;
        }

        out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
        out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
        out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;

        return out;
    },

    /**
     * Translation matrix
     */
    translation(x, y, z, out = new Float32Array(16)) {
        const m = this.identity4();
        m[12] = x;
        m[13] = y;
        m[14] = z;
        return m;
    },

    /**
     * Rotation matrix around XYZ Euler angles (radians)
     */
    rotationXYZ(rx, ry, rz, out = new Float32Array(16)) {
        const cx = Math.cos(rx), sx = Math.sin(rx);
        const cy = Math.cos(ry), sy = Math.sin(ry);
        const cz = Math.cos(rz), sz = Math.sin(rz);

        out[0] = cy * cz;
        out[1] = cy * sz;
        out[2] = -sy;
        out[3] = 0;

        out[4] = sx * sy * cz - cx * sz;
        out[5] = sx * sy * sz + cx * cz;
        out[6] = sx * cy;
        out[7] = 0;

        out[8] = cx * sy * cz + sx * sz;
        out[9] = cx * sy * sz - sx * cz;
        out[10] = cx * cy;
        out[11] = 0;

        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;

        return out;
    },

    /**
     * Scaling matrix
     */
    scaling(sx, sy, sz, out = new Float32Array(16)) {
        const m = this.identity4();
        m[0] = sx;
        m[5] = sy;
        m[10] = sz;
        return m;
    },

    /**
     * Extract 6 Frustum planes from ViewProjection matrix
     */
    extractFrustumPlanes(vpMatrix) {
        const m = vpMatrix;
        const planes = [];

        // Left, Right, Bottom, Top, Near, Far
        const rawPlanes = [
            [m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]],
            [m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]],
            [m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]],
            [m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]],
            [m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]],
            [m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]]
        ];

        for (const [a, b, c, d] of rawPlanes) {
            const length = Math.hypot(a, b, c);
            planes.push({
                normal: [a / length, b / length, c / length],
                constant: d / length
            });
        }

        return planes;
    }
};

export default MatrixUtils;
