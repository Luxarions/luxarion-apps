/**
 * Type definitions for Luxarion Engine.
 * This file provides JSDoc typedefs for common data structures used throughout the engine.
 * These types are used for documentation and editor support only.
 * 
 * @module Types
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * 2D vector with x and y components.
 * @typedef {Object} Vector2
 * @property {number} x - X component.
 * @property {number} y - Y component.
 */

/**
 * 2D integer vector with x and y components.
 * @typedef {Object} Vector2i
 * @property {number} x - X component.
 * @property {number} y - Y component.
 */

/**
 * 3D vector with x, y, z components.
 * @typedef {Object} Vector3
 * @property {number} x - X component.
 * @property {number} y - Y component.
 * @property {number} z - Z component.
 */

/**
 * 3D integer vector with x, y, z components.
 * @typedef {Object} Vector3i
 * @property {number} x - X component.
 * @property {number} y - Y component.
 * @property {number} z - Z component.
 */

/**
 * 4D vector with x, y, z, w components.
 * @typedef {Object} Vector4
 * @property {number} x - X component.
 * @property {number} y - Y component.
 * @property {number} z - Z component.
 * @property {number} w - W component.
 */

/**
 * 4D integer vector with x, y, z, w components.
 * @typedef {Object} Vector4i
 * @property {number} x - X component.
 * @property {number} y - Y component.
 * @property {number} z - Z component.
 * @property {number} w - W component.
 */

/**
 * 2x2 matrix (column-major order).
 * @typedef {Object} Mat2
 * @property {Float32Array} elements - 4 elements in column-major order.
 */

/**
 * 3x3 matrix (column-major order).
 * @typedef {Object} Mat3
 * @property {Float32Array} elements - 9 elements in column-major order.
 */

/**
 * 4x4 matrix (column-major order).
 * @typedef {Object} Mat4
 * @property {Float32Array} elements - 16 elements in column-major order.
 */

/**
 * Quaternion representing 3D rotation.
 * @typedef {Object} Quaternion
 * @property {number} x - X component.
 * @property {number} y - Y component.
 * @property {number} z - Z component.
 * @property {number} w - W component.
 */

/**
 * Color with RGBA components.
 * @typedef {Object} Color
 * @property {number} r - Red (0..1).
 * @property {number} g - Green (0..1).
 * @property {number} b - Blue (0..1).
 * @property {number} a - Alpha (0..1).
 */

/**
 * Rectangle with position and size.
 * @typedef {Object} Rect2
 * @property {number} x - X position.
 * @property {number} y - Y position.
 * @property {number} width - Rectangle width.
 * @property {number} height - Rectangle height.
 */

/**
 * Integer rectangle with position and size.
 * @typedef {Object} Rect2i
 * @property {number} x - X position.
 * @property {number} y - Y position.
 * @property {number} width - Rectangle width.
 * @property {number} height - Rectangle height.
 */

/**
 * 2D transform matrix.
 * @typedef {Object} Transform2D
 * @property {Vector2} origin - Origin position.
 * @property {Vector2} x - X basis vector.
 * @property {Vector2} y - Y basis vector.
 */

/**
 * 3D transform matrix.
 * @typedef {Object} Transform3D
 * @property {Vector3} origin - Origin position.
 * @property {Basis} basis - Rotation/scale basis.
 */

/**
 * 3D basis matrix.
 * @typedef {Object} Basis
 * @property {Vector3} x - X basis vector.
 * @property {Vector3} y - Y basis vector.
 * @property {Vector3} z - Z basis vector.
 */

/**
 * Axis-aligned bounding box.
 * @typedef {Object} AABB
 * @property {Vector3} position - Minimum corner.
 * @property {Vector3} size - Box dimensions.
 */

/**
 * Plane defined by normal and distance.
 * @typedef {Object} Plane
 * @property {Vector3} normal - Plane normal.
 * @property {number} d - Distance from origin.
 */

/**
 * Projection matrix.
 * @typedef {Object} Projection
 * @property {Mat4} matrix - The projection matrix.
 */

/**
 * Base object for all 3D objects.
 * @typedef {Object} Object3D
 * @property {string} id - Unique identifier (UUID).
 * @property {string} name - Display name.
 * @property {Object3D} parent - Parent object.
 * @property {Array<Object3D>} children - Child objects.
 * @property {Vector3} position - Local position.
 * @property {Quaternion} rotation - Local rotation.
 * @property {Vector3} scale - Local scale.
 * @property {Mat4} matrix - Local transform matrix.
 * @property {Mat4} matrixWorld - World transform matrix.
 * @property {boolean} visible - Visibility flag.
 * @property {function(Object3D): void} add - Add child.
 * @property {function(Object3D): void} remove - Remove child.
 * @property {function(string): Object3D} getChildById - Get child by ID.
 * @property {function(string): Object3D} getChildByName - Get child by name.
 * @property {function(function(Object3D)): void} traverse - Traverse all children.
 * @property {function(): Object3D} clone - Clone object.
 * @property {function(): void} dispose - Dispose object.
 */

/**
 * Scene node that holds the world hierarchy.
 * @typedef {Object} Scene
 * @property {string} id - Unique identifier.
 * @property {string} name - Scene name.
 * @property {Array<Object3D>} children - Root objects.
 * @property {Color|Texture|null} background - Background color or texture.
 * @property {Fog|null} fog - Fog settings.
 * @property {Texture|null} environment - Environment map.
 * @property {Material|null} overrideMaterial - Override material for all objects.
 * @property {boolean} autoUpdate - Auto-update matrices.
 * @property {function(Object3D): void} add - Add child.
 * @property {function(Object3D): void} remove - Remove child.
 * @property {function(string): Object3D} getChildById - Get child by ID.
 * @property {function(string): Object3D} getChildByName - Get child by name.
 * @property {function(function(Object3D)): void} traverse - Traverse all children.
 * @property {function(): Scene} clone - Clone scene.
 * @property {function(): void} dispose - Dispose scene.
 */

/**
 * Camera for rendering a scene.
 * @typedef {Object} Camera
 * @property {string} id - Unique identifier.
 * @property {string} name - Camera name.
 * @property {string} type - 'perspective' or 'orthographic'.
 * @property {number} fov - Field of view (degrees) for perspective.
 * @property {number} aspect - Aspect ratio (width/height).
 * @property {number} near - Near plane distance.
 * @property {number} far - Far plane distance.
 * @property {number} left - Left plane (orthographic).
 * @property {number} right - Right plane (orthographic).
 * @property {number} top - Top plane (orthographic).
 * @property {number} bottom - Bottom plane (orthographic).
 * @property {Vector3} position - Camera position.
 * @property {Vector3} target - Look-at target.
 * @property {Vector3} up - Up vector.
 * @property {Mat4} projectionMatrix - Projection matrix.
 * @property {Mat4} viewMatrix - View matrix.
 * @property {function(): void} updateProjectionMatrix - Update projection matrix.
 * @property {function(): void} updateViewMatrix - Update view matrix.
 * @property {function(number, number, number): Camera} setPosition - Set position.
 * @property {function(number, number, number): Camera} setTarget - Set target.
 * @property {function(Vector3): Camera} lookAt - Look at target.
 * @property {function(): Camera} clone - Clone camera.
 */

/**
 * Material for rendering objects.
 * @typedef {Object} Material
 * @property {string} type - Material type.
 * @property {Color} color - Base color.
 * @property {number} opacity - Opacity (0..1).
 * @property {boolean} transparent - Transparent flag.
 * @property {number} side - Side (FrontSide, BackSide, DoubleSide).
 * @property {number} blending - Blending mode.
 * @property {number} depthFunc - Depth function.
 * @property {boolean} depthTest - Depth test enabled.
 * @property {boolean} depthWrite - Depth write enabled.
 * @property {function(): Material} clone - Clone material.
 * @property {function(): void} dispose - Dispose material.
 */

/**
 * Texture for mapping onto geometry.
 * @typedef {Object} Texture
 * @property {string} type - '2D', '3D', 'Cube', 'Array'.
 * @property {number} width - Width in pixels.
 * @property {number} height - Height in pixels.
 * @property {number} depth - Depth (for 3D textures).
 * @property {number} format - Pixel format (e.g., RGBAFormat).
 * @property {number} type - Pixel type (e.g., UnsignedByteType).
 * @property {number} minFilter - Minification filter.
 * @property {number} magFilter - Magnification filter.
 * @property {number} wrapS - Wrap mode for U coordinate.
 * @property {number} wrapT - Wrap mode for V coordinate.
 * @property {boolean} generateMipmaps - Generate mipmaps flag.
 * @property {function(): void} dispose - Dispose texture.
 */

/**
 * Render target for off-screen rendering.
 * @typedef {Object} RenderTarget
 * @property {number} width - Width in pixels.
 * @property {number} height - Height in pixels.
 * @property {number} samples - MSAA samples.
 * @property {boolean} depthBuffer - Depth buffer enabled.
 * @property {boolean} stencilBuffer - Stencil buffer enabled.
 * @property {Texture} texture - Color texture.
 * @property {Texture} depthTexture - Depth texture (optional).
 * @property {function(number, number): void} setSize - Resize render target.
 * @property {function(): void} dispose - Dispose render target.
 */

/**
 * Light source.
 * @typedef {Object} Light
 * @property {string} type - 'ambient', 'directional', 'point', 'spot', 'hemisphere'.
 * @property {Color} color - Light color.
 * @property {number} intensity - Light intensity.
 * @property {number} distance - Max distance (point/spot).
 * @property {number} angle - Cone angle (spot).
 * @property {number} penumbra - Penumbra (spot).
 * @property {number} decay - Decay factor.
 * @property {boolean} castShadow - Cast shadow flag.
 * @property {function(): void} dispose - Dispose light.
 */

/**
 * Mesh geometry data.
 * @typedef {Object} Mesh
 * @property {string} id - Unique identifier.
 * @property {string} name - Mesh name.
 * @property {Array<number>} positions - Vertex positions.
 * @property {Array<number>} normals - Vertex normals.
 * @property {Array<number>} uvs - Texture coordinates.
 * @property {Array<number>} indices - Index array.
 * @property {Array<Object>} groups - Draw groups.
 * @property {function(): Mesh} clone - Clone mesh.
 * @property {function(): void} dispose - Dispose mesh.
 */

/**
 * Node representing a group of objects.
 * @typedef {Object} Group
 * @extends Object3D
 * @property {string} type - Always 'Group'.
 */

/**
 * Node representing a sprite (2D image in 3D space).
 * @typedef {Object} Sprite
 * @extends Object3D
 * @property {Texture} texture - Sprite texture.
 * @property {number} width - Sprite width.
 * @property {number} height - Sprite height.
 * @property {string} type - Always 'Sprite'.
 */

/**
 * Fog settings.
 * @typedef {Object} Fog
 * @property {string} type - 'linear', 'exponential', 'exponential_squared'.
 * @property {Color} color - Fog color.
 * @property {number} density - Fog density.
 * @property {number} start - Start distance (linear).
 * @property {number} end - End distance (linear).
 */

/**
 * Event object for user input.
 * @typedef {Object} InputEvent
 * @property {string} type - Event type (e.g., 'keydown', 'mousemove').
 * @property {number} timestamp - Timestamp in ms.
 * @property {Object} data - Event-specific data.
 */

/**
 * Keyboard event data.
 * @typedef {Object} KeyboardEventData
 * @property {number} keyCode - Key code.
 * @property {string} key - Key string.
 * @property {boolean} shift - Shift key pressed.
 * @property {boolean} ctrl - Ctrl key pressed.
 * @property {boolean} alt - Alt key pressed.
 * @property {boolean} meta - Meta key pressed.
 */

/**
 * Mouse event data.
 * @typedef {Object} MouseEventData
 * @property {number} button - Mouse button (0=left, 1=right, 2=middle).
 * @property {number} x - X position.
 * @property {number} y - Y position.
 * @property {number} deltaX - Movement delta X.
 * @property {number} deltaY - Movement delta Y.
 */

/**
 * Touch event data.
 * @typedef {Object} TouchEventData
 * @property {number} pointerId - Pointer identifier.
 * @property {number} x - X position.
 * @property {number} y - Y position.
 * @property {number} pressure - Touch pressure.
 * @property {number} radiusX - Touch radius X.
 * @property {number} radiusY - Touch radius Y.
 */

/**
 * Generic callback function.
 * @callback Callback
 * @param {...*} args - Arguments.
 * @returns {*} - Return value.
 */

/**
 * Event listener function.
 * @callback EventListener
 * @param {InputEvent} event - Input event.
 * @returns {void}
 */

/**
 * Animation callback function.
 * @callback AnimationCallback
 * @param {number} time - Current time in seconds.
 * @param {number} delta - Time delta since last frame.
 * @returns {void}
 */

/**
 * Loader function for resources.
 * @callback LoaderCallback
 * @param {string} path - Resource path.
 * @param {function(Error, Object)} callback - Completion callback.
 * @returns {void}
 */

/**
 * Promise-based loader function.
 * @callback LoaderPromise
 * @param {string} path - Resource path.
 * @returns {Promise<Object>}
 */

/**
 * Timer object for scheduling callbacks.
 * @typedef {Object} Timer
 * @property {number} id - Timer ID.
 * @property {number} delay - Delay in ms.
 * @property {number} repeat - Repeat count (0 = once, -1 = infinite).
 * @property {Callback} callback - Callback function.
 * @property {boolean} active - Whether timer is active.
 * @property {function(): void} start - Start timer.
 * @property {function(): void} stop - Stop timer.
 * @property {function(): void} reset - Reset timer.
 */

/**
 * Variant type enumeration (matches Constants.TYPE_*).
 * @typedef {number} VariantType
 * @see Constants.TYPE_*
 */

/**
 * Operator enumeration (matches Constants.OP_*).
 * @typedef {number} OperatorType
 * @see Constants.OP_*
 */

/**
 * Error code enumeration (matches Constants.ERR_* and OK).
 * @typedef {number} ErrorCode
 * @see Constants.OK, Constants.ERR_*
 */

/**
 * Empty types object for module exports.
 * @type {Object}
 */
export const types = {};

/**
 * Default export for convenience.
 */
export default types;
