/**
 * LXRN PacketPeerUDP Module
 * @namespace LXRN.PacketPeerUDP
 * @author LXRN
 */

const PacketPeer = require('./PacketPeer.js');
const Dgram = require('dgram');

/**
 * UDP packet peer
 * @class PacketPeerUDP
 * @extends PacketPeer
 */
class PacketPeerUDP extends PacketPeer {
  #socket = null;
  #connected = false;
  #host = '';
  #port = 0;
  #remoteHost = '';
  #remotePort = 0;
  #timeout = 30000;

  /**
   * Connect to UDP peer
   * @param {string} host - Host to connect to
   * @param {number} port - Port to connect to
   * @returns {Promise<void>}
   */
  connect(host, port) {
    this.#host = host;
    this.#port = port;
    
    return new Promise((resolve, reject) => {
      try {
        this.#socket = Dgram.createSocket('udp4');
        this.#socket.setTimeout(this.#timeout);
        
        this.#socket.on('message', (msg, rinfo) => {
          const data = new Uint8Array(msg);
          this.#packets.push(data);
          this.#remoteHost = rinfo.address;
          this.#remotePort = rinfo.port;
        });
        
        this.#socket.on('error', (error) => {
          reject(error);
        });
        
        this.#socket.on('listening', () => {
          this.#connected = true;
          resolve();
        });
        
        this.#socket.on('timeout', () => {
          this.close();
          reject(new Error('UDP timeout'));
        });
        
        this.#socket.bind(0);
      } catch (error) {
        reject(new Error(`UDP connection failed: ${error.message}`));
      }
    });
  }

  /**
   * Connect to remote host
   * @param {string} host - Remote host
   * @param {number} port - Remote port
   * @returns {Promise<void>}
   */
  connectToHost(host, port) {
    this.#remoteHost = host;
    this.#remotePort = port;
    return this.connect(host, port);
  }

  /**
   * Send data
   * @param {Uint8Array|string} data - Data to send
   * @returns {Promise<void>}
   */
  send(data) {
    if (!this.#connected || !this.#socket) {
      throw new Error('UDP peer not connected');
    }
    
    const sendData = this.__prepareData(data);
    
    return new Promise((resolve, reject) => {
      this.#socket.send(sendData, 0, sendData.length, this.#remotePort, this.#remoteHost, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Receive data
   * @returns {Promise<Uint8Array>} Received data
   */
  receive() {
    return new Promise((resolve) => {
      if (this.#packets.length > 0) {
        resolve(this.#packets.shift());
        return;
      }
      
      this.#socket.once('message', (msg) => {
        resolve(new Uint8Array(msg));
      });
    });
  }

  /**
   * Close connection
   */
  close() {
    if (this.#socket) {
      try {
        this.#socket.close();
      } catch (error) {
        // Ignore
      }
      this.#socket = null;
    }
    this.#connected = false;
  }

  /**
   * Set timeout
   * @param {number} ms - Timeout in milliseconds
   */
  setTimeout(ms) {
    this.#timeout = ms;
    if (this.#socket) {
      this.#socket.setTimeout(ms);
    }
  }

  /**
   * Prepare data for sending
   * @private
   * @param {Uint8Array|string} data - Data to prepare
   * @returns {Buffer} Prepared data
   */
  __prepareData(data) {
    if (typeof data === 'string') {
      return Buffer.from(data);
    }
    if (data instanceof Uint8Array) {
      return Buffer.from(data);
    }
    if (data instanceof Buffer) {
      return data;
    }
    return Buffer.from(data);
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  get isConnected() {
    return this.#connected;
  }

  /**
   * Get local host
   * @returns {string}
   */
  get host() {
    return this.#host;
  }

  /**
   * Get local port
   * @returns {number}
   */
  get port() {
    return this.#port;
  }

  /**
   * Get remote host
   * @returns {string}
   */
  get remoteHost() {
    return this.#remoteHost;
  }

  /**
   * Get remote port
   * @returns {number}
   */
  get remotePort() {
    return this.#remotePort;
  }
}

module.exports = PacketPeerUDP;
