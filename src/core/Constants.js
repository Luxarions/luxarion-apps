/**
 * Core constants for Luxarion Engine.
 * All constants are defined in UPPER_SNAKE_CASE following JavaScript conventions.
 * This file provides numeric and string constants used throughout the engine.
 * 
 * @module Constants
 * @author Luxarion Labs
 * @version 1.0.0
 */

// Version and Identity
export const VERSION = '1.0.0';
export const NAME = 'Luxarion';
export const VENDOR = 'Luxarion Labs';
export const ENGINE_URL = 'https://luxarion.dev';
export const ENGINE_DOCS = 'https://docs.luxarion.dev';

// Depth comparison functions for the depth test
export const NEVER_DEPTH = 0;
export const ALWAYS_DEPTH = 1;
export const LESS_DEPTH = 2;
export const LESS_EQUAL_DEPTH = 3;
export const EQUAL_DEPTH = 4;
export const GREATER_EQUAL_DEPTH = 5;
export const GREATER_DEPTH = 6;
export const NOT_EQUAL_DEPTH = 7;

// Depth comparison functions mapping for easy lookup
export const DEPTH_FUNCTIONS = {
    NEVER: NEVER_DEPTH,
    ALWAYS: ALWAYS_DEPTH,
    LESS: LESS_DEPTH,
    LESS_EQUAL: LESS_EQUAL_DEPTH,
    EQUAL: EQUAL_DEPTH,
    GREATER_EQUAL: GREATER_EQUAL_DEPTH,
    GREATER: GREATER_DEPTH,
    NOT_EQUAL: NOT_EQUAL_DEPTH
};

// Face culling modes
export const CULL_FACE_NONE = 0;
export const CULL_FACE_BACK = 1;
export const CULL_FACE_FRONT = 2;
export const CULL_FACE_FRONT_BACK = 3;

// Shadow map types
export const BASIC_SHADOW_MAP = 0;
export const PCF_SHADOW_MAP = 1;
export const PCF_SOFT_SHADOW_MAP = 2;
export const VSM_SHADOW_MAP = 3;

// Rendering side (front, back, both)
export const FRONT_SIDE = 0;
export const BACK_SIDE = 1;
export const DOUBLE_SIDE = 2;

// Blending modes
export const NO_BLENDING = 0;
export const NORMAL_BLENDING = 1;
export const ADDITIVE_BLENDING = 2;
export const SUBTRACTIVE_BLENDING = 3;
export const MULTIPLY_BLENDING = 4;
export const CUSTOM_BLENDING = 5;
export const MATERIAL_BLENDING = 6;

// Blend equations
export const ADD_EQUATION = 100;
export const SUBTRACT_EQUATION = 101;
export const REVERSE_SUBTRACT_EQUATION = 102;
export const MIN_EQUATION = 103;
export const MAX_EQUATION = 104;

// Blend factors
export const ZERO_FACTOR = 200;
export const ONE_FACTOR = 201;
export const SRC_COLOR_FACTOR = 202;
export const ONE_MINUS_SRC_COLOR_FACTOR = 203;
export const SRC_ALPHA_FACTOR = 204;
export const ONE_MINUS_SRC_ALPHA_FACTOR = 205;
export const DST_ALPHA_FACTOR = 206;
export const ONE_MINUS_DST_ALPHA_FACTOR = 207;
export const DST_COLOR_FACTOR = 208;
export const ONE_MINUS_DST_COLOR_FACTOR = 209;
export const SRC_ALPHA_SATURATE_FACTOR = 210;
export const CONSTANT_COLOR_FACTOR = 211;
export const ONE_MINUS_CONSTANT_COLOR_FACTOR = 212;
export const CONSTANT_ALPHA_FACTOR = 213;
export const ONE_MINUS_CONSTANT_ALPHA_FACTOR = 214;

// Blend operations
export const MULTIPLY_OPERATION = 0;
export const MIX_OPERATION = 1;
export const ADD_OPERATION = 2;

// Tone mapping modes
export const NO_TONE_MAPPING = 0;
export const LINEAR_TONE_MAPPING = 1;
export const REINHARD_TONE_MAPPING = 2;
export const CINEON_TONE_MAPPING = 3;
export const ACES_FILMIC_TONE_MAPPING = 4;
export const CUSTOM_TONE_MAPPING = 5;
export const AGX_TONE_MAPPING = 6;
export const NEUTRAL_TONE_MAPPING = 7;

// Tone mapping options grouped
export const TONE_MAPPING_OPTIONS = {
    NONE: NO_TONE_MAPPING,
    LINEAR: LINEAR_TONE_MAPPING,
    REINHARD: REINHARD_TONE_MAPPING,
    CINEON: CINEON_TONE_MAPPING,
    ACES_FILMIC: ACES_FILMIC_TONE_MAPPING,
    CUSTOM: CUSTOM_TONE_MAPPING,
    AGX: AGX_TONE_MAPPING,
    NEUTRAL: NEUTRAL_TONE_MAPPING
};

// Binding modes for uniform buffers
export const ATTACHED_BIND_MODE = 'attached';
export const DETACHED_BIND_MODE = 'detached';

// Texture mapping modes
export const UV_MAPPING = 300;
export const CUBE_REFLECTION_MAPPING = 301;
export const CUBE_REFRACTION_MAPPING = 302;
export const EQUIRECTANGULAR_REFLECTION_MAPPING = 303;
export const EQUIRECTANGULAR_REFRACTION_MAPPING = 304;
export const CUBE_UV_REFLECTION_MAPPING = 306;

// Texture wrapping modes
export const REPEAT_WRAPPING = 1000;
export const CLAMP_TO_EDGE_WRAPPING = 1001;
export const MIRRORED_REPEAT_WRAPPING = 1002;

// Texture filtering modes
export const NEAREST_FILTER = 1003;
export const NEAREST_MIPMAP_NEAREST_FILTER = 1004;
export const NEAREST_MIPMAP_LINEAR_FILTER = 1005;
export const LINEAR_FILTER = 1006;
export const LINEAR_MIPMAP_NEAREST_FILTER = 1007;
export const LINEAR_MIPMAP_LINEAR_FILTER = 1008;

// Pixel data types
export const UNSIGNED_BYTE_TYPE = 1009;
export const BYTE_TYPE = 1010;
export const SHORT_TYPE = 1011;
export const UNSIGNED_SHORT_TYPE = 1012;
export const INT_TYPE = 1013;
export const UNSIGNED_INT_TYPE = 1014;
export const FLOAT_TYPE = 1015;
export const HALF_FLOAT_TYPE = 1016;
export const UNSIGNED_SHORT_4444_TYPE = 1017;
export const UNSIGNED_SHORT_5551_TYPE = 1018;
export const UNSIGNED_INT_248_TYPE = 1020;
export const UNSIGNED_INT_5999_TYPE = 35902;
export const UNSIGNED_INT_101111_TYPE = 35899;

// Pixel data types grouped
export const PIXEL_TYPES = {
    UNSIGNED_BYTE: UNSIGNED_BYTE_TYPE,
    BYTE: BYTE_TYPE,
    SHORT: SHORT_TYPE,
    UNSIGNED_SHORT: UNSIGNED_SHORT_TYPE,
    INT: INT_TYPE,
    UNSIGNED_INT: UNSIGNED_INT_TYPE,
    FLOAT: FLOAT_TYPE,
    HALF_FLOAT: HALF_FLOAT_TYPE,
    UNSIGNED_SHORT_4444: UNSIGNED_SHORT_4444_TYPE,
    UNSIGNED_SHORT_5551: UNSIGNED_SHORT_5551_TYPE,
    UNSIGNED_INT_248: UNSIGNED_INT_248_TYPE,
    UNSIGNED_INT_5999: UNSIGNED_INT_5999_TYPE,
    UNSIGNED_INT_101111: UNSIGNED_INT_101111_TYPE
};

// Pixel formats
export const ALPHA_FORMAT = 1021;
export const RGB_FORMAT = 1022;
export const RGBA_FORMAT = 1023;
export const DEPTH_FORMAT = 1026;
export const DEPTH_STENCIL_FORMAT = 1027;
export const RED_FORMAT = 1028;
export const RED_INTEGER_FORMAT = 1029;
export const RG_FORMAT = 1030;
export const RG_INTEGER_FORMAT = 1031;
export const RGB_INTEGER_FORMAT = 1032;
export const RGBA_INTEGER_FORMAT = 1033;

// Pixel formats grouped
export const PIXEL_FORMATS = {
    ALPHA: ALPHA_FORMAT,
    RGB: RGB_FORMAT,
    RGBA: RGBA_FORMAT,
    DEPTH: DEPTH_FORMAT,
    DEPTH_STENCIL: DEPTH_STENCIL_FORMAT,
    RED: RED_FORMAT,
    RED_INTEGER: RED_INTEGER_FORMAT,
    RG: RG_FORMAT,
    RG_INTEGER: RG_INTEGER_FORMAT,
    RGB_INTEGER: RGB_INTEGER_FORMAT,
    RGBA_INTEGER: RGBA_INTEGER_FORMAT
};

// Compressed texture formats (S3TC, PVRTC, ETC, ASTC, BPTC, RGTC)
export const RGB_S3TC_DXT1_FORMAT = 33776;
export const RGBA_S3TC_DXT1_FORMAT = 33777;
export const RGBA_S3TC_DXT3_FORMAT = 33778;
export const RGBA_S3TC_DXT5_FORMAT = 33779;
export const RGB_PVRTC_4BPPV1_FORMAT = 35840;
export const RGB_PVRTC_2BPPV1_FORMAT = 35841;
export const RGBA_PVRTC_4BPPV1_FORMAT = 35842;
export const RGBA_PVRTC_2BPPV1_FORMAT = 35843;
export const RGB_ETC1_FORMAT = 36196;
export const RGB_ETC2_FORMAT = 37492;
export const RGBA_ETC2_EAC_FORMAT = 37496;
export const R11_EAC_FORMAT = 37488;
export const SIGNED_R11_EAC_FORMAT = 37489;
export const RG11_EAC_FORMAT = 37490;
export const SIGNED_RG11_EAC_FORMAT = 37491;
export const RGBA_ASTC_4X4_FORMAT = 37808;
export const RGBA_ASTC_5X4_FORMAT = 37809;
export const RGBA_ASTC_5X5_FORMAT = 37810;
export const RGBA_ASTC_6X5_FORMAT = 37811;
export const RGBA_ASTC_6X6_FORMAT = 37812;
export const RGBA_ASTC_8X5_FORMAT = 37813;
export const RGBA_ASTC_8X6_FORMAT = 37814;
export const RGBA_ASTC_8X8_FORMAT = 37815;
export const RGBA_ASTC_10X5_FORMAT = 37816;
export const RGBA_ASTC_10X6_FORMAT = 37817;
export const RGBA_ASTC_10X8_FORMAT = 37818;
export const RGBA_ASTC_10X10_FORMAT = 37819;
export const RGBA_ASTC_12X10_FORMAT = 37820;
export const RGBA_ASTC_12X12_FORMAT = 37821;
export const RGBA_BPTC_FORMAT = 36492;
export const RGB_BPTC_SIGNED_FORMAT = 36494;
export const RGB_BPTC_UNSIGNED_FORMAT = 36495;
export const RED_RGTC1_FORMAT = 36283;
export const SIGNED_RED_RGTC1_FORMAT = 36284;
export const RED_GREEN_RGTC2_FORMAT = 36285;
export const SIGNED_RED_GREEN_RGTC2_FORMAT = 36286;

// Animation loop modes
export const LOOP_ONCE = 2200;
export const LOOP_REPEAT = 2201;
export const LOOP_PING_PONG = 2202;

// Interpolation types
export const INTERPOLATE_DISCRETE = 2300;
export const INTERPOLATE_LINEAR = 2301;
export const INTERPOLATE_SMOOTH = 2302;
export const INTERPOLATE_BEZIER = 2303;

// Animation ending modes
export const ZERO_CURVATURE_ENDING = 2400;
export const ZERO_SLOPE_ENDING = 2401;
export const WRAP_AROUND_ENDING = 2402;

// Animation blend modes
export const NORMAL_ANIMATION_BLEND_MODE = 2500;
export const ADDITIVE_ANIMATION_BLEND_MODE = 2501;

// Draw modes for geometry
export const TRIANGLES_DRAW_MODE = 0;
export const TRIANGLE_STRIP_DRAW_MODE = 1;
export const TRIANGLE_FAN_DRAW_MODE = 2;

// Depth packing formats
export const BASIC_DEPTH_PACKING = 3200;
export const RGBA_DEPTH_PACKING = 3201;
export const RGB_DEPTH_PACKING = 3202;
export const RG_DEPTH_PACKING = 3203;

// Normal map space
export const TANGENT_SPACE_NORMAL_MAP = 0;
export const OBJECT_SPACE_NORMAL_MAP = 1;

// Color spaces and transfers
export const NO_COLOR_SPACE = '';
export const SRGB_COLOR_SPACE = 'srgb';
export const LINEAR_SRGB_COLOR_SPACE = 'srgb-linear';
export const LINEAR_TRANSFER = 'linear';
export const SRGB_TRANSFER = 'srgb';

// Normal packing
export const NO_NORMAL_PACKING = '';
export const NORMAL_RG_PACKING = 'rg';
export const NORMAL_GA_PACKING = 'ga';

// Stencil operations
export const ZERO_STENCIL_OP = 0;
export const KEEP_STENCIL_OP = 7680;
export const REPLACE_STENCIL_OP = 7681;
export const INCREMENT_STENCIL_OP = 7682;
export const DECREMENT_STENCIL_OP = 7683;
export const INCREMENT_WRAP_STENCIL_OP = 34055;
export const DECREMENT_WRAP_STENCIL_OP = 34056;
export const INVERT_STENCIL_OP = 5386;

// Stencil functions (same as compare functions)
export const NEVER_STENCIL_FUNC = 512;
export const LESS_STENCIL_FUNC = 513;
export const EQUAL_STENCIL_FUNC = 514;
export const LESS_EQUAL_STENCIL_FUNC = 515;
export const GREATER_STENCIL_FUNC = 516;
export const NOT_EQUAL_STENCIL_FUNC = 517;
export const GREATER_EQUAL_STENCIL_FUNC = 518;
export const ALWAYS_STENCIL_FUNC = 519;

// Compare functions (also used for depth and stencil)
export const NEVER_COMPARE = 512;
export const LESS_COMPARE = 513;
export const EQUAL_COMPARE = 514;
export const LESS_EQUAL_COMPARE = 515;
export const GREATER_COMPARE = 516;
export const NOT_EQUAL_COMPARE = 517;
export const GREATER_EQUAL_COMPARE = 518;
export const ALWAYS_COMPARE = 519;

// Buffer usage hints
export const STATIC_DRAW_USAGE = 35044;
export const DYNAMIC_DRAW_USAGE = 35048;
export const STREAM_DRAW_USAGE = 35040;
export const STATIC_READ_USAGE = 35045;
export const DYNAMIC_READ_USAGE = 35049;
export const STREAM_READ_USAGE = 35041;
export const STATIC_COPY_USAGE = 35046;
export const DYNAMIC_COPY_USAGE = 35050;
export const STREAM_COPY_USAGE = 35042;

// GLSL versions
export const GLSL_1 = '100';
export const GLSL_3 = '300 es';

// Coordinate systems
export const WEBGL_COORDINATE_SYSTEM = 2000;
export const WEBGPU_COORDINATE_SYSTEM = 2001;

// Timestamp query types
export const TIMESTAMP_QUERY_COMPUTE = 'compute';
export const TIMESTAMP_QUERY_RENDER = 'render';

// Interpolation sampling types
export const INTERPOLATION_SAMPLING_TYPE_PERSPECTIVE = 'perspective';
export const INTERPOLATION_SAMPLING_TYPE_LINEAR = 'linear';
export const INTERPOLATION_SAMPLING_TYPE_FLAT = 'flat';

// Interpolation sampling modes
export const INTERPOLATION_SAMPLING_MODE_NORMAL = 'normal';
export const INTERPOLATION_SAMPLING_MODE_CENTROID = 'centroid';
export const INTERPOLATION_SAMPLING_MODE_SAMPLE = 'sample';
export const INTERPOLATION_SAMPLING_MODE_FIRST = 'first';
export const INTERPOLATION_SAMPLING_MODE_EITHER = 'either';

// Feature compatibility strings
export const COMPATIBILITY_TEXTURE_COMPARE = 'depthTextureCompare';

// Side identifiers for UI layout
export const SIDE_LEFT = 0;
export const SIDE_TOP = 1;
export const SIDE_RIGHT = 2;
export const SIDE_BOTTOM = 3;

// Corner identifiers
export const CORNER_TOP_LEFT = 0;
export const CORNER_TOP_RIGHT = 1;
export const CORNER_BOTTOM_RIGHT = 2;
export const CORNER_BOTTOM_LEFT = 3;

// Orientation
export const VERTICAL = 0;
export const HORIZONTAL = 1;

// Winding order
export const CLOCKWISE = 0;
export const COUNTERCLOCKWISE = 1;

// Horizontal alignment
export const HORIZONTAL_ALIGNMENT_LEFT = 0;
export const HORIZONTAL_ALIGNMENT_CENTER = 1;
export const HORIZONTAL_ALIGNMENT_RIGHT = 2;
export const HORIZONTAL_ALIGNMENT_FILL = 3;

// Vertical alignment
export const VERTICAL_ALIGNMENT_TOP = 0;
export const VERTICAL_ALIGNMENT_CENTER = 1;
export const VERTICAL_ALIGNMENT_BOTTOM = 2;
export const VERTICAL_ALIGNMENT_FILL = 3;

// Inline alignment (source to target)
export const INLINE_ALIGNMENT_TOP_TO = 0;
export const INLINE_ALIGNMENT_CENTER_TO = 1;
export const INLINE_ALIGNMENT_BASELINE_TO = 2;
export const INLINE_ALIGNMENT_BOTTOM_TO = 3;

// Inline alignment (target to source)
export const INLINE_ALIGNMENT_TO_TOP = 0;
export const INLINE_ALIGNMENT_TO_CENTER = 1;
export const INLINE_ALIGNMENT_TO_BASELINE = 2;
export const INLINE_ALIGNMENT_TO_BOTTOM = 3;

// Inline alignment (simple)
export const INLINE_ALIGNMENT_TOP = 0;
export const INLINE_ALIGNMENT_CENTER = 1;
export const INLINE_ALIGNMENT_BOTTOM = 2;

// Inline alignment masks for image/text
export const INLINE_ALIGNMENT_IMAGE_MASK = 0;
export const INLINE_ALIGNMENT_TEXT_MASK = 1;

// Euler rotation orders
export const EULER_ORDER_XYZ = 0;
export const EULER_ORDER_XZY = 1;
export const EULER_ORDER_YXZ = 2;
export const EULER_ORDER_YZX = 3;
export const EULER_ORDER_ZXY = 4;
export const EULER_ORDER_ZYX = 5;

// Keyboard key codes
export const KEY_NONE = 0;
export const KEY_SPECIAL = 1;
export const KEY_ESCAPE = 2;
export const KEY_TAB = 3;
export const KEY_BACKTAB = 4;
export const KEY_BACKSPACE = 5;
export const KEY_ENTER = 6;
export const KEY_KP_ENTER = 7;
export const KEY_INSERT = 8;
export const KEY_DELETE = 9;
export const KEY_PAUSE = 10;
export const KEY_PRINT = 11;
export const KEY_SYSREQ = 12;
export const KEY_CLEAR = 13;
export const KEY_HOME = 14;
export const KEY_END = 15;
export const KEY_LEFT = 16;
export const KEY_UP = 17;
export const KEY_RIGHT = 18;
export const KEY_DOWN = 19;
export const KEY_PAGEUP = 20;
export const KEY_PAGEDOWN = 21;
export const KEY_SHIFT = 22;
export const KEY_CTRL = 23;
export const KEY_META = 24;
export const KEY_ALT = 25;
export const KEY_CAPSLOCK = 26;
export const KEY_NUMLOCK = 27;
export const KEY_SCROLLLOCK = 28;
export const KEY_F1 = 29;
export const KEY_F2 = 30;
export const KEY_F3 = 31;
export const KEY_F4 = 32;
export const KEY_F5 = 33;
export const KEY_F6 = 34;
export const KEY_F7 = 35;
export const KEY_F8 = 36;
export const KEY_F9 = 37;
export const KEY_F10 = 38;
export const KEY_F11 = 39;
export const KEY_F12 = 40;
export const KEY_F13 = 41;
export const KEY_F14 = 42;
export const KEY_F15 = 43;
export const KEY_F16 = 44;
export const KEY_F17 = 45;
export const KEY_F18 = 46;
export const KEY_F19 = 47;
export const KEY_F20 = 48;
export const KEY_F21 = 49;
export const KEY_F22 = 50;
export const KEY_F23 = 51;
export const KEY_F24 = 52;
export const KEY_F25 = 53;
export const KEY_F26 = 54;
export const KEY_F27 = 55;
export const KEY_F28 = 56;
export const KEY_F29 = 57;
export const KEY_F30 = 58;
export const KEY_F31 = 59;
export const KEY_F32 = 60;
export const KEY_F33 = 61;
export const KEY_F34 = 62;
export const KEY_F35 = 63;
export const KEY_KP_MULTIPLY = 64;
export const KEY_KP_DIVIDE = 65;
export const KEY_KP_SUBTRACT = 66;
export const KEY_KP_PERIOD = 67;
export const KEY_KP_ADD = 68;
export const KEY_KP_0 = 69;
export const KEY_KP_1 = 70;
export const KEY_KP_2 = 71;
export const KEY_KP_3 = 72;
export const KEY_KP_4 = 73;
export const KEY_KP_5 = 74;
export const KEY_KP_6 = 75;
export const KEY_KP_7 = 76;
export const KEY_KP_8 = 77;
export const KEY_KP_9 = 78;
export const KEY_MENU = 79;
export const KEY_HYPER = 80;
export const KEY_HELP = 81;
export const KEY_BACK = 82;
export const KEY_FORWARD = 83;
export const KEY_STOP = 84;
export const KEY_REFRESH = 85;
export const KEY_VOLUMEDOWN = 86;
export const KEY_VOLUMEMUTE = 87;
export const KEY_VOLUMEUP = 88;
export const KEY_MEDIAPLAY = 89;
export const KEY_MEDIASTOP = 90;
export const KEY_MEDIAPREVIOUS = 91;
export const KEY_MEDIANEXT = 92;
export const KEY_MEDIARECORD = 93;
export const KEY_HOMEPAGE = 94;
export const KEY_FAVORITES = 95;
export const KEY_SEARCH = 96;
export const KEY_STANDBY = 97;
export const KEY_OPENURL = 98;
export const KEY_LAUNCHMAIL = 99;
export const KEY_LAUNCHMEDIA = 100;
export const KEY_LAUNCH0 = 101;
export const KEY_LAUNCH1 = 102;
export const KEY_LAUNCH2 = 103;
export const KEY_LAUNCH3 = 104;
export const KEY_LAUNCH4 = 105;
export const KEY_LAUNCH5 = 106;
export const KEY_LAUNCH6 = 107;
export const KEY_LAUNCH7 = 108;
export const KEY_LAUNCH8 = 109;
export const KEY_LAUNCH9 = 110;
export const KEY_LAUNCHA = 111;
export const KEY_LAUNCHB = 112;
export const KEY_LAUNCHC = 113;
export const KEY_LAUNCHD = 114;
export const KEY_LAUNCHE = 115;
export const KEY_LAUNCHF = 116;
export const KEY_GLOBE = 117;
export const KEY_KEYBOARD = 118;
export const KEY_JIS_EISU = 119;
export const KEY_JIS_KANA = 120;
export const KEY_UNKNOWN = 121;
export const KEY_SPACE = 122;
export const KEY_EXCLAM = 123;
export const KEY_QUOTEDBL = 124;
export const KEY_NUMBERSIGN = 125;
export const KEY_DOLLAR = 126;
export const KEY_PERCENT = 127;
export const KEY_AMPERSAND = 128;
export const KEY_APOSTROPHE = 129;
export const KEY_PARENLEFT = 130;
export const KEY_PARENRIGHT = 131;
export const KEY_ASTERISK = 132;
export const KEY_PLUS = 133;
export const KEY_COMMA = 134;
export const KEY_MINUS = 135;
export const KEY_PERIOD = 136;
export const KEY_SLASH = 137;
export const KEY_0 = 138;
export const KEY_1 = 139;
export const KEY_2 = 140;
export const KEY_3 = 141;
export const KEY_4 = 142;
export const KEY_5 = 143;
export const KEY_6 = 144;
export const KEY_7 = 145;
export const KEY_8 = 146;
export const KEY_9 = 147;
export const KEY_COLON = 148;
export const KEY_SEMICOLON = 149;
export const KEY_LESS = 150;
export const KEY_EQUAL = 151;
export const KEY_GREATER = 152;
export const KEY_QUESTION = 153;
export const KEY_AT = 154;
export const KEY_A = 155;
export const KEY_B = 156;
export const KEY_C = 157;
export const KEY_D = 158;
export const KEY_E = 159;
export const KEY_F = 160;
export const KEY_G = 161;
export const KEY_H = 162;
export const KEY_I = 163;
export const KEY_J = 164;
export const KEY_K = 165;
export const KEY_L = 166;
export const KEY_M = 167;
export const KEY_N = 168;
export const KEY_O = 169;
export const KEY_P = 170;
export const KEY_Q = 171;
export const KEY_R = 172;
export const KEY_S = 173;
export const KEY_T = 174;
export const KEY_U = 175;
export const KEY_V = 176;
export const KEY_W = 177;
export const KEY_X = 178;
export const KEY_Y = 179;
export const KEY_Z = 180;
export const KEY_BRACKETLEFT = 181;
export const KEY_BACKSLASH = 182;
export const KEY_BRACKETRIGHT = 183;
export const KEY_ASCIICIRCUM = 184;
export const KEY_UNDERSCORE = 185;
export const KEY_QUOTELEFT = 186;
export const KEY_BRACELEFT = 187;
export const KEY_BAR = 188;
export const KEY_BRACERIGHT = 189;
export const KEY_ASCIITILDE = 190;
export const KEY_YEN = 191;
export const KEY_SECTION = 192;

// Key modifier masks
export const KEY_CODE_MASK = 1 << 0;
export const KEY_MODIFIER_MASK = 1 << 1;
export const KEY_MASK_CMD_OR_CTRL = 1 << 2;
export const KEY_MASK_SHIFT = 1 << 3;
export const KEY_MASK_ALT = 1 << 4;
export const KEY_MASK_META = 1 << 5;
export const KEY_MASK_CTRL = 1 << 6;
export const KEY_MASK_KPAD = 1 << 7;
export const KEY_MASK_GROUP_SWITCH = 1 << 8;

// Key location
export const KEY_LOCATION_UNSPECIFIED = 0;
export const KEY_LOCATION_LEFT = 1;
export const KEY_LOCATION_RIGHT = 2;

// Mouse buttons
export const MOUSE_BUTTON_NONE = 0;
export const MOUSE_BUTTON_LEFT = 1;
export const MOUSE_BUTTON_RIGHT = 2;
export const MOUSE_BUTTON_MIDDLE = 3;
export const MOUSE_BUTTON_WHEEL_UP = 4;
export const MOUSE_BUTTON_WHEEL_DOWN = 5;
export const MOUSE_BUTTON_WHEEL_LEFT = 6;
export const MOUSE_BUTTON_WHEEL_RIGHT = 7;
export const MOUSE_BUTTON_XBUTTON1 = 8;
export const MOUSE_BUTTON_XBUTTON2 = 9;

// Mouse button masks
export const MOUSE_BUTTON_MASK_LEFT = 1 << 0;
export const MOUSE_BUTTON_MASK_RIGHT = 1 << 1;
export const MOUSE_BUTTON_MASK_MIDDLE = 1 << 2;
export const MOUSE_BUTTON_MASK_XBUTTON1 = 1 << 3;
export const MOUSE_BUTTON_MASK_XBUTTON2 = 1 << 4;

// Joystick buttons
export const JOY_BUTTON_INVALID = 0;
export const JOY_BUTTON_A = 1;
export const JOY_BUTTON_B = 2;
export const JOY_BUTTON_X = 3;
export const JOY_BUTTON_Y = 4;
export const JOY_BUTTON_BACK = 5;
export const JOY_BUTTON_GUIDE = 6;
export const JOY_BUTTON_START = 7;
export const JOY_BUTTON_LEFT_STICK = 8;
export const JOY_BUTTON_RIGHT_STICK = 9;
export const JOY_BUTTON_LEFT_SHOULDER = 10;
export const JOY_BUTTON_RIGHT_SHOULDER = 11;
export const JOY_BUTTON_DPAD_UP = 12;
export const JOY_BUTTON_DPAD_DOWN = 13;
export const JOY_BUTTON_DPAD_LEFT = 14;
export const JOY_BUTTON_DPAD_RIGHT = 15;
export const JOY_BUTTON_MISC1 = 16;
export const JOY_BUTTON_PADDLE1 = 17;
export const JOY_BUTTON_PADDLE2 = 18;
export const JOY_BUTTON_PADDLE3 = 19;
export const JOY_BUTTON_PADDLE4 = 20;
export const JOY_BUTTON_TOUCHPAD = 21;
export const JOY_BUTTON_MISC2 = 22;
export const JOY_BUTTON_MISC3 = 23;
export const JOY_BUTTON_MISC4 = 24;
export const JOY_BUTTON_MISC5 = 25;
export const JOY_BUTTON_MISC6 = 26;
export const JOY_BUTTON_SDL_MAX = 27;
export const JOY_BUTTON_MAX = 28;

// Joystick axes
export const JOY_AXIS_INVALID = 0;
export const JOY_AXIS_LEFT_X = 1;
export const JOY_AXIS_LEFT_Y = 2;
export const JOY_AXIS_RIGHT_X = 3;
export const JOY_AXIS_RIGHT_Y = 4;
export const JOY_AXIS_TRIGGER_LEFT = 5;
export const JOY_AXIS_TRIGGER_RIGHT = 6;
export const JOY_AXIS_SDL_MAX = 7;
export const JOY_AXIS_MAX = 8;

// MIDI messages
export const MIDI_MESSAGE_NONE = 0;
export const MIDI_MESSAGE_NOTE_OFF = 1;
export const MIDI_MESSAGE_NOTE_ON = 2;
export const MIDI_MESSAGE_AFTERTOUCH = 3;
export const MIDI_MESSAGE_CONTROL_CHANGE = 4;
export const MIDI_MESSAGE_PROGRAM_CHANGE = 5;
export const MIDI_MESSAGE_CHANNEL_PRESSURE = 6;
export const MIDI_MESSAGE_PITCH_BEND = 7;
export const MIDI_MESSAGE_SYSTEM_EXCLUSIVE = 8;
export const MIDI_MESSAGE_QUARTER_FRAME = 9;
export const MIDI_MESSAGE_SONG_POSITION_POINTER = 10;
export const MIDI_MESSAGE_SONG_SELECT = 11;
export const MIDI_MESSAGE_TUNE_REQUEST = 12;
export const MIDI_MESSAGE_TIMING_CLOCK = 13;
export const MIDI_MESSAGE_START = 14;
export const MIDI_MESSAGE_CONTINUE = 15;
export const MIDI_MESSAGE_STOP = 16;
export const MIDI_MESSAGE_ACTIVE_SENSING = 17;
export const MIDI_MESSAGE_SYSTEM_RESET = 18;

// Result codes (OK and errors)
export const OK = 0;
export const FAILED = 1;
export const ERR_UNAVAILABLE = 2;
export const ERR_UNCONFIGURED = 3;
export const ERR_UNAUTHORIZED = 4;
export const ERR_PARAMETER_RANGE_ERROR = 5;
export const ERR_OUT_OF_MEMORY = 6;
export const ERR_FILE_NOT_FOUND = 7;
export const ERR_FILE_BAD_DRIVE = 8;
export const ERR_FILE_BAD_PATH = 9;
export const ERR_FILE_NO_PERMISSION = 10;
export const ERR_FILE_ALREADY_IN_USE = 11;
export const ERR_FILE_CANT_OPEN = 12;
export const ERR_FILE_CANT_WRITE = 13;
export const ERR_FILE_CANT_READ = 14;
export const ERR_FILE_UNRECOGNIZED = 15;
export const ERR_FILE_CORRUPT = 16;
export const ERR_FILE_MISSING_DEPENDENCIES = 17;
export const ERR_FILE_EOF = 18;
export const ERR_CANT_OPEN = 19;
export const ERR_CANT_CREATE = 20;
export const ERR_QUERY_FAILED = 21;
export const ERR_ALREADY_IN_USE = 22;
export const ERR_LOCKED = 23;
export const ERR_TIMEOUT = 24;
export const ERR_CANT_CONNECT = 25;
export const ERR_CANT_RESOLVE = 26;
export const ERR_CONNECTION_ERROR = 27;
export const ERR_CANT_ACQUIRE_RESOURCE = 28;
export const ERR_CANT_FORK = 29;
export const ERR_INVALID_DATA = 30;
export const ERR_INVALID_PARAMETER = 31;
export const ERR_ALREADY_EXISTS = 32;
export const ERR_DOES_NOT_EXIST = 33;
export const ERR_DATABASE_CANT_READ = 34;
export const ERR_DATABASE_CANT_WRITE = 35;
export const ERR_COMPILATION_FAILED = 36;
export const ERR_METHOD_NOT_FOUND = 37;
export const ERR_LINK_FAILED = 38;
export const ERR_SCRIPT_FAILED = 39;
export const ERR_CYCLIC_LINK = 40;
export const ERR_INVALID_DECLARATION = 41;
export const ERR_DUPLICATE_SYMBOL = 42;
export const ERR_PARSE_ERROR = 43;
export const ERR_BUSY = 44;
export const ERR_SKIP = 45;
export const ERR_HELP = 46;
export const ERR_BUG = 47;
export const ERR_PRINTER_ON_FIRE = 48;

// Property hints
export const PROPERTY_HINT_NONE = 0;
export const PROPERTY_HINT_RANGE = 1;
export const PROPERTY_HINT_ENUM = 2;
export const PROPERTY_HINT_ENUM_SUGGESTION = 3;
export const PROPERTY_HINT_EXP_EASING = 4;
export const PROPERTY_HINT_LINK = 5;
export const PROPERTY_HINT_FLAGS = 6;
export const PROPERTY_HINT_LAYERS_2D_RENDER = 7;
export const PROPERTY_HINT_LAYERS_2D_PHYSICS = 8;
export const PROPERTY_HINT_LAYERS_2D_NAVIGATION = 9;
export const PROPERTY_HINT_LAYERS_3D_RENDER = 10;
export const PROPERTY_HINT_LAYERS_3D_PHYSICS = 11;
export const PROPERTY_HINT_LAYERS_3D_NAVIGATION = 12;
export const PROPERTY_HINT_LAYERS_AVOIDANCE = 13;
export const PROPERTY_HINT_FILE = 14;
export const PROPERTY_HINT_DIR = 15;
export const PROPERTY_HINT_GLOBAL_FILE = 16;
export const PROPERTY_HINT_GLOBAL_DIR = 17;
export const PROPERTY_HINT_RESOURCE_TYPE = 18;
export const PROPERTY_HINT_MULTILINE_TEXT = 19;
export const PROPERTY_HINT_EXPRESSION = 20;
export const PROPERTY_HINT_PLACEHOLDER_TEXT = 21;
export const PROPERTY_HINT_COLOR_NO_ALPHA = 22;
export const PROPERTY_HINT_OBJECT_ID = 23;
export const PROPERTY_HINT_TYPE_STRING = 24;
export const PROPERTY_HINT_NODE_PATH_TO_EDITED_NODE = 25;
export const PROPERTY_HINT_OBJECT_TOO_BIG = 26;
export const PROPERTY_HINT_NODE_PATH_VALID_TYPES = 27;
export const PROPERTY_HINT_SAVE_FILE = 28;
export const PROPERTY_HINT_GLOBAL_SAVE_FILE = 29;
export const PROPERTY_HINT_INT_IS_OBJECTID = 30;
export const PROPERTY_HINT_INT_IS_POINTER = 31;
export const PROPERTY_HINT_ARRAY_TYPE = 32;
export const PROPERTY_HINT_DICTIONARY_TYPE = 33;
export const PROPERTY_HINT_LOCALE_ID = 34;
export const PROPERTY_HINT_LOCALIZABLE_STRING = 35;
export const PROPERTY_HINT_NODE_TYPE = 36;
export const PROPERTY_HINT_HIDE_QUATERNION_EDIT = 37;
export const PROPERTY_HINT_PASSWORD = 38;
export const PROPERTY_HINT_TOOL_BUTTON = 39;
export const PROPERTY_HINT_ONESHOT = 40;
export const PROPERTY_HINT_GROUP_ENABLE = 41;
export const PROPERTY_HINT_INPUT_NAME = 42;
export const PROPERTY_HINT_FILE_PATH = 43;
export const PROPERTY_HINT_MAX = 44;

// Property usage flags
export const PROPERTY_USAGE_NONE = 0;
export const PROPERTY_USAGE_STORAGE = 1 << 0;
export const PROPERTY_USAGE_EDITOR = 1 << 1;
export const PROPERTY_USAGE_INTERNAL = 1 << 2;
export const PROPERTY_USAGE_CHECKABLE = 1 << 3;
export const PROPERTY_USAGE_CHECKED = 1 << 4;
export const PROPERTY_USAGE_GROUP = 1 << 5;
export const PROPERTY_USAGE_CATEGORY = 1 << 6;
export const PROPERTY_USAGE_SUBGROUP = 1 << 7;
export const PROPERTY_USAGE_CLASS_IS_BITFIELD = 1 << 8;
export const PROPERTY_USAGE_NO_INSTANCE_STATE = 1 << 9;
export const PROPERTY_USAGE_RESTART_IF_CHANGED = 1 << 10;
export const PROPERTY_USAGE_SCRIPT_VARIABLE = 1 << 11;
export const PROPERTY_USAGE_STORE_IF_NULL = 1 << 12;
export const PROPERTY_USAGE_UPDATE_ALL_IF_MODIFIED = 1 << 13;
export const PROPERTY_USAGE_SCRIPT_DEFAULT_VALUE = 1 << 14;
export const PROPERTY_USAGE_CLASS_IS_ENUM = 1 << 15;
export const PROPERTY_USAGE_NIL_IS_VARIANT = 1 << 16;
export const PROPERTY_USAGE_ARRAY = 1 << 17;
export const PROPERTY_USAGE_ALWAYS_DUPLICATE = 1 << 18;
export const PROPERTY_USAGE_NEVER_DUPLICATE = 1 << 19;
export const PROPERTY_USAGE_HIGH_END_GFX = 1 << 20;
export const PROPERTY_USAGE_NODE_PATH_FROM_SCENE_ROOT = 1 << 21;
export const PROPERTY_USAGE_RESOURCE_NOT_PERSISTENT = 1 << 22;
export const PROPERTY_USAGE_KEYING_INCREMENTS = 1 << 23;
export const PROPERTY_USAGE_DEFERRED_SET_RESOURCE = 1 << 24;
export const PROPERTY_USAGE_EDITOR_INSTANTIATE_OBJECT = 1 << 25;
export const PROPERTY_USAGE_EDITOR_BASIC_SETTING = 1 << 26;
export const PROPERTY_USAGE_READ_ONLY = 1 << 27;
export const PROPERTY_USAGE_SECRET = 1 << 28;
export const PROPERTY_USAGE_DEFAULT = 1 << 29;
export const PROPERTY_USAGE_NO_EDITOR = 1 << 30;

// Method flags
export const METHOD_FLAG_NORMAL = 0;
export const METHOD_FLAG_EDITOR = 1 << 0;
export const METHOD_FLAG_CONST = 1 << 1;
export const METHOD_FLAG_VIRTUAL = 1 << 2;
export const METHOD_FLAG_VARARG = 1 << 3;
export const METHOD_FLAG_STATIC = 1 << 4;
export const METHOD_FLAG_OBJECT_CORE = 1 << 5;
export const METHOD_FLAG_VIRTUAL_REQUIRED = 1 << 6;
export const METHOD_FLAGS_DEFAULT = 1 << 7;

// Variant types
export const TYPE_NIL = 0;
export const TYPE_BOOL = 1;
export const TYPE_INT = 2;
export const TYPE_FLOAT = 3;
export const TYPE_STRING = 4;
export const TYPE_VECTOR2 = 5;
export const TYPE_VECTOR2I = 6;
export const TYPE_RECT2 = 7;
export const TYPE_RECT2I = 8;
export const TYPE_VECTOR3 = 9;
export const TYPE_VECTOR3I = 10;
export const TYPE_TRANSFORM2D = 11;
export const TYPE_VECTOR4 = 12;
export const TYPE_VECTOR4I = 13;
export const TYPE_PLANE = 14;
export const TYPE_QUATERNION = 15;
export const TYPE_AABB = 16;
export const TYPE_BASIS = 17;
export const TYPE_TRANSFORM3D = 18;
export const TYPE_PROJECTION = 19;
export const TYPE_COLOR = 20;
export const TYPE_STRING_NAME = 21;
export const TYPE_NODE_PATH = 22;
export const TYPE_RID = 23;
export const TYPE_OBJECT = 24;
export const TYPE_CALLABLE = 25;
export const TYPE_SIGNAL = 26;
export const TYPE_DICTIONARY = 27;
export const TYPE_ARRAY = 28;
export const TYPE_PACKED_BYTE_ARRAY = 29;
export const TYPE_PACKED_INT32_ARRAY = 30;
export const TYPE_PACKED_INT64_ARRAY = 31;
export const TYPE_PACKED_FLOAT32_ARRAY = 32;
export const TYPE_PACKED_FLOAT64_ARRAY = 33;
export const TYPE_PACKED_STRING_ARRAY = 34;
export const TYPE_PACKED_VECTOR2_ARRAY = 35;
export const TYPE_PACKED_VECTOR3_ARRAY = 36;
export const TYPE_PACKED_COLOR_ARRAY = 37;
export const TYPE_PACKED_VECTOR4_ARRAY = 38;
export const TYPE_MAX = 39;

// Operators
export const OP_EQUAL = 0;
export const OP_NOT_EQUAL = 1;
export const OP_LESS = 2;
export const OP_LESS_EQUAL = 3;
export const OP_GREATER = 4;
export const OP_GREATER_EQUAL = 5;
export const OP_ADD = 6;
export const OP_SUBTRACT = 7;
export const OP_MULTIPLY = 8;
export const OP_DIVIDE = 9;
export const OP_NEGATE = 10;
export const OP_POSITIVE = 11;
export const OP_MODULE = 12;
export const OP_POWER = 13;
export const OP_SHIFT_LEFT = 14;
export const OP_SHIFT_RIGHT = 15;
export const OP_BIT_AND = 16;
export const OP_BIT_OR = 17;
export const OP_BIT_XOR = 18;
export const OP_BIT_NEGATE = 19;
export const OP_AND = 20;
export const OP_OR = 21;
export const OP_XOR = 22;
export const OP_NOT = 23;
export const OP_IN = 24;
export const OP_MAX = 25;

// Integer limits
export const UINT8_MAX = 0xFF;
export const UINT16_MAX = 0xFFFF;
export const UINT32_MAX = 0xFFFFFFFF;
export const INT8_MIN = -0x80;
export const INT8_MAX = 0x7F;
export const INT16_MIN = -0x8000;
export const INT16_MAX = 0x7FFF;
export const INT32_MIN = -0x80000000;
export const INT32_MAX = 0x7FFFFFFF;
export const INT64_MIN = -0x8000000000000000n;
export const INT64_MAX = 0x7FFFFFFFFFFFFFFFn;

// Renderer defaults
export const RENDERER_DEFAULTS = {
    CLEAR_COLOR: [0, 0, 0, 1],
    CLEAR_DEPTH: 1,
    CLEAR_STENCIL: 0,
    PIXEL_RATIO: 1,
    SAMPLES: 0,
    DEPTH: true,
    STENCIL: false,
    ALPHA: true,
    ANTIALIAS: false,
    PREMULTIPLIED_ALPHA: true,
    PRESERVE_DRAWING_BUFFER: false,
    POWER_PREFERENCE: 'default',
    FAIL_IF_MAJOR_PERFORMANCE_CAVEAT: false
};

// Scene defaults
export const SCENE_DEFAULTS = {
    BACKGROUND: [0, 0, 0, 1],
    FOG: null,
    ENVIRONMENT: null,
    OVERRIDE_MATERIAL: null,
    AUTO_UPDATE: true,
    MATRIX_AUTO_UPDATE: true
};

// Camera defaults
export const CAMERA_DEFAULTS = {
    PERSPECTIVE: {
        FOV: 45,
        ASPECT: 1.6,
        NEAR: 0.1,
        FAR: 100
    },
    ORTHOGRAPHIC: {
        LEFT: -1,
        RIGHT: 1,
        TOP: 1,
        BOTTOM: -1,
        NEAR: 0.1,
        FAR: 100
    },
    STEREO: {
        IPD: 0.064,
        FOV: 45,
        ASPECT: 1.6,
        NEAR: 0.1,
        FAR: 100
    }
};

// Math constants
export const MATH_CONSTANTS = {
    PI: Math.PI,
    PI2: Math.PI * 2,
    PI_HALF: Math.PI / 2,
    PI_QUARTER: Math.PI / 4,
    EPSILON: 1e-10,
    EPSILON2: 1e-6,
    INFINITY: Infinity,
    NEGATIVE_INFINITY: -Infinity,
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI
};

// Material constants (grouped)
export const MATERIAL_CONSTANTS = {
    SIDE: {
        FRONT: FRONT_SIDE,
        BACK: BACK_SIDE,
        DOUBLE: DOUBLE_SIDE
    },
    BLENDING: {
        NONE: NO_BLENDING,
        NORMAL: NORMAL_BLENDING,
        ADDITIVE: ADDITIVE_BLENDING,
        SUBTRACTIVE: SUBTRACTIVE_BLENDING,
        MULTIPLY: MULTIPLY_BLENDING,
        CUSTOM: CUSTOM_BLENDING
    },
    DEPTH_FUNC: {
        NEVER: NEVER_DEPTH,
        LESS: LESS_DEPTH,
        EQUAL: EQUAL_DEPTH,
        LEQUAL: LESS_EQUAL_DEPTH,
        GREATER: GREATER_DEPTH,
        NOTEQUAL: NOT_EQUAL_DEPTH,
        GEQUAL: GREATER_EQUAL_DEPTH,
        ALWAYS: ALWAYS_DEPTH
    },
    SHADOW_MAP: {
        BASIC: BASIC_SHADOW_MAP,
        PCF: PCF_SHADOW_MAP,
        PCF_SOFT: PCF_SOFT_SHADOW_MAP,
        VSM: VSM_SHADOW_MAP
    }
};

// Object type names
export const OBJECT_TYPES = {
    SCENE: 'Scene',
    CAMERA: 'Camera',
    MESH: 'Mesh',
    LIGHT: 'Light',
    GROUP: 'Group',
    SPRITE: 'Sprite',
    LINE: 'Line',
    POINTS: 'Points',
    BONE: 'Bone',
    SKELETON: 'Skeleton',
    SKINNED_MESH: 'SkinnedMesh',
    INSTANCED_MESH: 'InstancedMesh'
};

// WebGL constants (matching WebGL numeric values)
export const WEBGL_CONSTANTS = {
    NEVER: 0x0200,
    LESS: 0x0201,
    EQUAL: 0x0202,
    LEQUAL: 0x0203,
    GREATER: 0x0204,
    NOTEQUAL: 0x0205,
    GEQUAL: 0x0206,
    ALWAYS: 0x0207,
    ZERO: 0,
    ONE: 1,
    SRC_COLOR: 0x0300,
    ONE_MINUS_SRC_COLOR: 0x0301,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    DST_ALPHA: 0x0304,
    ONE_MINUS_DST_ALPHA: 0x0305,
    DST_COLOR: 0x0306,
    ONE_MINUS_DST_COLOR: 0x0307,
    SRC_ALPHA_SATURATE: 0x0308,
    CONSTANT_COLOR: 0x8001,
    ONE_MINUS_CONSTANT_COLOR: 0x8002,
    CONSTANT_ALPHA: 0x8003,
    ONE_MINUS_CONSTANT_ALPHA: 0x8004,
    FUNC_ADD: 0x8006,
    FUNC_SUBTRACT: 0x800A,
    FUNC_REVERSE_SUBTRACT: 0x800B,
    FUNC_MIN: 0x8007,
    FUNC_MAX: 0x8008,
    NONE: 0,
    FRONT: 0x0404,
    BACK: 0x0405,
    FRONT_AND_BACK: 0x0408,
    ALPHA: 0x1906,
    RGB: 0x1907,
    RGBA: 0x1908,
    LUMINANCE: 0x1909,
    LUMINANCE_ALPHA: 0x190A,
    DEPTH_COMPONENT: 0x1902,
    DEPTH_STENCIL: 0x84F9,
    UNSIGNED_BYTE: 0x1401,
    UNSIGNED_SHORT: 0x1403,
    UNSIGNED_INT: 0x1405,
    HALF_FLOAT: 0x140B,
    FLOAT: 0x1406,
    UNSIGNED_INT_24_8: 0x84FA,
    UNSIGNED_SHORT_4_4_4_4: 0x8033,
    UNSIGNED_SHORT_5_5_5_1: 0x8034,
    UNSIGNED_SHORT_5_6_5: 0x8363,
    NEAREST: 0x2600,
    LINEAR: 0x2601,
    NEAREST_MIPMAP_NEAREST: 0x2700,
    LINEAR_MIPMAP_NEAREST: 0x2701,
    NEAREST_MIPMAP_LINEAR: 0x2702,
    LINEAR_MIPMAP_LINEAR: 0x2703,
    REPEAT: 0x2901,
    CLAMP_TO_EDGE: 0x812F,
    MIRRORED_REPEAT: 0x8370,
    CLAMP_TO_BORDER: 0x812D,
    TEXTURE_2D: 0x0DE1,
    TEXTURE_CUBE_MAP: 0x8513,
    TEXTURE_3D: 0x806F,
    TEXTURE_2D_ARRAY: 0x8C1A,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    UNIFORM_BUFFER: 0x8A11,
    TEXTURE_BUFFER: 0x8C2A,
    FRAMEBUFFER: 0x8D40,
    RENDERBUFFER: 0x8D41,
    COLOR_ATTACHMENT0: 0x8CE0,
    DEPTH_ATTACHMENT: 0x8D00,
    STENCIL_ATTACHMENT: 0x8D20,
    DEPTH_STENCIL_ATTACHMENT: 0x821A,
    POINTS: 0x0000,
    LINES: 0x0001,
    LINE_LOOP: 0x0002,
    LINE_STRIP: 0x0003,
    TRIANGLES: 0x0004,
    TRIANGLE_STRIP: 0x0005,
    TRIANGLE_FAN: 0x0006
};

// Security constants
export const SECURITY_ALLOWED_ORIGINS = [
    'https://luxarion.dev',
    'https://app.luxarion.dev',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
];

export const SECURITY_INTEGRITY_HASH = 'luxarion-integrity-v1';
export const SECURITY_VERSION = '1.0.0';
export const SECURITY_FEATURES = {
    ORIGIN_CHECK: true,
    INTEGRITY_CHECK: true,
    FUNCTION_GUARD: true,
    OBJECT_SEALING: true,
    OBFUSCATION: true
};

export const SECURITY_DEFAULTS = {
    STRICT_MODE: false,
    AUTO_INIT: true,
    ALLOW_UNKNOWN_ORIGIN: false,
    LOG_VIOLATIONS: true,
    THROW_ON_VIOLATION: true
};

// Default export of all constants for convenience
export default {
    VERSION,
    NAME,
    VENDOR,
    ENGINE_URL,
    ENGINE_DOCS,
    NEVER_DEPTH,
    ALWAYS_DEPTH,
    LESS_DEPTH,
    LESS_EQUAL_DEPTH,
    EQUAL_DEPTH,
    GREATER_EQUAL_DEPTH,
    GREATER_DEPTH,
    NOT_EQUAL_DEPTH,
    DEPTH_FUNCTIONS,
    CULL_FACE_NONE,
    CULL_FACE_BACK,
    CULL_FACE_FRONT,
    CULL_FACE_FRONT_BACK,
    BASIC_SHADOW_MAP,
    PCF_SHADOW_MAP,
    PCF_SOFT_SHADOW_MAP,
    VSM_SHADOW_MAP,
    FRONT_SIDE,
    BACK_SIDE,
    DOUBLE_SIDE,
    NO_BLENDING,
    NORMAL_BLENDING,
    ADDITIVE_BLENDING,
    SUBTRACTIVE_BLENDING,
    MULTIPLY_BLENDING,
    CUSTOM_BLENDING,
    MATERIAL_BLENDING,
    ADD_EQUATION,
    SUBTRACT_EQUATION,
    REVERSE_SUBTRACT_EQUATION,
    MIN_EQUATION,
    MAX_EQUATION,
    ZERO_FACTOR,
    ONE_FACTOR,
    SRC_COLOR_FACTOR,
    ONE_MINUS_SRC_COLOR_FACTOR,
    SRC_ALPHA_FACTOR,
    ONE_MINUS_SRC_ALPHA_FACTOR,
    DST_ALPHA_FACTOR,
    ONE_MINUS_DST_ALPHA_FACTOR,
    DST_COLOR_FACTOR,
    ONE_MINUS_DST_COLOR_FACTOR,
    SRC_ALPHA_SATURATE_FACTOR,
    CONSTANT_COLOR_FACTOR,
    ONE_MINUS_CONSTANT_COLOR_FACTOR,
    CONSTANT_ALPHA_FACTOR,
    ONE_MINUS_CONSTANT_ALPHA_FACTOR,
    MULTIPLY_OPERATION,
    MIX_OPERATION,
    ADD_OPERATION,
    NO_TONE_MAPPING,
    LINEAR_TONE_MAPPING,
    REINHARD_TONE_MAPPING,
    CINEON_TONE_MAPPING,
    ACES_FILMIC_TONE_MAPPING,
    CUSTOM_TONE_MAPPING,
    AGX_TONE_MAPPING,
    NEUTRAL_TONE_MAPPING,
    TONE_MAPPING_OPTIONS,
    ATTACHED_BIND_MODE,
    DETACHED_BIND_MODE,
    UV_MAPPING,
    CUBE_REFLECTION_MAPPING,
    CUBE_REFRACTION_MAPPING,
    EQUIRECTANGULAR_REFLECTION_MAPPING,
    EQUIRECTANGULAR_REFRACTION_MAPPING,
    CUBE_UV_REFLECTION_MAPPING,
    REPEAT_WRAPPING,
    CLAMP_TO_EDGE_WRAPPING,
    MIRRORED_REPEAT_WRAPPING,
    NEAREST_FILTER,
    NEAREST_MIPMAP_NEAREST_FILTER,
    NEAREST_MIPMAP_LINEAR_FILTER,
    LINEAR_FILTER,
    LINEAR_MIPMAP_NEAREST_FILTER,
    LINEAR_MIPMAP_LINEAR_FILTER,
    UNSIGNED_BYTE_TYPE,
    BYTE_TYPE,
    SHORT_TYPE,
    UNSIGNED_SHORT_TYPE,
    INT_TYPE,
    UNSIGNED_INT_TYPE,
    FLOAT_TYPE,
    HALF_FLOAT_TYPE,
    UNSIGNED_SHORT_4444_TYPE,
    UNSIGNED_SHORT_5551_TYPE,
    UNSIGNED_INT_248_TYPE,
    UNSIGNED_INT_5999_TYPE,
    UNSIGNED_INT_101111_TYPE,
    PIXEL_TYPES,
    ALPHA_FORMAT,
    RGB_FORMAT,
    RGBA_FORMAT,
    DEPTH_FORMAT,
    DEPTH_STENCIL_FORMAT,
    RED_FORMAT,
    RED_INTEGER_FORMAT,
    RG_FORMAT,
    RG_INTEGER_FORMAT,
    RGB_INTEGER_FORMAT,
    RGBA_INTEGER_FORMAT,
    PIXEL_FORMATS,
    RGB_S3TC_DXT1_FORMAT,
    RGBA_S3TC_DXT1_FORMAT,
    RGBA_S3TC_DXT3_FORMAT,
    RGBA_S3TC_DXT5_FORMAT,
    RGB_PVRTC_4BPPV1_FORMAT,
    RGB_PVRTC_2BPPV1_FORMAT,
    RGBA_PVRTC_4BPPV1_FORMAT,
    RGBA_PVRTC_2BPPV1_FORMAT,
    RGB_ETC1_FORMAT,
    RGB_ETC2_FORMAT,
    RGBA_ETC2_EAC_FORMAT,
    R11_EAC_FORMAT,
    SIGNED_R11_EAC_FORMAT,
    RG11_EAC_FORMAT,
    SIGNED_RG11_EAC_FORMAT,
    RGBA_ASTC_4X4_FORMAT,
    RGBA_ASTC_5X4_FORMAT,
    RGBA_ASTC_5X5_FORMAT,
    RGBA_ASTC_6X5_FORMAT,
    RGBA_ASTC_6X6_FORMAT,
    RGBA_ASTC_8X5_FORMAT,
    RGBA_ASTC_8X6_FORMAT,
    RGBA_ASTC_8X8_FORMAT,
    RGBA_ASTC_10X5_FORMAT,
    RGBA_ASTC_10X6_FORMAT,
    RGBA_ASTC_10X8_FORMAT,
    RGBA_ASTC_10X10_FORMAT,
    RGBA_ASTC_12X10_FORMAT,
    RGBA_ASTC_12X12_FORMAT,
    RGBA_BPTC_FORMAT,
    RGB_BPTC_SIGNED_FORMAT,
    RGB_BPTC_UNSIGNED_FORMAT,
    RED_RGTC1_FORMAT,
    SIGNED_RED_RGTC1_FORMAT,
    RED_GREEN_RGTC2_FORMAT,
    SIGNED_RED_GREEN_RGTC2_FORMAT,
    LOOP_ONCE,
    LOOP_REPEAT,
    LOOP_PING_PONG,
    INTERPOLATE_DISCRETE,
    INTERPOLATE_LINEAR,
    INTERPOLATE_SMOOTH,
    INTERPOLATE_BEZIER,
    ZERO_CURVATURE_ENDING,
    ZERO_SLOPE_ENDING,
    WRAP_AROUND_ENDING,
    NORMAL_ANIMATION_BLEND_MODE,
    ADDITIVE_ANIMATION_BLEND_MODE,
    TRIANGLES_DRAW_MODE,
    TRIANGLE_STRIP_DRAW_MODE,
    TRIANGLE_FAN_DRAW_MODE,
    BASIC_DEPTH_PACKING,
    RGBA_DEPTH_PACKING,
    RGB_DEPTH_PACKING,
    RG_DEPTH_PACKING,
    TANGENT_SPACE_NORMAL_MAP,
    OBJECT_SPACE_NORMAL_MAP,
    NO_COLOR_SPACE,
    SRGB_COLOR_SPACE,
    LINEAR_SRGB_COLOR_SPACE,
    LINEAR_TRANSFER,
    SRGB_TRANSFER,
    NO_NORMAL_PACKING,
    NORMAL_RG_PACKING,
    NORMAL_GA_PACKING,
    ZERO_STENCIL_OP,
    KEEP_STENCIL_OP,
    REPLACE_STENCIL_OP,
    INCREMENT_STENCIL_OP,
    DECREMENT_STENCIL_OP,
    INCREMENT_WRAP_STENCIL_OP,
    DECREMENT_WRAP_STENCIL_OP,
    INVERT_STENCIL_OP,
    NEVER_STENCIL_FUNC,
    LESS_STENCIL_FUNC,
    EQUAL_STENCIL_FUNC,
    LESS_EQUAL_STENCIL_FUNC,
    GREATER_STENCIL_FUNC,
    NOT_EQUAL_STENCIL_FUNC,
    GREATER_EQUAL_STENCIL_FUNC,
    ALWAYS_STENCIL_FUNC,
    NEVER_COMPARE,
    LESS_COMPARE,
    EQUAL_COMPARE,
    LESS_EQUAL_COMPARE,
    GREATER_COMPARE,
    NOT_EQUAL_COMPARE,
    GREATER_EQUAL_COMPARE,
    ALWAYS_COMPARE,
    STATIC_DRAW_USAGE,
    DYNAMIC_DRAW_USAGE,
    STREAM_DRAW_USAGE,
    STATIC_READ_USAGE,
    DYNAMIC_READ_USAGE,
    STREAM_READ_USAGE,
    STATIC_COPY_USAGE,
    DYNAMIC_COPY_USAGE,
    STREAM_COPY_USAGE,
    GLSL_1,
    GLSL_3,
    WEBGL_COORDINATE_SYSTEM,
    WEBGPU_COORDINATE_SYSTEM,
    TIMESTAMP_QUERY_COMPUTE,
    TIMESTAMP_QUERY_RENDER,
    INTERPOLATION_SAMPLING_TYPE_PERSPECTIVE,
    INTERPOLATION_SAMPLING_TYPE_LINEAR,
    INTERPOLATION_SAMPLING_TYPE_FLAT,
    INTERPOLATION_SAMPLING_MODE_NORMAL,
    INTERPOLATION_SAMPLING_MODE_CENTROID,
    INTERPOLATION_SAMPLING_MODE_SAMPLE,
    INTERPOLATION_SAMPLING_MODE_FIRST,
    INTERPOLATION_SAMPLING_MODE_EITHER,
    COMPATIBILITY_TEXTURE_COMPARE,
    SIDE_LEFT,
    SIDE_TOP,
    SIDE_RIGHT,
    SIDE_BOTTOM,
    CORNER_TOP_LEFT,
    CORNER_TOP_RIGHT,
    CORNER_BOTTOM_RIGHT,
    CORNER_BOTTOM_LEFT,
    VERTICAL,
    HORIZONTAL,
    CLOCKWISE,
    COUNTERCLOCKWISE,
    HORIZONTAL_ALIGNMENT_LEFT,
    HORIZONTAL_ALIGNMENT_CENTER,
    HORIZONTAL_ALIGNMENT_RIGHT,
    HORIZONTAL_ALIGNMENT_FILL,
    VERTICAL_ALIGNMENT_TOP,
    VERTICAL_ALIGNMENT_CENTER,
    VERTICAL_ALIGNMENT_BOTTOM,
    VERTICAL_ALIGNMENT_FILL,
    INLINE_ALIGNMENT_TOP_TO,
    INLINE_ALIGNMENT_CENTER_TO,
    INLINE_ALIGNMENT_BASELINE_TO,
    INLINE_ALIGNMENT_BOTTOM_TO,
    INLINE_ALIGNMENT_TO_TOP,
    INLINE_ALIGNMENT_TO_CENTER,
    INLINE_ALIGNMENT_TO_BASELINE,
    INLINE_ALIGNMENT_TO_BOTTOM,
    INLINE_ALIGNMENT_TOP,
    INLINE_ALIGNMENT_CENTER,
    INLINE_ALIGNMENT_BOTTOM,
    INLINE_ALIGNMENT_IMAGE_MASK,
    INLINE_ALIGNMENT_TEXT_MASK,
    EULER_ORDER_XYZ,
    EULER_ORDER_XZY,
    EULER_ORDER_YXZ,
    EULER_ORDER_YZX,
    EULER_ORDER_ZXY,
    EULER_ORDER_ZYX,
    KEY_NONE,
    KEY_SPECIAL,
    KEY_ESCAPE,
    KEY_TAB,
    KEY_BACKTAB,
    KEY_BACKSPACE,
    KEY_ENTER,
    KEY_KP_ENTER,
    KEY_INSERT,
    KEY_DELETE,
    KEY_PAUSE,
    KEY_PRINT,
    KEY_SYSREQ,
    KEY_CLEAR,
    KEY_HOME,
    KEY_END,
    KEY_LEFT,
    KEY_UP,
    KEY_RIGHT,
    KEY_DOWN,
    KEY_PAGEUP,
    KEY_PAGEDOWN,
    KEY_SHIFT,
    KEY_CTRL,
    KEY_META,
    KEY_ALT,
    KEY_CAPSLOCK,
    KEY_NUMLOCK,
    KEY_SCROLLLOCK,
    KEY_F1,
    KEY_F2,
    KEY_F3,
    KEY_F4,
    KEY_F5,
    KEY_F6,
    KEY_F7,
    KEY_F8,
    KEY_F9,
    KEY_F10,
    KEY_F11,
    KEY_F12,
    KEY_F13,
    KEY_F14,
    KEY_F15,
    KEY_F16,
    KEY_F17,
    KEY_F18,
    KEY_F19,
    KEY_F20,
    KEY_F21,
    KEY_F22,
    KEY_F23,
    KEY_F24,
    KEY_F25,
    KEY_F26,
    KEY_F27,
    KEY_F28,
    KEY_F29,
    KEY_F30,
    KEY_F31,
    KEY_F32,
    KEY_F33,
    KEY_F34,
    KEY_F35,
    KEY_KP_MULTIPLY,
    KEY_KP_DIVIDE,
    KEY_KP_SUBTRACT,
    KEY_KP_PERIOD,
    KEY_KP_ADD,
    KEY_KP_0,
    KEY_KP_1,
    KEY_KP_2,
    KEY_KP_3,
    KEY_KP_4,
    KEY_KP_5,
    KEY_KP_6,
    KEY_KP_7,
    KEY_KP_8,
    KEY_KP_9,
    KEY_MENU,
    KEY_HYPER,
    KEY_HELP,
    KEY_BACK,
    KEY_FORWARD,
    KEY_STOP,
    KEY_REFRESH,
    KEY_VOLUMEDOWN,
    KEY_VOLUMEMUTE,
    KEY_VOLUMEUP,
    KEY_MEDIAPLAY,
    KEY_MEDIASTOP,
    KEY_MEDIAPREVIOUS,
    KEY_MEDIANEXT,
    KEY_MEDIARECORD,
    KEY_HOMEPAGE,
    KEY_FAVORITES,
    KEY_SEARCH,
    KEY_STANDBY,
    KEY_OPENURL,
    KEY_LAUNCHMAIL,
    KEY_LAUNCHMEDIA,
    KEY_LAUNCH0,
    KEY_LAUNCH1,
    KEY_LAUNCH2,
    KEY_LAUNCH3,
    KEY_LAUNCH4,
    KEY_LAUNCH5,
    KEY_LAUNCH6,
    KEY_LAUNCH7,
    KEY_LAUNCH8,
    KEY_LAUNCH9,
    KEY_LAUNCHA,
    KEY_LAUNCHB,
    KEY_LAUNCHC,
    KEY_LAUNCHD,
    KEY_LAUNCHE,
    KEY_LAUNCHF,
    KEY_GLOBE,
    KEY_KEYBOARD,
    KEY_JIS_EISU,
    KEY_JIS_KANA,
    KEY_UNKNOWN,
    KEY_SPACE,
    KEY_EXCLAM,
    KEY_QUOTEDBL,
    KEY_NUMBERSIGN,
    KEY_DOLLAR,
    KEY_PERCENT,
    KEY_AMPERSAND,
    KEY_APOSTROPHE,
    KEY_PARENLEFT,
    KEY_PARENRIGHT,
    KEY_ASTERISK,
    KEY_PLUS,
    KEY_COMMA,
    KEY_MINUS,
    KEY_PERIOD,
    KEY_SLASH,
    KEY_0,
    KEY_1,
    KEY_2,
    KEY_3,
    KEY_4,
    KEY_5,
    KEY_6,
    KEY_7,
    KEY_8,
    KEY_9,
    KEY_COLON,
    KEY_SEMICOLON,
    KEY_LESS,
    KEY_EQUAL,
    KEY_GREATER,
    KEY_QUESTION,
    KEY_AT,
    KEY_A,
    KEY_B,
    KEY_C,
    KEY_D,
    KEY_E,
    KEY_F,
    KEY_G,
    KEY_H,
    KEY_I,
    KEY_J,
    KEY_K,
    KEY_L,
    KEY_M,
    KEY_N,
    KEY_O,
    KEY_P,
    KEY_Q,
    KEY_R,
    KEY_S,
    KEY_T,
    KEY_U,
    KEY_V,
    KEY_W,
    KEY_X,
    KEY_Y,
    KEY_Z,
    KEY_BRACKETLEFT,
    KEY_BACKSLASH,
    KEY_BRACKETRIGHT,
    KEY_ASCIICIRCUM,
    KEY_UNDERSCORE,
    KEY_QUOTELEFT,
    KEY_BRACELEFT,
    KEY_BAR,
    KEY_BRACERIGHT,
    KEY_ASCIITILDE,
    KEY_YEN,
    KEY_SECTION,
    KEY_CODE_MASK,
    KEY_MODIFIER_MASK,
    KEY_MASK_CMD_OR_CTRL,
    KEY_MASK_SHIFT,
    KEY_MASK_ALT,
    KEY_MASK_META,
    KEY_MASK_CTRL,
    KEY_MASK_KPAD,
    KEY_MASK_GROUP_SWITCH,
    KEY_LOCATION_UNSPECIFIED,
    KEY_LOCATION_LEFT,
    KEY_LOCATION_RIGHT,
    MOUSE_BUTTON_NONE,
    MOUSE_BUTTON_LEFT,
    MOUSE_BUTTON_RIGHT,
    MOUSE_BUTTON_MIDDLE,
    MOUSE_BUTTON_WHEEL_UP,
    MOUSE_BUTTON_WHEEL_DOWN,
    MOUSE_BUTTON_WHEEL_LEFT,
    MOUSE_BUTTON_WHEEL_RIGHT,
    MOUSE_BUTTON_XBUTTON1,
    MOUSE_BUTTON_XBUTTON2,
    MOUSE_BUTTON_MASK_LEFT,
    MOUSE_BUTTON_MASK_RIGHT,
    MOUSE_BUTTON_MASK_MIDDLE,
    MOUSE_BUTTON_MASK_XBUTTON1,
    MOUSE_BUTTON_MASK_XBUTTON2,
    JOY_BUTTON_INVALID,
    JOY_BUTTON_A,
    JOY_BUTTON_B,
    JOY_BUTTON_X,
    JOY_BUTTON_Y,
    JOY_BUTTON_BACK,
    JOY_BUTTON_GUIDE,
    JOY_BUTTON_START,
    JOY_BUTTON_LEFT_STICK,
    JOY_BUTTON_RIGHT_STICK,
    JOY_BUTTON_LEFT_SHOULDER,
    JOY_BUTTON_RIGHT_SHOULDER,
    JOY_BUTTON_DPAD_UP,
    JOY_BUTTON_DPAD_DOWN,
    JOY_BUTTON_DPAD_LEFT,
    JOY_BUTTON_DPAD_RIGHT,
    JOY_BUTTON_MISC1,
    JOY_BUTTON_PADDLE1,
    JOY_BUTTON_PADDLE2,
    JOY_BUTTON_PADDLE3,
    JOY_BUTTON_PADDLE4,
    JOY_BUTTON_TOUCHPAD,
    JOY_BUTTON_MISC2,
    JOY_BUTTON_MISC3,
    JOY_BUTTON_MISC4,
    JOY_BUTTON_MISC5,
    JOY_BUTTON_MISC6,
    JOY_BUTTON_SDL_MAX,
    JOY_BUTTON_MAX,
    JOY_AXIS_INVALID,
    JOY_AXIS_LEFT_X,
    JOY_AXIS_LEFT_Y,
    JOY_AXIS_RIGHT_X,
    JOY_AXIS_RIGHT_Y,
    JOY_AXIS_TRIGGER_LEFT,
    JOY_AXIS_TRIGGER_RIGHT,
    JOY_AXIS_SDL_MAX,
    JOY_AXIS_MAX,
    MIDI_MESSAGE_NONE,
    MIDI_MESSAGE_NOTE_OFF,
    MIDI_MESSAGE_NOTE_ON,
    MIDI_MESSAGE_AFTERTOUCH,
    MIDI_MESSAGE_CONTROL_CHANGE,
    MIDI_MESSAGE_PROGRAM_CHANGE,
    MIDI_MESSAGE_CHANNEL_PRESSURE,
    MIDI_MESSAGE_PITCH_BEND,
    MIDI_MESSAGE_SYSTEM_EXCLUSIVE,
    MIDI_MESSAGE_QUARTER_FRAME,
    MIDI_MESSAGE_SONG_POSITION_POINTER,
    MIDI_MESSAGE_SONG_SELECT,
    MIDI_MESSAGE_TUNE_REQUEST,
    MIDI_MESSAGE_TIMING_CLOCK,
    MIDI_MESSAGE_START,
    MIDI_MESSAGE_CONTINUE,
    MIDI_MESSAGE_STOP,
    MIDI_MESSAGE_ACTIVE_SENSING,
    MIDI_MESSAGE_SYSTEM_RESET,
    OK,
    FAILED,
    ERR_UNAVAILABLE,
    ERR_UNCONFIGURED,
    ERR_UNAUTHORIZED,
    ERR_PARAMETER_RANGE_ERROR,
    ERR_OUT_OF_MEMORY,
    ERR_FILE_NOT_FOUND,
    ERR_FILE_BAD_DRIVE,
    ERR_FILE_BAD_PATH,
    ERR_FILE_NO_PERMISSION,
    ERR_FILE_ALREADY_IN_USE,
    ERR_FILE_CANT_OPEN,
    ERR_FILE_CANT_WRITE,
    ERR_FILE_CANT_READ,
    ERR_FILE_UNRECOGNIZED,
    ERR_FILE_CORRUPT,
    ERR_FILE_MISSING_DEPENDENCIES,
    ERR_FILE_EOF,
    ERR_CANT_OPEN,
    ERR_CANT_CREATE,
    ERR_QUERY_FAILED,
    ERR_ALREADY_IN_USE,
    ERR_LOCKED,
    ERR_TIMEOUT,
    ERR_CANT_CONNECT,
    ERR_CANT_RESOLVE,
    ERR_CONNECTION_ERROR,
    ERR_CANT_ACQUIRE_RESOURCE,
    ERR_CANT_FORK,
    ERR_INVALID_DATA,
    ERR_INVALID_PARAMETER,
    ERR_ALREADY_EXISTS,
    ERR_DOES_NOT_EXIST,
    ERR_DATABASE_CANT_READ,
    ERR_DATABASE_CANT_WRITE,
    ERR_COMPILATION_FAILED,
    ERR_METHOD_NOT_FOUND,
    ERR_LINK_FAILED,
    ERR_SCRIPT_FAILED,
    ERR_CYCLIC_LINK,
    ERR_INVALID_DECLARATION,
    ERR_DUPLICATE_SYMBOL,
    ERR_PARSE_ERROR,
    ERR_BUSY,
    ERR_SKIP,
    ERR_HELP,
    ERR_BUG,
    ERR_PRINTER_ON_FIRE,
    PROPERTY_HINT_NONE,
    PROPERTY_HINT_RANGE,
    PROPERTY_HINT_ENUM,
    PROPERTY_HINT_ENUM_SUGGESTION,
    PROPERTY_HINT_EXP_EASING,
    PROPERTY_HINT_LINK,
    PROPERTY_HINT_FLAGS,
    PROPERTY_HINT_LAYERS_2D_RENDER,
    PROPERTY_HINT_LAYERS_2D_PHYSICS,
    PROPERTY_HINT_LAYERS_2D_NAVIGATION,
    PROPERTY_HINT_LAYERS_3D_RENDER,
    PROPERTY_HINT_LAYERS_3D_PHYSICS,
    PROPERTY_HINT_LAYERS_3D_NAVIGATION,
    PROPERTY_HINT_LAYERS_AVOIDANCE,
    PROPERTY_HINT_FILE,
    PROPERTY_HINT_DIR,
    PROPERTY_HINT_GLOBAL_FILE,
    PROPERTY_HINT_GLOBAL_DIR,
    PROPERTY_HINT_RESOURCE_TYPE,
    PROPERTY_HINT_MULTILINE_TEXT,
    PROPERTY_HINT_EXPRESSION,
    PROPERTY_HINT_PLACEHOLDER_TEXT,
    PROPERTY_HINT_COLOR_NO_ALPHA,
    PROPERTY_HINT_OBJECT_ID,
    PROPERTY_HINT_TYPE_STRING,
    PROPERTY_HINT_NODE_PATH_TO_EDITED_NODE,
    PROPERTY_HINT_OBJECT_TOO_BIG,
    PROPERTY_HINT_NODE_PATH_VALID_TYPES,
    PROPERTY_HINT_SAVE_FILE,
    PROPERTY_HINT_GLOBAL_SAVE_FILE,
    PROPERTY_HINT_INT_IS_OBJECTID,
    PROPERTY_HINT_INT_IS_POINTER,
    PROPERTY_HINT_ARRAY_TYPE,
    PROPERTY_HINT_DICTIONARY_TYPE,
    PROPERTY_HINT_LOCALE_ID,
    PROPERTY_HINT_LOCALIZABLE_STRING,
    PROPERTY_HINT_NODE_TYPE,
    PROPERTY_HINT_HIDE_QUATERNION_EDIT,
    PROPERTY_HINT_PASSWORD,
    PROPERTY_HINT_TOOL_BUTTON,
    PROPERTY_HINT_ONESHOT,
    PROPERTY_HINT_GROUP_ENABLE,
    PROPERTY_HINT_INPUT_NAME,
    PROPERTY_HINT_FILE_PATH,
    PROPERTY_HINT_MAX,
    PROPERTY_USAGE_NONE,
    PROPERTY_USAGE_STORAGE,
    PROPERTY_USAGE_EDITOR,
    PROPERTY_USAGE_INTERNAL,
    PROPERTY_USAGE_CHECKABLE,
    PROPERTY_USAGE_CHECKED,
    PROPERTY_USAGE_GROUP,
    PROPERTY_USAGE_CATEGORY,
    PROPERTY_USAGE_SUBGROUP,
    PROPERTY_USAGE_CLASS_IS_BITFIELD,
    PROPERTY_USAGE_NO_INSTANCE_STATE,
    PROPERTY_USAGE_RESTART_IF_CHANGED,
    PROPERTY_USAGE_SCRIPT_VARIABLE,
    PROPERTY_USAGE_STORE_IF_NULL,
    PROPERTY_USAGE_UPDATE_ALL_IF_MODIFIED,
    PROPERTY_USAGE_SCRIPT_DEFAULT_VALUE,
    PROPERTY_USAGE_CLASS_IS_ENUM,
    PROPERTY_USAGE_NIL_IS_VARIANT,
    PROPERTY_USAGE_ARRAY,
    PROPERTY_USAGE_ALWAYS_DUPLICATE,
    PROPERTY_USAGE_NEVER_DUPLICATE,
    PROPERTY_USAGE_HIGH_END_GFX,
    PROPERTY_USAGE_NODE_PATH_FROM_SCENE_ROOT,
    PROPERTY_USAGE_RESOURCE_NOT_PERSISTENT,
    PROPERTY_USAGE_KEYING_INCREMENTS,
    PROPERTY_USAGE_DEFERRED_SET_RESOURCE,
    PROPERTY_USAGE_EDITOR_INSTANTIATE_OBJECT,
    PROPERTY_USAGE_EDITOR_BASIC_SETTING,
    PROPERTY_USAGE_READ_ONLY,
    PROPERTY_USAGE_SECRET,
    PROPERTY_USAGE_DEFAULT,
    PROPERTY_USAGE_NO_EDITOR,
    METHOD_FLAG_NORMAL,
    METHOD_FLAG_EDITOR,
    METHOD_FLAG_CONST,
    METHOD_FLAG_VIRTUAL,
    METHOD_FLAG_VARARG,
    METHOD_FLAG_STATIC,
    METHOD_FLAG_OBJECT_CORE,
    METHOD_FLAG_VIRTUAL_REQUIRED,
    METHOD_FLAGS_DEFAULT,
    TYPE_NIL,
    TYPE_BOOL,
    TYPE_INT,
    TYPE_FLOAT,
    TYPE_STRING,
    TYPE_VECTOR2,
    TYPE_VECTOR2I,
    TYPE_RECT2,
    TYPE_RECT2I,
    TYPE_VECTOR3,
    TYPE_VECTOR3I,
    TYPE_TRANSFORM2D,
    TYPE_VECTOR4,
    TYPE_VECTOR4I,
    TYPE_PLANE,
    TYPE_QUATERNION,
    TYPE_AABB,
    TYPE_BASIS,
    TYPE_TRANSFORM3D,
    TYPE_PROJECTION,
    TYPE_COLOR,
    TYPE_STRING_NAME,
    TYPE_NODE_PATH,
    TYPE_RID,
    TYPE_OBJECT,
    TYPE_CALLABLE,
    TYPE_SIGNAL,
    TYPE_DICTIONARY,
    TYPE_ARRAY,
    TYPE_PACKED_BYTE_ARRAY,
    TYPE_PACKED_INT32_ARRAY,
    TYPE_PACKED_INT64_ARRAY,
    TYPE_PACKED_FLOAT32_ARRAY,
    TYPE_PACKED_FLOAT64_ARRAY,
    TYPE_PACKED_STRING_ARRAY,
    TYPE_PACKED_VECTOR2_ARRAY,
    TYPE_PACKED_VECTOR3_ARRAY,
    TYPE_PACKED_COLOR_ARRAY,
    TYPE_PACKED_VECTOR4_ARRAY,
    TYPE_MAX,
    OP_EQUAL,
    OP_NOT_EQUAL,
    OP_LESS,
    OP_LESS_EQUAL,
    OP_GREATER,
    OP_GREATER_EQUAL,
    OP_ADD,
    OP_SUBTRACT,
    OP_MULTIPLY,
    OP_DIVIDE,
    OP_NEGATE,
    OP_POSITIVE,
    OP_MODULE,
    OP_POWER,
    OP_SHIFT_LEFT,
    OP_SHIFT_RIGHT,
    OP_BIT_AND,
    OP_BIT_OR,
    OP_BIT_XOR,
    OP_BIT_NEGATE,
    OP_AND,
    OP_OR,
    OP_XOR,
    OP_NOT,
    OP_IN,
    OP_MAX,
    UINT8_MAX,
    UINT16_MAX,
    UINT32_MAX,
    INT8_MIN,
    INT8_MAX,
    INT16_MIN,
    INT16_MAX,
    INT32_MIN,
    INT32_MAX,
    INT64_MIN,
    INT64_MAX,
    WEBGL_CONSTANTS,
    RENDERER_DEFAULTS,
    SCENE_DEFAULTS,
    CAMERA_DEFAULTS,
    MATH_CONSTANTS,
    MATERIAL_CONSTANTS,
    OBJECT_TYPES,
    SECURITY_ALLOWED_ORIGINS,
    SECURITY_INTEGRITY_HASH,
    SECURITY_VERSION,
    SECURITY_FEATURES,
    SECURITY_DEFAULTS
};
