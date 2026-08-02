/**
 * LXRN CanvasItem Module
 * @namespace LXRN.CanvasItem
 * @author LXRN
 */

const Node = require('./Node.js');

/**
 * Canvas item for 2D rendering
 * @class CanvasItem
 * @extends Node
 */
class CanvasItem extends Node {
  #visible = true;
  #opacity = 1.0;
  #position = { x: 0, y: 0 };
  #rotation = 0;
  #scale = { x: 1, y: 1 };
  #pivotOffset = { x: 0, y: 0 };
  #color = { r: 1, g: 1, b: 1, a: 1 };
  #material = null;
  #texture = null;
  #rect = { x: 0, y: 0, width: 0, height: 0 };
  #clipRect = null;
  #zIndex = 0;
  #zAsRelative = true;
  #lightMask = 0;
  #modulate = { r: 1, g: 1, b: 1, a: 1 };
  #selfModulate = { r: 1, g: 1, b: 1, a: 1 };
  #useParentMaterial = false;
  #tooltipText = '';
  #focusMode = 0;
  #mouseFilter = 0;
  #centered = false;
  #flipH = false;
  #flipV = false;
  #regionEnabled = false;
  #regionRect = { x: 0, y: 0, width: 0, height: 0 };
  #drawing = false;
  #canvas = null;
  #parentCanvasItem = null;
  #transformDirty = true;
  #transform = null;
  #globalTransform = null;
  #rectCache = null;

  constructor(name = 'CanvasItem') {
    super(name);
  }

  /**
   * Get visible
   * @returns {boolean}
   */
  get visible() {
    return this.#visible;
  }

  /**
   * Set visible
   * @param {boolean} value - Visible
   */
  set visible(value) {
    this.#visible = value;
  }

  /**
   * Show item
   * @returns {CanvasItem} This instance
   */
  show() {
    this.#visible = true;
    this.update();
    return this;
  }

  /**
   * Hide item
   * @returns {CanvasItem} This instance
   */
  hide() {
    this.#visible = false;
    this.update();
    return this;
  }

  /**
   * Check if visible
   * @returns {boolean}
   */
  isVisible() {
    return this.#visible;
  }

  /**
   * Get position
   * @returns {Object}
   */
  get position() {
    return this.#position;
  }

  /**
   * Set position
   * @param {Object} value - Position
   */
  set position(value) {
    this.#position = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get rotation
   * @returns {number}
   */
  get rotation() {
    return this.#rotation;
  }

  /**
   * Set rotation
   * @param {number} value - Rotation in radians
   */
  set rotation(value) {
    this.#rotation = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get scale
   * @returns {Object}
   */
  get scale() {
    return this.#scale;
  }

  /**
   * Set scale
   * @param {Object} value - Scale
   */
  set scale(value) {
    this.#scale = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get pivot offset
   * @returns {Object}
   */
  get pivotOffset() {
    return this.#pivotOffset;
  }

  /**
   * Set pivot offset
   * @param {Object} value - Pivot offset
   */
  set pivotOffset(value) {
    this.#pivotOffset = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get global position
   * @returns {Object}
   */
  get globalPosition() {
    let pos = { x: this.#position.x, y: this.#position.y };
    let parent = this.#parent;
    while (parent instanceof CanvasItem) {
      pos.x += parent._position.x;
      pos.y += parent._position.y;
      parent = parent.#parent;
    }
    return pos;
  }

  /**
   * Set global position
   * @param {Object} value - Global position
   */
  set globalPosition(value) {
    let parent = this.#parent;
    let offset = { x: 0, y: 0 };
    while (parent instanceof CanvasItem) {
      offset.x += parent._position.x;
      offset.y += parent._position.y;
      parent = parent.#parent;
    }
    this.#position.x = value.x - offset.x;
    this.#position.y = value.y - offset.y;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get global rotation
   * @returns {number}
   */
  get globalRotation() {
    let rot = this.#rotation;
    let parent = this.#parent;
    while (parent instanceof CanvasItem) {
      rot += parent._rotation;
      parent = parent.#parent;
    }
    return rot;
  }

  /**
   * Get global scale
   * @returns {Object}
   */
  get globalScale() {
    let sc = { x: this.#scale.x, y: this.#scale.y };
    let parent = this.#parent;
    while (parent instanceof CanvasItem) {
      sc.x *= parent._scale.x;
      sc.y *= parent._scale.y;
      parent = parent.#parent;
    }
    return sc;
  }

  /**
   * Get modulate color
   * @returns {Object}
   */
  get modulate() {
    return this.#modulate;
  }

  /**
   * Set modulate color
   * @param {Object} value - Modulate color
   */
  set modulate(value) {
    this.#modulate = value;
    this.update();
  }

  /**
   * Get self modulate
   * @returns {Object}
   */
  get selfModulate() {
    return this.#selfModulate;
  }

  /**
   * Set self modulate
   * @param {Object} value - Self modulate
   */
  set selfModulate(value) {
    this.#selfModulate = value;
    this.update();
  }

  /**
   * Get color
   * @returns {Object}
   */
  get color() {
    return this.#color;
  }

  /**
   * Set color
   * @param {Object} value - Color
   */
  set color(value) {
    this.#color = value;
    this.update();
  }

  /**
   * Get opacity
   * @returns {number}
   */
  get opacity() {
    return this.#opacity;
  }

  /**
   * Set opacity
   * @param {number} value - Opacity (0-1)
   */
  set opacity(value) {
    this.#opacity = Math.max(0, Math.min(1, value));
    this.update();
  }

  /**
   * Get rectangle
   * @returns {Object}
   */
  get rect() {
    return this.#rect;
  }

  /**
   * Set rectangle
   * @param {Object} value - Rectangle
   */
  set rect(value) {
    this.#rect = value;
    this.#rectCache = null;
    this.update();
  }

  /**
   * Get rectangle
   * @returns {Object}
   */
  getRect() {
    return this.#rect;
  }

  /**
   * Get global rectangle
   * @returns {Object}
   */
  getGlobalRect() {
    if (this.#rectCache) return this.#rectCache;
    
    const pos = this.globalPosition;
    const sc = this.globalScale;
    const result = {
      x: pos.x + this.#rect.x * sc.x,
      y: pos.y + this.#rect.y * sc.y,
      width: this.#rect.width * sc.x,
      height: this.#rect.height * sc.y,
    };
    this.#rectCache = result;
    return result;
  }

  /**
   * Get z-index
   * @returns {number}
   */
  get zIndex() {
    return this.#zIndex;
  }

  /**
   * Set z-index
   * @param {number} value - Z-index
   */
  set zIndex(value) {
    this.#zIndex = value;
  }

  /**
   * Get z-as-relative
   * @returns {boolean}
   */
  get zAsRelative() {
    return this.#zAsRelative;
  }

  /**
   * Set z-as-relative
   * @param {boolean} value - Z-as-relative
   */
  set zAsRelative(value) {
    this.#zAsRelative = value;
  }

  /**
   * Get material
   * @returns {Object|null}
   */
  get material() {
    return this.#material;
  }

  /**
   * Set material
   * @param {Object} value - Material
   */
  set material(value) {
    this.#material = value;
    this.update();
  }

  /**
   * Get texture
   * @returns {Object|null}
   */
  get texture() {
    return this.#texture;
  }

  /**
   * Set texture
   * @param {Object} value - Texture
   */
  set texture(value) {
    this.#texture = value;
    this.update();
  }

  /**
   * Get clip rect
   * @returns {Object|null}
   */
  get clipRect() {
    return this.#clipRect;
  }

  /**
   * Set clip rect
   * @param {Object} value - Clip rect
   */
  set clipRect(value) {
    this.#clipRect = value;
    this.update();
  }

  /**
   * Get light mask
   * @returns {number}
   */
  get lightMask() {
    return this.#lightMask;
  }

  /**
   * Set light mask
   * @param {number} value - Light mask
   */
  set lightMask(value) {
    this.#lightMask = value;
  }

  /**
   * Get focus mode
   * @returns {number}
   */
  get focusMode() {
    return this.#focusMode;
  }

  /**
   * Set focus mode
   * @param {number} value - Focus mode
   */
  set focusMode(value) {
    this.#focusMode = value;
  }

  /**
   * Get mouse filter
   * @returns {number}
   */
  get mouseFilter() {
    return this.#mouseFilter;
  }

  /**
   * Set mouse filter
   * @param {number} value - Mouse filter
   */
  set mouseFilter(value) {
    this.#mouseFilter = value;
  }

  /**
   * Get tooltip text
   * @returns {string}
   */
  get tooltipText() {
    return this.#tooltipText;
  }

  /**
   * Set tooltip text
   * @param {string} value - Tooltip text
   */
  set tooltipText(value) {
    this.#tooltipText = value;
  }

  /**
   * Get centered
   * @returns {boolean}
   */
  get centered() {
    return this.#centered;
  }

  /**
   * Set centered
   * @param {boolean} value - Centered
   */
  set centered(value) {
    this.#centered = value;
  }

  /**
   * Get flip horizontal
   * @returns {boolean}
   */
  get flipH() {
    return this.#flipH;
  }

  /**
   * Set flip horizontal
   * @param {boolean} value - Flip horizontal
   */
  set flipH(value) {
    this.#flipH = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get flip vertical
   * @returns {boolean}
   */
  get flipV() {
    return this.#flipV;
  }

  /**
   * Set flip vertical
   * @param {boolean} value - Flip vertical
   */
  set flipV(value) {
    this.#flipV = value;
    this.#transformDirty = true;
    this.update();
  }

  /**
   * Get region enabled
   * @returns {boolean}
   */
  get regionEnabled() {
    return this.#regionEnabled;
  }

  /**
   * Set region enabled
   * @param {boolean} value - Region enabled
   */
  set regionEnabled(value) {
    this.#regionEnabled = value;
    this.update();
  }

  /**
   * Get region rect
   * @returns {Object}
   */
  get regionRect() {
    return this.#regionRect;
  }

  /**
   * Set region rect
   * @param {Object} value - Region rect
   */
  set regionRect(value) {
    this.#regionRect = value;
    this.update();
  }

  /**
   * Update item
   * @returns {CanvasItem} This instance
   */
  update() {
    this._notification(Node.NOTIFICATION_UPDATE);
    return this;
  }

  /**
   * Draw item
   * @param {Object} canvas - Canvas context
   */
  draw(canvas) {
    if (!this.#visible) return;
    this.#canvas = canvas;
    this.#drawing = true;
    this.__draw(canvas);
    this.#drawing = false;
    this.#canvas = null;
  }

  /**
   * Internal draw
   * @private
   * @param {Object} canvas - Canvas context
   */
  __draw(canvas) {
    // Override in subclasses
  }

  /**
   * Get transform matrix
   * @returns {Array}
   */
  getTransformMatrix() {
    if (!this.#transformDirty && this.#transform) {
      return this.#transform;
    }
    
    const cos = Math.cos(this.#rotation);
    const sin = Math.sin(this.#rotation);
    const sc = this.#scale;
    const pos = this.#position;
    const pivot = this.#pivotOffset;
    
    // Apply pivot offset
    const px = -pivot.x;
    const py = -pivot.y;
    
    // Apply flip
    const flipX = this.#flipH ? -1 : 1;
    const flipY = this.#flipV ? -1 : 1;
    
    this.#transform = [
      cos * sc.x * flipX, -sin * sc.y * flipY, pos.x + px * cos * sc.x - py * sin * sc.y,
      sin * sc.x * flipX, cos * sc.y * flipY, pos.y + px * sin * sc.x + py * cos * sc.y,
      0, 0, 1,
    ];
    
    this.#transformDirty = false;
    this.#rectCache = null;
    return this.#transform;
  }

  /**
   * Get global transform
   * @returns {Array}
   */
  getGlobalTransform() {
    if (this.#globalTransform) return this.#globalTransform;
    
    const transform = this.getTransformMatrix();
    let parent = this.#parent;
    let parentTransform = null;
    
    while (parent instanceof CanvasItem) {
      parentTransform = parent.getTransformMatrix();
      if (parentTransform) {
        // Multiply matrices
        transform[0] = transform[0] * parentTransform[0] + transform[1] * parentTransform[3];
        transform[1] = transform[0] * parentTransform[1] + transform[1] * parentTransform[4];
        transform[2] = transform[0] * parentTransform[2] + transform[1] * parentTransform[5] + parentTransform[2];
        transform[3] = transform[3] * parentTransform[0] + transform[4] * parentTransform[3];
        transform[4] = transform[3] * parentTransform[1] + transform[4] * parentTransform[4];
        transform[5] = transform[3] * parentTransform[2] + transform[4] * parentTransform[5] + parentTransform[5];
      }
      parent = parent.#parent;
    }
    
    this.#globalTransform = transform;
    return transform;
  }

  /**
   * Convert local to global
   * @param {Object} position - Local position
   * @returns {Object}
   */
  toGlobal(position) {
    const transform = this.getGlobalTransform();
    return {
      x: position.x * transform[0] + position.y * transform[1] + transform[2],
      y: position.x * transform[3] + position.y * transform[4] + transform[5],
    };
  }

  /**
   * Convert global to local
   * @param {Object} position - Global position
   * @returns {Object}
   */
  toLocal(position) {
    const transform = this.getGlobalTransform();
    const det = transform[0] * transform[4] - transform[1] * transform[3];
    if (det === 0) return { x: 0, y: 0 };
    
    const x = (position.x - transform[2]) / transform[0];
    const y = (position.y - transform[5]) / transform[4];
    return { x, y };
  }

  /**
   * Check if point is inside
   * @param {Object} point - Point to check
   * @returns {boolean}
   */
  hasPoint(point) {
    const rect = this.getGlobalRect();
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  /**
   * Draw rectangle
   * @param {Object} rect - Rectangle
   * @param {string} color - Color
   * @param {number} width - Line width
   * @returns {CanvasItem} This instance
   */
  drawRect(rect, color, width = 1) {
    if (!this.#canvas || !this.#drawing) return this;
    const ctx = this.#canvas;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    return this;
  }

  /**
   * Draw filled rectangle
   * @param {Object} rect - Rectangle
   * @param {string} color - Color
   * @returns {CanvasItem} This instance
   */
  drawFilledRect(rect, color) {
    if (!this.#canvas || !this.#drawing) return this;
    const ctx = this.#canvas;
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    return this;
  }

  /**
   * Draw circle
   * @param {Object} center - Center point
   * @param {number} radius - Radius
   * @param {string} color - Color
   * @param {number} width - Line width
   * @returns {CanvasItem} This instance
   */
  drawCircle(center, radius, color, width = 1) {
    if (!this.#canvas || !this.#drawing) return this;
    const ctx = this.#canvas;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    return this;
  }

  /**
   * Draw filled circle
   * @param {Object} center - Center point
   * @param {number} radius - Radius
   * @param {string} color - Color
   * @returns {CanvasItem} This instance
   */
  drawFilledCircle(center, radius, color) {
    if (!this.#canvas || !this.#drawing) return this;
    const ctx = this.#canvas;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    return this;
  }

  /**
   * Draw line
   * @param {Object} from - Start point
   * @param {Object} to - End point
   * @param {string} color - Color
   * @param {number} width - Line width
   * @returns {CanvasItem} This instance
   */
  drawLine(from, to, color, width = 1) {
    if (!this.#canvas || !this.#drawing) return this;
    const ctx = this.#canvas;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    return this;
  }

  /**
   * Draw text
   * @param {string} text - Text to draw
   * @param {Object} position - Position
   * @param {string} color - Color
   * @param {string} font - Font
   * @param {string} align - Text alignment
   * @returns {CanvasItem} This instance
   */
  drawText(text, position, color, font = '16px Arial', align = 'left') {
    if (!this.#canvas || !this.#drawing) return this;
    const ctx = this.#canvas;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, position.x, position.y);
    return this;
  }

  /**
   * Draw image
   * @param {Object} image - Image to draw
   * @param {Object} position - Position
   * @param {Object} size - Size
   * @returns {CanvasItem} This instance
   */
  drawImage(image, position, size = null) {
    if (!this.#canvas || !this.#drawing) return this;
    const ctx = this.#canvas;
    if (size) {
      ctx.drawImage(image, position.x, position.y, size.width, size.height);
    } else {
      ctx.drawImage(image, position.x, position.y);
    }
    return this;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    const data = super.toJSON();
    data.visible = this.#visible;
    data.opacity = this.#opacity;
    data.position = this.#position;
    data.rotation = this.#rotation;
    data.scale = this.#scale;
    data.pivotOffset = this.#pivotOffset;
    data.color = this.#color;
    data.rect = this.#rect;
    data.zIndex = this.#zIndex;
    data.zAsRelative = this.#zAsRelative;
    data.lightMask = this.#lightMask;
    data.modulate = this.#modulate;
    data.selfModulate = this.#selfModulate;
    data.useParentMaterial = this.#useParentMaterial;
    data.tooltipText = this.#tooltipText;
    data.focusMode = this.#focusMode;
    data.mouseFilter = this.#mouseFilter;
    data.centered = this.#centered;
    data.flipH = this.#flipH;
    data.flipV = this.#flipV;
    data.regionEnabled = this.#regionEnabled;
    data.regionRect = this.#regionRect;
    return data;
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {CanvasItem} This instance
   */
  fromJSON(data) {
    super.fromJSON(data);
    this.#visible = data.visible !== undefined ? data.visible : true;
    this.#opacity = data.opacity || 1.0;
    this.#position = data.position || { x: 0, y: 0 };
    this.#rotation = data.rotation || 0;
    this.#scale = data.scale || { x: 1, y: 1 };
    this.#pivotOffset = data.pivotOffset || { x: 0, y: 0 };
    this.#color = data.color || { r: 1, g: 1, b: 1, a: 1 };
    this.#rect = data.rect || { x: 0, y: 0, width: 0, height: 0 };
    this.#zIndex = data.zIndex || 0;
    this.#zAsRelative = data.zAsRelative !== undefined ? data.zAsRelative : true;
    this.#lightMask = data.lightMask || 0;
    this.#modulate = data.modulate || { r: 1, g: 1, b: 1, a: 1 };
    this.#selfModulate = data.selfModulate || { r: 1, g: 1, b: 1, a: 1 };
    this.#useParentMaterial = data.useParentMaterial || false;
    this.#tooltipText = data.tooltipText || '';
    this.#focusMode = data.focusMode || 0;
    this.#mouseFilter = data.mouseFilter || 0;
    this.#centered = data.centered || false;
    this.#flipH = data.flipH || false;
    this.#flipV = data.flipV || false;
    this.#regionEnabled = data.regionEnabled || false;
    this.#regionRect = data.regionRect || { x: 0, y: 0, width: 0, height: 0 };
    return this;
  }
}

module.exports = CanvasItem;
