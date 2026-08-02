/**
 * LXRN SceneTree Module
 * @namespace LXRN.SceneTree
 * @author LXRN
 */

const Node = require('./Node.js');
const EventEmitter = require('events');

/**
 * Scene tree managing the node hierarchy
 * @class SceneTree
 * @extends EventEmitter
 */
class SceneTree extends EventEmitter {
  #root = null;
  #processList = [];
  #physicsProcessList = [];
  #deferredCalls = [];
  #deletions = [];
  #groups = {};
  #currentScene = null;
  #paused = false;
  #delta = 0;
  #frame = 0;
  #quitRequested = false;
  #loopId = null;
  #fps = 60;
  #running = false;
  #lastTime = 0;
  #timeScale = 1;
  #maxDelta = 0.1;
  #networkPeer = null;
  #multiplayer = null;
  #inputEnabled = true;
  #focusStack = [];
  #nodeIdMap = new Map();
  #nodePathCache = new Map();
  #sceneLoaded = false;
  #loadingScene = false;
  #sceneLoadQueue = [];
  #resourceLoader = null;
  #logger = null;

  constructor() {
    super();
    this.#root = new Node('Root');
    this.#root._sceneTree = this;
    this.#root.addChild(this);
    this.#root._name = '@root';
  }

  /**
   * Set logger
   * @param {Object} logger - Logger instance
   * @returns {SceneTree} This instance
   */
  setLogger(logger) {
    this.#logger = logger;
    return this;
  }

  /**
   * Log message
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Log data
   */
  __log(level, message, data = null) {
    if (this.#logger) {
      if (typeof this.#logger.log === 'function') {
        this.#logger.log(level, message, data);
      } else if (typeof this.#logger === 'function') {
        this.#logger(level, message, data);
      }
    }
  }

  /**
   * Get root node
   * @returns {Node}
   */
  getRoot() {
    return this.#root;
  }

  /**
   * Get current scene
   * @returns {Node|null}
   */
  getCurrentScene() {
    return this.#currentScene;
  }

  /**
   * Set current scene
   * @param {Node} scene - Scene node
   * @returns {SceneTree} This instance
   */
  setCurrentScene(scene) {
    if (this.#currentScene) {
      this.#root.removeChild(this.#currentScene);
    }
    this.#currentScene = scene;
    if (scene) {
      this.#root.addChild(scene);
      this.#sceneLoaded = true;
    }
    this.emit('scene_changed', scene);
    return this;
  }

  /**
   * Change scene
   * @param {string} path - Scene file path
   * @param {Object} options - Change options
   * @returns {Promise<number>}
   */
  async changeScene(path, options = {}) {
    if (this.#loadingScene) {
      return -2; // Already loading
    }
    
    this.#loadingScene = true;
    this.__log('info', `Changing scene: ${path}`);
    
    try {
      const async = options.async !== undefined ? options.async : true;
      let scene;
      if (async) {
        scene = await this.loadSceneAsync(path, options);
      } else {
        scene = this.loadScene(path, options);
      }
      this.setCurrentScene(scene);
      this.#loadingScene = false;
      this.__log('info', `Scene changed successfully: ${path}`);
      return 0;
    } catch (error) {
      this.#loadingScene = false;
      this.__log('error', `Failed to change scene: ${path}`, { error: error.message });
      return -1;
    }
  }

  /**
   * Change scene to scene node
   * @param {Node} scene - Scene node
   * @returns {number}
   */
  changeSceneTo(scene) {
    this.setCurrentScene(scene);
    return 0;
  }

  /**
   * Load scene
   * @param {string} path - Scene file path
   * @param {Object} options - Load options
   * @returns {Node}
   */
  loadScene(path, options = {}) {
    const fs = require('fs');
    if (!fs.existsSync(path)) {
      throw new Error(`Scene not found: ${path}`);
    }
    
    const data = fs.readFileSync(path, 'utf-8');
    return this.__deserializeScene(data, options);
  }

  /**
   * Load scene asynchronously
   * @param {string} path - Scene file path
   * @param {Object} options - Load options
   * @returns {Promise<Node>}
   */
  async loadSceneAsync(path, options = {}) {
    const fs = require('fs');
    if (!fs.existsSync(path)) {
      throw new Error(`Scene not found: ${path}`);
    }
    
    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf-8', (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        try {
          const scene = this.__deserializeScene(data, options);
          resolve(scene);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /**
   * Deserialize scene from JSON
   * @private
   * @param {string} data - JSON data
   * @param {Object} options - Deserialize options
   * @returns {Node}
   */
  __deserializeScene(data, options = {}) {
    const json = JSON.parse(data);
    const nodes = {};
    let root = null;
    
    // First pass: create nodes
    for (const nodeData of json.nodes) {
      const node = this.__createNodeFromData(nodeData, options);
      nodes[nodeData.id] = node;
      if (nodeData.parentId === null) {
        root = node;
      }
    }
    
    // Second pass: build hierarchy
    for (const nodeData of json.nodes) {
      if (nodeData.parentId !== null) {
        const node = nodes[nodeData.id];
        const parent = nodes[nodeData.parentId];
        if (parent) {
          parent.addChild(node);
        }
      }
    }
    
    return root;
  }

  /**
   * Create node from data
   * @private
   * @param {Object} data - Node data
   * @param {Object} options - Create options
   * @returns {Node}
   */
  __createNodeFromData(data, options = {}) {
    const node = new Node(data.name);
    for (const key in data) {
      if (key !== 'id' && key !== 'parentId' && key !== 'name' && key !== 'type') {
        node[key] = data[key];
      }
    }
    return node;
  }

  /**
   * Set FPS
   * @param {number} fps - Frames per second
   * @returns {SceneTree} This instance
   */
  setFPS(fps) {
    this.#fps = Math.max(1, fps);
    return this;
  }

  /**
   * Get FPS
   * @returns {number}
   */
  getFPS() {
    return this.#fps;
  }

  /**
   * Start the scene tree
   * @returns {SceneTree} This instance
   */
  start() {
    if (this.#running) return this;
    this.#running = true;
    this.#quitRequested = false;
    this.#lastTime = Date.now();
    this.#root.__enterTree();
    this.#root._notification(Node.NOTIFICATION_READY);
    this.__loop();
    this.emit('started');
    return this;
  }

  /**
   * Main loop
   * @private
   */
  __loop() {
    if (!this.#running || this.#quitRequested) {
      this.#running = false;
      this.emit('stopped');
      return;
    }
    
    const now = Date.now();
    let delta = (now - this.#lastTime) / 1000;
    this.#lastTime = now;
    
    // Clamp delta
    if (delta < 0.001) delta = 0.001;
    if (delta > this.#maxDelta) delta = this.#maxDelta;
    
    // Apply time scale
    delta *= this.#timeScale;
    this.#delta = delta;
    this.#frame++;
    
    // Process
    this.__process(delta);
    this.__physicsProcess(delta);
    this.__processDeferredCalls();
    this.__processDeletions();
    
    // Update process lists
    this.__updateProcessList();
    this.__updatePhysicsProcessList();
    
    this.emit('frame', this.#frame, delta);
    
    // Schedule next frame
    const waitTime = Math.max(0, 1000 / this.#fps - (Date.now() - this.#lastTime));
    this.#loopId = setTimeout(() => this.__loop(), waitTime);
  }

  /**
   * Stop the scene tree
   * @returns {SceneTree} This instance
   */
  stop() {
    this.#running = false;
    if (this.#loopId) {
      clearTimeout(this.#loopId);
      this.#loopId = null;
    }
    this.#root.__exitTree();
    this.emit('stopped');
    return this;
  }

  /**
   * Quit the scene tree
   * @returns {SceneTree} This instance
   */
  quit() {
    this.#quitRequested = true;
    this.#running = false;
    if (this.#loopId) {
      clearTimeout(this.#loopId);
      this.#loopId = null;
    }
    this.emit('quit');
    return this;
  }

  /**
   * Process
   * @private
   * @param {number} delta - Time delta
   */
  __process(delta) {
    // Process nodes
    for (const node of this.#processList) {
      if (node.isEnabled()) {
        node.process(delta);
      }
    }
    // Process main loop
    this.process(delta);
  }

  /**
   * Physics process
   * @private
   * @param {number} delta - Time delta
   */
  __physicsProcess(delta) {
    // Process nodes
    for (const node of this.#physicsProcessList) {
      if (node.isEnabled()) {
        node.physicsProcess(delta);
      }
    }
    // Process main loop physics
    this.physicsProcess(delta);
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
   * Update process list
   * @private
   */
  __updateProcessList() {
    this.#processList = [];
    this.__collectProcessingNodes(this.#root);
    // Sort by priority
    this.#processList.sort((a, b) => a._processPriority - b._processPriority);
  }

  /**
   * Collect processing nodes
   * @private
   * @param {Node} node - Node to check
   */
  __collectProcessingNodes(node) {
    if (node.isProcessing() && node !== this) {
      this.#processList.push(node);
    }
    for (const child of node._children) {
      this.__collectProcessingNodes(child);
    }
  }

  /**
   * Update physics process list
   * @private
   */
  __updatePhysicsProcessList() {
    this.#physicsProcessList = [];
    this.__collectPhysicsProcessingNodes(this.#root);
    // Sort by priority
    this.#physicsProcessList.sort((a, b) => a._physicsProcessPriority - b._physicsProcessPriority);
  }

  /**
   * Collect physics processing nodes
   * @private
   * @param {Node} node - Node to check
   */
  __collectPhysicsProcessingNodes(node) {
    if (node.isPhysicsProcessing() && node !== this) {
      this.#physicsProcessList.push(node);
    }
    for (const child of node._children) {
      this.__collectPhysicsProcessingNodes(child);
    }
  }

  /**
   * Add to group
   * @private
   * @param {Node} node - Node to add
   * @param {string} group - Group name
   */
  __addToGroup(node, group) {
    if (!this.#groups[group]) {
      this.#groups[group] = [];
    }
    if (!this.#groups[group].includes(node)) {
      this.#groups[group].push(node);
    }
  }

  /**
   * Remove from group
   * @private
   * @param {Node} node - Node to remove
   * @param {string} group - Group name
   */
  __removeFromGroup(node, group) {
    if (this.#groups[group]) {
      const idx = this.#groups[group].indexOf(node);
      if (idx !== -1) {
        this.#groups[group].splice(idx, 1);
      }
    }
  }

  /**
   * Get nodes in group
   * @param {string} group - Group name
   * @returns {Array}
   */
  getNodesInGroup(group) {
    return this.#groups[group] ? [...this.#groups[group]] : [];
  }

  /**
   * Call group
   * @param {string} group - Group name
   * @param {string} method - Method name
   * @param {Array} args - Arguments
   * @returns {Array}
   */
  callGroup(group, method, ...args) {
    const nodes = this.getNodesInGroup(group);
    const results = [];
    for (const node of nodes) {
      try {
        const result = node.call(method, ...args);
        results.push({ node, result });
      } catch (error) {
        results.push({ node, error: error.message });
      }
    }
    return results;
  }

  /**
   * Call deferred
   * @private
   * @param {Node} node - Node
   * @param {string} method - Method name
   * @param {Array} args - Arguments
   */
  __callDeferred(node, method, args) {
    this.#deferredCalls.push({ node, method, args });
  }

  /**
   * Process deferred calls
   * @private
   */
  __processDeferredCalls() {
    const calls = this.#deferredCalls;
    this.#deferredCalls = [];
    for (const call of calls) {
      try {
        call.node.call(call.method, ...call.args);
      } catch (error) {
        this.__log('error', 'Deferred call failed', { error: error.message });
      }
    }
  }

  /**
   * Queue deletion
   * @private
   * @param {Node} node - Node to delete
   */
  __queueDelete(node) {
    this.#deletions.push(node);
  }

  /**
   * Process deletions
   * @private
   */
  __processDeletions() {
    const deletions = this.#deletions;
    this.#deletions = [];
    for (const node of deletions) {
      try {
        node.free();
      } catch (error) {
        this.__log('error', 'Deletion failed', { error: error.message });
      }
    }
  }

  /**
   * Set paused
   * @param {boolean} paused - Paused state
   * @returns {SceneTree} This instance
   */
  setPaused(paused) {
    this.#paused = paused;
    this.emit('paused', paused);
    return this;
  }

  /**
   * Check if paused
   * @returns {boolean}
   */
  isPaused() {
    return this.#paused;
  }

  /**
   * Get delta
   * @returns {number}
   */
  getDelta() {
    return this.#delta;
  }

  /**
   * Get frame
   * @returns {number}
   */
  getFrame() {
    return this.#frame;
  }

  /**
   * Check if running
   * @returns {boolean}
   */
  isRunning() {
    return this.#running;
  }

  /**
   * Set time scale
   * @param {number} scale - Time scale
   * @returns {SceneTree} This instance
   */
  setTimeScale(scale) {
    this.#timeScale = Math.max(0, scale);
    return this;
  }

  /**
   * Get time scale
   * @returns {number}
   */
  getTimeScale() {
    return this.#timeScale;
  }

  /**
   * Set network peer
   * @param {Object} peer - Network peer
   * @returns {SceneTree} This instance
   */
  setNetworkPeer(peer) {
    this.#networkPeer = peer;
    return this;
  }

  /**
   * Get network peer
   * @returns {Object|null}
   */
  getNetworkPeer() {
    return this.#networkPeer;
  }

  /**
   * Set multiplayer
   * @param {Object} multiplayer - Multiplayer instance
   * @returns {SceneTree} This instance
   */
  setMultiplayer(multiplayer) {
    this.#multiplayer = multiplayer;
    return this;
  }

  /**
   * Get multiplayer
   * @returns {Object|null}
   */
  getMultiplayer() {
    return this.#multiplayer;
  }

  /**
   * Set input enabled
   * @param {boolean} enabled - Input enabled
   * @returns {SceneTree} This instance
   */
  setInputEnabled(enabled) {
    this.#inputEnabled = enabled;
    return this;
  }

  /**
   * Check if input enabled
   * @returns {boolean}
   */
  isInputEnabled() {
    return this.#inputEnabled;
  }

  /**
   * Handle input
   * @param {Object} event - Input event
   * @returns {boolean}
   */
  input(event) {
    if (!this.#inputEnabled) return false;
    // Propagate to root
    this.__propagateInput(this.#root, event);
    return true;
  }

  /**
   * Propagate input
   * @private
   * @param {Node} node - Node
   * @param {Object} event - Input event
   */
  __propagateInput(node, event) {
    // Process children first (top-down)
    for (const child of node._children) {
      if (child.isEnabled()) {
        child.input(event);
      }
    }
    // Process node
    node.input(event);
  }

  /**
   * Save scene
   * @param {string} path - File path
   * @param {Node} scene - Scene node
   * @param {Object} options - Save options
   * @returns {boolean}
   */
  saveScene(path, scene = null, options = {}) {
    const target = scene || this.#currentScene;
    if (!target) throw new Error('No scene to save');
    
    const data = this.__serializeScene(target, options);
    const fs = require('fs');
    const pretty = options.pretty !== undefined ? options.pretty : true;
    fs.writeFileSync(path, JSON.stringify(data, null, pretty ? 2 : 0), 'utf-8');
    return true;
  }

  /**
   * Serialize scene
   * @private
   * @param {Node} root - Root node
   * @param {Object} options - Serialize options
   * @returns {Object}
   */
  __serializeScene(root, options = {}) {
    const nodes = [];
    const idMap = new Map();
    let nextId = 1;
    
    const traverse = (node, parentId = null) => {
      const id = nextId++;
      idMap.set(node, id);
      const data = {
        id: id,
        parentId: parentId,
        name: node.name,
        type: node.constructor.name,
        uniqueName: node.uniqueName,
        enabled: node.isEnabled(),
        visible: node.isVisible(),
        position: node.position,
        rotation: node.rotation,
        scale: node.scale,
        modulate: node.modulate,
        selfModulate: node._selfModulate,
      };
      
      if (node._metadata && Object.keys(node._metadata).length > 0) {
        data.metadata = node._metadata;
      }
      if (node._groups && node._groups.length > 0) {
        data.groups = node._groups;
      }
      if (node._filename) {
        data.filename = node._filename;
      }
      if (node._editorDescription) {
        data.editorDescription = node._editorDescription;
      }
      if (node._persistent) {
        data.persistent = true;
      }
      
      nodes.push(data);
      for (const child of node._children) {
        traverse(child, id);
      }
    };
    
    traverse(root);
    return { nodes };
  }

  /**
   * To string
   * @returns {string}
   */
  toString() {
    return `[SceneTree running=${this.#running} fps=${this.#fps} nodes=${this.#root.getChildCount()}]`;
  }
}

module.exports = SceneTree;
