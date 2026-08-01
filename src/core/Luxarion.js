/**
 * Luxarion Engine main entry point.
 * Aggregates all core modules and provides a global container for services.
 * 
 * @module Luxarion
 * @author Luxarion Labs
 * @version 1.0.0
 */

import * as ConstantsModule from './Constants.js';
import * as VersionModule from './Version.js';
import * as TypesModule from './Types.js';
import Container, { SERVICE_TYPES } from './Container.js';
import * as UtilsModule from '../utils/index.js';

/**
 * Main Luxarion Engine class.
 * Manages the engine lifecycle and provides access to all services.
 */
export class LuxarionEngine {
    /**
     * Private fields for internal state.
     */
    #container = null;
    #initialized = false;
    #version = null;
    #constants = null;

    /**
     * Create a new Luxarion Engine instance.
     * @param {Object} [options] - Engine configuration.
     * @param {Object} [options.container] - Custom DI container.
     * @param {Object} [options.security] - Security module options.
     * @param {Object} [options.logger] - Logger configuration.
     * @param {boolean} [options.autoInit=true] - Automatically initialize.
     */
    constructor(options = {}) {
        this.#version = VersionModule.default || VersionModule;
        this.#constants = ConstantsModule.default || ConstantsModule;

        // Initialize container
        this.#container = options.container || new Container();
        this.#setupContainer(options);
        this.#setupUtils();

        // Auto-initialize if requested
        if (options.autoInit !== false) {
            this.init(options);
        }
    }

    /**
     * Set up the DI container with core services.
     * @private
     * @param {Object} options - Configuration options.
     */
    #setupContainer(options) {
        const container = this.#container;

        // Register core modules
        container.singleton('constants', ConstantsModule);
        container.singleton('version', VersionModule);
        container.singleton('types', TypesModule);
        container.singleton('engine', this);

        // Register security
        const securityOptions = options.security || {};
        container.singleton('security', (deps) => {
            const security = UtilsModule.SecurityCybork;
            return security.initSecurity({
                autoProtect: true,
                ...securityOptions
            });
        });

        // Register logger
        container.singleton('logger', () => ({
            log: (...args) => console.log('[Luxarion]', ...args),
            warn: (...args) => console.warn('[Luxarion]', ...args),
            error: (...args) => console.error('[Luxarion]', ...args),
            debug: (...args) => {
                if (options.debug) console.debug('[Luxarion]', ...args);
            }
        }));

        // Register error handler
        container.singleton('errorHandler', (deps) => {
            const logger = deps.logger;
            return {
                handle: (error, context = {}) => {
                    logger.error('Error occurred:', error.message, context);
                    if (options.onError) {
                        options.onError(error, context);
                    }
                    throw error;
                }
            };
        });
    }

    /**
     * Set up utility modules in the container.
     * @private
     */
    #setupUtils() {
        const container = this.#container;

        // Register each utility module
        const utilModules = {
            array: UtilsModule.ArrayUtils,
            console: UtilsModule.ConsoleUtils,
            async: UtilsModule.AsyncUtils,
            serialize: UtilsModule.SerializeUtils,
            type: UtilsModule.TypeUtils,
            error: UtilsModule.ErrorUtils,
            matrix: UtilsModule.MatrixUtils,
            dom: UtilsModule.DOMUtils,
            security: () => container.get('security')
        };

        for (const [name, module] of Object.entries(utilModules)) {
            container.singleton(`util.${name}`, module);
        }

        // Register utils namespace
        container.singleton('utils', () => {
            const result = {};
            for (const name of Object.keys(utilModules)) {
                result[name] = container.get(`util.${name}`);
            }
            return result;
        });
    }

    /**
     * Initialize the engine.
     * @param {Object} [options] - Initialization options.
     * @returns {this} For chaining.
     */
    init(options = {}) {
        if (this.#initialized) {
            return this;
        }

        const container = this.#container;
        
        // Initialize security
        try {
            const security = container.get('security');
            if (security && typeof security.isAuthorized === 'function') {
                const authorized = security.isAuthorized();
                if (!authorized && options.strict !== false) {
                    throw new Error('Security authorization failed');
                }
            }
        } catch (error) {
            const errorHandler = container.get('errorHandler');
            errorHandler.handle(error, { context: 'security' });
        }

        // Mark as initialized
        this.#initialized = true;
        
        // Log initialization
        const logger = container.get('logger');
        logger.log(`Luxarion Engine v${this.#version.VERSION} initialized`);

        return this;
    }

    /**
     * Get a service from the container.
     * @param {string} name - Service name.
     * @returns {*} Service instance.
     * @throws {Error} If service not found.
     */
    get(name) {
        return this.#container.get(name);
    }

    /**
     * Check if a service exists.
     * @param {string} name - Service name.
     * @returns {boolean} True if service exists.
     */
    has(name) {
        return this.#container.has(name);
    }

    /**
     * Register a service with the container.
     * @param {string} name - Service name.
     * @param {*} definition - Service definition.
     * @param {Object} [options] - Registration options.
     * @returns {this} For chaining.
     */
    register(name, definition, options = {}) {
        this.#container.register(name, definition, options);
        return this;
    }

    /**
     * Register a singleton service.
     * @param {string} name - Service name.
     * @param {*} definition - Service definition.
     * @param {Object} [options] - Additional options.
     * @returns {this} For chaining.
     */
    singleton(name, definition, options = {}) {
        this.#container.singleton(name, definition, options);
        return this;
    }

    /**
     * Register a factory service.
     * @param {string} name - Service name.
     * @param {Function} factory - Factory function.
     * @param {Object} [options] - Additional options.
     * @returns {this} For chaining.
     */
    factory(name, factory, options = {}) {
        this.#container.factory(name, factory, options);
        return this;
    }

    /**
     * Get the DI container.
     * @returns {Container} The container instance.
     */
    getContainer() {
        return this.#container;
    }

    /**
     * Get engine version information.
     * @returns {Object} Version information.
     */
    getVersion() {
        return this.#version;
    }

    /**
     * Get engine constants.
     * @returns {Object} Constants module.
     */
    getConstants() {
        return this.#constants;
    }

    /**
     * Check if the engine is initialized.
     * @returns {boolean} True if initialized.
     */
    isInitialized() {
        return this.#initialized;
    }

    /**
     * Dispose the engine and clean up resources.
     */
    dispose() {
        if (!this.#initialized) {
            return;
        }

        // Clean up security
        try {
            const security = this.#container.get('security');
            if (security && typeof security.clearViolationLog === 'function') {
                security.clearViolationLog();
            }
        } catch (error) {
            // Ignore errors during cleanup
        }

        // Clear container
        this.#container.clear();
        this.#initialized = false;

        const logger = this.#container.get('logger');
        if (logger) {
            logger.log('Luxarion Engine disposed');
        }
    }

    /**
     * Create a child engine instance.
     * @param {Object} [options] - Child configuration.
     * @returns {LuxarionEngine} Child engine instance.
     */
    createChild(options = {}) {
        const childContainer = this.#container.createChild();
        const childOptions = {
            ...options,
            container: childContainer,
            autoInit: true
        };
        return new LuxarionEngine(childOptions);
    }

    /**
     * Static factory method to create an engine instance.
     * @param {Object} [options] - Engine configuration.
     * @returns {LuxarionEngine} Engine instance.
     */
    static create(options = {}) {
        return new LuxarionEngine(options);
    }

    /**
     * Static method to get the default engine instance.
     * @returns {LuxarionEngine} Default engine instance.
     */
    static getDefault() {
        if (!LuxarionEngine.#defaultInstance) {
            LuxarionEngine.#defaultInstance = new LuxarionEngine();
        }
        return LuxarionEngine.#defaultInstance;
    }

    /**
     * Static default instance.
     * @private
     * @type {LuxarionEngine|null}
     */
    static #defaultInstance = null;
}

/**
 * Default export - the Luxarion engine.
 */
const Luxarion = LuxarionEngine.create();

/**
 * Export all modules and the engine instance.
 */
export {
    Luxarion,
    ConstantsModule,
    VersionModule,
    TypesModule,
    Container,
    SERVICE_TYPES,
    UtilsModule
};

/**
 * Default export for convenience.
 */
export default Luxarion;
