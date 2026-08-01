/**
 * Luxarion Engine Facade.
 * Main entry point aggregating core container, constants, types, versioning,
 * security shield, and utility modules into a unified dependency injection architecture.
 * 
 * @module Luxarion
 * @author Luxarion Labs
 * @version 1.0.0
 */

import * as Constants from './Constants.js';
import version from './Version.js';
import * as Types from './Types.js';
import Container from './Container.js';
import * as UtilsModule from '../utils/index.js';

export class LuxarionEngine {
    #container;
    #initialized = false;

    constructor() {
        this.#container = new Container();
        this.#bootstrap();
    }

    #bootstrap() {
        // Register core singletons in DI container
        this.#container.registerInstance('constants', Constants);
        this.#container.registerInstance('version', version);
        this.#container.registerInstance('types', Types);
        this.#container.registerInstance('utils', UtilsModule);
        this.#container.registerInstance('security', UtilsModule.SecurityCybork);
        this.#container.registerInstance('logger', UtilsModule.ConsoleUtils);
        this.#container.registerInstance('engine', this);
    }

    get container() {
        return this.#container;
    }

    getContainer() {
        return this.#container;
    }

    get version() {
        return version;
    }

    getVersion() {
        return version;
    }

    get constants() {
        return Constants;
    }

    getConstants() {
        return Constants;
    }

    get types() {
        return Types;
    }

    getTypes() {
        return Types;
    }

    get utils() {
        return UtilsModule;
    }

    getUtils() {
        return UtilsModule;
    }

    get security() {
        return UtilsModule.SecurityCybork;
    }

    getSecurity() {
        return UtilsModule.SecurityCybork;
    }

    get logger() {
        return UtilsModule.ConsoleUtils;
    }

    getLogger() {
        return UtilsModule.ConsoleUtils;
    }

    get isInitialized() {
        return this.#initialized;
    }

    isInitialized() {
        return this.#initialized;
    }

    get(name) {
        return this.#container.resolve(name);
    }

    has(name) {
        return this.#container.has(name);
    }

    register(name, definition, options) {
        if (typeof definition === 'function') {
            const lifetime = typeof options === 'string' ? options : (options?.type || 'singleton');
            this.#container.register(name, definition, lifetime);
        } else {
            this.#container.registerInstance(name, definition);
        }
        return this;
    }

    singleton(name, definition, options) {
        return this.register(name, definition, { ...options, type: 'singleton' });
    }

    factory(name, factory, options) {
        return this.register(name, factory, { ...options, type: 'factory' });
    }

    /**
     * Initialize engine & security
     */
    init(options = {}) {
        if (this.#initialized) {
            this.logger.warn('Luxarion Engine is already initialized');
            return this;
        }

        this.logger.info(`Initializing ${version.toString()}...`);
        this.security.init(options);
        this.#initialized = true;
        this.logger.info('Luxarion Engine initialized successfully.');
        return this;
    }

    /**
     * Create child container inheriting services
     */
    createChildContainer() {
        return this.#container.createChild();
    }

    /**
     * Dispose engine resources
     */
    dispose() {
        this.logger.info('Disposing Luxarion Engine...');
        this.#initialized = false;
        this.security.clearViolations();
    }
}

// Singleton default engine instance
export const Luxarion = new LuxarionEngine();
export default Luxarion;
