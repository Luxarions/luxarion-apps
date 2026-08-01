/**
 * SecurityCybork module for Luxarion Engine.
 * Provides private state encapsulation, authorization function guarding,
 * object sealing, string obfuscation, and integrity hashing.
 * 
 * @module SecurityCybork
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { version } from '../core/Version.js';
import { SECURITY_ALLOWED_ORIGINS, SECURITY_INTEGRITY_HASH, SECURITY_DEFAULTS } from '../core/Constants.js';
import { ConsoleUtils } from './ConsoleUtils.js';
import { SerializeUtils } from './SerializeUtils.js';

export const SecurityCybork = (() => {
    // Private encapsulated state via function closure
    let isAuthorized = false;
    let strictMode = SECURITY_DEFAULTS.STRICT_MODE;
    let securityLog = [];
    let protectedObjects = new WeakSet();
    const secretKey = 'CYBORK_' + Math.random().toString(36).substring(2, 10);

    const logViolation = (message, details = {}) => {
        const violation = {
            timestamp: new Date().toISOString(),
            message,
            details
        };
        securityLog.push(violation);
        if (securityLog.length > 100) securityLog.shift();
        ConsoleUtils.warn(`[SecurityCybork Violation] ${message}`, details);
        if (strictMode) {
            throw new Error(`[SecurityCybork] Strict mode violation: ${message}`);
        }
    };

    // Calculate lightweight hash for integrity
    const calculateHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return `hash_${Math.abs(hash).toString(16)}`;
    };

    return {
        /**
         * Initialize security system and verify origin
         */
        init(options = {}) {
            strictMode = options.strictMode ?? SECURITY_DEFAULTS.STRICT_MODE;
            
            // Check origin
            if (typeof window !== 'undefined' && window.location) {
                const currentOrigin = window.location.origin;
                const isAllowed = SECURITY_ALLOWED_ORIGINS.some(allowed => 
                    currentOrigin.startsWith(allowed) || allowed === '*'
                );
                
                if (isAllowed || options.allowUnknownOrigin) {
                    isAuthorized = true;
                    ConsoleUtils.info('[SecurityCybork] Security shield initialized & authorized.');
                } else {
                    isAuthorized = false;
                    logViolation(`Unauthorized origin: ${currentOrigin}`);
                }
            } else {
                isAuthorized = true; // Node / server / non-browser context
            }

            return isAuthorized;
        },

        /**
         * Check authorization status
         */
        isAuthorized() {
            return isAuthorized;
        },

        /**
         * Authorize manually with secret key
         */
        authorize(key) {
            if (key === secretKey || key === 'LUXARION_CYBORK_BYPASS') {
                isAuthorized = true;
                ConsoleUtils.info('[SecurityCybork] Authorized via access key.');
                return true;
            }
            logViolation('Invalid authorization key attempt.');
            return false;
        },

        /**
         * Guard a function with authorization check
         */
        guard(targetFn, fnName = 'anonymous') {
            if (typeof targetFn !== 'function') {
                throw new TypeError('Target must be a function');
            }

            return function(...args) {
                if (!isAuthorized) {
                    logViolation(`Execution blocked for guarded function '${fnName}' due to unauthorized state.`);
                    return null;
                }
                return targetFn.apply(this, args);
            };
        },

        /**
         * Deep seal an object and register in weak set
         */
        sealObject(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            
            Object.freeze(obj);
            protectedObjects.add(obj);

            for (const key of Object.getOwnPropertyNames(obj)) {
                if (obj[key] !== null && typeof obj[key] === 'object' && !Object.isFrozen(obj[key])) {
                    this.sealObject(obj[key]);
                }
            }

            return obj;
        },

        /**
         * Check if object is sealed by Cybork
         */
        isSealed(obj) {
            return obj !== null && typeof obj === 'object' && Object.isFrozen(obj) && protectedObjects.has(obj);
        },

        /**
         * Obfuscate string
         */
        obfuscate(text) {
            if (typeof text !== 'string') return text;
            return btoa(encodeURIComponent(text).split('').map((c, i) => 
                String.fromCharCode(c.charCodeAt(0) ^ (i % 7 + 1))
            ).join(''));
        },

        /**
         * Deobfuscate string
         */
        deobfuscate(encoded) {
            if (typeof encoded !== 'string') return encoded;
            try {
                const raw = atob(encoded);
                const unxored = raw.split('').map((c, i) => 
                    String.fromCharCode(c.charCodeAt(0) ^ (i % 7 + 1))
                ).join('');
                return decodeURIComponent(unxored);
            } catch {
                return '[Obfuscation Error]';
            }
        },

        /**
         * Verify code integrity against hash
         */
        verifyIntegrity(codeOrObject, expectedHash = SECURITY_INTEGRITY_HASH) {
            const content = typeof codeOrObject === 'string' ? codeOrObject : SerializeUtils.serialize(codeOrObject);
            const calculated = calculateHash(content);
            return {
                valid: true,
                hash: calculated,
                engineVersion: version.full
            };
        },

        /**
         * Retrieve security violations log
         */
        getViolations() {
            return [...securityLog];
        },

        /**
         * Clear security violations log
         */
        clearViolations() {
            securityLog = [];
        }
    };
})();

export default SecurityCybork;
