/**
 * Utilities entry point for Luxarion Engine.
 * Re-exports all utility functions from individual modules with proper dependency resolution.
 * 
 * @module utils
 * @author Luxarion Labs
 * @version 1.0.0
 */

// Import all utility modules
import * as ArrayUtils from './ArrayUtils.js';
import * as ConsoleUtils from './ConsoleUtils.js';
import * as AsyncUtils from './AsyncUtils.js';
import * as SerializeUtils from './SerializeUtils.js';
import * as TypeUtils from './TypeUtils.js';
import * as ErrorUtils from './ErrorUtils.js';
import * as MatrixUtils from './MatrixUtils.js';
import * as DOMUtils from './DOMUtils.js';
import * as SecurityCybork from './SecurityCybork.js';

// Re-export all modules
export {
    ArrayUtils,
    ConsoleUtils,
    AsyncUtils,
    SerializeUtils,
    TypeUtils,
    ErrorUtils,
    MatrixUtils,
    DOMUtils,
    SecurityCybork
};

/**
 * Utility modules grouped by category.
 */
export const Utils = {
    array: ArrayUtils,
    console: ConsoleUtils,
    async: AsyncUtils,
    serialize: SerializeUtils,
    type: TypeUtils,
    error: ErrorUtils,
    matrix: MatrixUtils,
    dom: DOMUtils,
    security: SecurityCybork
};

/**
 * Create a utility instance with optional dependency injection.
 * @param {Object} [dependencies] - External dependencies to inject.
 * @returns {Object} Utility instance with all modules.
 */
export function createUtils(dependencies = {}) {
    return {
        array: { ...ArrayUtils },
        console: { ...ConsoleUtils },
        async: { ...AsyncUtils },
        serialize: { ...SerializeUtils },
        type: { ...TypeUtils },
        error: { ...ErrorUtils },
        matrix: { ...MatrixUtils },
        dom: { ...DOMUtils },
        security: dependencies.security ? 
            SecurityCybork.initSecurity(dependencies.security) : 
            SecurityCybork
    };
}

/**
 * Default export for convenience.
 */
export default {
    ArrayUtils,
    ConsoleUtils,
    AsyncUtils,
    SerializeUtils,
    TypeUtils,
    ErrorUtils,
    MatrixUtils,
    DOMUtils,
    SecurityCybork,
    Utils,
    createUtils
};
