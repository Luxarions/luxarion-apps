/**
 * LXRN MultiplayerPeer Module
 * @namespace LXRN.MultiplayerPeer
 * @author LXRN
 */

const EventEmitter = require('events');

/**
 * Multiplayer peer for network communication
 * @class MultiplayerPeer
 * @extends EventEmitter
 */
class MultiplayerPeer extends EventEmitter {
  /**
   * Transfer modes
   */
  static TRANSFER_MODE_RELIABLE = 0;
  static TRANSFER_MODE_UNRELIABLE = 1;
  static TRANSFER_MODE_UNRELIABLE_ORDERED = 2;

  constructor() {
    super();
    this._multiplayer = null;
    this._transferMode = MultiplayerPeer.TRANSFER_MODE_RELIABLE;
    this._targetPeer = 0;
    this._connected = false;
    this._incomingPackets = [];
    this._outgoingPackets = [];
    this._packetHandlers = [];
    this._peerId = -1;
    this._peerIds = new Set();
    this._callbacks = {};
    this._socket = null;
    this._maxPacketSize = 65535;
    this._compressPackets = false;
    this._encryptPackets = false;
    this._encryptionKey = null;
    this._packetQueue = [];
    this._queueLimit = 1000;
    this._sendRate = 0;
    this._lastSendTime = 0;
    this._sendInterval = 0;
    this._bytesSent = 0;
    this._bytesReceived = 0;
    this._packetsSent = 0;
    this._packetsReceived = 0;
    this._packetsDropped = 0;
    this._latency = 0;
    this._jitter = 0;
    this._connectionTime = 0;
    this._reconnectAttempts = 0;
    this._maxReconnectAttempts = 5;
    this._reconnectDelay = 1000;
    this._reconnecting = false;
    this._pingInterval = null;
    this._pingTimeout = 30000;
    this._lastPing = 0;
    this._lastPong = 0;
    this._roundTripTime = 0;
  }

  /**
   * Get multiplayer
   * @returns {Object|null}
   */
  get multiplayer() {
    return this._multiplayer;
  }

  /**
   * Set multiplayer
   * @param {Object} value - Multiplayer
   */
  set multiplayer(value) {
    this._multiplayer = value;
  }

  /**
   * Get transfer mode
   * @returns {number}
   */
  get transferMode() {
    return this._transferMode;
  }

  /**
   * Set transfer mode
   * @param {number} value - Transfer mode
   */
  set transferMode(value) {
    this._transferMode = value;
  }

  /**
   * Get target peer
   * @returns {number}
   */
  get targetPeer() {
    return this._targetPeer;
  }

  /**
   * Set target peer
   * @param {number} value - Target peer
   */
  set targetPeer(value) {
    this._targetPeer = value;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this._connected;
  }

  /**
   * Get peer ID
   * @returns {number}
   */
  get peerId() {
    return this._peerId;
  }

  /**
   * Get connected peers
   * @returns {Array}
   */
  getConnectedPeers() {
    return Array.from(this._peerIds);
  }

  /**
   * Set transfer mode
   * @param {number} mode - Transfer mode
   * @returns {MultiplayerPeer} This instance
   */
  setTransferMode(mode) {
    this._transferMode = mode;
    return this;
  }

  /**
   * Set target peer
   * @param {number} id - Peer ID
   * @returns {MultiplayerPeer} This instance
   */
  setTargetPeer(id) {
    this._targetPeer = id;
    return this;
  }

  /**
   * Send data
   * @param {Uint8Array|string} data - Data to send
   * @returns {MultiplayerPeer} This instance
   */
  send(data) {
    let packet = data;
    if (typeof data === 'string') {
      packet = Buffer.from(data, 'utf-8');
    }
    if (!(packet instanceof Buffer)) {
      packet = Buffer.from(packet);
    }
    
    // Check size
    if (packet.length > this._maxPacketSize) {
      // Split packet
      const chunks = this.__splitPacket(packet);
      for (const chunk of chunks) {
        this._outgoingPackets.push({
          data: chunk,
          mode: this._transferMode,
          target: this._targetPeer,
        });
      }
    } else {
      this._outgoingPackets.push({
        data: packet,
        mode: this._transferMode,
        target: this._targetPeer,
      });
    }
    
    this.__processOutgoing();
    return this;
  }

  /**
   * Split packet into chunks
   * @private
   * @param {Buffer} data - Data to split
   * @returns {Array}
   */
  __splitPacket(data) {
    const chunks = [];
    for (let i = 0; i < data.length; i += this._maxPacketSize) {
      chunks.push(data.slice(i, i + this._maxPacketSize));
    }
    return chunks;
  }

  /**
   * Process outgoing packets
   * @private
   */
  __processOutgoing() {
    while (this._outgoingPackets.length > 0) {
      const packet = this._outgoingPackets.shift();
      this._packetsSent++;
      this._bytesSent += packet.data.length;
      
      // Call handlers
      for (const handler of this._packetHandlers) {
        try {
          handler(packet.data, packet.target);
        } catch (error) {
          // Ignore
        }
      }
      
      this.emit('packetSent', packet.data, packet.target);
    }
  }

  /**
   * Receive data
   * @returns {Buffer|null}
   */
  receive() {
    if (this._incomingPackets.length > 0) {
      const packet = this._incomingPackets.shift();
      this._packetsReceived++;
      this._bytesReceived += packet.length;
      return packet;
    }
    return null;
  }

  /**
   * Get available packet count
   * @returns {number}
   */
  getAvailablePacketCount() {
    return this._incomingPackets.length;
  }

  /**
   * Add packet handler
   * @param {Function} handler - Handler function
   * @returns {MultiplayerPeer} This instance
   */
  addPacketHandler(handler) {
    this._packetHandlers.push(handler);
    return this;
  }

  /**
   * Remove packet handler
   * @param {Function} handler - Handler function
   * @returns {boolean}
   */
  removePacketHandler(handler) {
    const idx = this._packetHandlers.indexOf(handler);
    if (idx !== -1) {
      this._packetHandlers.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Connect to peer
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @returns {Promise<MultiplayerPeer>}
   */
  connect(host, port) {
    return new Promise((resolve, reject) => {
      try {
        // Simulate connection
        this._connected = true;
        this._peerId = Math.floor(Math.random() * 1000000) + 1;
        this._connectionTime = Date.now();
        this.emit('connected');
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect peer
   * @returns {MultiplayerPeer} This instance
   */
  disconnect() {
    this._connected = false;
    this.__stopPing();
    this.emit('disconnected');
    return this;
  }

  /**
   * Set socket
   * @param {Object} socket - Socket
   * @returns {MultiplayerPeer} This instance
   */
  setSocket(socket) {
    this._socket = socket;
    if (socket) {
      socket.on('data', (data) => {
        this._incomingPackets.push(data);
        this._packetsReceived++;
        this._bytesReceived += data.length;
        this.emit('packetReceived', data);
      });
      socket.on('connect', () => {
        this._connected = true;
        this.emit('connected');
        this.__startPing();
      });
      socket.on('close', () => {
        this._connected = false;
        this.__stopPing();
        this.emit('disconnected');
      });
      socket.on('error', (error) => {
        this.emit('error', error);
      });
    }
    return this;
  }

  /**
   * Get socket
   * @returns {Object|null}
   */
  getSocket() {
    return this._socket;
  }

  /**
   * Start ping
   * @private
   */
  __startPing() {
    this.__stopPing();
    this._pingInterval = setInterval(() => {
      if (this._connected) {
        this._lastPing = Date.now();
        this.send('__ping__');
      }
    }, 5000);
  }

  /**
   * Stop ping
   * @private
   */
  __stopPing() {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
  }

  /**
   * Set max packet size
   * @param {number} size - Max packet size
   * @returns {MultiplayerPeer} This instance
   */
  setMaxPacketSize(size) {
    this._maxPacketSize = size;
    return this;
  }

  /**
   * Enable compression
   * @param {boolean} enable - Enable compression
   * @returns {MultiplayerPeer} This instance
   */
  setCompression(enable) {
    this._compressPackets = enable;
    return this;
  }

  /**
   * Enable encryption
   * @param {boolean} enable - Enable encryption
   * @param {Uint8Array} key - Encryption key
   * @returns {MultiplayerPeer} This instance
   */
  setEncryption(enable, key = null) {
    this._encryptPackets = enable;
    this._encryptionKey = key;
    return this;
  }

  /**
   * Set queue limit
   * @param {number} limit - Queue limit
   * @returns {MultiplayerPeer} This instance
   */
  setQueueLimit(limit) {
    this._queueLimit = limit;
    return this;
  }

  /**
   * Get stats
   * @returns {Object}
   */
  getStats() {
    return {
      connected: this._connected,
      peerId: this._peerId,
      bytesSent: this._bytesSent,
      bytesReceived: this._bytesReceived,
      packetsSent: this._packetsSent,
      packetsReceived: this._packetsReceived,
      packetsDropped: this._packetsDropped,
      latency: this._latency,
      jitter: this._jitter,
      rtt: this._roundTripTime,
      connectionTime: this._connectionTime,
      uptime: Date.now() - this._connectionTime,
    };
  }

  /**
   * To JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      peerId: this._peerId,
      connected: this._connected,
      transferMode: this._transferMode,
      targetPeer: this._targetPeer,
    };
  }

  /**
   * From JSON
   * @param {Object} data - JSON data
   * @returns {MultiplayerPeer} This instance
   */
  fromJSON(data) {
    this._peerId = data.peerId || -1;
    this._connected = data.connected || false;
    this._transferMode = data.transferMode || MultiplayerPeer.TRANSFER_MODE_RELIABLE;
    this._targetPeer = data.targetPeer || 0;
    return this;
  }
}

module.exports = MultiplayerPeer;
