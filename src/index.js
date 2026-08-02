/**
 * LXRN Game Engine - Complete JavaScript Game Framework
 * @namespace LXRN
 * @version 1.0.0
 * @author LXRN
 * @license MIT
 */

const FS = require('fs');
const PATH = require('path');

// ============================================================================
// Core Module
// ============================================================================
const LXRN = {
  VERSION: '1.0.0',
  NAME: 'LXRN Game Engine',
  AUTHOR: 'LXRN',
  
  // Core
  COMPRESSION: require('./src/core/Compression.js'),
  DELTA_ENCODING: require('./src/core/DeltaEncoding.js'),
  IP_ADDRESS: require('./src/core/IPAddress.js'),
  IP: require('./src/core/IP.js'),
  NET_SOCKET: require('./src/core/NetSocket.js'),
  STREAM_PEER: require('./src/core/StreamPeer.js'),
  STREAM_PEER_GZIP: require('./src/core/StreamPeerGZip.js'),
  STREAM_PEER_SOCKET: require('./src/core/StreamPeerSocket.js'),
  STREAM_PEER_TCP: require('./src/core/StreamPeerTCP.js'),
  STREAM_PEER_TLS: require('./src/core/StreamPeerTLS.js'),
  STREAM_PEER_UDS: require('./src/core/StreamPeerUDS.js'),
  TCP_SERVER: require('./src/core/TCPServer.js'),
  UDP_SERVER: require('./src/core/UDPServer.js'),
  PACKET_PEER: require('./src/core/PacketPeer.js'),
  PACKET_PEER_UDP: require('./src/core/PacketPeerUDP.js'),
  PACKET_PEER_DTLS: require('./src/core/PacketPeerDTLS.js'),
  DTLS_SERVER: require('./src/core/DTLSServer.js'),
  SOCKET_SERVER: require('./src/core/SocketServer.js'),
  
  // Network
  HTTP_CLIENT: require('./src/network/HTTPClient.js'),
  HTTP_CLIENT_TCP: require('./src/network/HTTPClientTCP.js'),
  WEB_SOCKET_CLIENT: require('./src/network/WebSocketClient.js'),
  WEB_SOCKET_SERVER: require('./src/network/WebSocketServer.js'),
  MULTIPLAYER_API: require('./src/network/MultiplayerAPI.js'),
  
  // Resource
  RESOURCE: require('./src/resource/Resource.js'),
  RESOURCE_LOADER: require('./src/resource/ResourceLoader.js'),
  RESOURCE_SAVER: require('./src/resource/ResourceSaver.js'),
  RESOURCE_FORMAT_BINARY: require('./src/resource/ResourceFormatBinary.js'),
  RESOURCE_FORMAT_JSON: require('./src/resource/ResourceFormatJSON.js'),
  RESOURCE_PRELOADER: require('./src/resource/ResourcePreloader.js'),
  PACKED_DATA_CONTAINER: require('./src/resource/PackedDataContainer.js'),
  PCK_PACKER: require('./src/resource/PCKPacker.js'),
  FILE_ACCESS_PACK: require('./src/resource/FileAccessPack.js'),
  FILE_ACCESS_ZIP: require('./src/resource/FileAccessZip.js'),
  FILE_ACCESS_ENCRYPTED: require('./src/resource/FileAccessEncrypted.js'),
  FILE_ACCESS_COMPRESSED: require('./src/resource/FileAccessCompressed.js'),
  FILE_ACCESS_MEMORY: require('./src/resource/FileAccessMemory.js'),
  FILE_ACCESS_PATCHED: require('./src/resource/FileAccessPatched.js'),
  DIR_ACCESS: require('./src/resource/DirAccess.js'),
  
  // Scene
  NODE: require('./src/scene/Node.js'),
  SCENE_TREE: require('./src/scene/SceneTree.js'),
  TIMER: require('./src/scene/Timer.js'),
  CANVAS_ITEM: require('./src/scene/CanvasItem.js'),
  CANVAS_LAYER: require('./src/scene/CanvasLayer.js'),
  VIEWPORT: require('./src/scene/Viewport.js'),
  WINDOW: require('./src/scene/Window.js'),
  HTTP_REQUEST: require('./src/scene/HTTPRequest.js'),
  INSTANCE_PLACEHOLDER: require('./src/scene/InstancePlaceholder.js'),
  MISSING_NODE: require('./src/scene/MissingNode.js'),
  STATUS_INDICATOR: require('./src/scene/StatusIndicator.js'),
  SHADER_GLOBALS_OVERRIDE: require('./src/scene/ShaderGlobalsOverride.js'),
  
  // Crypto
  HASHING_CONTEXT: require('./src/crypto/HashingContext.js'),
  AES_CONTEXT: require('./src/crypto/AESContext.js'),
  CRYPTO_CORE: require('./src/crypto/CryptoCore.js'),
  CRYPTO: require('./src/crypto/Crypto.js'),
  CRYPTO_RESOURCE_FORMAT: require('./src/crypto/CryptoResourceFormat.js'),
  
  // Extension
  EXTENSION_INTERFACE: require('./src/extension/ExtensionInterface.js'),
  EXTENSION_MANAGER: require('./src/extension/ExtensionManager.js'),
  EXTENSION_LOADER: require('./src/extension/ExtensionLoader.js'),
  EXTENSION_INSTANCE: require('./src/extension/ExtensionInstance.js'),
  EXTENSION_RESOURCE_FORMAT: require('./src/extension/ExtensionResourceFormat.js'),
  ANDROID_PLUGIN_MANAGER: require('./src/extension/AndroidPluginManager.js'),
  JNI_BRIDGE: require('./src/extension/JNIBridge.js'),
  
  // Threading
  MUTEX: require('./src/threading/Mutex.js'),
  SPIN_LOCK: require('./src/threading/SpinLock.js'),
  RW_LOCK: require('./src/threading/RWLock.js'),
  SEMAPHORE: require('./src/threading/Semaphore.js'),
  CONDITION_VARIABLE: require('./src/threading/ConditionVariable.js'),
  THREAD: require('./src/threading/Thread.js'),
  THREAD_SAFE: require('./src/threading/ThreadSafe.js'),
  
  // Utils
  LOGGER: require('./src/utils/Logger.js'),
  CONFIG_FILE: require('./src/utils/ConfigFile.js'),
  JSON_PARSER: require('./src/utils/JSONParser.js'),
  XML_PARSER: require('./src/utils/XMLParser.js'),
  PLIST_PARSER: require('./src/utils/PlistParser.js'),
  MARSHALLS: require('./src/utils/Marshalls.js'),
  TIME: require('./src/utils/Time.js'),
  OS: require('./src/utils/OS.js'),
  MEMORY: require('./src/utils/Memory.js'),
  KEYBOARD: require('./src/utils/Keyboard.js'),
  MAIN_LOOP: require('./src/utils/MainLoop.js'),
  
  // Graphics
  IMAGE: require('./src/graphics/Image.js'),
  IMAGE_LOADER: require('./src/graphics/ImageLoader.js'),
  IMAGE_RESOURCE_FORMAT: require('./src/graphics/ImageResourceFormat.js'),
  IMAGE_COMPAT: require('./src/graphics/ImageCompat.js'),
  
  // I18n
  TRANSLATION_LOADER_PO: require('./src/i18n/TranslationLoaderPO.js'),
  
  // Application
  APPLICATION: class Application {
    constructor() {
      this._logger = new LXRN.LOGGER('Application');
      this._sceneTree = new LXRN.SCENE_TREE();
      this._window = new LXRN.WINDOW('LXRN Application');
      this._preloader = new LXRN.RESOURCE_PRELOADER();
      this._multiplayer = new LXRN.MULTIPLAYER_API();
      this._http = new LXRN.HTTP_REQUEST();
      this._status = new LXRN.STATUS_INDICATOR();
      this._running = false;
      this._initialized = false;
    }
    
    async initialize() {
      if (this._initialized) return;
      
      this._logger.info('Initializing LXRN Engine...');
      
      this._window.setSize(1280, 720);
      this._window.setTitle('LXRN Game Engine');
      this._window.show();
      
      this._sceneTree.getRoot().addChild(this._window);
      this._sceneTree.getRoot().addChild(this._http);
      this._sceneTree.getRoot().addChild(this._status);
      this._sceneTree.setFPS(60);
      
      this._multiplayer.setRootNode(this._sceneTree.getRoot());
      
      this._status.setStatus('initializing', 'Starting LXRN Engine...', 0);
      
      this._initialized = true;
      this._logger.info('LXRN Engine initialized successfully');
      return this;
    }
    
    async start() {
      if (!this._initialized) {
        await this.initialize();
      }
      
      this._logger.info('Starting LXRN Engine...');
      this._running = true;
      
      this._status.setStatus('running', 'LXRN Engine is running', 1);
      
      this._sceneTree.start();
      
      this._logger.info('LXRN Engine started');
      return this;
    }
    
    stop() {
      this._running = false;
      this._sceneTree.quit();
      this._logger.info('LXRN Engine stopped');
      return this;
    }
    
    loadScene(path) {
      this._logger.info(`Loading scene: ${path}`);
      const result = this._sceneTree.changeScene(path);
      if (result === 0) {
        this._logger.info('Scene loaded successfully');
      } else {
        this._logger.error('Failed to load scene');
      }
      return result;
    }
    
    getSceneTree() { return this._sceneTree; }
    getWindow() { return this._window; }
    getLogger() { return this._logger; }
    getMultiplayer() { return this._multiplayer; }
    getPreloader() { return this._preloader; }
    getStatus() { return this._status; }
    isRunning() { return this._running; }
    isInitialized() { return this._initialized; }
  }
};

// ============================================================================
// Export all modules
// ============================================================================
module.exports = LXRN;

// ============================================================================
// Auto-initialize if run directly
// ============================================================================
if (require.main === module) {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                        LXRN GAME ENGINE                         ║
║                        Version ${LXRN.VERSION}                          ║
║                    Powered by Node.js & Godot                   ║
║                    Copyright (c) LXRN 2024                     ║
╚══════════════════════════════════════════════════════════════════╝
  `);
  
  const app = new LXRN.APPLICATION();
  app.initialize()
    .then(() => app.start())
    .catch((err) => {
      console.error('Failed to start application:', err);
      process.exit(1);
    });
  
  process.on('SIGINT', () => {
    app.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    app.stop();
    process.exit(0);
  });
}
