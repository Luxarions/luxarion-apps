/**
 * LXRN Node Module
 * @namespace LXRN.Node
 * @author LXRN
 */

/**
 * Base node class for scene tree
 * @class Node
 */
class Node {
  /**
   * Notification constants
   * @static
   */
  static NOTIFICATION_ENTER_TREE = 10;
  static NOTIFICATION_EXIT_TREE = 11;
  static NOTIFICATION_ENTER_SCENE = 12;
  static NOTIFICATION_EXIT_SCENE = 13;
  static NOTIFICATION_READY = 14;
  static NOTIFICATION_PROCESS = 15;
  static NOTIFICATION_PHYSICS_PROCESS = 16;
  static NOTIFICATION_UPDATE = 17;
  static NOTIFICATION_SLEEP = 18;
  static NOTIFICATION_WAKE = 19;
  static NOTIFICATION_RESIZED = 20;

  #name = 'Node';
  #parent = null;
  #children = [];
  #owner = null;
  #sceneTree = null;
  #processing = false;
  #physicsProcessing = false;
  #enabled = true;
  #readyCalled = false;
  #enteredTree = false;
  #metadata = {};
  #groups = [];
  #signals = {};
  #script = null;
  #filename = '';
  #editorDescription = '';
  #instanceId = '';
  #uniqueName = '';
  #persistent = false;
  #sceneFilePath = '';
  #editorOnly = false;
  #position = { x: 0, y: 0 };
  #rotation = 0;
  #scale = { x: 1, y: 1 };
  #visible = true;
  #modulate = { r: 1, g: 1, b: 1, a: 1 };
  #selfModulate = { r: 1, g: 1, b: 1, a: 1 };
  #processPriority = 0;
  #physicsProcessPriority = 0;
  #inputEnabled = true;
  #pauseMode = 0;
  #treeLocked = false;
  #isQueuedForDeletion = false;
  #callbacks = {};
  #timers = [];
  #connections = [];

  constructor(name = 'Node') {
    this.#name = name;
    this.#instanceId = Node.__generateId();
  }

  /**
   * Generate unique ID
   * @private
   * @returns {string}
   */
  static __generateId() {
    return `node_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Get name
   * @returns {string}
   */
  get name() {
    return this.#name;
  }

  /**
   * Set name
   * @param {string} value - Name
   */
  set name(value) {
    this.#name = value;
  }

  /**
   * Get unique name
   * @returns {string}
   */
  get uniqueName() {
    return this.#uniqueName;
  }

  /**
   * Set unique name
   * @param {string} value - Unique name
   */
  set uniqueName(value) {
    this.#uniqueName = value;
  }

  /**
   * Get parent
   * @returns {Node|null}
   */
  get parent() {
    return this.#parent;
  }

  /**
   * Get children
   * @returns {Array}
   */
  get children() {
    return [...this.#children];
  }

  /**
   * Get owner
   * @returns {Node|null}
   */
  get owner() {
    return this.#owner;
  }

  /**
   * Set owner
   * @param {Node} value - Owner
   */
  set owner(value) {
    this.#owner = value;
  }

  /**
   * Get scene tree
   * @returns {SceneTree|null}
   */
  getSceneTree() {
    return this.#sceneTree;
  }

  /**
   * Get scene file path
   * @returns {string}
   */
  getSceneFilePath() {
    return this.#sceneFilePath;
  }

  /**
   * Get instance ID
   * @returns {string}
   */
  getInstanceId() {
    return this.#instanceId;
  }

  /**
   * Check if inside tree
   * @returns {boolean}
   */
  isInsideTree() {
    return this.#enteredTree;
  }

  /**
   * Check if enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.#enabled;
  }

  /**
   * Set enabled
   * @param {boolean} value - Enabled
   * @returns {Node} This instance
   */
  setEnabled(value) {
    this.#enabled = value;
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
   * Set visible
   * @param {boolean} value - Visible
   * @returns {Node} This instance
   */
  setVisible(value) {
    this.#visible = value;
    return this;
  }

  /**
   * Show node
   * @returns {Node} This instance
   */
  show() {
    this.#visible = true;
    return this;
  }

  /**
   * Hide node
   * @returns {Node} This instance
   */
  hide() {
    this.#visible = false;
    return this;
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
   * @returns {Node} This instance
   */
  setPosition(value) {
    this.#position = value;
    return this;
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
   * @returns {Node} This instance
   */
  setRotation(value) {
    this.#rotation = value;
    return this;
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
   * @returns {Node} This instance
   */
  setScale(value) {
    this.#scale = value;
    return this;
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
   * @returns {Node} This instance
   */
  setModulate(value) {
    this.#modulate = value;
    return this;
  }

  /**
   * Add child
   * @param {Node} child - Child node
   * @param {number} index - Position index
   * @returns {Node} This instance
   */
  addChild(child, index = -1) {
    if (!child) throw new Error('Cannot add null child');
    if (child.#parent) {
      child.#parent.removeChild(child);
    }
    
    if (index < 0 || index >= this.#children.length) {
      this.#children.push(child);
    } else {
      this.#children.splice(index, 0, child);
    }
    
    child.#parent = this;
    child.#sceneTree = this.#sceneTree;
    
    if (this.#enteredTree) {
      child.__enterTree();
    }
    
    return this;
  }

  /**
   * Remove child
   * @param {Node} child - Child node
   * @returns {boolean}
   */
  removeChild(child) {
    const idx = this.#children.indexOf(child);
    if (idx === -1) return false;
    
    if (this.#enteredTree) {
      child.__exitTree();
    }
    
    this.#children.splice(idx, 1);
    child.#parent = null;
    child.#sceneTree = null;
    return true;
  }

  /**
   * Get child at index
   * @param {number} index - Index
   * @returns {Node|null}
   */
  getChild(index) {
    return this.#children[index] || null;
  }

  /**
   * Get child count
   * @returns {number}
   */
  getChildCount() {
    return this.#children.length;
  }

  /**
   * Get children array
   * @returns {Array}
   */
  getChildren() {
    return [...this.#children];
  }

  /**
   * Find child by name
   * @param {string} name - Name to find
   * @param {boolean} recursive - Search recursively
   * @param {Node} owner - Owner filter
   * @returns {Node|null}
   */
  findChild(name, recursive = false, owner = null) {
    for (const child of this.#children) {
      if (child.#name === name) {
        if (owner === null || child.#owner === owner) {
          return child;
        }
      }
      if (recursive) {
        const result = child.findChild(name, true, owner);
        if (result) return result;
      }
    }
    return null;
  }

  /**
   * Find children by name
   * @param {string} name - Name to find
   * @param {boolean} recursive - Search recursively
   * @param {Node} owner - Owner filter
   * @returns {Array}
   */
  findChildren(name, recursive = false, owner = null) {
    const results = [];
    for (const child of this.#children) {
      if (child.#name === name) {
        if (owner === null || child.#owner === owner) {
          results.push(child);
        }
      }
      if (recursive) {
        results.push(...child.findChildren(name, true, owner));
      }
    }
    return results;
  }

  /**
   * Get parent node
   * @returns {Node|null}
   */
  getParent() {
    return this.#parent;
  }

  /**
   * Check if ancestor of node
   * @param {Node} node - Node to check
   * @returns {boolean}
   */
  isAncestorOf(node) {
    let current = node;
    while (current) {
      if (current === this) return true;
      current = current.#parent;
    }
    return false;
  }

  /**
   * Check if descendant of node
   * @param {Node} node - Node to check
   * @returns {boolean}
   */
  isDescendantOf(node) {
    let current = this.#parent;
    while (current) {
      if (current === node) return true;
      current = current.#parent;
    }
    return false;
  }

  /**
   * Get tree
   * @returns {SceneTree|null}
   */
  getTree() {
    return this.#sceneTree;
  }

  /**
   * Enter tree
   * @private
   */
  __enterTree() {
    if (this.#enteredTree) return;
    this.#enteredTree = true;
    this.#sceneTree = this.__getSceneTree();
    this._notification(Node.NOTIFICATION_ENTER_TREE);
    this._notification(Node.NOTIFICATION_ENTER_SCENE);
    
    for (const child of this.#children) {
      child.__enterTree();
    }
    
    if (!this.#readyCalled) {
      this.#readyCalled = true;
      this._notification(Node.NOTIFICATION_READY);
      this.ready();
    }
  }

  /**
   * Exit tree
   * @private
   */
  __exitTree() {
    if (!this.#enteredTree) return;
    this._notification(Node.NOTIFICATION_EXIT_SCENE);
    this._notification(Node.NOTIFICATION_EXIT_TREE);
    
    for (const child of this.#children) {
      child.__exitTree();
    }
    
    this.#enteredTree = false;
    this.#sceneTree = null;
  }

  /**
   * Get scene tree
   * @private
   * @returns {SceneTree|null}
   */
  __getSceneTree() {
    let current = this.#parent;
    while (current) {
      if (current.#sceneTree) return current.#sceneTree;
      current = current.#parent;
    }
    return null;
  }

  /**
   * Send notification
   * @param {number} what - Notification type
   */
  _notification(what) {
    this.onNotification(what);
  }

  /**
   * Handle notification
   * @param {number} what - Notification type
   */
  onNotification(what) {
    // Override in subclasses
  }

  /**
   * Ready callback
   */
  ready() {
    // Override in subclasses
  }

  /**
   * Process callback
   * @param {number} delta - Time delta
   */
  process(delta) {
    // Override in subclasses
  }

  /**
   * Physics process callback
   * @param {number} delta - Time delta
   */
  physicsProcess(delta) {
    // Override in subclasses
  }

  /**
   * Input callback
   * @param {Object} event - Input event
   */
  input(event) {
    // Override in subclasses
  }

  /**
   * Unhandled input callback
   * @param {Object} event - Input event
   */
  unhandledInput(event) {
    // Override in subclasses
  }

  /**
   * Unhandled key input callback
   * @param {Object} event - Input event
   */
  unhandledKeyInput(event) {
    // Override in subclasses
  }

  /**
   * Set process enabled
   * @param {boolean} enable - Enable processing
   * @returns {Node} This instance
   */
  setProcess(enable) {
    this.#processing = enable;
    if (this.#sceneTree) {
      this.#sceneTree.__updateProcessList();
    }
    return this;
  }

  /**
   * Check if processing
   * @returns {boolean}
   */
  isProcessing() {
    return this.#processing;
  }

  /**
   * Set physics process enabled
   * @param {boolean} enable - Enable physics processing
   * @returns {Node} This instance
   */
  setPhysicsProcess(enable) {
    this.#physicsProcessing = enable;
    if (this.#sceneTree) {
      this.#sceneTree.__updatePhysicsProcessList();
    }
    return this;
  }

  /**
   * Check if physics processing
   * @returns {boolean}
   */
  isPhysicsProcessing() {
    return this.#physicsProcessing;
  }

  /**
   * Add to group
   * @param {string} group - Group name
   * @returns {Node} This instance
   */
  addGroup(group) {
    if (!this.#groups.includes(group)) {
      this.#groups.push(group);
      if (this.#sceneTree) {
        this.#sceneTree.__addToGroup(this, group);
      }
    }
    return this;
  }

  /**
   * Remove from group
   * @param {string} group - Group name
   * @returns {Node} This instance
   */
  removeGroup(group) {
    const idx = this.#groups.indexOf(group);
    if (idx !== -1) {
      this.#groups.splice(idx, 1);
      if (this.#sceneTree) {
        this.#sceneTree.__removeFromGroup(this, group);
      }
    }
    return this;
  }

  /**
   * Check if in group
   * @param {string} group - Group name
   * @returns {boolean}
   */
  isInGroup(group) {
    return this.#groups.includes(group);
  }

  /**
   * Get groups
   * @returns {Array}
   */
  getGroups() {
    return [...this.#groups];
  }

  /**
   * Connect signal
   * @param {string} signal - Signal name
   * @param {Object} target - Target object
   * @param {string} method - Method name
   * @param {Array} binds - Bind arguments
   * @returns {Node} This instance
   */
  connect(signal, target, method, binds = []) {
    if (!this.#signals[signal]) {
      this.#signals[signal] = [];
    }
    this.#signals[signal].push({ target, method, binds });
    return this;
  }

  /**
   * Disconnect signal
   * @param {string} signal - Signal name
   * @param {Object} target - Target object
   * @param {string} method - Method name
   * @returns {Node} This instance
   */
  disconnect(signal, target, method) {
    if (!this.#signals[signal]) return this;
    this.#signals[signal] = this.#signals[signal].filter(
      entry => !(entry.target === target && entry.method === method)
    );
    return this;
  }

  /**
   * Emit signal
   * @param {string} signal - Signal name
   * @param {Array} args - Arguments
   * @returns {Node} This instance
   */
  emit(signal, ...args) {
    const entries = this.#signals[signal] || [];
    for (const entry of entries) {
      const allArgs = [...entry.binds, ...args];
      if (typeof entry.target[entry.method] === 'function') {
        entry.target[entry.method](...allArgs);
      } else if (typeof entry.target === 'function') {
        entry.target(...allArgs);
      }
    }
    return this;
  }

  /**
   * Get signal list
   * @returns {Array}
   */
  getSignalList() {
    return Object.keys(this.#signals);
  }

  /**
   * Set metadata
   * @param {string} key - Metadata key
   * @param {*} value - Metadata value
   * @returns {Node} This instance
   */
  setMeta(key, value) {
    this.#metadata[key] = value;
    return this;
  }

  /**
   * Get metadata
   * @param {string} key - Metadata key
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  getMeta(key, defaultValue = null) {
    return this.#metadata.hasOwnProperty(key) ? this.#metadata[key] : defaultValue;
  }

  /**
   * Check if metadata exists
   * @param {string} key - Metadata key
   * @returns {boolean}
   */
  hasMeta(key) {
    return this.#metadata.hasOwnProperty(key);
  }

  /**
   * Remove metadata
   * @param {string} key - Metadata key
   * @returns {Node} This instance
   */
  removeMeta(key) {
    delete this.#metadata[key];
    return this;
  }

  /**
   * Get metadata list
   * @returns {Array}
   */
  getMetaList() {
    return Object.keys(this.#metadata);
  }

  /**
   * Get script
   * @returns {Object|null}
   */
  getScript() {
    return this.#script;
  }

  /**
   * Set script
   * @param {Object} script - Script object
   * @returns {Node} This instance
   */
  setScript(script) {
    this.#script = script;
    return this;
  }

  /**
   * Get filename
   * @returns {string}
   */
  getFilename() {
    return this.#filename;
  }

  /**
   * Set filename
   * @param {string} value - Filename
   * @returns {Node} This instance
   */
  setFilename(value) {
    this.#filename = value;
    return this;
  }

  /**
   * Get editor description
   * @returns {string}
   */
  getEditorDescription() {
    return this.#editorDescription;
  }

  /**
   * Set editor description
   * @param {string} value - Editor description
   * @returns {Node} This instance
   */
  setEditorDescription(value) {
    this.#editorDescription = value;
    return this;
  }

  /**
   * Check if persistent
   * @returns {boolean}
   */
  isPersistent() {
    return this.#persistent;
  }

  /**
   * Set persistent
   * @param {boolean} value - Persistent
   * @returns {Node} This instance
   */
  setPersistent(value) {
    this.#persistent = value;
    return this;
  }

  /**
   * Get path
   * @returns {string}
   */
  getPath() {
    const parts = [];
    let current = this;
    while (current) {
      parts.unshift(current.#name);
      current = current.#parent;
    }
    return '/' + parts.join('/');
  }

  /**
   * Get path to node
   * @param {Node} node - Target node
   * @returns {string}
   */
  getPathTo(node) {
    if (this === node) return '.';
    
    const path = [];
    let common = null;
    let a = this;
    let b = node;
    
    // Find common ancestor
    const ancestors = new Set();
    while (a) {
      ancestors.add(a);
      a = a.#parent;
    }
    while (b) {
      if (ancestors.has(b)) {
        common = b;
        break;
      }
      b = b.#parent;
    }
    if (!common) return '';
    
    // Build path
    let from = this;
    while (from !== common) {
      path.push('..');
      from = from.#parent;
    }
    
    const toParts = [];
    let to = node;
    while (to !== common) {
      toParts.unshift(to.#name);
      to = to.#parent;
    }
    return path.concat(toParts).join('/');
  }

  /**
   * Get node by path
   * @param {string} path - Node path
   * @returns {Node|null}
   */
  getNode(path) {
    if (path === '.') return this;
    if (path === '..') return this.#parent;
    
    const parts = path.split('/').filter(p => p);
    let current = this;
    
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        current = current.#parent;
        if (!current) return null;
        continue;
      }
      
      let found = null;
      for (const child of current.#children) {
        if (child.#name === part) {
          found = child;
          break;
        }
      }
      if (!found) return null;
      current = found;
    }
    return current;
  }

  /**
   * Queue for deletion
   * @returns {Node} This instance
   */
  queueFree() {
    if (this.#isQueuedForDeletion) return this;
    this.#isQueuedForDeletion = true;
    if (this.#sceneTree) {
      this.#sceneTree.__queueDelete(this);
    } else {
      this.free();
    }
    return this;
  }

  /**
   * Free node
   * @returns {Node} This instance
   */
  free() {
    if (this.#parent) {
      this.#parent.removeChild(this);
    }
    this.__exitTree();
    
    // Clear signals
    for (const signal in this.#signals) {
      this.#signals[signal] = [];
    }
    
    // Clear children
    for (const child of this.#children) {
      child.free();
    }
    this.#children = [];
    this.#parent = null;
    this.#sceneTree = null;
    
    return this;
  }

  /**
   * Call method
   * @param {string} method - Method name
   * @param {Array} args - Arguments
   * @returns {*}
   */
  call(method, ...args) {
    if (typeof this[method] === 'function') {
      return this[method](...args);
    }
    return null;
  }

  /**
   * Call method deferred
   * @param {string} method - Method name
   * @param {Array} args - Arguments
   * @returns {Node} This instance
   */
  callDeferred(method, ...args) {
    if (this.#sceneTree) {
      this.#sceneTree.__callDeferred(this, method, args);
    }
    return this;
  }

  /**
   * Create timer
   * @param {number} duration - Timer duration
   * @param {boolean} oneshot - One-shot timer
   * @param {Function} callback - Timer callback
   * @returns {Object} Timer object
   */
  createTimer(duration, oneshot = true, callback = null) {
    if (this.#sceneTree) {
      const Timer = require('./Timer.js');
      const timer = new Timer();
      timer.setWaitTime(duration);
      timer.setOneShot(oneshot);
      this.addChild(timer);
      if (callback) {
        timer.connect('timeout', this, callback);
      }
      return timer;
    }
    return null;
  }

  /**
   * Duplicate node
   * @param {number} flags - Duplicate flags
   * @returns {Node}
   */
  duplicate(flags = 0) {
    const clone = new this.constructor();
    clone.#name = this.#name + ' (copy)';
    clone.#owner = this.#owner;
    clone.#metadata = { ...this.#metadata };
    clone.#groups = [...this.#groups];
    clone.#filename = this.#filename;
    clone.#editorDescription = this.#editorDescription;
    clone.#persistent = this.#persistent;
    clone.#visible = this.#visible;
    clone.#position = { ...this.#position };
    clone.#rotation = this.#rotation;
    clone.#scale = { ...this.#scale };
    clone.#modulate = { ...this.#modulate };
    clone.#selfModulate = { ...this.#selfModulate };
    
    // Duplicate children
    for (const child of this.#children) {
      const childClone = child.duplicate(flags);
      clone.addChild(childClone);
    }
    
    return clone;
  }

  /**
   * Check if node is queued for deletion
   * @returns {boolean}
   */
  isQueuedForDeletion() {
    return this.#isQueuedForDeletion;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.#name,
      type: this.constructor.name,
      instanceId: this.#instanceId,
      uniqueName: this.#uniqueName,
      metadata: this.#metadata,
      groups: this.#groups,
      filename: this.#filename,
      enabled: this.#enabled,
      visible: this.#visible,
      position: this.#position,
      rotation: this.#rotation,
      scale: this.#scale,
      modulate: this.#modulate,
      selfModulate: this.#selfModulate,
      persistent: this.#persistent,
      editorDescription: this.#editorDescription,
      editorOnly: this.#editorOnly,
      sceneFilePath: this.#sceneFilePath,
      processPriority: this.#processPriority,
      physicsProcessPriority: this.#physicsProcessPriority,
      inputEnabled: this.#inputEnabled,
      pauseMode: this.#pauseMode,
      children: this.#children.map(child => child.toJSON()),
    };
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   * @returns {Node} This instance
   */
  fromJSON(data) {
    this.#name = data.name || this.#name;
    this.#instanceId = data.instanceId || Node.__generateId();
    this.#uniqueName = data.uniqueName || '';
    this.#metadata = data.metadata || {};
    this.#groups = data.groups || [];
    this.#filename = data.filename || '';
    this.#enabled = data.enabled !== undefined ? data.enabled : true;
    this.#visible = data.visible !== undefined ? data.visible : true;
    this.#position = data.position || { x: 0, y: 0 };
    this.#rotation = data.rotation || 0;
    this.#scale = data.scale || { x: 1, y: 1 };
    this.#modulate = data.modulate || { r: 1, g: 1, b: 1, a: 1 };
    this.#selfModulate = data.selfModulate || { r: 1, g: 1, b: 1, a: 1 };
    this.#persistent = data.persistent || false;
    this.#editorDescription = data.editorDescription || '';
    this.#editorOnly = data.editorOnly || false;
    this.#sceneFilePath = data.sceneFilePath || '';
    this.#processPriority = data.processPriority || 0;
    this.#physicsProcessPriority = data.physicsProcessPriority || 0;
    this.#inputEnabled = data.inputEnabled !== undefined ? data.inputEnabled : true;
    this.#pauseMode = data.pauseMode || 0;
    
    // Load children
    if (data.children) {
      for (const childData of data.children) {
        const child = new Node();
        child.fromJSON(childData);
        this.addChild(child);
      }
    }
    
    return this;
  }

  /**
   * Create node from JSON
   * @param {Object} data - JSON data
   * @returns {Node}
   */
  static fromJSON(data) {
    const node = new Node(data.name);
    node.fromJSON(data);
    return node;
  }

  /**
   * To string
   * @returns {string}
   */
  toString() {
    return `[Node:${this.#name}]`;
  }
}

module.exports = Node;
