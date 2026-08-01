/**
 * SecurityCybork - Advanced Security Module for Luxarion Engine
 * Protects internal/private code from theft, unauthorized access, and reverse engineering.
 * Fully integrated with Luxarion Engine's existing codebase using DI pattern.
 * 
 * @module SecurityCybork
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { version } from '../core/Version.js';
import { 
    SECURITY_ALLOWED_ORIGINS, 
    SECURITY_INTEGRITY_HASH, 
    SECURITY_VERSION,
    SECURITY_FEATURES,
    SECURITY_DEFAULTS,
    NAME,
    VENDOR,
    ENGINE_URL
} from '../core/Constants.js';

import * as ConsoleUtils from './ConsoleUtils.js';
import * as SerializeUtils from './SerializeUtils.js';

/**
 * Private state using module closure (not accessible from outside).
 */
const state = {
    _initialized: false,
    _integrityHash: SECURITY_INTEGRITY_HASH || 'luxarion-integrity-v1',
    _allowedOrigins: [...SECURITY_ALLOWED_ORIGINS],
    _guardedFunctions: new Map(),
    _sealedObjects: new WeakSet(),
    _integrityChecksum: null,
    _instanceId: null,
    _strictMode: SECURITY_DEFAULTS ? SECURITY_DEFAULTS.STRICT_MODE : false,
    _logViolations: SECURITY_DEFAULTS ? SECURITY_DEFAULTS.LOG_VIOLATIONS : true,
    _throwOnViolation: SECURITY_DEFAULTS ? SECURITY_DEFAULTS.THROW_ON_VIOLATION : true,
    _violationLog: [],
    _initializationTime: null,
    _lastIntegrityCheck: null,
    _integrityPassed: false,
    _allowedOriginsSet: new Set(SECURITY_ALLOWED_ORIGINS),
    _logger: null,
    _serializer: null
};

/**
 * Generate a unique instance ID.
 * @private
 * @returns {string} Instance ID.
 */
function _generateInstanceId() {
    return 'lux-' + Date.now().toString(36) + '-' + 
           Math.random().toString(36).substr(2, 9) + '-' + 
           Math.random().toString(36).substr(2, 4);
}

/**
 * Get the current origin.
 * @private
 * @returns {string} Origin string.
 */
function _getOrigin() {
    try {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.origin;
        }
        if (typeof document !== 'undefined' && document.location) {
            return document.location.origin;
        }
        if (typeof global !== 'undefined' && global.location) {
            return global.location.origin;
        }
        return 'unknown';
    } catch (e) {
        return 'unknown';
    }
}

/**
 * Check if origin is allowed.
 * @private
 * @param {string} origin - Origin to check.
 * @returns {boolean} True if allowed.
 */
function _isAllowedOrigin(origin) {
    if (origin === 'unknown') return false;
    
    // Check exact match
    if (state._allowedOriginsSet.has(origin)) return true;
    
    // Check wildcard patterns
    for (const allowed of state._allowedOriginsSet) {
        if (allowed === '*') return true;
        if (allowed.includes('*')) {
            const pattern = allowed.replace(/\*/g, '.*');
            try {
                const regex = new RegExp(`^${pattern}$`);
                if (regex.test(origin)) return true;
            } catch (e) {
                // Invalid regex pattern, skip
            }
        }
        // Check prefix match (for subdomains)
        if (origin.startsWith(allowed) && allowed.length > 0) {
            // Only if allowed ends with something that makes sense as a prefix
            if (allowed.endsWith('.') || allowed.endsWith('/')) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Calculate hash of a value.
 * @private
 * @param {*} obj - Value to hash.
 * @returns {Promise<string>} Hash string.
 */
async function _calculateHash(obj) {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    
    // Try Web Crypto API
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fall through to simple hash
        }
    }
    
    // Simple hash fallback
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

/**
 * Calculate hash synchronously (for immediate use).
 * @private
 * @param {*} obj - Value to hash.
 * @returns {string} Hash string.
 */
function _calculateHashSync(obj) {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

/**
 * Log a security violation.
 * @private
 * @param {string} type - Violation type.
 * @param {string} message - Violation message.
 * @param {*} [data] - Additional data.
 */
function _logViolation(type, message, data = null) {
    const violation = {
        type: type,
        message: message,
        data: data,
        timestamp: Date.now(),
        origin: _getOrigin()
    };
    
    state._violationLog.push(violation);
    
    if (state._logViolations) {
        const logger = state._logger || ConsoleUtils;
        logger.warn(`[SecurityCybork] ${type}: ${message}`, data || '');
    }
    
    if (state._throwOnViolation) {
        throw new Error(`[SecurityCybork] ${type}: ${message}`);
    }
}

/**
 * Auto-protect critical functions.
 * @private
 */
async function _autoProtectCriticalFunctions() {
    try {
        // Protect SerializeUtils functions
        const serializeFns = ['toString', 'fromString', 'toBytes', 'fromBytes'];
        for (const fnName of serializeFns) {
            if (typeof SerializeUtils[fnName] === 'function') {
                const fn = SerializeUtils[fnName];
                state._guardedFunctions.set(fn, _guard(fn));
            }
        }
    } catch (e) {
        const logger = state._logger || ConsoleUtils;
        logger.warn('[SecurityCybork] Auto-protection for SerializeUtils failed:', e.message);
    }
    
    try {
        // Protect ConsoleUtils functions
        const consoleFns = ['log', 'warn', 'error', 'debug', 'warnOnce'];
        for (const fnName of consoleFns) {
            if (typeof ConsoleUtils[fnName] === 'function') {
                const fn = ConsoleUtils[fnName];
                state._guardedFunctions.set(fn, _guard(fn));
            }
        }
    } catch (e) {
        const logger = state._logger || ConsoleUtils;
        logger.warn('[SecurityCybork] Auto-protection for ConsoleUtils failed:', e.message);
    }
}

/**
 * Guard a function with security checks.
 * @private
 * @param {Function} func - Function to guard.
 * @param {Object} [context] - Context for the function.
 * @returns {Function} Guarded function.
 */
function _guard(func, context = null) {
    if (typeof func !== 'function') {
        throw new Error('[SecurityCybork] guard() requires a function');
    }
    
    if (state._guardedFunctions.has(func)) {
        return state._guardedFunctions.get(func);
    }
    
    const guardedFunc = function(...args) {
        if (!_isAuthorized()) {
            _logViolation('UNAUTHORIZED_ACCESS', 'Unauthorized access attempt to guarded function');
            throw new Error('[SecurityCybork] Unauthorized access to guarded function');
        }
        return func.apply(context || this, args);
    };
    
    Object.defineProperties(guardedFunc, {
        name: { value: func.name || 'guardedFunction', configurable: true },
        length: { value: func.length, configurable: true },
        __isGuarded: { value: true, configurable: false, enumerable: false },
        __originalFunction: { value: func, configurable: false, enumerable: false }
    });
    
    state._guardedFunctions.set(func, guardedFunc);
    state._guardedFunctions.set(guardedFunc, guardedFunc);
    
    return guardedFunc;
}

/**
 * Check if authorized (synchronous).
 * @private
 * @returns {boolean} True if authorized.
 */
function _isAuthorized() {
    if (!state._initialized) {
        return false;
    }
    
    const origin = _getOrigin();
    const isAllowed = _isAllowedOrigin(origin);
    
    if (!isAllowed) {
        _logViolation('UNAUTHORIZED_ORIGIN', `Origin "${origin}" is not in allowed list`);
        return false;
    }
    
    if (state._strictMode) {
        if (!state._integrityPassed) {
            _logViolation('INTEGRITY_FAILURE', 'Integrity check failed in strict mode');
            return false;
        }
    }
    
    return true;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initialize the SecurityCybork module.
 * @param {Object} [options] - Configuration options.
 * @param {string[]} [options.allowedOrigins] - Additional allowed origins.
 * @param {boolean} [options.strictMode] - Enable strict security mode.
 * @param {boolean} [options.logViolations] - Log violations to console.
 * @param {boolean} [options.throwOnViolation] - Throw error on violation.
 * @param {boolean} [options.autoProtect] - Auto-protect critical functions.
 * @param {Object} [options.logger] - Logger instance.
 * @param {Object} [options.serializer] - Serializer instance.
 * @returns {Object} Security instance.
 */
export function initSecurity(options = {}) {
    if (state._initialized) {
        return getSecurityInstance();
    }
    
    state._instanceId = _generateInstanceId();
    state._initializationTime = Date.now();
    state._logger = options.logger || ConsoleUtils;
    state._serializer = options.serializer || SerializeUtils;
    
    // Compute initial integrity checksum
    const hashData = {
        version: version.VERSION || '1.0.0',
        name: NAME || 'Luxarion',
        vendor: VENDOR || 'Luxarion Labs',
        url: ENGINE_URL || 'https://luxarion.dev',
        timestamp: Date.now()
    };
    
    // Use sync hash for immediate availability
    state._integrityChecksum = _calculateHashSync(hashData);
    state._integrityPassed = true;
    state._lastIntegrityCheck = Date.now();
    
    // Merge allowed origins
    if (options.allowedOrigins) {
        for (const origin of options.allowedOrigins) {
            state._allowedOriginsSet.add(origin);
            state._allowedOrigins.push(origin);
        }
    }
    
    // Apply options
    if (options.strictMode !== undefined) {
        state._strictMode = options.strictMode;
    }
    if (options.logViolations !== undefined) {
        state._logViolations = options.logViolations;
    }
    if (options.throwOnViolation !== undefined) {
        state._throwOnViolation = options.throwOnViolation;
    }
    
    state._initialized = true;
    
    // Auto-protect critical functions if requested
    if (options.autoProtect !== false) {
        _autoProtectCriticalFunctions().catch(e => {
            const logger = state._logger || ConsoleUtils;
            logger.warn('[SecurityCybork] Auto-protection error:', e.message);
        });
    }
    
    return getSecurityInstance();
}

/**
 * Get the current security instance.
 * @returns {Object} Security instance with all methods.
 */
export function getSecurityInstance() {
    if (!state._initialized) {
        throw new Error('[SecurityCybork] Module not initialized. Call initSecurity() first.');
    }
    
    return {
        isAuthorized,
        guard,
        sealObject,
        isSealed,
        checkIntegrity,
        obfuscate,
        deobfuscate,
        getInstanceId,
        getStatus,
        verifyEnvironment,
        protectFunction,
        unprotectFunction,
        getViolationLog,
        clearViolationLog,
        addAllowedOrigin,
        removeAllowedOrigin,
        getSecurityFeatures
    };
}

/**
 * Check if the current environment is authorized.
 * @returns {boolean} True if authorized.
 */
export function isAuthorized() {
    return _isAuthorized();
}

/**
 * Guard a function with security checks.
 * @param {Function} func - Function to guard.
 * @param {Object} [context] - Context for the function.
 * @returns {Function} Guarded function.
 * @throws {Error} If func is not a function.
 */
export function guard(func, context = null) {
    return _guard(func, context);
}

/**
 * Seal an object to prevent modification.
 * @param {Object} obj - Object to seal.
 * @returns {Object} Sealed object.
 */
export function sealObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    
    if (state._sealedObjects.has(obj)) {
        return obj;
    }
    
    if (!_isAuthorized()) {
        _logViolation('UNAUTHORIZED_SEAL', 'Unauthorized attempt to seal object');
        return obj;
    }
    
    try {
        Object.preventExtensions(obj);
        Object.seal(obj);
        state._sealedObjects.add(obj);
        
        // Recursively seal nested objects
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (value && typeof value === 'object' && 
                !Array.isArray(value) && 
                !(value instanceof Date) && 
                !(value instanceof RegExp)) {
                sealObject(value);
            }
        }
        
        return obj;
    } catch (e) {
        const logger = state._logger || ConsoleUtils;
        logger.warn('[SecurityCybork] Failed to seal object:', e);
        return obj;
    }
}

/**
 * Check if an object is sealed.
 * @param {Object} obj - Object to check.
 * @returns {boolean} True if sealed.
 */
export function isSealed(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return state._sealedObjects.has(obj) || Object.isSealed(obj);
}

/**
 * Check the integrity of the module.
 * @returns {Promise<boolean>} True if integrity is verified.
 */
export async function checkIntegrity() {
    if (!state._initialized) {
        return false;
    }
    
    const hashData = {
        version: version.VERSION || '1.0.0',
        name: NAME || 'Luxarion',
        vendor: VENDOR || 'Luxarion Labs',
        url: ENGINE_URL || 'https://luxarion.dev'
    };
    
    const currentHash = await _calculateHash(hashData);
    state._integrityPassed = currentHash === state._integrityChecksum;
    state._lastIntegrityCheck = Date.now();
    
    if (!state._integrityPassed && state._strictMode) {
        _logViolation('INTEGRITY_FAILURE', 'Integrity check failed');
    }
    
    return state._integrityPassed;
}

/**
 * Obfuscate a string using simple XOR and base64.
 * @param {string} str - String to obfuscate.
 * @returns {string} Obfuscated string.
 */
export function obfuscate(str) {
    if (typeof str !== 'string') return str;
    
    try {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            result += String.fromCharCode(charCode ^ 0x55);
        }
        return btoa(result);
    } catch (e) {
        const logger = state._logger || ConsoleUtils;
        logger.warn('[SecurityCybork] Obfuscation failed:', e.message);
        return str;
    }
}

/**
 * Deobfuscate a string.
 * @param {string} encoded - Obfuscated string.
 * @returns {string} Original string.
 */
export function deobfuscate(encoded) {
    if (typeof encoded !== 'string') return encoded;
    
    try {
        const decoded = atob(encoded);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i);
            result += String.fromCharCode(charCode ^ 0x55);
        }
        return result;
    } catch (e) {
        const logger = state._logger || ConsoleUtils;
        logger.warn('[SecurityCybork] Deobfuscation failed:', e.message);
        return encoded;
    }
}

/**
 * Get the instance ID.
 * @returns {string} Instance ID.
 */
export function getInstanceId() {
    if (!state._instanceId) {
        state._instanceId = _generateInstanceId();
    }
    return state._instanceId;
}

/**
 * Get security status.
 * @returns {Object} Status object.
 */
export function getStatus() {
    return {
        initialized: state._initialized,
        authorized: _isAuthorized(),
        integrity: state._integrityPassed,
        instanceId: state._instanceId,
        strictMode: state._strictMode,
        allowedOrigins: [...state._allowedOrigins],
        guardedCount: state._guardedFunctions.size,
        sealedCount: state._sealedObjects.size,
        violationCount: state._violationLog.length,
        initializationTime: state._initializationTime,
        lastIntegrityCheck: state._lastIntegrityCheck,
        integrityPassed: state._integrityPassed,
        version: SECURITY_VERSION || '1.0.0',
        features: { ...SECURITY_FEATURES }
    };
}

/**
 * Verify the environment.
 * @returns {Object} Verification result.
 */
export function verifyEnvironment() {
    const origin = _getOrigin();
    const allowed = _isAllowedOrigin(origin);
    
    return {
        origin: origin,
        allowed: allowed,
        integrity: state._integrityPassed,
        isSecure: allowed && state._integrityPassed,
        timestamp: Date.now(),
        version: version.VERSION || '1.0.0',
        name: NAME || 'Luxarion',
        vendor: VENDOR || 'Luxarion Labs',
        url: ENGINE_URL || 'https://luxarion.dev',
        instanceId: state._instanceId,
        strictMode: state._strictMode
    };
}

/**
 * Protect a function (alias for guard).
 * @param {Function} func - Function to protect.
 * @param {Object} [context] - Context for the function.
 * @returns {Function} Protected function.
 */
export function protectFunction(func, context = null) {
    return guard(func, context);
}

/**
 * Unprotect a function (remove guard).
 * @param {Function} func - Function to unprotect.
 * @returns {Function} Original function.
 */
export function unprotectFunction(func) {
    if (!func) return func;
    
    for (const [original, guarded] of state._guardedFunctions) {
        if (guarded === func) {
            state._guardedFunctions.delete(original);
            state._guardedFunctions.delete(guarded);
            return original;
        }
    }
    
    if (state._guardedFunctions.has(func)) {
        const original = state._guardedFunctions.get(func);
        state._guardedFunctions.delete(func);
        return original;
    }
    
    return func;
}

/**
 * Get violation log.
 * @returns {Array} Violation log.
 */
export function getViolationLog() {
    return [...state._violationLog];
}

/**
 * Clear violation log.
 */
export function clearViolationLog() {
    state._violationLog = [];
}

/**
 * Add allowed origin.
 * @param {string} origin - Origin to add.
 */
export function addAllowedOrigin(origin) {
    if (!state._allowedOriginsSet.has(origin)) {
        state._allowedOriginsSet.add(origin);
        state._allowedOrigins.push(origin);
    }
}

/**
 * Remove allowed origin.
 * @param {string} origin - Origin to remove.
 */
export function removeAllowedOrigin(origin) {
    state._allowedOriginsSet.delete(origin);
    const index = state._allowedOrigins.indexOf(origin);
    if (index !== -1) {
        state._allowedOrigins.splice(index, 1);
    }
}

/**
 * Get security features.
 * @returns {Object} Security features.
 */
export function getSecurityFeatures() {
    return {
        originCheck: SECURITY_FEATURES ? SECURITY_FEATURES.ORIGIN_CHECK : true,
        integrityCheck: SECURITY_FEATURES ? SECURITY_FEATURES.INTEGRITY_CHECK : true,
        functionGuard: SECURITY_FEATURES ? SECURITY_FEATURES.FUNCTION_GUARD : true,
        objectSealing: SECURITY_FEATURES ? SECURITY_FEATURES.OBJECT_SEALING : true,
        obfuscation: SECURITY_FEATURES ? SECURITY_FEATURES.OBFUSCATION : true
    };
}

/**
 * Initialize the security module automatically when imported.
 * Uses a fallback if auto-init fails.
 */
try {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
        initSecurity({
            autoProtect: true
        });
    }
} catch (e) {
    // Silently fail auto-init in non-critical environments
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('[SecurityCybork] Auto-init failed:', e.message);
    }
}

/**
 * Default export for convenience.
 */
export default {
    initSecurity,
    getSecurityInstance,
    isAuthorized,
    guard,
    sealObject,
    isSealed,
    checkIntegrity,
    obfuscate,
    deobfuscate,
    getInstanceId,
    getStatus,
    verifyEnvironment,
    protectFunction,
    unprotectFunction,
    getViolationLog,
    clearViolationLog,
    addAllowedOrigin,
    removeAllowedOrigin,
    getSecurityFeatures
};
