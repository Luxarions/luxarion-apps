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
   * @static
   */
  static TRANSFER_MODE_RELIABLE = 0;
  static TRANSFER_MODE_UNRELIABLE = 1;
  static TRANSFER_MODE_UNRELIABLE_ORDERED = 2;

  #multiplayer = null;
  #transferMode = MultiplayerPeer.TRANSFER_MODE_RELIABLE;
  #targetPeer = 0;
  #connected = false;
  #incomingPackets = [];
  #outgoingPackets = [];
  #packetHandlers = [];
  #peerId = -1;
  #peerIds = new Set();
  #callbacks = {};
  #socket = null;
  #maxPacketSize = 65535;
  #compressPackets = false;
  #encryptPackets = false;
  #encryptionKey = null;
  #packetQueue = [];
  #queueLimit = 1000;
  #sendRate = 0;
  #lastSendTime = 0;
  #sendInterval = 0;
  #bytesSent = 0;
  #bytesReceived = 0;
  #packetsSent = 0;
  #packetsReceived = 0;
  #packetsDropped = 0;
  #latency = 0;
  #jitter = 0;
  #connectionTime = 0;
  #reconnectAttempts = 0;
  #maxReconnectAttempts = 5;
  #reconnectDelay = 1000;
  #reconnecting = false;
  #pingInterval = null;
  #pingTimeout = 30000;
  #lastPing = 0;
  #lastPong = 0;
  #roundTripTime = 0;

  /**
   * Get multiplayer
   * @returns {Object|null}
   */
  get multiplayer() {
    return this.#multiplayer;
  }

  /**
   * Set multiplayer
   * @param {Object} value - Multiplayer
   */
  set multiplayer(value) {
    this.#multiplayer = value;
  }

  /**
   * Get transfer mode
   * @returns {number}
   */
  get transferMode() {
    return this.#transferMode;
  }

  /**
   * Set transfer mode
   * @param {number} value - Transfer mode
   */
  set transferMode(value) {
    this.#transferMode = value;
  }

  /**
   * Get target peer
   * @returns {number}
   */
  get targetPeer() {
    return this.#targetPeer;
  }

  /**
   * Set target peer
   * @param {number} value - Target peer
   */
  set targetPeer(value) {
    this.#targetPeer = value;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.#connected;
  }

  /**
   * Get peer ID
   * @returns {number}
   */
  get peerId() {
    return this.#peerId;
  }

  /**
   * Get connected peers
   * @returns {Array}
   */
  getConnectedPeers() {
    return Array.from(this.#peerIds);
  }

  /**
   * Set transfer mode
   * @param {number} mode - Transfer mode
   * @returns {MultiplayerPeer} This instance
   */
  setTransferMode(mode) {
    this.#transferMode = mode;
    return this;
  }

  /**
   * Set target peer
   * @param {number} id - Peer ID
   * @returns {MultiplayerPeer} This instance
   */
  setTargetPeer(id) {
    this.#targetPeer = id;
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
    if (packet.length > this.#maxPacketSize) {
      // Split packet
      const chunks = this.__splitPacket(packet);
      for (const chunk of chunks) {
        this.#outgoingPackets.push({
          data: chunk,
          mode: this.#transferMode,
          target: this.#targetPeer,
        });
      }
    } else {
      this.#outgoingPackets.push({
        data: packet,
        mode: this.#transferMode,
        target: this.#targetPeer,
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
    for (let i = 0; i < data.length; i += this.#maxPacketSize) {
      chunks.push(data.slice(i, i + this.#maxPacketSize));
    }
    return chunks;
  }

  /**
   * Process outgoing packets
   * @private
   */
  __processOutgoing() {
    while (this.#outgoingPackets.length > 0) {
      const packet = this.#outgoingPackets.shift();
      this.#packetsSent++;
      this.#bytesSent += packet.data.length;
      
      // Call handlers
      for (const handler of this.#packetHandlers) {
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
    if (this.#incomingPackets.length > 0) {
      const packet = this.#incomingPackets.shift();
      this.#packetsReceived++;
      this.#bytesReceived += packet.length;
      return packet;
    }
    return null;
  }

  /**
   * Get available packet count
   * @returns {number}
   */
  getAvailablePacketCount() {
    return this.#incomingPackets.length;
  }

  /**
   * Add packet handler
   * @param {Function} handler - Handler function
   * @returns {MultiplayerPeer} This instance
   */
  addPacketHandler(handler) {
    this.#packetHandlers.push(handler);
    return this;
  }

  /**
   * Remove packet handler
   * @param {Function} handler - Handler function
   * @returns {boolean}
   */
  removePacketHandler(handler) {
    const idx = this.#packetHandlers.indexOf(handler);
    if (idx !== -1) {
      this.#packetHandlers.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Connect to peer
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @param {Object} options - Connection options
   * @returns {Promise<MultiplayerPeer>}
   */
  connect(host, port, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Simulate connection
        this.#connected = true;
        this.#peerId = Math.floor(Math.random() * 1000000) + 1;
        this.#connectionTime = Date.now();
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
    this.#connected = false;
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
    this.#socket = socket;
    if (socket) {
      socket.on('data', (data) => {
        this.#incomingPackets.push(data);
        this.#packetsReceived++;
        this.#bytesReceived += data.length;
        this.emit('packetReceived', data);
      });
      socket.on('connect', () => {
        this.#connected = true;
        this.emit('connected');
        this.__startPing();
      });
      socket.on('close', () => {
        this.#connected = false;
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
    return this.#socket;
  }

  /**
   * Start ping
   * @private
   */
  __startPing() {
    this.__stopPing();
    this.#pingInterval = setInterval(() => {
      if (this.#connected) {
        this.#lastPing = Date.now();
        this.send('__ping__');
      }
    }, 5000);
  }

  /**
   * Stop ping
   * @private
   */
  __stopPing() {
    if (this.#pingInterval) {
      clearInterval(this.#pingInterval);
      this.#pingInterval = null;
    }
  }

  /**
   * Set max packet size
   * @param {number} size - Max packet size
   * @returns {MultiplayerPeer} This instance
   */
  setMaxPacketSize(size) {
    this.#maxPacketSize = size;
    return this;
  }

  /**
   * Enable compression
   * @param {boolean} enable - Enable compression
   * @returns {MultiplayerPeer} This instance
   */
  setCompression(enable) {
    this.#compressPackets = enable;
    return this;
  }

  /**
   * Enable encryption
   * @param {boolean} enable - Enable encryption
   * @param {Uint8Array} key - Encryption key
   * @returns {MultiplayerPeer} This instance
   */
  setEncryption(enable, key = null) {
    this.#encryptPackets = enable;
    this.#encryptionKey = key;
    return this;
  }

  /**
   * Set queue limit
   * @param {number} limit - Queue limit
   * @returns {MultiplayerPeer} This instance
   */
  setQueueLimit(limit) {
    this.#queueLimit = limit;
    return this;
  }

  /**
   * Get stats
   * @returns {Object}
   */
  getStats() {
    return {
      connected: this.#connected,
      peerId: this.#peerId,
      bytesSent: this.#bytesSent,
      bytesReceived: this.#bytesReceived,
      packetsSent: this.#packetsSent,
      packetsReceived: this.#packetsReceived,
      packetsDropped: this.#packetsDropped,
      latency: this.#latency,
      jitter: this.#jitter,
      rtt: this.#roundTripTime,
      connectionTime: this.#connectionTime,
      uptime: Date.now() - this.#connectionTime,
    };
  }

  /**
   * To JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      peerId: this.#peerId,
      connected: this.#connected,
      transferMode: this.#transferMode,
      targetPeer: this.#targetPeer,
    };
  }

  /**
   * From JSON
   * @param {Object} data - JSON data
   * @returns {MultiplayerPeer} This instance
   */
  fromJSON(data) {
    this.#peerId = data.peerId || -1;
    this.#connected = data.connected || false;
    this.#transferMode = data.transferMode || MultiplayerPeer.TRANSFER_MODE_RELIABLE;
    this.#targetPeer = data.targetPeer || 0;
    return this;
  }
}

module.exports = MultiplayerPeer;
