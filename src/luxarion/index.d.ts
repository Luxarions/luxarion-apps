/**
 * Luxarion Engine - TypeScript Declaration File
 * 
 * This file provides complete type definitions for the Luxarion Engine.
 * All modules, classes, interfaces, and utility functions are fully typed
 * for maximum TypeScript support and developer experience.
 * 
 * @module luxarion-engine
 * @author Luxarion Labs
 * @version 1.0.0
 */

export type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;

/**
 * Engine version information
 */
export interface Version {
    /** The version string (e.g., "1.0.0") */
    VERSION: string;
    /** Engine name */
    NAME: string;
    /** Vendor name */
    VENDOR: string;
    /** Major version number */
    MAJOR: number;
    /** Minor version number */
    MINOR: number;
    /** Patch version number */
    PATCH: number;
    /** Version branch (major.minor) */
    BRANCH: string;
    /** Full version number */
    NUMBER: string;
    /** Release status (stable, beta, alpha) */
    STATUS: string;
    /** Build type (official, dev) */
    BUILD: string;
    /** Complete version name */
    FULL_NAME: string;
    /** Website URL */
    WEBSITE: string;
    /** Documentation URL */
    DOCS_URL: string;
    /** Git commit hash */
    HASH: string;
    /** Build timestamp */
    TIMESTAMP: number;
    /** Convert to string */
    toString(): string;
}

/**
 * Core engine constants
 * All constants are defined in UPPER_SNAKE_CASE following JavaScript conventions
 */
export interface Constants {
    /** Engine version string */
    VERSION: string;
    /** Engine name */
    NAME: string;
    /** Vendor name */
    VENDOR: string;
    /** Engine website URL */
    ENGINE_URL: string;
    /** Engine documentation URL */
    ENGINE_DOCS: string;

    /** Depth comparison: never pass */
    NEVER_DEPTH: 0;
    /** Depth comparison: always pass */
    ALWAYS_DEPTH: 1;
    /** Depth comparison: pass if less */
    LESS_DEPTH: 2;
    /** Depth comparison: pass if less or equal */
    LESS_EQUAL_DEPTH: 3;
    /** Depth comparison: pass if equal */
    EQUAL_DEPTH: 4;
    /** Depth comparison: pass if greater or equal */
    GREATER_EQUAL_DEPTH: 5;
    /** Depth comparison: pass if greater */
    GREATER_DEPTH: 6;
    /** Depth comparison: pass if not equal */
    NOT_EQUAL_DEPTH: 7;

    /** Depth functions mapping for easy lookup */
    DEPTH_FUNCTIONS: {
        NEVER: 0;
        ALWAYS: 1;
        LESS: 2;
        LESS_EQUAL: 3;
        EQUAL: 4;
        GREATER_EQUAL: 5;
        GREATER: 6;
        NOT_EQUAL: 7;
    };

    /** No face culling */
    CULL_FACE_NONE: 0;
    /** Cull back faces */
    CULL_FACE_BACK: 1;
    /** Cull front faces */
    CULL_FACE_FRONT: 2;
    /** Cull both front and back faces */
    CULL_FACE_FRONT_BACK: 3;

    /** Basic shadow map (no filtering) */
    BASIC_SHADOW_MAP: 0;
    /** Percentage-closer filtering shadow map */
    PCF_SHADOW_MAP: 1;
    /** Soft PCF shadow map */
    PCF_SOFT_SHADOW_MAP: 2;
    /** Variance shadow map */
    VSM_SHADOW_MAP: 3;

    /** Render front side only */
    FRONT_SIDE: 0;
    /** Render back side only */
    BACK_SIDE: 1;
    /** Render both sides */
    DOUBLE_SIDE: 2;

    /** No blending */
    NO_BLENDING: 0;
    /** Normal blending (alpha compositing) */
    NORMAL_BLENDING: 1;
    /** Additive blending */
    ADDITIVE_BLENDING: 2;
    /** Subtractive blending */
    SUBTRACTIVE_BLENDING: 3;
    /** Multiply blending */
    MULTIPLY_BLENDING: 4;
    /** Custom blending */
    CUSTOM_BLENDING: 5;
    /** Material-defined blending */
    MATERIAL_BLENDING: 6;

    /** Add blend equation */
    ADD_EQUATION: 100;
    /** Subtract blend equation */
    SUBTRACT_EQUATION: 101;
    /** Reverse subtract blend equation */
    REVERSE_SUBTRACT_EQUATION: 102;
    /** Minimum blend equation */
    MIN_EQUATION: 103;
    /** Maximum blend equation */
    MAX_EQUATION: 104;

    /** Zero blend factor */
    ZERO_FACTOR: 200;
    /** One blend factor */
    ONE_FACTOR: 201;
    /** Source color blend factor */
    SRC_COLOR_FACTOR: 202;
    /** One minus source color blend factor */
    ONE_MINUS_SRC_COLOR_FACTOR: 203;
    /** Source alpha blend factor */
    SRC_ALPHA_FACTOR: 204;
    /** One minus source alpha blend factor */
    ONE_MINUS_SRC_ALPHA_FACTOR: 205;
    /** Destination alpha blend factor */
    DST_ALPHA_FACTOR: 206;
    /** One minus destination alpha blend factor */
    ONE_MINUS_DST_ALPHA_FACTOR: 207;
    /** Destination color blend factor */
    DST_COLOR_FACTOR: 208;
    /** One minus destination color blend factor */
    ONE_MINUS_DST_COLOR_FACTOR: 209;
    /** Source alpha saturate blend factor */
    SRC_ALPHA_SATURATE_FACTOR: 210;
    /** Constant color blend factor */
    CONSTANT_COLOR_FACTOR: 211;
    /** One minus constant color blend factor */
    ONE_MINUS_CONSTANT_COLOR_FACTOR: 212;
    /** Constant alpha blend factor */
    CONSTANT_ALPHA_FACTOR: 213;
    /** One minus constant alpha blend factor */
    ONE_MINUS_CONSTANT_ALPHA_FACTOR: 214;

    /** Multiply blend operation */
    MULTIPLY_OPERATION: 0;
    /** Mix blend operation */
    MIX_OPERATION: 1;
    /** Add blend operation */
    ADD_OPERATION: 2;

    /** No tone mapping */
    NO_TONE_MAPPING: 0;
    /** Linear tone mapping */
    LINEAR_TONE_MAPPING: 1;
    /** Reinhard tone mapping */
    REINHARD_TONE_MAPPING: 2;
    /** Cineon tone mapping */
    CINEON_TONE_MAPPING: 3;
    /** ACES Filmic tone mapping */
    ACES_FILMIC_TONE_MAPPING: 4;
    /** Custom tone mapping */
    CUSTOM_TONE_MAPPING: 5;
    /** AGX tone mapping */
    AGX_TONE_MAPPING: 6;
    /** Neutral tone mapping */
    NEUTRAL_TONE_MAPPING: 7;

    /** Tone mapping options grouped */
    TONE_MAPPING_OPTIONS: {
        NONE: 0;
        LINEAR: 1;
        REINHARD: 2;
        CINEON: 3;
        ACES_FILMIC: 4;
        CUSTOM: 5;
        AGX: 6;
        NEUTRAL: 7;
    };

    /** Attached uniform buffer binding mode */
    ATTACHED_BIND_MODE: 'attached';
    /** Detached uniform buffer binding mode */
    DETACHED_BIND_MODE: 'detached';

    /** UV texture mapping */
    UV_MAPPING: 300;
    /** Cube reflection mapping */
    CUBE_REFLECTION_MAPPING: 301;
    /** Cube refraction mapping */
    CUBE_REFRACTION_MAPPING: 302;
    /** Equirectangular reflection mapping */
    EQUIRECTANGULAR_REFLECTION_MAPPING: 303;
    /** Equirectangular refraction mapping */
    EQUIRECTANGULAR_REFRACTION_MAPPING: 304;
    /** Cube UV reflection mapping */
    CUBE_UV_REFLECTION_MAPPING: 306;

    /** Repeat texture wrapping */
    REPEAT_WRAPPING: 1000;
    /** Clamp to edge texture wrapping */
    CLAMP_TO_EDGE_WRAPPING: 1001;
    /** Mirrored repeat texture wrapping */
    MIRRORED_REPEAT_WRAPPING: 1002;

    /** Nearest texture filtering */
    NEAREST_FILTER: 1003;
    /** Nearest mipmap nearest texture filtering */
    NEAREST_MIPMAP_NEAREST_FILTER: 1004;
    /** Nearest mipmap linear texture filtering */
    NEAREST_MIPMAP_LINEAR_FILTER: 1005;
    /** Linear texture filtering */
    LINEAR_FILTER: 1006;
    /** Linear mipmap nearest texture filtering */
    LINEAR_MIPMAP_NEAREST_FILTER: 1007;
    /** Linear mipmap linear texture filtering */
    LINEAR_MIPMAP_LINEAR_FILTER: 1008;

    /** Unsigned byte pixel type */
    UNSIGNED_BYTE_TYPE: 1009;
    /** Byte pixel type */
    BYTE_TYPE: 1010;
    /** Short pixel type */
    SHORT_TYPE: 1011;
    /** Unsigned short pixel type */
    UNSIGNED_SHORT_TYPE: 1012;
    /** Integer pixel type */
    INT_TYPE: 1013;
    /** Unsigned integer pixel type */
    UNSIGNED_INT_TYPE: 1014;
    /** Float pixel type */
    FLOAT_TYPE: 1015;
    /** Half float pixel type */
    HALF_FLOAT_TYPE: 1016;
    /** Unsigned short 4-4-4-4 pixel type */
    UNSIGNED_SHORT_4444_TYPE: 1017;
    /** Unsigned short 5-5-5-1 pixel type */
    UNSIGNED_SHORT_5551_TYPE: 1018;
    /** Unsigned int 24-8 pixel type */
    UNSIGNED_INT_248_TYPE: 1020;
    /** Unsigned int 5-9-9-9 pixel type */
    UNSIGNED_INT_5999_TYPE: 35902;
    /** Unsigned int 10-11-11 pixel type */
    UNSIGNED_INT_101111_TYPE: 35899;

    /** Pixel types grouped */
    PIXEL_TYPES: {
        UNSIGNED_BYTE: 1009;
        BYTE: 1010;
        SHORT: 1011;
        UNSIGNED_SHORT: 1012;
        INT: 1013;
        UNSIGNED_INT: 1014;
        FLOAT: 1015;
        HALF_FLOAT: 1016;
        UNSIGNED_SHORT_4444: 1017;
        UNSIGNED_SHORT_5551: 1018;
        UNSIGNED_INT_248: 1020;
        UNSIGNED_INT_5999: 35902;
        UNSIGNED_INT_101111: 35899;
    };

    /** Alpha pixel format */
    ALPHA_FORMAT: 1021;
    /** RGB pixel format */
    RGB_FORMAT: 1022;
    /** RGBA pixel format */
    RGBA_FORMAT: 1023;
    /** Depth pixel format */
    DEPTH_FORMAT: 1026;
    /** Depth stencil pixel format */
    DEPTH_STENCIL_FORMAT: 1027;
    /** Red pixel format */
    RED_FORMAT: 1028;
    /** Red integer pixel format */
    RED_INTEGER_FORMAT: 1029;
    /** RG pixel format */
    RG_FORMAT: 1030;
    /** RG integer pixel format */
    RG_INTEGER_FORMAT: 1031;
    /** RGB integer pixel format */
    RGB_INTEGER_FORMAT: 1032;
    /** RGBA integer pixel format */
    RGBA_INTEGER_FORMAT: 1033;

    /** Pixel formats grouped */
    PIXEL_FORMATS: {
        ALPHA: 1021;
        RGB: 1022;
        RGBA: 1023;
        DEPTH: 1026;
        DEPTH_STENCIL: 1027;
        RED: 1028;
        RED_INTEGER: 1029;
        RG: 1030;
        RG_INTEGER: 1031;
        RGB_INTEGER: 1032;
        RGBA_INTEGER: 1033;
    };

    /** RGB S3TC DXT1 compressed format */
    RGB_S3TC_DXT1_FORMAT: 33776;
    /** RGBA S3TC DXT1 compressed format */
    RGBA_S3TC_DXT1_FORMAT: 33777;
    /** RGBA S3TC DXT3 compressed format */
    RGBA_S3TC_DXT3_FORMAT: 33778;
    /** RGBA S3TC DXT5 compressed format */
    RGBA_S3TC_DXT5_FORMAT: 33779;
    /** RGB PVRTC 4bpp compressed format */
    RGB_PVRTC_4BPPV1_FORMAT: 35840;
    /** RGB PVRTC 2bpp compressed format */
    RGB_PVRTC_2BPPV1_FORMAT: 35841;
    /** RGBA PVRTC 4bpp compressed format */
    RGBA_PVRTC_4BPPV1_FORMAT: 35842;
    /** RGBA PVRTC 2bpp compressed format */
    RGBA_PVRTC_2BPPV1_FORMAT: 35843;
    /** RGB ETC1 compressed format */
    RGB_ETC1_FORMAT: 36196;
    /** RGB ETC2 compressed format */
    RGB_ETC2_FORMAT: 37492;
    /** RGBA ETC2 EAC compressed format */
    RGBA_ETC2_EAC_FORMAT: 37496;
    /** R11 EAC compressed format */
    R11_EAC_FORMAT: 37488;
    /** Signed R11 EAC compressed format */
    SIGNED_R11_EAC_FORMAT: 37489;
    /** RG11 EAC compressed format */
    RG11_EAC_FORMAT: 37490;
    /** Signed RG11 EAC compressed format */
    SIGNED_RG11_EAC_FORMAT: 37491;
    /** RGBA ASTC 4x4 compressed format */
    RGBA_ASTC_4X4_FORMAT: 37808;
    /** RGBA ASTC 5x4 compressed format */
    RGBA_ASTC_5X4_FORMAT: 37809;
    /** RGBA ASTC 5x5 compressed format */
    RGBA_ASTC_5X5_FORMAT: 37810;
    /** RGBA ASTC 6x5 compressed format */
    RGBA_ASTC_6X5_FORMAT: 37811;
    /** RGBA ASTC 6x6 compressed format */
    RGBA_ASTC_6X6_FORMAT: 37812;
    /** RGBA ASTC 8x5 compressed format */
    RGBA_ASTC_8X5_FORMAT: 37813;
    /** RGBA ASTC 8x6 compressed format */
    RGBA_ASTC_8X6_FORMAT: 37814;
    /** RGBA ASTC 8x8 compressed format */
    RGBA_ASTC_8X8_FORMAT: 37815;
    /** RGBA ASTC 10x5 compressed format */
    RGBA_ASTC_10X5_FORMAT: 37816;
    /** RGBA ASTC 10x6 compressed format */
    RGBA_ASTC_10X6_FORMAT: 37817;
    /** RGBA ASTC 10x8 compressed format */
    RGBA_ASTC_10X8_FORMAT: 37818;
    /** RGBA ASTC 10x10 compressed format */
    RGBA_ASTC_10X10_FORMAT: 37819;
    /** RGBA ASTC 12x10 compressed format */
    RGBA_ASTC_12X10_FORMAT: 37820;
    /** RGBA ASTC 12x12 compressed format */
    RGBA_ASTC_12X12_FORMAT: 37821;
    /** RGBA BPTC compressed format */
    RGBA_BPTC_FORMAT: 36492;
    /** RGB BPTC signed compressed format */
    RGB_BPTC_SIGNED_FORMAT: 36494;
    /** RGB BPTC unsigned compressed format */
    RGB_BPTC_UNSIGNED_FORMAT: 36495;
    /** Red RGTC1 compressed format */
    RED_RGTC1_FORMAT: 36283;
    /** Signed red RGTC1 compressed format */
    SIGNED_RED_RGTC1_FORMAT: 36284;
    /** Red-green RGTC2 compressed format */
    RED_GREEN_RGTC2_FORMAT: 36285;
    /** Signed red-green RGTC2 compressed format */
    SIGNED_RED_GREEN_RGTC2_FORMAT: 36286;

    /** Loop once animation mode */
    LOOP_ONCE: 2200;
    /** Loop repeat animation mode */
    LOOP_REPEAT: 2201;
    /** Loop ping-pong animation mode */
    LOOP_PING_PONG: 2202;

    /** Discrete interpolation */
    INTERPOLATE_DISCRETE: 2300;
    /** Linear interpolation */
    INTERPOLATE_LINEAR: 2301;
    /** Smooth interpolation */
    INTERPOLATE_SMOOTH: 2302;
    /** Bezier interpolation */
    INTERPOLATE_BEZIER: 2303;

    /** Zero curvature ending */
    ZERO_CURVATURE_ENDING: 2400;
    /** Zero slope ending */
    ZERO_SLOPE_ENDING: 2401;
    /** Wrap around ending */
    WRAP_AROUND_ENDING: 2402;

    /** Normal animation blend mode */
    NORMAL_ANIMATION_BLEND_MODE: 2500;
    /** Additive animation blend mode */
    ADDITIVE_ANIMATION_BLEND_MODE: 2501;

    /** Triangles draw mode */
    TRIANGLES_DRAW_MODE: 0;
    /** Triangle strip draw mode */
    TRIANGLE_STRIP_DRAW_MODE: 1;
    /** Triangle fan draw mode */
    TRIANGLE_FAN_DRAW_MODE: 2;

    /** Basic depth packing */
    BASIC_DEPTH_PACKING: 3200;
    /** RGBA depth packing */
    RGBA_DEPTH_PACKING: 3201;
    /** RGB depth packing */
    RGB_DEPTH_PACKING: 3202;
    /** RG depth packing */
    RG_DEPTH_PACKING: 3203;

    /** Tangent space normal map */
    TANGENT_SPACE_NORMAL_MAP: 0;
    /** Object space normal map */
    OBJECT_SPACE_NORMAL_MAP: 1;

    /** No color space */
    NO_COLOR_SPACE: '';
    /** sRGB color space */
    SRGB_COLOR_SPACE: 'srgb';
    /** Linear sRGB color space */
    LINEAR_SRGB_COLOR_SPACE: 'srgb-linear';
    /** Linear transfer function */
    LINEAR_TRANSFER: 'linear';
    /** sRGB transfer function */
    SRGB_TRANSFER: 'srgb';

    /** No normal packing */
    NO_NORMAL_PACKING: '';
    /** RG normal packing */
    NORMAL_RG_PACKING: 'rg';
    /** GA normal packing */
    NORMAL_GA_PACKING: 'ga';

    /** Stencil operation: zero */
    ZERO_STENCIL_OP: 0;
    /** Stencil operation: keep */
    KEEP_STENCIL_OP: 7680;
    /** Stencil operation: replace */
    REPLACE_STENCIL_OP: 7681;
    /** Stencil operation: increment */
    INCREMENT_STENCIL_OP: 7682;
    /** Stencil operation: decrement */
    DECREMENT_STENCIL_OP: 7683;
    /** Stencil operation: increment wrap */
    INCREMENT_WRAP_STENCIL_OP: 34055;
    /** Stencil operation: decrement wrap */
    DECREMENT_WRAP_STENCIL_OP: 34056;
    /** Stencil operation: invert */
    INVERT_STENCIL_OP: 5386;

    /** Stencil function: never */
    NEVER_STENCIL_FUNC: 512;
    /** Stencil function: less */
    LESS_STENCIL_FUNC: 513;
    /** Stencil function: equal */
    EQUAL_STENCIL_FUNC: 514;
    /** Stencil function: less or equal */
    LESS_EQUAL_STENCIL_FUNC: 515;
    /** Stencil function: greater */
    GREATER_STENCIL_FUNC: 516;
    /** Stencil function: not equal */
    NOT_EQUAL_STENCIL_FUNC: 517;
    /** Stencil function: greater or equal */
    GREATER_EQUAL_STENCIL_FUNC: 518;
    /** Stencil function: always */
    ALWAYS_STENCIL_FUNC: 519;

    /** Compare function: never */
    NEVER_COMPARE: 512;
    /** Compare function: less */
    LESS_COMPARE: 513;
    /** Compare function: equal */
    EQUAL_COMPARE: 514;
    /** Compare function: less or equal */
    LESS_EQUAL_COMPARE: 515;
    /** Compare function: greater */
    GREATER_COMPARE: 516;
    /** Compare function: not equal */
    NOT_EQUAL_COMPARE: 517;
    /** Compare function: greater or equal */
    GREATER_EQUAL_COMPARE: 518;
    /** Compare function: always */
    ALWAYS_COMPARE: 519;

    /** Static draw buffer usage */
    STATIC_DRAW_USAGE: 35044;
    /** Dynamic draw buffer usage */
    DYNAMIC_DRAW_USAGE: 35048;
    /** Stream draw buffer usage */
    STREAM_DRAW_USAGE: 35040;
    /** Static read buffer usage */
    STATIC_READ_USAGE: 35045;
    /** Dynamic read buffer usage */
    DYNAMIC_READ_USAGE: 35049;
    /** Stream read buffer usage */
    STREAM_READ_USAGE: 35041;
    /** Static copy buffer usage */
    STATIC_COPY_USAGE: 35046;
    /** Dynamic copy buffer usage */
    DYNAMIC_COPY_USAGE: 35050;
    /** Stream copy buffer usage */
    STREAM_COPY_USAGE: 35042;

    /** GLSL version 1.00 */
    GLSL_1: '100';
    /** GLSL version 3.00 ES */
    GLSL_3: '300 es';

    /** WebGL coordinate system */
    WEBGL_COORDINATE_SYSTEM: 2000;
    /** WebGPU coordinate system */
    WEBGPU_COORDINATE_SYSTEM: 2001;

    /** Timestamp query for compute */
    TIMESTAMP_QUERY_COMPUTE: 'compute';
    /** Timestamp query for render */
    TIMESTAMP_QUERY_RENDER: 'render';

    /** Perspective interpolation sampling type */
    INTERPOLATION_SAMPLING_TYPE_PERSPECTIVE: 'perspective';
    /** Linear interpolation sampling type */
    INTERPOLATION_SAMPLING_TYPE_LINEAR: 'linear';
    /** Flat interpolation sampling type */
    INTERPOLATION_SAMPLING_TYPE_FLAT: 'flat';

    /** Normal interpolation sampling mode */
    INTERPOLATION_SAMPLING_MODE_NORMAL: 'normal';
    /** Centroid interpolation sampling mode */
    INTERPOLATION_SAMPLING_MODE_CENTROID: 'centroid';
    /** Sample interpolation sampling mode */
    INTERPOLATION_SAMPLING_MODE_SAMPLE: 'sample';
    /** First interpolation sampling mode */
    INTERPOLATION_SAMPLING_MODE_FIRST: 'first';
    /** Either interpolation sampling mode */
    INTERPOLATION_SAMPLING_MODE_EITHER: 'either';

    /** Depth texture compare compatibility feature */
    COMPATIBILITY_TEXTURE_COMPARE: 'depthTextureCompare';

    /** Left side identifier */
    SIDE_LEFT: 0;
    /** Top side identifier */
    SIDE_TOP: 1;
    /** Right side identifier */
    SIDE_RIGHT: 2;
    /** Bottom side identifier */
    SIDE_BOTTOM: 3;

    /** Top-left corner identifier */
    CORNER_TOP_LEFT: 0;
    /** Top-right corner identifier */
    CORNER_TOP_RIGHT: 1;
    /** Bottom-right corner identifier */
    CORNER_BOTTOM_RIGHT: 2;
    /** Bottom-left corner identifier */
    CORNER_BOTTOM_LEFT: 3;

    /** Vertical orientation */
    VERTICAL: 0;
    /** Horizontal orientation */
    HORIZONTAL: 1;

    /** Clockwise winding order */
    CLOCKWISE: 0;
    /** Counterclockwise winding order */
    COUNTERCLOCKWISE: 1;

    /** Horizontal alignment: left */
    HORIZONTAL_ALIGNMENT_LEFT: 0;
    /** Horizontal alignment: center */
    HORIZONTAL_ALIGNMENT_CENTER: 1;
    /** Horizontal alignment: right */
    HORIZONTAL_ALIGNMENT_RIGHT: 2;
    /** Horizontal alignment: fill */
    HORIZONTAL_ALIGNMENT_FILL: 3;

    /** Vertical alignment: top */
    VERTICAL_ALIGNMENT_TOP: 0;
    /** Vertical alignment: center */
    VERTICAL_ALIGNMENT_CENTER: 1;
    /** Vertical alignment: bottom */
    VERTICAL_ALIGNMENT_BOTTOM: 2;
    /** Vertical alignment: fill */
    VERTICAL_ALIGNMENT_FILL: 3;

    /** Inline alignment: top to */
    INLINE_ALIGNMENT_TOP_TO: 0;
    /** Inline alignment: center to */
    INLINE_ALIGNMENT_CENTER_TO: 1;
    /** Inline alignment: baseline to */
    INLINE_ALIGNMENT_BASELINE_TO: 2;
    /** Inline alignment: bottom to */
    INLINE_ALIGNMENT_BOTTOM_TO: 3;

    /** Inline alignment: to top */
    INLINE_ALIGNMENT_TO_TOP: 0;
    /** Inline alignment: to center */
    INLINE_ALIGNMENT_TO_CENTER: 1;
    /** Inline alignment: to baseline */
    INLINE_ALIGNMENT_TO_BASELINE: 2;
    /** Inline alignment: to bottom */
    INLINE_ALIGNMENT_TO_BOTTOM: 3;

    /** Inline alignment: top */
    INLINE_ALIGNMENT_TOP: 0;
    /** Inline alignment: center */
    INLINE_ALIGNMENT_CENTER: 1;
    /** Inline alignment: bottom */
    INLINE_ALIGNMENT_BOTTOM: 2;

    /** Inline alignment: image mask */
    INLINE_ALIGNMENT_IMAGE_MASK: 0;
    /** Inline alignment: text mask */
    INLINE_ALIGNMENT_TEXT_MASK: 1;

    /** Euler rotation order: XYZ */
    EULER_ORDER_XYZ: 0;
    /** Euler rotation order: XZY */
    EULER_ORDER_XZY: 1;
    /** Euler rotation order: YXZ */
    EULER_ORDER_YXZ: 2;
    /** Euler rotation order: YZX */
    EULER_ORDER_YZX: 3;
    /** Euler rotation order: ZXY */
    EULER_ORDER_ZXY: 4;
    /** Euler rotation order: ZYX */
    EULER_ORDER_ZYX: 5;

    KEY_NONE: 0;
    KEY_SPECIAL: 1;
    KEY_ESCAPE: 2;
    KEY_TAB: 3;
    KEY_BACKTAB: 4;
    KEY_BACKSPACE: 5;
    KEY_ENTER: 6;
    KEY_KP_ENTER: 7;
    KEY_INSERT: 8;
    KEY_DELETE: 9;
    KEY_PAUSE: 10;
    KEY_PRINT: 11;
    KEY_SYSREQ: 12;
    KEY_CLEAR: 13;
    KEY_HOME: 14;
    KEY_END: 15;
    KEY_LEFT: 16;
    KEY_UP: 17;
    KEY_RIGHT: 18;
    KEY_DOWN: 19;
    KEY_PAGEUP: 20;
    KEY_PAGEDOWN: 21;
    KEY_SHIFT: 22;
    KEY_CTRL: 23;
    KEY_META: 24;
    KEY_ALT: 25;
    KEY_CAPSLOCK: 26;
    KEY_NUMLOCK: 27;
    KEY_SCROLLLOCK: 28;
    KEY_F1: 29;
    KEY_F2: 30;
    KEY_F3: 31;
    KEY_F4: 32;
    KEY_F5: 33;
    KEY_F6: 34;
    KEY_F7: 35;
    KEY_F8: 36;
    KEY_F9: 37;
    KEY_F10: 38;
    KEY_F11: 39;
    KEY_F12: 40;
    KEY_F13: 41;
    KEY_F14: 42;
    KEY_F15: 43;
    KEY_F16: 44;
    KEY_F17: 45;
    KEY_F18: 46;
    KEY_F19: 47;
    KEY_F20: 48;
    KEY_F21: 49;
    KEY_F22: 50;
    KEY_F23: 51;
    KEY_F24: 52;
    KEY_F25: 53;
    KEY_F26: 54;
    KEY_F27: 55;
    KEY_F28: 56;
    KEY_F29: 57;
    KEY_F30: 58;
    KEY_F31: 59;
    KEY_F32: 60;
    KEY_F33: 61;
    KEY_F34: 62;
    KEY_F35: 63;
    KEY_KP_MULTIPLY: 64;
    KEY_KP_DIVIDE: 65;
    KEY_KP_SUBTRACT: 66;
    KEY_KP_PERIOD: 67;
    KEY_KP_ADD: 68;
    KEY_KP_0: 69;
    KEY_KP_1: 70;
    KEY_KP_2: 71;
    KEY_KP_3: 72;
    KEY_KP_4: 73;
    KEY_KP_5: 74;
    KEY_KP_6: 75;
    KEY_KP_7: 76;
    KEY_KP_8: 77;
    KEY_KP_9: 78;
    KEY_MENU: 79;
    KEY_HYPER: 80;
    KEY_HELP: 81;
    KEY_BACK: 82;
    KEY_FORWARD: 83;
    KEY_STOP: 84;
    KEY_REFRESH: 85;
    KEY_VOLUMEDOWN: 86;
    KEY_VOLUMEMUTE: 87;
    KEY_VOLUMEUP: 88;
    KEY_MEDIAPLAY: 89;
    KEY_MEDIASTOP: 90;
    KEY_MEDIAPREVIOUS: 91;
    KEY_MEDIANEXT: 92;
    KEY_MEDIARECORD: 93;
    KEY_HOMEPAGE: 94;
    KEY_FAVORITES: 95;
    KEY_SEARCH: 96;
    KEY_STANDBY: 97;
    KEY_OPENURL: 98;
    KEY_LAUNCHMAIL: 99;
    KEY_LAUNCHMEDIA: 100;
    KEY_LAUNCH0: 101;
    KEY_LAUNCH1: 102;
    KEY_LAUNCH2: 103;
    KEY_LAUNCH3: 104;
    KEY_LAUNCH4: 105;
    KEY_LAUNCH5: 106;
    KEY_LAUNCH6: 107;
    KEY_LAUNCH7: 108;
    KEY_LAUNCH8: 109;
    KEY_LAUNCH9: 110;
    KEY_LAUNCHA: 111;
    KEY_LAUNCHB: 112;
    KEY_LAUNCHC: 113;
    KEY_LAUNCHD: 114;
    KEY_LAUNCHE: 115;
    KEY_LAUNCHF: 116;
    KEY_GLOBE: 117;
    KEY_KEYBOARD: 118;
    KEY_JIS_EISU: 119;
    KEY_JIS_KANA: 120;
    KEY_UNKNOWN: 121;
    KEY_SPACE: 122;
    KEY_EXCLAM: 123;
    KEY_QUOTEDBL: 124;
    KEY_NUMBERSIGN: 125;
    KEY_DOLLAR: 126;
    KEY_PERCENT: 127;
    KEY_AMPERSAND: 128;
    KEY_APOSTROPHE: 129;
    KEY_PARENLEFT: 130;
    KEY_PARENRIGHT: 131;
    KEY_ASTERISK: 132;
    KEY_PLUS: 133;
    KEY_COMMA: 134;
    KEY_MINUS: 135;
    KEY_PERIOD: 136;
    KEY_SLASH: 137;
    KEY_0: 138;
    KEY_1: 139;
    KEY_2: 140;
    KEY_3: 141;
    KEY_4: 142;
    KEY_5: 143;
    KEY_6: 144;
    KEY_7: 145;
    KEY_8: 146;
    KEY_9: 147;
    KEY_COLON: 148;
    KEY_SEMICOLON: 149;
    KEY_LESS: 150;
    KEY_EQUAL: 151;
    KEY_GREATER: 152;
    KEY_QUESTION: 153;
    KEY_AT: 154;
    KEY_A: 155;
    KEY_B: 156;
    KEY_C: 157;
    KEY_D: 158;
    KEY_E: 159;
    KEY_F: 160;
    KEY_G: 161;
    KEY_H: 162;
    KEY_I: 163;
    KEY_J: 164;
    KEY_K: 165;
    KEY_L: 166;
    KEY_M: 167;
    KEY_N: 168;
    KEY_O: 169;
    KEY_P: 170;
    KEY_Q: 171;
    KEY_R: 172;
    KEY_S: 173;
    KEY_T: 174;
    KEY_U: 175;
    KEY_V: 176;
    KEY_W: 177;
    KEY_X: 178;
    KEY_Y: 179;
    KEY_Z: 180;
    KEY_BRACKETLEFT: 181;
    KEY_BACKSLASH: 182;
    KEY_BRACKETRIGHT: 183;
    KEY_ASCIICIRCUM: 184;
    KEY_UNDERSCORE: 185;
    KEY_QUOTELEFT: 186;
    KEY_BRACELEFT: 187;
    KEY_BAR: 188;
    KEY_BRACERIGHT: 189;
    KEY_ASCIITILDE: 190;
    KEY_YEN: 191;
    KEY_SECTION: 192;

    KEY_CODE_MASK: number;
    KEY_MODIFIER_MASK: number;
    KEY_MASK_CMD_OR_CTRL: number;
    KEY_MASK_SHIFT: number;
    KEY_MASK_ALT: number;
    KEY_MASK_META: number;
    KEY_MASK_CTRL: number;
    KEY_MASK_KPAD: number;
    KEY_MASK_GROUP_SWITCH: number;

    KEY_LOCATION_UNSPECIFIED: 0;
    KEY_LOCATION_LEFT: 1;
    KEY_LOCATION_RIGHT: 2;

    MOUSE_BUTTON_NONE: 0;
    MOUSE_BUTTON_LEFT: 1;
    MOUSE_BUTTON_RIGHT: 2;
    MOUSE_BUTTON_MIDDLE: 3;
    MOUSE_BUTTON_WHEEL_UP: 4;
    MOUSE_BUTTON_WHEEL_DOWN: 5;
    MOUSE_BUTTON_WHEEL_LEFT: 6;
    MOUSE_BUTTON_WHEEL_RIGHT: 7;
    MOUSE_BUTTON_XBUTTON1: 8;
    MOUSE_BUTTON_XBUTTON2: 9;

    MOUSE_BUTTON_MASK_LEFT: number;
    MOUSE_BUTTON_MASK_RIGHT: number;
    MOUSE_BUTTON_MASK_MIDDLE: number;
    MOUSE_BUTTON_MASK_XBUTTON1: number;
    MOUSE_BUTTON_MASK_XBUTTON2: number;

    JOY_BUTTON_INVALID: 0;
    JOY_BUTTON_A: 1;
    JOY_BUTTON_B: 2;
    JOY_BUTTON_X: 3;
    JOY_BUTTON_Y: 4;
    JOY_BUTTON_BACK: 5;
    JOY_BUTTON_GUIDE: 6;
    JOY_BUTTON_START: 7;
    JOY_BUTTON_LEFT_STICK: 8;
    JOY_BUTTON_RIGHT_STICK: 9;
    JOY_BUTTON_LEFT_SHOULDER: 10;
    JOY_BUTTON_RIGHT_SHOULDER: 11;
    JOY_BUTTON_DPAD_UP: 12;
    JOY_BUTTON_DPAD_DOWN: 13;
    JOY_BUTTON_DPAD_LEFT: 14;
    JOY_BUTTON_DPAD_RIGHT: 15;
    JOY_BUTTON_MISC1: 16;
    JOY_BUTTON_PADDLE1: 17;
    JOY_BUTTON_PADDLE2: 18;
    JOY_BUTTON_PADDLE3: 19;
    JOY_BUTTON_PADDLE4: 20;
    JOY_BUTTON_TOUCHPAD: 21;
    JOY_BUTTON_MISC2: 22;
    JOY_BUTTON_MISC3: 23;
    JOY_BUTTON_MISC4: 24;
    JOY_BUTTON_MISC5: 25;
    JOY_BUTTON_MISC6: 26;
    JOY_BUTTON_SDL_MAX: 27;
    JOY_BUTTON_MAX: 28;

    JOY_AXIS_INVALID: 0;
    JOY_AXIS_LEFT_X: 1;
    JOY_AXIS_LEFT_Y: 2;
    JOY_AXIS_RIGHT_X: 3;
    JOY_AXIS_RIGHT_Y: 4;
    JOY_AXIS_TRIGGER_LEFT: 5;
    JOY_AXIS_TRIGGER_RIGHT: 6;
    JOY_AXIS_SDL_MAX: 7;
    JOY_AXIS_MAX: 8;

    MIDI_MESSAGE_NONE: 0;
    MIDI_MESSAGE_NOTE_OFF: 1;
    MIDI_MESSAGE_NOTE_ON: 2;
    MIDI_MESSAGE_AFTERTOUCH: 3;
    MIDI_MESSAGE_CONTROL_CHANGE: 4;
    MIDI_MESSAGE_PROGRAM_CHANGE: 5;
    MIDI_MESSAGE_CHANNEL_PRESSURE: 6;
    MIDI_MESSAGE_PITCH_BEND: 7;
    MIDI_MESSAGE_SYSTEM_EXCLUSIVE: 8;
    MIDI_MESSAGE_QUARTER_FRAME: 9;
    MIDI_MESSAGE_SONG_POSITION_POINTER: 10;
    MIDI_MESSAGE_SONG_SELECT: 11;
    MIDI_MESSAGE_TUNE_REQUEST: 12;
    MIDI_MESSAGE_TIMING_CLOCK: 13;
    MIDI_MESSAGE_START: 14;
    MIDI_MESSAGE_CONTINUE: 15;
    MIDI_MESSAGE_STOP: 16;
    MIDI_MESSAGE_ACTIVE_SENSING: 17;
    MIDI_MESSAGE_SYSTEM_RESET: 18;

    OK: 0;
    FAILED: 1;
    ERR_UNAVAILABLE: 2;
    ERR_UNCONFIGURED: 3;
    ERR_UNAUTHORIZED: 4;
    ERR_PARAMETER_RANGE_ERROR: 5;
    ERR_OUT_OF_MEMORY: 6;
    ERR_FILE_NOT_FOUND: 7;
    ERR_FILE_BAD_DRIVE: 8;
    ERR_FILE_BAD_PATH: 9;
    ERR_FILE_NO_PERMISSION: 10;
    ERR_FILE_ALREADY_IN_USE: 11;
    ERR_FILE_CANT_OPEN: 12;
    ERR_FILE_CANT_WRITE: 13;
    ERR_FILE_CANT_READ: 14;
    ERR_FILE_UNRECOGNIZED: 15;
    ERR_FILE_CORRUPT: 16;
    ERR_FILE_MISSING_DEPENDENCIES: 17;
    ERR_FILE_EOF: 18;
    ERR_CANT_OPEN: 19;
    ERR_CANT_CREATE: 20;
    ERR_QUERY_FAILED: 21;
    ERR_ALREADY_IN_USE: 22;
    ERR_LOCKED: 23;
    ERR_TIMEOUT: 24;
    ERR_CANT_CONNECT: 25;
    ERR_CANT_RESOLVE: 26;
    ERR_CONNECTION_ERROR: 27;
    ERR_CANT_ACQUIRE_RESOURCE: 28;
    ERR_CANT_FORK: 29;
    ERR_INVALID_DATA: 30;
    ERR_INVALID_PARAMETER: 31;
    ERR_ALREADY_EXISTS: 32;
    ERR_DOES_NOT_EXIST: 33;
    ERR_DATABASE_CANT_READ: 34;
    ERR_DATABASE_CANT_WRITE: 35;
    ERR_COMPILATION_FAILED: 36;
    ERR_METHOD_NOT_FOUND: 37;
    ERR_LINK_FAILED: 38;
    ERR_SCRIPT_FAILED: 39;
    ERR_CYCLIC_LINK: 40;
    ERR_INVALID_DECLARATION: 41;
    ERR_DUPLICATE_SYMBOL: 42;
    ERR_PARSE_ERROR: 43;
    ERR_BUSY: 44;
    ERR_SKIP: 45;
    ERR_HELP: 46;
    ERR_BUG: 47;
    ERR_PRINTER_ON_FIRE: 48;

    PROPERTY_HINT_NONE: 0;
    PROPERTY_HINT_RANGE: 1;
    PROPERTY_HINT_ENUM: 2;
    PROPERTY_HINT_ENUM_SUGGESTION: 3;
    PROPERTY_HINT_EXP_EASING: 4;
    PROPERTY_HINT_LINK: 5;
    PROPERTY_HINT_FLAGS: 6;
    PROPERTY_HINT_LAYERS_2D_RENDER: 7;
    PROPERTY_HINT_LAYERS_2D_PHYSICS: 8;
    PROPERTY_HINT_LAYERS_2D_NAVIGATION: 9;
    PROPERTY_HINT_LAYERS_3D_RENDER: 10;
    PROPERTY_HINT_LAYERS_3D_PHYSICS: 11;
    PROPERTY_HINT_LAYERS_3D_NAVIGATION: 12;
    PROPERTY_HINT_LAYERS_AVOIDANCE: 13;
    PROPERTY_HINT_FILE: 14;
    PROPERTY_HINT_DIR: 15;
    PROPERTY_HINT_GLOBAL_FILE: 16;
    PROPERTY_HINT_GLOBAL_DIR: 17;
    PROPERTY_HINT_RESOURCE_TYPE: 18;
    PROPERTY_HINT_MULTILINE_TEXT: 19;
    PROPERTY_HINT_EXPRESSION: 20;
    PROPERTY_HINT_PLACEHOLDER_TEXT: 21;
    PROPERTY_HINT_COLOR_NO_ALPHA: 22;
    PROPERTY_HINT_OBJECT_ID: 23;
    PROPERTY_HINT_TYPE_STRING: 24;
    PROPERTY_HINT_NODE_PATH_TO_EDITED_NODE: 25;
    PROPERTY_HINT_OBJECT_TOO_BIG: 26;
    PROPERTY_HINT_NODE_PATH_VALID_TYPES: 27;
    PROPERTY_HINT_SAVE_FILE: 28;
    PROPERTY_HINT_GLOBAL_SAVE_FILE: 29;
    PROPERTY_HINT_INT_IS_OBJECTID: 30;
    PROPERTY_HINT_INT_IS_POINTER: 31;
    PROPERTY_HINT_ARRAY_TYPE: 32;
    PROPERTY_HINT_DICTIONARY_TYPE: 33;
    PROPERTY_HINT_LOCALE_ID: 34;
    PROPERTY_HINT_LOCALIZABLE_STRING: 35;
    PROPERTY_HINT_NODE_TYPE: 36;
    PROPERTY_HINT_HIDE_QUATERNION_EDIT: 37;
    PROPERTY_HINT_PASSWORD: 38;
    PROPERTY_HINT_TOOL_BUTTON: 39;
    PROPERTY_HINT_ONESHOT: 40;
    PROPERTY_HINT_GROUP_ENABLE: 41;
    PROPERTY_HINT_INPUT_NAME: 42;
    PROPERTY_HINT_FILE_PATH: 43;
    PROPERTY_HINT_MAX: 44;

    PROPERTY_USAGE_NONE: 0;
    PROPERTY_USAGE_STORAGE: number;
    PROPERTY_USAGE_EDITOR: number;
    PROPERTY_USAGE_INTERNAL: number;
    PROPERTY_USAGE_CHECKABLE: number;
    PROPERTY_USAGE_CHECKED: number;
    PROPERTY_USAGE_GROUP: number;
    PROPERTY_USAGE_CATEGORY: number;
    PROPERTY_USAGE_SUBGROUP: number;
    PROPERTY_USAGE_CLASS_IS_BITFIELD: number;
    PROPERTY_USAGE_NO_INSTANCE_STATE: number;
    PROPERTY_USAGE_RESTART_IF_CHANGED: number;
    PROPERTY_USAGE_SCRIPT_VARIABLE: number;
    PROPERTY_USAGE_STORE_IF_NULL: number;
    PROPERTY_USAGE_UPDATE_ALL_IF_MODIFIED: number;
    PROPERTY_USAGE_SCRIPT_DEFAULT_VALUE: number;
    PROPERTY_USAGE_CLASS_IS_ENUM: number;
    PROPERTY_USAGE_NIL_IS_VARIANT: number;
    PROPERTY_USAGE_ARRAY: number;
    PROPERTY_USAGE_ALWAYS_DUPLICATE: number;
    PROPERTY_USAGE_NEVER_DUPLICATE: number;
    PROPERTY_USAGE_HIGH_END_GFX: number;
    PROPERTY_USAGE_NODE_PATH_FROM_SCENE_ROOT: number;
    PROPERTY_USAGE_RESOURCE_NOT_PERSISTENT: number;
    PROPERTY_USAGE_KEYING_INCREMENTS: number;
    PROPERTY_USAGE_DEFERRED_SET_RESOURCE: number;
    PROPERTY_USAGE_EDITOR_INSTANTIATE_OBJECT: number;
    PROPERTY_USAGE_EDITOR_BASIC_SETTING: number;
    PROPERTY_USAGE_READ_ONLY: number;
    PROPERTY_USAGE_SECRET: number;
    PROPERTY_USAGE_DEFAULT: number;
    PROPERTY_USAGE_NO_EDITOR: number;

    METHOD_FLAG_NORMAL: 0;
    METHOD_FLAG_EDITOR: number;
    METHOD_FLAG_CONST: number;
    METHOD_FLAG_VIRTUAL: number;
    METHOD_FLAG_VARARG: number;
    METHOD_FLAG_STATIC: number;
    METHOD_FLAG_OBJECT_CORE: number;
    METHOD_FLAG_VIRTUAL_REQUIRED: number;
    METHOD_FLAGS_DEFAULT: number;

    TYPE_NIL: 0;
    TYPE_BOOL: 1;
    TYPE_INT: 2;
    TYPE_FLOAT: 3;
    TYPE_STRING: 4;
    TYPE_VECTOR2: 5;
    TYPE_VECTOR2I: 6;
    TYPE_RECT2: 7;
    TYPE_RECT2I: 8;
    TYPE_VECTOR3: 9;
    TYPE_VECTOR3I: 10;
    TYPE_TRANSFORM2D: 11;
    TYPE_VECTOR4: 12;
    TYPE_VECTOR4I: 13;
    TYPE_PLANE: 14;
    TYPE_QUATERNION: 15;
    TYPE_AABB: 16;
    TYPE_BASIS: 17;
    TYPE_TRANSFORM3D: 18;
    TYPE_PROJECTION: 19;
    TYPE_COLOR: 20;
    TYPE_STRING_NAME: 21;
    TYPE_NODE_PATH: 22;
    TYPE_RID: 23;
    TYPE_OBJECT: 24;
    TYPE_CALLABLE: 25;
    TYPE_SIGNAL: 26;
    TYPE_DICTIONARY: 27;
    TYPE_ARRAY: 28;
    TYPE_PACKED_BYTE_ARRAY: 29;
    TYPE_PACKED_INT32_ARRAY: 30;
    TYPE_PACKED_INT64_ARRAY: 31;
    TYPE_PACKED_FLOAT32_ARRAY: 32;
    TYPE_PACKED_FLOAT64_ARRAY: 33;
    TYPE_PACKED_STRING_ARRAY: 34;
    TYPE_PACKED_VECTOR2_ARRAY: 35;
    TYPE_PACKED_VECTOR3_ARRAY: 36;
    TYPE_PACKED_COLOR_ARRAY: 37;
    TYPE_PACKED_VECTOR4_ARRAY: 38;
    TYPE_MAX: 39;

    OP_EQUAL: 0;
    OP_NOT_EQUAL: 1;
    OP_LESS: 2;
    OP_LESS_EQUAL: 3;
    OP_GREATER: 4;
    OP_GREATER_EQUAL: 5;
    OP_ADD: 6;
    OP_SUBTRACT: 7;
    OP_MULTIPLY: 8;
    OP_DIVIDE: 9;
    OP_NEGATE: 10;
    OP_POSITIVE: 11;
    OP_MODULE: 12;
    OP_POWER: 13;
    OP_SHIFT_LEFT: 14;
    OP_SHIFT_RIGHT: 15;
    OP_BIT_AND: 16;
    OP_BIT_OR: 17;
    OP_BIT_XOR: 18;
    OP_BIT_NEGATE: 19;
    OP_AND: 20;
    OP_OR: 21;
    OP_XOR: 22;
    OP_NOT: 23;
    OP_IN: 24;
    OP_MAX: 25;

    UINT8_MAX: number;
    UINT16_MAX: number;
    UINT32_MAX: number;
    INT8_MIN: number;
    INT8_MAX: number;
    INT16_MIN: number;
    INT16_MAX: number;
    INT32_MIN: number;
    INT32_MAX: number;
    INT64_MIN: bigint;
    INT64_MAX: bigint;

    RENDERER_DEFAULTS: {
        CLEAR_COLOR: [number, number, number, number];
        CLEAR_DEPTH: number;
        CLEAR_STENCIL: number;
        PIXEL_RATIO: number;
        SAMPLES: number;
        DEPTH: boolean;
        STENCIL: boolean;
        ALPHA: boolean;
        ANTIALIAS: boolean;
        PREMULTIPLIED_ALPHA: boolean;
        PRESERVE_DRAWING_BUFFER: boolean;
        POWER_PREFERENCE: string;
        FAIL_IF_MAJOR_PERFORMANCE_CAVEAT: boolean;
    };

    SCENE_DEFAULTS: {
        BACKGROUND: [number, number, number, number];
        FOG: null;
        ENVIRONMENT: null;
        OVERRIDE_MATERIAL: null;
        AUTO_UPDATE: boolean;
        MATRIX_AUTO_UPDATE: boolean;
    };

    CAMERA_DEFAULTS: {
        PERSPECTIVE: {
            FOV: number;
            ASPECT: number;
            NEAR: number;
            FAR: number;
        };
        ORTHOGRAPHIC: {
            LEFT: number;
            RIGHT: number;
            TOP: number;
            BOTTOM: number;
            NEAR: number;
            FAR: number;
        };
        STEREO: {
            IPD: number;
            FOV: number;
            ASPECT: number;
            NEAR: number;
            FAR: number;
        };
    };

    MATH_CONSTANTS: {
        PI: number;
        PI2: number;
        PI_HALF: number;
        PI_QUARTER: number;
        EPSILON: number;
        EPSILON2: number;
        INFINITY: number;
        NEGATIVE_INFINITY: number;
        DEG2RAD: number;
        RAD2DEG: number;
    };

    MATERIAL_CONSTANTS: {
        SIDE: {
            FRONT: 0;
            BACK: 1;
            DOUBLE: 2;
        };
        BLENDING: {
            NONE: 0;
            NORMAL: 1;
            ADDITIVE: 2;
            SUBTRACTIVE: 3;
            MULTIPLY: 4;
            CUSTOM: 5;
        };
        DEPTH_FUNC: {
            NEVER: 0;
            LESS: 2;
            EQUAL: 4;
            LEQUAL: 3;
            GREATER: 6;
            NOTEQUAL: 7;
            GEQUAL: 5;
            ALWAYS: 1;
        };
        SHADOW_MAP: {
            BASIC: 0;
            PCF: 1;
            PCF_SOFT: 2;
            VSM: 3;
        };
    };

    OBJECT_TYPES: {
        SCENE: 'Scene';
        CAMERA: 'Camera';
        MESH: 'Mesh';
        LIGHT: 'Light';
        GROUP: 'Group';
        SPRITE: 'Sprite';
        LINE: 'Line';
        POINTS: 'Points';
        BONE: 'Bone';
        SKELETON: 'Skeleton';
        SKINNED_MESH: 'SkinnedMesh';
        INSTANCED_MESH: 'InstancedMesh';
    };

    WEBGL_CONSTANTS: {
        NEVER: number;
        LESS: number;
        EQUAL: number;
        LEQUAL: number;
        GREATER: number;
        NOTEQUAL: number;
        GEQUAL: number;
        ALWAYS: number;
        ZERO: 0;
        ONE: 1;
        SRC_COLOR: number;
        ONE_MINUS_SRC_COLOR: number;
        SRC_ALPHA: number;
        ONE_MINUS_SRC_ALPHA: number;
        DST_ALPHA: number;
        ONE_MINUS_DST_ALPHA: number;
        DST_COLOR: number;
        ONE_MINUS_DST_COLOR: number;
        SRC_ALPHA_SATURATE: number;
        CONSTANT_COLOR: number;
        ONE_MINUS_CONSTANT_COLOR: number;
        CONSTANT_ALPHA: number;
        ONE_MINUS_CONSTANT_ALPHA: number;
        FUNC_ADD: number;
        FUNC_SUBTRACT: number;
        FUNC_REVERSE_SUBTRACT: number;
        FUNC_MIN: number;
        FUNC_MAX: number;
        NONE: 0;
        FRONT: number;
        BACK: number;
        FRONT_AND_BACK: number;
        ALPHA: number;
        RGB: number;
        RGBA: number;
        LUMINANCE: number;
        LUMINANCE_ALPHA: number;
        DEPTH_COMPONENT: number;
        DEPTH_STENCIL: number;
        UNSIGNED_BYTE: number;
        UNSIGNED_SHORT: number;
        UNSIGNED_INT: number;
        HALF_FLOAT: number;
        FLOAT: number;
        UNSIGNED_INT_24_8: number;
        UNSIGNED_SHORT_4_4_4_4: number;
        UNSIGNED_SHORT_5_5_5_1: number;
        UNSIGNED_SHORT_5_6_5: number;
        NEAREST: number;
        LINEAR: number;
        NEAREST_MIPMAP_NEAREST: number;
        LINEAR_MIPMAP_NEAREST: number;
        NEAREST_MIPMAP_LINEAR: number;
        LINEAR_MIPMAP_LINEAR: number;
        REPEAT: number;
        CLAMP_TO_EDGE: number;
        MIRRORED_REPEAT: number;
        CLAMP_TO_BORDER: number;
        TEXTURE_2D: number;
        TEXTURE_CUBE_MAP: number;
        TEXTURE_3D: number;
        TEXTURE_2D_ARRAY: number;
        ARRAY_BUFFER: number;
        ELEMENT_ARRAY_BUFFER: number;
        UNIFORM_BUFFER: number;
        TEXTURE_BUFFER: number;
        FRAMEBUFFER: number;
        RENDERBUFFER: number;
        COLOR_ATTACHMENT0: number;
        DEPTH_ATTACHMENT: number;
        STENCIL_ATTACHMENT: number;
        DEPTH_STENCIL_ATTACHMENT: number;
        POINTS: number;
        LINES: number;
        LINE_LOOP: number;
        LINE_STRIP: number;
        TRIANGLES: number;
        TRIANGLE_STRIP: number;
        TRIANGLE_FAN: number;
    };

    SECURITY_ALLOWED_ORIGINS: string[];
    SECURITY_INTEGRITY_HASH: string;
    SECURITY_VERSION: string;
    SECURITY_FEATURES: {
        ORIGIN_CHECK: boolean;
        INTEGRITY_CHECK: boolean;
        FUNCTION_GUARD: boolean;
        OBJECT_SEALING: boolean;
        OBFUSCATION: boolean;
    };
    SECURITY_DEFAULTS: {
        STRICT_MODE: boolean;
        AUTO_INIT: boolean;
        ALLOW_UNKNOWN_ORIGIN: boolean;
        LOG_VIOLATIONS: boolean;
        THROW_ON_VIOLATION: boolean;
    };
}

/**
 * 2D vector with x and y components
 */
export interface Vector2 {
    x: number;
    y: number;
}

/**
 * 2D integer vector with x and y components
 */
export interface Vector2i {
    x: number;
    y: number;
}

/**
 * 3D vector with x, y, z components
 */
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

/**
 * 3D integer vector with x, y, z components
 */
export interface Vector3i {
    x: number;
    y: number;
    z: number;
}

/**
 * 4D vector with x, y, z, w components
 */
export interface Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * 4D integer vector with x, y, z, w components
 */
export interface Vector4i {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * 2x2 matrix in column-major order
 */
export interface Mat2 {
    elements: Float32Array;
}

/**
 * 3x3 matrix in column-major order
 */
export interface Mat3 {
    elements: Float32Array;
}

/**
 * 4x4 matrix in column-major order
 */
export interface Mat4 {
    elements: Float32Array;
}

/**
 * Quaternion representing 3D rotation
 */
export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * Color with RGBA components (values 0-1)
 */
export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * Rectangle with position and size
 */
export interface Rect2 {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Integer rectangle with position and size
 */
export interface Rect2i {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * 2D transform with origin and basis vectors
 */
export interface Transform2D {
    origin: Vector2;
    x: Vector2;
    y: Vector2;
}

/**
 * 3D transform with origin and basis
 */
export interface Transform3D {
    origin: Vector3;
    basis: Basis;
}

/**
 * 3D basis matrix (rotation/scale)
 */
export interface Basis {
    x: Vector3;
    y: Vector3;
    z: Vector3;
}

/**
 * Axis-aligned bounding box
 */
export interface AABB {
    position: Vector3;
    size: Vector3;
}

/**
 * Plane defined by normal and distance
 */
export interface Plane {
    normal: Vector3;
    d: number;
}

/**
 * Projection matrix wrapper
 */
export interface Projection {
    matrix: Mat4;
}

/**
 * Fog settings for scene rendering
 */
export interface Fog {
    type: 'linear' | 'exponential' | 'exponential_squared';
    color: Color;
    density: number;
    start: number;
    end: number;
}

/**
 * Texture mapping for materials
 */
export interface Texture {
    type: '2D' | '3D' | 'Cube' | 'Array';
    width: number;
    height: number;
    depth: number;
    format: number;
    pixelType: number;
    minFilter: number;
    magFilter: number;
    wrapS: number;
    wrapT: number;
    generateMipmaps: boolean;
    dispose(): void;
}

/**
 * Render target for off-screen rendering
 */
export interface RenderTarget {
    width: number;
    height: number;
    samples: number;
    depthBuffer: boolean;
    stencilBuffer: boolean;
    texture: Texture;
    depthTexture: Texture | null;
    setSize(width: number, height: number): void;
    dispose(): void;
}

/**
 * Base object for all 3D objects in the scene
 */
export interface Object3D {
    id: string;
    name: string;
    parent: Object3D | null;
    children: Object3D[];
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    matrix: Mat4;
    matrixWorld: Mat4;
    visible: boolean;
    add(child: Object3D): void;
    remove(child: Object3D): void;
    getChildById(id: string): Object3D | null;
    getChildByName(name: string): Object3D | null;
    traverse(callback: (object: Object3D) => void): void;
    clone(): Object3D;
    dispose(): void;
}

/**
 * Scene containing the object hierarchy
 */
export interface Scene {
    id: string;
    name: string;
    children: Object3D[];
    background: Color | Texture | null;
    fog: Fog | null;
    environment: Texture | null;
    overrideMaterial: Material | null;
    autoUpdate: boolean;
    add(child: Object3D): void;
    remove(child: Object3D): void;
    getChildById(id: string): Object3D | null;
    getChildByName(name: string): Object3D | null;
    traverse(callback: (object: Object3D) => void): void;
    clone(): Scene;
    dispose(): void;
}

/**
 * Camera for rendering the scene
 */
export interface Camera {
    id: string;
    name: string;
    type: 'perspective' | 'orthographic';
    fov: number;
    aspect: number;
    near: number;
    far: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    position: Vector3;
    target: Vector3;
    up: Vector3;
    projectionMatrix: Mat4;
    viewMatrix: Mat4;
    updateProjectionMatrix(): void;
    updateViewMatrix(): void;
    setPosition(x: number, y: number, z: number): Camera;
    setTarget(x: number, y: number, z: number): Camera;
    lookAt(target: Vector3): Camera;
    clone(): Camera;
}

/**
 * Material for rendering objects
 */
export interface Material {
    type: string;
    color: Color;
    opacity: number;
    transparent: boolean;
    side: number;
    blending: number;
    depthFunc: number;
    depthTest: boolean;
    depthWrite: boolean;
    clone(): Material;
    dispose(): void;
}

/**
 * Mesh geometry data
 */
export interface Mesh {
    id: string;
    name: string;
    positions: number[];
    normals: number[];
    uvs: number[];
    indices: number[];
    groups: Array<{
        start: number;
        count: number;
        materialIndex: number;
    }>;
    clone(): Mesh;
    dispose(): void;
}

/**
 * Light source for scene illumination
 */
export interface Light {
    type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
    color: Color;
    intensity: number;
    distance: number;
    angle: number;
    penumbra: number;
    decay: number;
    castShadow: boolean;
    dispose(): void;
}

/**
 * Sprite (2D image in 3D space)
 */
export interface Sprite extends Object3D {
    texture: Texture;
    width: number;
    height: number;
    type: 'Sprite';
}

/**
 * Group of objects (no transformation)
 */
export interface Group extends Object3D {
    type: 'Group';
}

/**
 * Service registration options for the container
 */
export interface RegisterOptions {
    type?: 'singleton' | 'factory' | 'transient';
    dependencies?: string[] | Record<string, string>[];
    autoResolve?: boolean;
}

/**
 * Service definition in the container
 */
export interface ServiceDefinition {
    name: string;
    definition: any;
    type: 'singleton' | 'factory' | 'transient' | 'alias';
    dependencies: string[] | Record<string, string>[];
    autoResolve: boolean;
    resolved: boolean;
    instance: any | null;
    isAlias?: boolean;
    target?: string;
}

/**
 * Service information for inspection
 */
export interface ServiceInfo {
    name: string;
    type: string;
    dependencies: string[] | Record<string, string>[];
    isAlias: boolean;
    target: string | null;
    resolved: boolean;
}

/**
 * Dependency Injection Container
 */
export interface Container {
    /**
     * Register a service with the container
     * @param name - Service name/identifier
     * @param definition - Service definition (class, factory function, or instance)
     * @param options - Registration options
     * @returns This container for chaining
     * @throws Error if service already registered
     */
    register<T>(name: string, definition: T | ((deps: any, container: Container, context?: any) => T), options?: RegisterOptions): Container;

    /**
     * Register a singleton service (single instance)
     * @param name - Service name
     * @param definition - Service definition
     * @param options - Additional options
     * @returns This container for chaining
     */
    singleton<T>(name: string, definition: T | ((deps: any, container: Container, context?: any) => T), options?: Omit<RegisterOptions, 'type'>): Container;

    /**
     * Register a factory service (creates new instance each time)
     * @param name - Service name
     * @param factory - Factory function that returns the service
     * @param options - Additional options
     * @returns This container for chaining
     */
    factory<T>(name: string, factory: (deps: any, container: Container, context?: any) => T, options?: Omit<RegisterOptions, 'type'>): Container;

    /**
     * Register a transient service (new instance each time)
     * @param name - Service name
     * @param definition - Service definition
     * @param options - Additional options
     * @returns This container for chaining
     */
    transient<T>(name: string, definition: T | ((deps: any, container: Container, context?: any) => T), options?: Omit<RegisterOptions, 'type'>): Container;

    /**
     * Register a service alias
     * @param alias - Alias name
     * @param target - Target service name
     * @returns This container for chaining
     * @throws Error if target service doesn't exist
     */
    alias(alias: string, target: string): Container;

    /**
     * Check if a service is registered
     * @param name - Service name
     * @returns True if service exists
     */
    has(name: string): boolean;

    /**
     * Get a service instance
     * @param name - Service name
     * @param context - Context for factory functions
     * @returns Service instance
     * @throws Error if service not found or circular dependency detected
     */
    get<T>(name: string, context?: any): T;

    /**
     * Get or create a service instance (cached)
     * @param name - Service name
     * @param factory - Factory function if service doesn't exist
     * @param options - Options for registration
     * @returns Service instance
     */
    getOrCreate<T>(name: string, factory: (deps: any, container: Container, context?: any) => T, options?: RegisterOptions): T;

    /**
     * Get all registered service names
     * @returns Array of service names
     */
    listServices(): string[];

    /**
     * Get service registration info
     * @param name - Service name
     * @returns Service info or null if not found
     */
    getServiceInfo(name: string): ServiceInfo | null;

    /**
     * Remove a service from the container
     * @param name - Service name
     * @returns True if removed
     */
    remove(name: string): boolean;

    /**
     * Clear all services from the container
     */
    clear(): void;

    /**
     * Create a child container that inherits from this one
     * @returns Child container
     */
    createChild(): Container;

    /**
     * Get the parent container
     * @returns Parent container or null
     */
    getParent(): Container | null;

    /**
     * Set the parent container
     * @param parent - Parent container
     * @returns This container for chaining
     */
    setParent(parent: Container): Container;

    /**
     * Check if a service is a singleton
     * @param name - Service name
     * @returns True if singleton
     */
    isSingleton(name: string): boolean;

    /**
     * Check if a service is a factory
     * @param name - Service name
     * @returns True if factory
     */
    isFactory(name: string): boolean;
}

/**
 * Service lifetime types
 */
export const SERVICE_TYPES: {
    SINGLETON: 'singleton';
    FACTORY: 'factory';
    TRANSIENT: 'transient';
};

/**
 * Array utility functions
 */
export interface ArrayUtils {
    /**
     * Find minimum value in array
     * @param array - Array of numbers
     * @returns Minimum value, or Infinity if array is empty
     */
    min(array: number[] | Float32Array | Float64Array): number;

    /**
     * Find maximum value in array
     * @param array - Array of numbers
     * @returns Maximum value, or -Infinity if array is empty
     */
    max(array: number[] | Float32Array | Float64Array): number;

    /**
     * Check if array needs Uint32 indices (contains values >= 65535)
     * @param array - Array of indices
     * @returns True if array contains values >= 65535
     */
    needsUint32(array: number[] | Uint16Array | Uint32Array): boolean;

    /**
     * Get typed array from buffer
     * @param type - Typed array constructor name
     * @param buffer - Buffer to create view from
     * @param byteOffset - Byte offset
     * @param length - Length of the view
     * @returns Typed array view
     * @throws Error if type is unknown
     */
    getTypedArray(type: string, buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArray;

    /**
     * Check if value is a typed array
     * @param value - Value to check
     * @returns True if value is a typed array
     */
    isTypedArray(value: any): boolean;

    /**
     * Calculate sum of array elements
     * @param array - Array of numbers
     * @returns Sum of all elements
     */
    sum(array: number[] | Float32Array | Float64Array): number;

    /**
     * Calculate average of array elements
     * @param array - Array of numbers
     * @returns Average of all elements, or 0 if array is empty
     */
    average(array: number[] | Float32Array | Float64Array): number;

    /**
     * Create a new array with unique values
     * @param array - Array to deduplicate
     * @returns Array with unique values
     */
    unique<T>(array: T[]): T[];

    /**
     * Chunk an array into smaller arrays of specified size
     * @param array - Array to chunk
     * @param size - Chunk size
     * @returns Array of chunks
     */
    chunk<T>(array: T[], size: number): T[][];

    /**
     * Flatten an array of arrays
     * @param array - Array to flatten
     * @param depth - Depth to flatten
     * @returns Flattened array
     */
    flatten<T>(array: any[], depth?: number): T[];

    /**
     * Get the last element of an array
     * @param array - Array to get last element from
     * @returns Last element, or undefined if empty
     */
    last<T>(array: T[]): T | undefined;

    /**
     * Check if an array is empty
     * @param array - Array to check
     * @returns True if array is empty
     */
    isEmpty(array: any[]): boolean;

    /**
     * Create a range array from start to end (exclusive)
     * @param start - Start value
     * @param end - End value (exclusive)
     * @param step - Step value
     * @returns Range array
     */
    range(start: number, end: number, step?: number): number[];
}

/**
 * Console utility functions
 */
export interface ConsoleUtils {
    /**
     * Set custom console function override
     * @param fn - Custom console function (type, message, ...params)
     */
    setConsoleOverride(fn: (type: string, message: string, ...params: any[]) => void): void;

    /**
     * Get current console override function
     * @returns Current console override or null
     */
    getConsoleOverride(): ((type: string, message: string, ...params: any[]) => void) | null;

    /**
     * Set the minimum log level
     * @param level - Log level
     */
    setLogLevel(level: 'debug' | 'info' | 'warn' | 'error' | 'none'): void;

    /**
     * Get the current log level
     * @returns Current log level
     */
    getLogLevel(): string;

    /**
     * Log debug message to console
     * @param message - Message to log
     * @param params - Additional parameters
     */
    debug(message: string, ...params: any[]): void;

    /**
     * Log message to console
     * @param message - Message to log
     * @param params - Additional parameters
     */
    log(message: string, ...params: any[]): void;

    /**
     * Log warning message to console
     * @param message - Warning message
     * @param params - Additional parameters
     */
    warn(message: string, ...params: any[]): void;

    /**
     * Log error message to console
     * @param message - Error message
     * @param params - Additional parameters
     */
    error(message: string, ...params: any[]): void;

    /**
     * Log warning message only once (deduplicated by message)
     * @param message - Warning message
     * @param params - Additional parameters
     */
    warnOnce(message: string, ...params: any[]): void;

    /**
     * Clear warning cache
     */
    clearWarnCache(): void;

    /**
     * Create a namespaced logger
     * @param namespace - Namespace for the logger
     * @returns Logger instance with namespace prefix
     */
    createLogger(namespace: string): {
        debug: (message: string, ...params: any[]) => void;
        log: (message: string, ...params: any[]) => void;
        warn: (message: string, ...params: any[]) => void;
        error: (message: string, ...params: any[]) => void;
        warnOnce: (message: string, ...params: any[]) => void;
    };
}

/**
 * Async utility functions
 */
export interface AsyncUtils {
    /**
     * Yield to main thread, allowing other tasks to run
     * Uses scheduler.yield() if available, otherwise requestAnimationFrame
     * @returns Promise that resolves when main thread is available
     */
    yieldToMain(): Promise<void>;

    /**
     * Probe WebGL sync object until complete
     * @param gl - WebGL2 context
     * @param sync - WebGL sync object
     * @param interval - Polling interval in ms
     * @returns Promise that resolves when sync is complete
     * @throws Error if WebGL wait fails
     */
    probeAsync(gl: WebGL2RenderingContext, sync: WebGLSync, interval?: number): Promise<void>;

    /**
     * Delay execution for a specified time
     * @param ms - Milliseconds to delay
     * @returns Promise that resolves after delay
     */
    delay(ms: number): Promise<void>;

    /**
     * Retry an async operation with exponential backoff
     * @param fn - Async function to retry
     * @param options - Retry options
     * @returns Result of the operation
     * @throws Error if all attempts fail
     */
    retry<T>(fn: () => Promise<T>, options?: {
        maxAttempts?: number;
        initialDelay?: number;
        maxDelay?: number;
        backoffFactor?: number;
        shouldRetry?: (error: any) => boolean;
    }): Promise<T>;

    /**
     * Timeout a promise after a specified duration
     * @param promise - Promise to timeout
     * @param ms - Timeout in milliseconds
     * @param message - Timeout error message
     * @returns Promise with timeout
     */
    timeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T>;

    /**
     * Throttle a function to execute at most once per interval
     * @param fn - Function to throttle
     * @param interval - Throttle interval in ms
     * @param options - Throttle options
     * @returns Throttled function
     */
    throttle<T extends (...args: any[]) => any>(fn: T, interval: number, options?: {
        leading?: boolean;
        trailing?: boolean;
    }): T;

    /**
     * Debounce a function to execute after a delay
     * @param fn - Function to debounce
     * @param delay - Debounce delay in ms
     * @param options - Debounce options
     * @returns Debounced function
     */
    debounce<T extends (...args: any[]) => any>(fn: T, delay: number, options?: {
        leading?: boolean;
        trailing?: boolean;
    }): T;
}

/**
 * Serialization utility functions
 */
export interface SerializeUtils {
    /**
     * Convert value to JSON string
     * @param value - Value to serialize
     * @param replacer - Custom replacer function
     * @param space - Number of spaces for indentation
     * @returns JSON string
     */
    toString(value: any, replacer?: (key: string, value: any) => any, space?: number): string;

    /**
     * Parse JSON string to value
     * @param str - JSON string
     * @param reviver - Custom reviver function
     * @returns Parsed value
     * @throws SyntaxError if JSON is malformed
     */
    fromString<T>(str: string, reviver?: (key: string, value: any) => any): T;

    /**
     * Convert value to Uint8Array bytes
     * @param value - Value to serialize
     * @param replacer - Custom replacer function
     * @returns Serialized bytes
     */
    toBytes(value: any, replacer?: (key: string, value: any) => any): Uint8Array;

    /**
     * Convert bytes to value
     * @param bytes - Bytes to deserialize
     * @param reviver - Custom reviver function
     * @returns Deserialized value
     * @throws SyntaxError if JSON is malformed
     * @throws TypeError if bytes cannot be decoded
     */
    fromBytes<T>(bytes: Uint8Array | ArrayBuffer, reviver?: (key: string, value: any) => any): T;

    /**
     * Clone a value using serialization
     * @param value - Value to clone
     * @returns Cloned value
     */
    clone<T>(value: T): T;

    /**
     * Check if a value is serializable
     * @param value - Value to check
     * @returns True if serializable
     */
    isSerializable(value: any): boolean;
}

/**
 * Type utility functions
 */
export interface TypeUtils {
    TYPE_IDS: {
        NIL: 0;
        BOOL: 1;
        INT: 2;
        FLOAT: 3;
        STRING: 4;
        VECTOR2: 5;
        VECTOR2I: 6;
        RECT2: 7;
        RECT2I: 8;
        VECTOR3: 9;
        VECTOR3I: 10;
        TRANSFORM2D: 11;
        VECTOR4: 12;
        VECTOR4I: 13;
        PLANE: 14;
        QUATERNION: 15;
        AABB: 16;
        BASIS: 17;
        TRANSFORM3D: 18;
        PROJECTION: 19;
        COLOR: 20;
        STRING_NAME: 21;
        NODE_PATH: 22;
        RID: 23;
        OBJECT: 24;
        CALLABLE: 25;
        SIGNAL: 26;
        DICTIONARY: 27;
        ARRAY: 28;
        PACKED_BYTE_ARRAY: 29;
        PACKED_INT32_ARRAY: 30;
        PACKED_INT64_ARRAY: 31;
        PACKED_FLOAT32_ARRAY: 32;
        PACKED_FLOAT64_ARRAY: 33;
        PACKED_STRING_ARRAY: 34;
        PACKED_VECTOR2_ARRAY: 35;
        PACKED_VECTOR3_ARRAY: 36;
        PACKED_COLOR_ARRAY: 37;
        PACKED_VECTOR4_ARRAY: 38;
    };

    TYPE_NAMES: {
        [key: number]: string;
    };

    TYPE_NAME_TO_ID: {
        [key: string]: number;
    };

    /**
     * Get Luxarion type ID for a value
     * @param value - Value to check
     * @returns Type ID
     */
    getTypeId(value: any): number;

    /**
     * Get type name from type ID
     * @param typeId - Type ID
     * @returns Type name
     */
    getTypeName(typeId: number): string;

    /**
     * Get type ID from type name
     * @param typeName - Type name
     * @returns Type ID, or -1 if not found
     */
    getTypeIdFromName(typeName: string): number;

    /**
     * Check if value is of a specific type
     * @param value - Value to check
     * @param typeId - Type ID to compare against
     * @returns True if value is of the specified type
     */
    isType(value: any, typeId: number): boolean;

    /**
     * Check if value is a numeric type (int or float)
     * @param value - Value to check
     * @returns True if value is numeric
     */
    isNumeric(value: any): boolean;

    /**
     * Check if value is an array type
     * @param value - Value to check
     * @returns True if value is an array
     */
    isArray(value: any): boolean;

    /**
     * Check if value is a vector type
     * @param value - Value to check
     * @returns True if value is a vector
     */
    isVector(value: any): boolean;
}

/**
 * Error utility functions
 */
export interface ErrorUtils {
    ERROR_NAMES: {
        [key: number]: string;
    };

    /**
     * Get error name from error code
     * @param errorCode - Error code
     * @returns Error name
     */
    getErrorName(errorCode: number): string;

    /**
     * Check if error code indicates success
     * @param errorCode - Error code
     * @returns True if code is OK
     */
    isOk(errorCode: number): boolean;

    /**
     * Check if error code indicates failure
     * @param errorCode - Error code
     * @returns True if code is not OK
     */
    isError(errorCode: number): boolean;

    /**
     * Check if error code is fatal
     * @param errorCode - Error code
     * @returns True if code >= 2
     */
    isFatal(errorCode: number): boolean;

    /**
     * Get error severity level
     * @param errorCode - Error code
     * @returns Severity level
     */
    getErrorSeverity(errorCode: number): 'ok' | 'warning' | 'error' | 'fatal';
}

/**
 * Luxarion Error class
 */
export interface LuxarionError extends Error {
    code: number;
    cause: any;

    /**
     * Check if error is OK (no error)
     * @returns True if code is OK
     */
    isOk(): boolean;

    /**
     * Check if error is fatal
     * @returns True if code >= 2
     */
    isFatal(): boolean;

    /**
     * Get the error severity level
     * @returns Severity level
     */
    getSeverity(): 'ok' | 'warning' | 'error' | 'fatal';

    /**
     * Get the error name
     * @returns Error name
     */
    getErrorName(): string;

    /**
     * Convert to string
     * @returns String representation
     */
    toString(): string;

    /**
     * Convert to JSON
     * @returns JSON representation
     */
    toJSON(): {
        name: string;
        code: number;
        message: string;
        severity: string;
        cause: any;
        stack: string | undefined;
    };
}

export interface LuxarionErrorConstructor {
    new (code: number, message?: string, cause?: any): LuxarionError;
    fromCode(code: number, message?: string, cause?: any): LuxarionError;
    fromError(error: Error, code?: number): LuxarionError;
}

/**
 * Matrix utility functions
 */
export interface MatrixUtils {
    /**
     * Convert projection matrix to normalized device coordinates
     * Adjusts the matrix so that the depth range is [0,1] instead of [-1,1]
     * @param projectionMatrix - Matrix object with elements property
     */
    toNormalizedProjection(projectionMatrix: Mat4 | Float32Array): void;

    /**
     * Convert projection matrix to reversed depth
     * Modifies the matrix to use reversed depth for better precision
     * @param projectionMatrix - Matrix object with elements property
     */
    toReversedProjection(projectionMatrix: Mat4 | Float32Array): Float32Array;

    /**
     * Get reversed depth function
     * @param depthFunc - Original depth function
     * @returns Reversed depth function
     */
    getReversedDepthFunc(depthFunc: number): number;

    /**
     * Check if a projection matrix is perspective
     * @param projectionMatrix - Matrix object with elements property
     * @returns True if perspective matrix
     */
    isPerspectiveMatrix(projectionMatrix: Mat4 | Float32Array): boolean;

    /**
     * Check if a projection matrix is orthographic
     * @param projectionMatrix - Matrix object with elements property
     * @returns True if orthographic matrix
     */
    isOrthographicMatrix(projectionMatrix: Mat4 | Float32Array): boolean;

    /**
     * Extract camera frustum planes from a projection matrix
     * @param projectionMatrix - Matrix object with elements property
     * @param viewMatrix - View matrix object with elements property
     * @returns Object containing frustum planes
     */
    extractFrustumPlanes(projectionMatrix: Mat4 | Float32Array, viewMatrix: Mat4 | Float32Array): {
        left: [number, number, number, number];
        right: [number, number, number, number];
        bottom: [number, number, number, number];
        top: [number, number, number, number];
        near: [number, number, number, number];
        far: [number, number, number, number];
    };

    /**
     * Create a perspective projection matrix
     * @param fov - Field of view in radians
     * @param aspect - Aspect ratio (width/height)
     * @param near - Near clipping plane
     * @param far - Far clipping plane
     * @returns 4x4 projection matrix as Float32Array
     */
    perspective(fov: number, aspect: number, near: number, far: number): Float32Array;

    /**
     * Create an orthographic projection matrix
     * @param left - Left clipping plane
     * @param right - Right clipping plane
     * @param bottom - Bottom clipping plane
     * @param top - Top clipping plane
     * @param near - Near clipping plane
     * @param far - Far clipping plane
     * @returns 4x4 projection matrix as Float32Array
     */
    ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array;

    /**
     * Create a look-at view matrix
     * @param eye - Camera position
     * @param target - Target position
     * @param up - Up vector
     * @returns 4x4 view matrix as Float32Array
     */
    lookAt(eye: [number, number, number], target: [number, number, number], up: [number, number, number]): Float32Array;

    /**
     * Create a rotation matrix (XYZ order)
     * @param angleX - Rotation around X axis in radians
     * @param angleY - Rotation around Y axis in radians
     * @param angleZ - Rotation around Z axis in radians
     * @returns 4x4 rotation matrix as Float32Array
     */
    rotationXYZ(angleX: number, angleY: number, angleZ: number): Float32Array;

    /**
     * Multiply two 4x4 matrices
     * @param a - First matrix
     * @param b - Second matrix
     * @returns Product matrix as Float32Array
     */
    multiply4(a: Float32Array | Mat4, b: Float32Array | Mat4): Float32Array;

    /**
     * Reverse depth function mapping
     */
    REVERSED_DEPTH_MAP: {
        [key: number]: number;
    };
}

/**
 * DOM utility functions
 */
export interface DOMUtils {
    /**
     * Create element with namespace (HTML namespace)
     * @param name - Element tag name
     * @param namespace - XML namespace
     * @returns Created element
     */
    createElementNS(name: string, namespace?: string): Element;

    /**
     * Create canvas element with display block style
     * @param width - Canvas width
     * @param height - Canvas height
     * @returns Created canvas element
     */
    createCanvasElement(width?: number, height?: number): HTMLCanvasElement;

    /**
     * Create an element with specified attributes and children
     * @param tag - Element tag name
     * @param attributes - Element attributes
     * @param children - Child elements or text content
     * @returns Created element
     */
    createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        attributes?: {
            className?: string;
            style?: Partial<CSSStyleDeclaration>;
            dataset?: Record<string, string>;
            [key: string]: any;
        },
        children?: string | Node | Node[]
    ): HTMLElementTagNameMap[K];

    /**
     * Get element by ID with error handling
     * @param id - Element ID
     * @param context - Context element
     * @returns Element or null if not found
     */
    getElement(id: string, context?: Document | Element): Element | null;

    /**
     * Query selector with error handling
     * @param selector - CSS selector
     * @param context - Context element
     * @returns Element or null if not found
     */
    querySelector<K extends keyof HTMLElementTagNameMap>(
        selector: K,
        context?: Document | Element
    ): HTMLElementTagNameMap[K] | null;

    /**
     * Query selector all with error handling
     * @param selector - CSS selector
     * @param context - Context element
     * @returns Array of matching elements
     */
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(
        selector: K,
        context?: Document | Element
    ): HTMLElementTagNameMap[K][];

    /**
     * Add classes to an element
     * @param element - Target element
     * @param classes - Classes to add
     * @returns The element
     */
    addClass<T extends Element>(element: T, ...classes: string[]): T;

    /**
     * Remove classes from an element
     * @param element - Target element
     * @param classes - Classes to remove
     * @returns The element
     */
    removeClass<T extends Element>(element: T, ...classes: string[]): T;

    /**
     * Toggle a class on an element
     * @param element - Target element
     * @param className - Class to toggle
     * @param force - Force state
     * @returns True if class is present after toggle
     */
    toggleClass<T extends Element>(element: T, className: string, force?: boolean): boolean;

    /**
     * Check if element has a class
     * @param element - Target element
     * @param className - Class to check
     * @returns True if class is present
     */
    hasClass<T extends Element>(element: T, className: string): boolean;

    /**
     * Set element styles
     * @param element - Target element
     * @param styles - Style object
     * @returns The element
     */
    setStyles<T extends Element>(element: T, styles: Partial<CSSStyleDeclaration>): T;

    /**
     * Get element computed style
     * @param element - Target element
     * @param property - CSS property
     * @param pseudoElement - Pseudo element
     * @returns Computed style value
     */
    getComputedStyle<T extends Element>(element: T, property: string, pseudoElement?: string): string;

    /**
     * Check if element is visible
     * @param element - Target element
     * @returns True if element is visible
     */
    isVisible<T extends Element>(element: T): boolean;

    /**
     * Check if element is in viewport
     * @param element - Target element
     * @param offset - Offset in pixels
     * @returns True if element is in viewport
     */
    isInViewport<T extends Element>(element: T, offset?: number): boolean;
}

/**
 * Security options for initialization
 */
export interface SecurityOptions {
    /** Additional allowed origins */
    allowedOrigins?: string[];
    /** Enable strict security mode */
    strictMode?: boolean;
    /** Log violations to console */
    logViolations?: boolean;
    /** Throw error on violation */
    throwOnViolation?: boolean;
    /** Auto-protect critical functions */
    autoProtect?: boolean;
    /** Logger instance */
    logger?: any;
    /** Serializer instance */
    serializer?: any;
}

/**
 * Security violation log entry
 */
export interface SecurityViolation {
    type: string;
    message: string;
    data: any;
    timestamp: number;
    origin: string;
}

/**
 * Security status information
 */
export interface SecurityStatus {
    initialized: boolean;
    authorized: boolean;
    integrity: boolean;
    instanceId: string;
    strictMode: boolean;
    allowedOrigins: string[];
    guardedCount: number;
    sealedCount: number;
    violationCount: number;
    initializationTime: number | null;
    lastIntegrityCheck: number | null;
    integrityPassed: boolean;
    version: string;
    features: {
        originCheck: boolean;
        integrityCheck: boolean;
        functionGuard: boolean;
        objectSealing: boolean;
        obfuscation: boolean;
    };
}

/**
 * Environment verification result
 */
export interface SecurityEnvironment {
    origin: string;
    allowed: boolean;
    integrity: boolean;
    isSecure: boolean;
    timestamp: number;
    version: string;
    name: string;
    vendor: string;
    url: string;
    instanceId: string;
    strictMode: boolean;
}

/**
 * Security features
 */
export interface SecurityFeatures {
    originCheck: boolean;
    integrityCheck: boolean;
    functionGuard: boolean;
    objectSealing: boolean;
    obfuscation: boolean;
}

/**
 * SecurityCybork - Advanced Security Module
 * Protects internal/private code from theft, unauthorized access, and reverse engineering
 */
export interface SecurityCybork {
    /**
     * Initialize the SecurityCybork module
     * @param options - Configuration options
     * @returns Security instance
     */
    initSecurity(options?: SecurityOptions): SecurityCybork;

    /**
     * Get the current security instance
     * @returns Security instance with all methods
     * @throws Error if not initialized
     */
    getSecurityInstance(): SecurityCybork;

    /**
     * Check if the current environment is authorized
     * @returns True if authorized
     */
    isAuthorized(): boolean;

    /**
     * Guard a function with security checks
     * @param func - Function to guard
     * @param context - Context for the function
     * @returns Guarded function
     * @throws Error if func is not a function
     */
    guard<T extends Function>(func: T, context?: any): T;

    /**
     * Seal an object to prevent modification
     * @param obj - Object to seal
     * @returns Sealed object
     */
    sealObject<T extends object>(obj: T): T;

    /**
     * Check if an object is sealed
     * @param obj - Object to check
     * @returns True if sealed
     */
    isSealed(obj: object): boolean;

    /**
     * Check the integrity of the module
     * @returns Promise that resolves to true if integrity is verified
     */
    checkIntegrity(): Promise<boolean>;

    /**
     * Obfuscate a string using simple XOR and base64
     * @param str - String to obfuscate
     * @returns Obfuscated string
     */
    obfuscate(str: string): string;

    /**
     * Deobfuscate a string
     * @param encoded - Obfuscated string
     * @returns Original string
     */
    deobfuscate(encoded: string): string;

    /**
     * Get the instance ID
     * @returns Instance ID
     */
    getInstanceId(): string;

    /**
     * Get security status
     * @returns Status object
     */
    getStatus(): SecurityStatus;

    /**
     * Verify the environment
     * @returns Verification result
     */
    verifyEnvironment(): SecurityEnvironment;

    /**
     * Protect a function (alias for guard)
     * @param func - Function to protect
     * @param context - Context for the function
     * @returns Protected function
     */
    protectFunction<T extends Function>(func: T, context?: any): T;

    /**
     * Unprotect a function (remove guard)
     * @param func - Function to unprotect
     * @returns Original function
     */
    unprotectFunction<T extends Function>(func: T): T;

    /**
     * Get violation log
     * @returns Violation log
     */
    getViolationLog(): SecurityViolation[];

    /**
     * Clear violation log
     */
    clearViolationLog(): void;

    /**
     * Add allowed origin
     * @param origin - Origin to add
     */
    addAllowedOrigin(origin: string): void;

    /**
     * Remove allowed origin
     * @param origin - Origin to remove
     */
    removeAllowedOrigin(origin: string): void;

    /**
     * Get security features
     * @returns Security features
     */
    getSecurityFeatures(): SecurityFeatures;
}

/**
 * Engine configuration options
 */
export interface EngineOptions {
    /** Custom DI container */
    container?: Container;
    /** Security module options */
    security?: SecurityOptions;
    /** Logger configuration */
    logger?: any;
    /** Automatically initialize */
    autoInit?: boolean;
    /** Strict mode for security */
    strict?: boolean;
    /** Enable debug logging */
    debug?: boolean;
    /** Error handler callback */
    onError?: (error: any, context?: any) => void;
}

/**
 * Luxarion Engine main instance
 * Manages the engine lifecycle and provides access to all services
 */
export interface LuxarionEngineInstance {
    /**
     * Initialize the engine
     * @param options - Initialization options
     * @returns This instance for chaining
     */
    init(options?: EngineOptions): this;

    /**
     * Get a service from the container
     * @param name - Service name
     * @returns Service instance
     * @throws Error if service not found
     */
    get<T>(name: string): T;

    /**
     * Check if a service exists
     * @param name - Service name
     * @returns True if service exists
     */
    has(name: string): boolean;

    /**
     * Register a service with the container
     * @param name - Service name
     * @param definition - Service definition
     * @param options - Registration options
     * @returns This instance for chaining
     */
    register<T>(name: string, definition: T | ((deps: any, container: Container, context?: any) => T), options?: RegisterOptions): this;

    /**
     * Register a singleton service
     * @param name - Service name
     * @param definition - Service definition
     * @param options - Additional options
     * @returns This instance for chaining
     */
    singleton<T>(name: string, definition: T | ((deps: any, container: Container, context?: any) => T), options?: Omit<RegisterOptions, 'type'>): this;

    /**
     * Register a factory service
     * @param name - Service name
     * @param factory - Factory function
     * @param options - Additional options
     * @returns This instance for chaining
     */
    factory<T>(name: string, factory: (deps: any, container: Container, context?: any) => T, options?: Omit<RegisterOptions, 'type'>): this;

    /**
     * Get the DI container
     * @returns The container instance
     */
    getContainer(): Container;

    /**
     * Get engine version information
     * @returns Version information
     */
    getVersion(): Version;

    /**
     * Get engine constants
     * @returns Constants module
     */
    getConstants(): Constants;

    /**
     * Check if the engine is initialized
     * @returns True if initialized
     */
    isInitialized(): boolean;

    /**
     * Dispose the engine and clean up resources
     */
    dispose(): void;

    /**
     * Create a child engine instance
     * @param options - Child configuration
     * @returns Child engine instance
     */
    createChild(options?: EngineOptions): LuxarionEngineInstance;
}

/**
 * Luxarion Engine class
 */
export const LuxarionEngine: {
    /**
     * Create a new Luxarion Engine instance
     * @param options - Engine configuration
     */
    new (options?: EngineOptions): LuxarionEngineInstance;

    /**
     * Static factory method to create an engine instance
     * @param options - Engine configuration
     * @returns Engine instance
     */
    create(options?: EngineOptions): LuxarionEngineInstance;

    /**
     * Static method to get the default engine instance
     * @returns Default engine instance
     */
    getDefault(): LuxarionEngineInstance;
};

/**
 * All utility modules grouped by category
 */
export interface Utils {
    array: ArrayUtils;
    console: ConsoleUtils;
    async: AsyncUtils;
    serialize: SerializeUtils;
    type: TypeUtils;
    error: ErrorUtils;
    matrix: MatrixUtils;
    dom: DOMUtils;
    security: SecurityCybork;
}

/**
 * Default engine instance
 */
export const Luxarion: LuxarionEngineInstance;

/**
 * Constants module
 */
export const Constants: Constants;

/**
 * Version module
 */
export const version: Version;

/**
 * Types module (JSDoc definitions)
 */
export const Types: {
    types: Record<string, any>;
};

/**
 * Container module
 */
export const Container: Container;

/**
 * Utils module (all utilities)
 */
export const Utils: Utils;

/**
 * SecurityCybork module
 */
export const SecurityCybork: SecurityCybork;

/**
 * MatrixUtils module
 */
export const MatrixUtils: MatrixUtils;

/**
 * ArrayUtils module
 */
export const ArrayUtils: ArrayUtils;

/**
 * SerializeUtils module
 */
export const SerializeUtils: SerializeUtils;

/**
 * ConsoleUtils module
 */
export const ConsoleUtils: ConsoleUtils;

/**
 * LuxarionError class constructor
 */
export const LuxarionError: LuxarionErrorConstructor;

/**
 * Service lifetime types
 */
export const ServiceLifetime: {
    SINGLETON: 'singleton';
    FACTORY: 'factory';
    TRANSIENT: 'transient';
};

/**
 * Default export - the Luxarion engine instance
 */
export default Luxarion;
