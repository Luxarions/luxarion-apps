/**
 * LXRN MultiplayerAPI Module
 * @namespace LXRN.MultiplayerAPI
 * @author LXRN
 */

const EventEmitter = require('events');

/**
 * Multiplayer API for networked games
 * @class MultiplayerAPI
 * @extends EventEmitter
 */
class MultiplayerAPI extends EventEmitter {
  /**
   * RPC modes
   * @static
   */
  static RPC_MODE_DISABLED = 0;
  static RPC_MODE_AUTHORITY = 1;
  static RPC_MODE_ANY = 2;

  /**
   * Transfer modes
   * @static
   */
  static TRANSFER_RELIABLE = 0;
  static TRANSFER_UNRELIABLE = 1;
  static TRANSFER_UNRELIABLE_ORDERED = 2;

  #peer = null;
  #rootNode = null;
  #rpcMethods = new Map();
  #rpcConfigs = new Map();
  #refuseNewConnections = false;
  #allowObjectDecoding = true;
  #connected = false;
  #uniqueId = 1;
  #peerIds = new Map();
  #packetHandlers = new Map();
  #callbacks = {};
  #networkPeer = null;
  #isServer = false;
  #connectionId = 0;
  #rpcCache = new Map();
  #syncRate = 60;
  #lastSync = 0;
  #deltaSync = 0;
  #syncData = {};
  #maxPacketSize = 65535;
  #compressPackets = false;
  #encryptPackets = false;
  #encryptionKey = null;
  #packetQueue = [];
  #queueLimit = 1000;
  #lastSequence = 0;
  #receivedSequences = new Set();
  #pendingAcks = new Map();

  /**
   * Set root node
   * @param {Node} node - Root node
   * @returns {MultiplayerAPI} This instance
   */
  setRootNode(node) {
    this.#rootNode = node;
    return this;
  }

  /**
   * Get root node
   * @returns {Node}
   */
  getRootNode() {
    return this.#rootNode;
  }

  /**
   * Set network peer
   * @param {Object} peer - Network peer
   * @returns {MultiplayerAPI} This instance
   */
  setNetworkPeer(peer) {
    this.#networkPeer = peer;
    if (peer) {
      peer._multiplayer = this;
      this.#connected = true;
      this.__setupPeer(peer);
    } else {
      this.#connected = false;
    }
    return this;
  }

  /**
   * Setup peer
   * @private
   * @param {Object} peer - Network peer
   */
  __setupPeer(peer) {
    if (typeof peer.on === 'function') {
      peer.on('message', (data) => {
        this.__handlePacket(data);
      });
      
      peer.on('connected', () => {
        this.#connected = true;
        this.emit('connected');
      });
      
      peer.on('disconnected', () => {
        this.#connected = false;
        this.emit('disconnected');
      });
    }
  }

  /**
   * Get network peer
   * @returns {Object}
   */
  getNetworkPeer() {
    return this.#networkPeer;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.#connected;
  }

  /**
   * Get unique ID
   * @returns {number}
   */
  getUniqueId() {
    return this.#uniqueId;
  }

  /**
   * Set refuse new connections
   * @param {boolean} value - Refuse new connections
   * @returns {MultiplayerAPI} This instance
   */
  setRefuseNewConnections(value) {
    this.#refuseNewConnections = value;
    return this;
  }

  /**
   * Check if refusing new connections
   * @returns {boolean}
   */
  isRefusingNewConnections() {
    return this.#refuseNewConnections;
  }

  /**
   * Set allow object decoding
   * @param {boolean} value - Allow object decoding
   * @returns {MultiplayerAPI} This instance
   */
  setAllowObjectDecoding(value) {
    this.#allowObjectDecoding = value;
    return this;
  }

  /**
   * Check if object decoding is allowed
   * @returns {boolean}
   */
  isAllowObjectDecoding() {
    return this.#allowObjectDecoding;
  }

  /**
   * Register RPC
   * @param {Node} node - Node
   * @param {string} method - Method name
   * @param {number} mode - RPC mode
   * @returns {MultiplayerAPI} This instance
   */
  registerRPC(node, method, mode = MultiplayerAPI.RPC_MODE_ANY) {
    const key = this.__getNodeKey(node);
    if (!this.#rpcMethods.has(key)) {
      this.#rpcMethods.set(key, new Set());
    }
    this.#rpcMethods.get(key).add(method);
    this.#rpcConfigs.set(`${key}.${method}`, mode);
    return this;
  }

  /**
   * Unregister RPC
   * @param {Node} node - Node
   * @param {string} method - Method name
   * @returns {MultiplayerAPI} This instance
   */
  unregisterRPC(node, method) {
    const key = this.__getNodeKey(node);
    if (this.#rpcMethods.has(key)) {
      this.#rpcMethods.get(key).delete(method);
      this.#rpcConfigs.delete(`${key}.${method}`);
    }
    return this;
  }

  /**
   * Get node key
   * @private
   * @param {Node} node - Node
   * @returns {string}
   */
  __getNodeKey(node) {
    return node.getInstanceId ? node.getInstanceId() : node._instanceId;
  }

  /**
   * Send RPC
   * @param {Node} node - Node
   * @param {string} method - Method name
   * @param {Array} args - Arguments
   * @returns {MultiplayerAPI} This instance
   */
  rpc(node, method, ...args) {
    if (!this.#networkPeer) {
      throw new Error('No network peer set');
    }
    
    const key = this.__getNodeKey(node);
    const config = this.#rpcConfigs.get(`${key}.${method}`);
    if (config === MultiplayerAPI.RPC_MODE_DISABLED) {
      throw new Error(`RPC method ${method} is disabled`);
    }
    
    const packet = {
      type: 'rpc',
      nodeId: key,
      method: method,
      args: args,
      fromId: this.#uniqueId,
      sequence: ++this.#lastSequence,
    };
    
    this.__sendPacket(packet);
    return this;
  }

  /**
   * Send RPC to specific peer
   * @param {Node} node - Node
   * @param {number} peerId - Peer ID
   * @param {string} method - Method name
   * @param {Array} args - Arguments
   * @returns {MultiplayerAPI} This instance
   */
  rpcTo(node, peerId, method, ...args) {
    if (!this.#networkPeer) {
      throw new Error('No network peer set');
    }
    
    const key = this.__getNodeKey(node);
    const packet = {
      type: 'rpc',
      nodeId: key,
      method: method,
      args: args,
      fromId: this.#uniqueId,
      targetId: peerId,
      sequence: ++this.#lastSequence,
    };
    
    this.__sendPacket(packet);
    return this;
  }

  /**
   * Send RPC to all except
   * @param {Node} node - Node
   * @param {number} peerId - Peer ID to exclude
   * @param {string} method - Method name
   * @param {Array} args - Arguments
   * @returns {MultiplayerAPI} This instance
   */
  rpcExclude(node, peerId, method, ...args) {
    if (!this.#networkPeer) {
      throw new Error('No network peer set');
    }
    
    const key = this.__getNodeKey(node);
    const packet = {
      type: 'rpc',
      nodeId: key,
      method: method,
      args: args,
      fromId: this.#uniqueId,
      excludeId: peerId,
      sequence: ++this.#lastSequence,
    };
    
    this.__sendPacket(packet);
    return this;
  }

  /**
   * Send packet
   * @private
   * @param {Object} packet - Packet data
   */
  __sendPacket(packet) {
    let data = JSON.stringify(packet);
    
    // Compress if enabled
    if (this.#compressPackets && data.length > 1000) {
      const Compression = require('../core/Compression.js');
      data = Compression.compress(data);
    }
    
    // Encrypt if enabled
    if (this.#encryptPackets && this.#encryptionKey) {
      // Simple XOR encryption
      const key = this.#encryptionKey;
      const encrypted = Buffer.from(data);
      for (let i = 0; i < encrypted.length; i++) {
        encrypted[i] = encrypted[i] ^ key[i % key.length];
      }
      data = encrypted.toString('base64');
    }
    
    if (this.#networkPeer.send) {
      this.#networkPeer.send(data);
    }
  }

  /**
   * Handle packet
   * @private
   * @param {string|Buffer} data - Packet data
   */
  __handlePacket(data) {
    try {
      let packetData = data;
      
      // Decrypt if enabled
      if (this.#encryptPackets && this.#encryptionKey) {
        const key = this.#encryptionKey;
        const encrypted = Buffer.from(data, 'base64');
        const decrypted = Buffer.alloc(encrypted.length);
        for (let i = 0; i < encrypted.length; i++) {
          decrypted[i] = encrypted[i] ^ key[i % key.length];
        }
        packetData = decrypted.toString();
      }
      
      // Decompress if needed
      let parsedData = packetData;
      if (typeof packetData === 'string' && packetData.startsWith('{')) {
        parsedData = JSON.parse(packetData);
      } else {
        try {
          const Compression = require('../core/Compression.js');
          const decompressed = Compression.decompress(Buffer.from(packetData));
          parsedData = JSON.parse(decompressed.toString());
        } catch (error) {
          // Not compressed
          parsedData = JSON.parse(packetData);
        }
      }
      
      // Check sequence for duplicate
      if (parsedData.sequence && this.#receivedSequences.has(parsedData.sequence)) {
        return; // Duplicate packet
      }
      if (parsedData.sequence) {
        this.#receivedSequences.add(parsedData.sequence);
        if (this.#receivedSequences.size > 1000) {
          // Clean up old sequences
          const sorted = Array.from(this.#receivedSequences).sort();
          const toRemove = sorted.slice(0, sorted.length - 500);
          for (const seq of toRemove) {
            this.#receivedSequences.delete(seq);
          }
        }
      }
      
      switch (parsedData.type) {
        case 'rpc':
          this.__handleRPC(parsedData);
          break;
        case 'peerConnected':
          this.__handlePeerConnected(parsedData);
          break;
        case 'peerDisconnected':
          this.__handlePeerDisconnected(parsedData);
          break;
        case 'sync':
          this.__handleSync(parsedData);
          break;
        case 'auth':
          this.__handleAuth(parsedData);
          break;
        case 'ack':
          this.__handleAck(parsedData);
          break;
        default:
          this.emit('unknown_packet', parsedData);
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Handle RPC
   * @private
   * @param {Object} packet - RPC packet
   */
  __handleRPC(packet) {
    const node = this.__findNode(packet.nodeId);
    if (!node) return;
    
    const method = packet.method;
    if (typeof node[method] === 'function') {
      const config = this.#rpcConfigs.get(`${packet.nodeId}.${method}`);
      if (config === MultiplayerAPI.RPC_MODE_DISABLED) return;
      if (config === MultiplayerAPI.RPC_MODE_AUTHORITY && packet.fromId !== 1) return;
      
      try {
        node[method](...packet.args);
        // Send ACK for reliable delivery
        if (packet.sequence) {
          this.__sendAck(packet.sequence);
        }
      } catch (error) {
        this.emit('error', error);
      }
    }
  }

  /**
   * Send ACK
   * @private
   * @param {number} sequence - Sequence number
   */
  __sendAck(sequence) {
    const packet = {
      type: 'ack',
      sequence: sequence,
      fromId: this.#uniqueId,
    };
    this.__sendPacket(packet);
  }

  /**
   * Handle ACK
   * @private
   * @param {Object} packet - ACK packet
   */
  __handleAck(packet) {
    if (this.#pendingAcks.has(packet.sequence)) {
      const resolve = this.#pendingAcks.get(packet.sequence);
      this.#pendingAcks.delete(packet.sequence);
      resolve(true);
    }
  }

  /**
   * Find node by ID
   * @private
   * @param {string} nodeId - Node ID
   * @returns {Node|null}
   */
  __findNode(nodeId) {
    if (!this.#rootNode) return null;
    
    const traverse = (node) => {
      const id = node.getInstanceId ? node.getInstanceId() : node._instanceId;
      if (id === nodeId) return node;
      
      for (const child of node._children) {
        const result = traverse(child);
        if (result) return result;
      }
      return null;
    };
    
    return traverse(this.#rootNode);
  }

  /**
   * Handle peer connected
   * @private
   * @param {Object} packet - Peer connected packet
   */
  __handlePeerConnected(packet) {
    this.#peerIds.set(packet.peerId, packet.peerId);
    this.emit('peerConnected', packet.peerId);
  }

  /**
   * Handle peer disconnected
   * @private
   * @param {Object} packet - Peer disconnected packet
   */
  __handlePeerDisconnected(packet) {
    this.#peerIds.delete(packet.peerId);
    this.emit('peerDisconnected', packet.peerId);
  }

  /**
   * Handle sync
   * @private
   * @param {Object} packet - Sync packet
   */
  __handleSync(packet) {
    this.emit('sync', packet.data);
  }

  /**
   * Handle auth
   * @private
   * @param {Object} packet - Auth packet
   */
  __handleAuth(packet) {
    this.emit('auth', packet.data);
  }

  /**
   * Connect peer
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @param {Object} options - Connection options
   * @returns {Promise<MultiplayerAPI>}
   */
  connectPeer(host, port, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Setup connection
        this.#connected = true;
        this.#uniqueId = Math.floor(Math.random() * 1000000) + 1;
        this.emit('connected');
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect peer
   * @returns {MultiplayerAPI} This instance
   */
  disconnectPeer() {
    this.#connected = false;
    this.#peerIds.clear();
    this.emit('disconnected');
    return this;
  }

  /**
   * Get peer IDs
   * @returns {Array}
   */
  getPeerIds() {
    return Array.from(this.#peerIds.keys());
  }

  /**
   * Get connected peers
   * @returns {Array}
   */
  getConnectedPeers() {
    return Array.from(this.#peerIds.keys());
  }

  /**
   * Get network unique ID
   * @returns {number}
   */
  getNetworkUniqueId() {
    return this.#uniqueId;
  }

  /**
   * Get network peer ID
   * @returns {number}
   */
  getNetworkPeerId() {
    return this.#uniqueId;
  }

  /**
   * Sync data
   * @param {Object} data - Data to sync
   * @returns {MultiplayerAPI} This instance
   */
  sync(data) {
    if (!this.#networkPeer) return this;
    
    const packet = {
      type: 'sync',
      data: data,
      fromId: this.#uniqueId,
    };
    
    this.__sendPacket(packet);
    return this;
  }

  /**
   * Set spawn function
   * @param {Function} fn - Spawn function
   * @returns {MultiplayerAPI} This instance
   */
  setSpawnFunction(fn) {
    this.#spawnFn = fn;
    return this;
  }

  /**
   * Spawn node
   * @param {Node} node - Node to spawn
   * @param {string} spawnId - Spawn ID
   * @returns {Node}
   */
  spawn(node, spawnId) {
    if (this.#spawnFn) {
      return this.#spawnFn(node, spawnId);
    }
    return null;
  }

  /**
   * Set sync rate
   * @param {number} rate - Sync rate in Hz
   * @returns {MultiplayerAPI} This instance
   */
  setSyncRate(rate) {
    this.#syncRate = Math.max(1, rate);
    return this;
  }

  /**
   * Get sync rate
   * @returns {number}
   */
  getSyncRate() {
    return this.#syncRate;
  }

  /**
   * Process sync
   * @param {number} delta - Time delta
   * @returns {MultiplayerAPI} This instance
   */
  processSync(delta) {
    this.#deltaSync += delta;
    const interval = 1 / this.#syncRate;
    
    if (this.#deltaSync >= interval) {
      this.#deltaSync = 0;
      this.emit('sync_ready', this.#syncData);
    }
    
    return this;
  }

  /**
   * Set sync data
   * @param {string} key - Data key
   * @param {*} value - Data value
   * @returns {MultiplayerAPI} This instance
   */
  setSyncData(key, value) {
    this.#syncData[key] = value;
    return this;
  }

  /**
   * Get sync data
   * @param {string} key - Data key
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  getSyncData(key, defaultValue = null) {
    return this.#syncData.hasOwnProperty(key) ? this.#syncData[key] : defaultValue;
  }

  /**
   * Set compression
   * @param {boolean} enable - Enable compression
   * @returns {MultiplayerAPI} This instance
   */
  setCompression(enable) {
    this.#compressPackets = enable;
    return this;
  }

  /**
   * Set encryption
   * @param {boolean} enable - Enable encryption
   * @param {Uint8Array} key - Encryption key
   * @returns {MultiplayerAPI} This instance
   */
  setEncryption(enable, key = null) {
    this.#encryptPackets = enable;
    this.#encryptionKey = key;
    return this;
  }

  /**
   * Set max packet size
   * @param {number} size - Max packet size
   * @returns {MultiplayerAPI} This instance
   */
  setMaxPacketSize(size) {
    this.#maxPacketSize = size;
    return this;
  }

  /**
   * Set queue limit
   * @param {number} limit - Queue limit
   * @returns {MultiplayerAPI} This instance
   */
  setQueueLimit(limit) {
    this.#queueLimit = limit;
    return this;
  }

  /**
   * Event: connected
   * @param {Function} callback - Callback
   * @returns {MultiplayerAPI} This instance
   */
  onConnected(callback) {
    this.on('connected', callback);
    return this;
  }

  /**
   * Event: disconnected
   * @param {Function} callback - Callback
   * @returns {MultiplayerAPI} This instance
   */
  onDisconnected(callback) {
    this.on('disconnected', callback);
    return this;
  }

  /**
   * Event: peerConnected
   * @param {Function} callback - Callback
   * @returns {MultiplayerAPI} This instance
   */
  onPeerConnected(callback) {
    this.on('peerConnected', callback);
    return this;
  }

  /**
   * Event: peerDisconnected
   * @param {Function} callback - Callback
   * @returns {MultiplayerAPI} This instance
   */
  onPeerDisconnected(callback) {
    this.on('peerDisconnected', callback);
    return this;
  }

  /**
   * Event: error
   * @param {Function} callback - Callback
   * @returns {MultiplayerAPI} This instance
   */
  onError(callback) {
    this.on('error', callback);
    return this;
  }

  /**
   * Event: sync
   * @param {Function} callback - Callback
   * @returns {MultiplayerAPI} This instance
   */
  onSync(callback) {
    this.on('sync', callback);
    return this;
  }

  /**
   * Event: auth
   * @param {Function} callback - Callback
   * @returns {MultiplayerAPI} This instance
   */
  onAuth(callback) {
    this.on('auth', callback);
    return this;
  }
}

module.exports = MultiplayerAPI;
