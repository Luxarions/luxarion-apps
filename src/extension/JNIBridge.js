/**
 * LXRN JNIBridge Module
 * @namespace LXRN.JNIBridge
 * @author LXRN
 */

/**
 * JNI Bridge for Java Native Interface
 * @class JNIBridge
 */
class JNIBridge {
  #env = null;
  #classes = new Map();
  #objects = new Map();
  #nextId = 1;
  #globalRefs = new Map();
  #localRefs = new Map();
  #frameDepth = 0;

  /**
   * Create JNI environment
   * @returns {Object}
   */
  createEnv() {
    this.#env = {
      jni: this,
      PushLocalFrame: (capacity) => this.pushLocalFrame(capacity),
      PopLocalFrame: (result) => this.popLocalFrame(result),
      NewGlobalRef: (obj) => this.newGlobalRef(obj),
      DeleteGlobalRef: (obj) => this.deleteGlobalRef(obj),
      NewLocalRef: (obj) => this.newLocalRef(obj),
      DeleteLocalRef: (obj) => this.deleteLocalRef(obj),
      FindClass: (name) => this.findClass(name),
      GetObjectClass: (obj) => this.getObjectClass(obj),
      GetMethodID: (cls, name, sig) => this.getMethodID(cls, name, sig),
      GetStaticMethodID: (cls, name, sig) => this.getStaticMethodID(cls, name, sig),
      CallObjectMethod: (obj, method, ...args) => this.callMethod(obj, method, ...args),
      CallBooleanMethod: (obj, method, ...args) => this.callMethod(obj, method, ...args),
      CallIntMethod: (obj, method, ...args) => this.callMethod(obj, method, ...args),
      CallVoidMethod: (obj, method, ...args) => this.callMethod(obj, method, ...args),
      CallStaticObjectMethod: (cls, method, ...args) => this.callStaticMethod(cls, method, ...args),
      CallStaticBooleanMethod: (cls, method, ...args) => this.callStaticMethod(cls, method, ...args),
      CallStaticIntMethod: (cls, method, ...args) => this.callStaticMethod(cls, method, ...args),
      CallStaticVoidMethod: (cls, method, ...args) => this.callStaticMethod(cls, method, ...args),
      NewStringUTF: (str) => str,
      GetStringUTFChars: (str) => str,
      ReleaseStringUTFChars: (str) => {},
      NewObject: (cls, method, ...args) => this.newObject(cls, method, ...args),
      NewByteArray: (len) => new Uint8Array(len),
      SetByteArrayRegion: (arr, offset, len, buf) => {
        for (let i = 0; i < len; i++) arr[offset + i] = buf[i];
      },
      GetByteArrayElements: (arr) => arr,
      ReleaseByteArrayElements: (arr) => {},
      GetArrayLength: (arr) => arr.length,
      IsSameObject: (obj1, obj2) => obj1 === obj2,
      MonitorEnter: (obj) => 0,
      MonitorExit: (obj) => 0,
      GetStringLength: (str) => str ? str.length : 0,
      GetStringChars: (str) => str,
      ReleaseStringChars: (str) => {},
      NewGlobalRef: (obj) => this.newGlobalRef(obj),
      DeleteGlobalRef: (obj) => this.deleteGlobalRef(obj),
      GetEnv: () => this.#env,
      GetJavaVM: () => ({ GetEnv: () => this.#env }),
    };
    return this.#env;
  }

  /**
   * Get environment
   * @returns {Object}
   */
  getEnv() {
    if (!this.#env) this.createEnv();
    return this.#env;
  }

  /**
   * Push local frame
   * @param {number} capacity - Frame capacity
   * @returns {number}
   */
  pushLocalFrame(capacity) {
    this.#frameDepth++;
    return 0;
  }

  /**
   * Pop local frame
   * @param {*} result - Result
   * @returns {*}
   */
  popLocalFrame(result) {
    if (this.#frameDepth > 0) {
      this.#frameDepth--;
      // Clear local refs
      for (const [id, ref] of this.#localRefs) {
        if (ref.depth === this.#frameDepth) {
          this.#localRefs.delete(id);
        }
      }
    }
    return result;
  }

  /**
   * New global reference
   * @param {*} obj - Object
   * @returns {number}
   */
  newGlobalRef(obj) {
    const id = this.#nextId++;
    this.#globalRefs.set(id, { obj, depth: this.#frameDepth });
    return id;
  }

  /**
   * Delete global reference
   * @param {number} id - Reference ID
   * @returns {boolean}
   */
  deleteGlobalRef(id) {
    return this.#globalRefs.delete(id);
  }

  /**
   * New local reference
   * @param {*} obj - Object
   * @returns {number}
   */
  newLocalRef(obj) {
    const id = this.#nextId++;
    this.#localRefs.set(id, { obj, depth: this.#frameDepth });
    return id;
  }

  /**
   * Delete local reference
   * @param {number} id - Reference ID
   * @returns {boolean}
   */
  deleteLocalRef(id) {
    return this.#localRefs.delete(id);
  }

  /**
   * Find class
   * @param {string} name - Class name
   * @returns {Object}
   */
  findClass(name) {
    if (!this.#classes.has(name)) {
      this.#classes.set(name, {
        name: name,
        methods: {},
        staticMethods: {},
        fields: {},
        staticFields: {},
      });
    }
    return this.#classes.get(name);
  }

  /**
   * Get object class
   * @param {*} obj - Object
   * @returns {Object}
   */
  getObjectClass(obj) {
    if (typeof obj === 'number') {
      const entry = this.#localRefs.get(obj) || this.#globalRefs.get(obj);
      if (entry) obj = entry.obj;
    }
    const className = obj && obj._className ? obj._className : 'java/lang/Object';
    return this.findClass(className);
  }

  /**
   * Get method ID
   * @param {Object} cls - Class
   * @param {string} name - Method name
   * @param {string} sig - Signature
   * @returns {Object}
   */
  getMethodID(cls, name, sig) {
    if (typeof cls === 'number') {
      const entry = this.#localRefs.get(cls) || this.#globalRefs.get(cls);
      if (entry) cls = entry.obj;
    }
    if (typeof cls === 'object' && cls !== null && cls._methods) {
      return cls._methods[name] || null;
    }
    if (typeof cls === 'object' && cls !== null && typeof cls.methods === 'object') {
      return cls.methods[name] || null;
    }
    return { name: name, signature: sig };
  }

  /**
   * Get static method ID
   * @param {Object} cls - Class
   * @param {string} name - Method name
   * @param {string} sig - Signature
   * @returns {Object}
   */
  getStaticMethodID(cls, name, sig) {
    if (typeof cls === 'object' && cls !== null && typeof cls.staticMethods === 'object') {
      return cls.staticMethods[name] || null;
    }
    return { name: name, signature: sig };
  }

  /**
   * Call method
   * @param {*} obj - Object
   * @param {string|Function} method - Method
   * @param {Array} args - Arguments
   * @returns {*}
   */
  callMethod(obj, method, ...args) {
    if (typeof obj === 'number') {
      const entry = this.#localRefs.get(obj) || this.#globalRefs.get(obj);
      if (entry) obj = entry.obj;
    }
    if (typeof obj === 'object' && obj !== null && typeof obj.call === 'function') {
      return obj.call(method, ...args);
    }
    if (typeof obj === 'object' && obj !== null && typeof obj[method] === 'function') {
      return obj[method](...args);
    }
    if (typeof method === 'function') {
      return method(...args);
    }
    return null;
  }

  /**
   * Call static method
   * @param {Object} cls - Class
   * @param {string|Function} method - Method
   * @param {Array} args - Arguments
   * @returns {*}
   */
  callStaticMethod(cls, method, ...args) {
    if (typeof cls === 'object' && cls !== null && typeof cls.staticMethod === 'function') {
      return cls.staticMethod(method, ...args);
    }
    if (typeof cls === 'object' && cls !== null && typeof cls[method] === 'function') {
      return cls[method](...args);
    }
    return null;
  }

  /**
   * New object
   * @param {Object} cls - Class
   * @param {Function} method - Constructor method
   * @param {Array} args - Arguments
   * @returns {Object}
   */
  newObject(cls, method, ...args) {
    const obj = {
      _className: typeof cls === 'string' ? cls : cls.name,
      _methods: {},
      _data: {},
    };
    
    obj.call = (m, ...a) => {
      if (obj._methods[m]) return obj._methods[m](...a);
      if (typeof obj[m] === 'function') return obj[m](...a);
      return null;
    };
    obj.get = (key, def = null) => obj._data[key] || def;
    obj.set = (key, value) => { obj._data[key] = value; };
    
    if (method && typeof method === 'function') {
      method(obj, ...args);
    }
    return obj;
  }

  /**
   * Convert to JNI type
   * @param {*} value - Value
   * @param {string} type - Type
   * @returns {*}
   */
  toJNI(value, type) {
    if (type === 'string' || type === 'Ljava/lang/String;') {
      return String(value);
    }
    if (type === 'int' || type === 'I') {
      return parseInt(value, 10) || 0;
    }
    if (type === 'boolean' || type === 'Z') {
      return Boolean(value);
    }
    if (type === 'float' || type === 'F') {
      return parseFloat(value) || 0;
    }
    if (type === 'double' || type === 'D') {
      return parseFloat(value) || 0;
    }
    if (type === 'long' || type === 'J') {
      return parseInt(value, 10) || 0;
    }
    if (type === 'byte' || type === 'B') {
      return (parseInt(value, 10) || 0) & 0xFF;
    }
    if (type === 'char' || type === 'C') {
      return String(value)[0] || '';
    }
    return value;
  }

  /**
   * Convert from JNI type
   * @param {*} value - Value
   * @param {string} type - Type
   * @returns {*}
   */
  fromJNI(value, type) {
    if (type === 'string' || type === 'Ljava/lang/String;') {
      return String(value);
    }
    if (type === 'int' || type === 'I') {
      return Number(value) || 0;
    }
    if (type === 'boolean' || type === 'Z') {
      return !!value;
    }
    return value;
  }

  /**
   * Get global references
   * @returns {Array}
   */
  getGlobalRefs() {
    return Array.from(this.#globalRefs.keys());
  }

  /**
   * Get local references
   * @returns {Array}
   */
  getLocalRefs() {
    return Array.from(this.#localRefs.keys());
  }

  /**
   * Clear all references
   * @returns {JNIBridge} This instance
   */
  clear() {
    this.#globalRefs.clear();
    this.#localRefs.clear();
    this.#classes.clear();
    this.#objects.clear();
    this.#frameDepth = 0;
    return this;
  }
}

module.exports = JNIBridge;
