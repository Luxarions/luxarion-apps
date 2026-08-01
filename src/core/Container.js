/**
 * Dependency Injection Container for Luxarion Engine.
 * Provides a simple but powerful DI container for managing service lifetimes.
 * 
 * @module Container
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * Service definition types.
 * @enum {string}
 */
const ServiceType = {
    SINGLETON: 'singleton',
    FACTORY: 'factory',
    TRANSIENT: 'transient'
};

/**
 * Dependency Injection Container class.
 * Manages service registration, resolution, and lifecycle.
 */
export class Container {
    /**
     * Private fields for internal state.
     */
    #services = new Map();
    #instances = new Map();
    #factories = new Map();
    #singletons = new Map();
    #resolving = new Set();
    #parent = null;

    /**
     * Create a new Container instance.
     * @param {Container} [parent] - Optional parent container for hierarchy.
     */
    constructor(parent = null) {
        this.#parent = parent;
    }

    /**
     * Register a service with the container.
     * @param {string} name - Service name/identifier.
     * @param {*} definition - Service definition (class, factory function, or instance).
     * @param {Object} [options] - Registration options.
     * @param {string} [options.type='transient'] - Service type (singleton, factory, transient).
     * @param {Array<string>} [options.dependencies=[]] - Dependencies to inject.
     * @param {boolean} [options.autoResolve=true] - Automatically resolve dependencies.
     * @returns {this} For chaining.
     * @throws {Error} If service already registered.
     */
    register(name, definition, options = {}) {
        if (this.#services.has(name)) {
            throw new Error(`Service "${name}" is already registered`);
        }

        const serviceType = options.type || ServiceType.TRANSIENT;
        const dependencies = options.dependencies || [];
        const autoResolve = options.autoResolve !== false;

        this.#services.set(name, {
            name,
            definition,
            type: serviceType,
            dependencies,
            autoResolve,
            resolved: false,
            instance: null
        });

        return this;
    }

    /**
     * Register a singleton service (single instance).
     * @param {string} name - Service name.
     * @param {*} definition - Service definition.
     * @param {Object} [options] - Additional options.
     * @returns {this} For chaining.
     */
    singleton(name, definition, options = {}) {
        return this.register(name, definition, { ...options, type: ServiceType.SINGLETON });
    }

    /**
     * Register a factory service (creates new instance each time).
     * @param {string} name - Service name.
     * @param {Function} factory - Factory function that returns the service.
     * @param {Object} [options] - Additional options.
     * @returns {this} For chaining.
     */
    factory(name, factory, options = {}) {
        return this.register(name, factory, { ...options, type: ServiceType.FACTORY });
    }

    /**
     * Register a transient service (new instance each time).
     * @param {string} name - Service name.
     * @param {*} definition - Service definition.
     * @param {Object} [options] - Additional options.
     * @returns {this} For chaining.
     */
    transient(name, definition, options = {}) {
        return this.register(name, definition, { ...options, type: ServiceType.TRANSIENT });
    }

    /**
     * Register a service alias.
     * @param {string} alias - Alias name.
     * @param {string} target - Target service name.
     * @returns {this} For chaining.
     * @throws {Error} If target service doesn't exist.
     */
    alias(alias, target) {
        if (!this.#services.has(target) && !this.#parent?.has(target)) {
            throw new Error(`Target service "${target}" not found for alias "${alias}"`);
        }
        this.#services.set(alias, {
            name: alias,
            definition: target,
            type: 'alias',
            dependencies: [],
            autoResolve: true,
            resolved: false,
            instance: null,
            isAlias: true,
            target
        });
        return this;
    }

    /**
     * Check if a service is registered.
     * @param {string} name - Service name.
     * @returns {boolean} True if service exists.
     */
    has(name) {
        if (this.#services.has(name)) return true;
        if (this.#parent) return this.#parent.has(name);
        return false;
    }

    /**
     * Get a service instance.
     * @param {string} name - Service name.
     * @param {Object} [context] - Context for factory functions.
     * @returns {*} Service instance.
     * @throws {Error} If service not found or circular dependency detected.
     */
    get(name, context = null) {
        // Check if currently resolving (circular dependency)
        if (this.#resolving.has(name)) {
            throw new Error(`Circular dependency detected for service "${name}"`);
        }

        // Check local services
        if (this.#services.has(name)) {
            return this.#resolveService(name, context);
        }

        // Check parent container
        if (this.#parent) {
            return this.#parent.get(name, context);
        }

        throw new Error(`Service "${name}" not found`);
    }

    /**
     * Resolve a service from the container.
     * @private
     * @param {string} name - Service name.
     * @param {Object} [context] - Context for factory functions.
     * @returns {*} Resolved service instance.
     */
    #resolveService(name, context = null) {
        const service = this.#services.get(name);
        
        // Handle alias
        if (service.isAlias) {
            return this.get(service.target, context);
        }

        // Handle singleton
        if (service.type === ServiceType.SINGLETON) {
            if (this.#singletons.has(name)) {
                return this.#singletons.get(name);
            }
            
            this.#resolving.add(name);
            try {
                const instance = this.#createInstance(service, context);
                this.#singletons.set(name, instance);
                return instance;
            } finally {
                this.#resolving.delete(name);
            }
        }

        // Handle factory
        if (service.type === ServiceType.FACTORY) {
            this.#resolving.add(name);
            try {
                return this.#createInstance(service, context);
            } finally {
                this.#resolving.delete(name);
            }
        }

        // Handle transient
        this.#resolving.add(name);
        try {
            return this.#createInstance(service, context);
        } finally {
            this.#resolving.delete(name);
        }
    }

    /**
     * Create an instance of a service.
     * @private
     * @param {Object} service - Service definition.
     * @param {Object} [context] - Context for factory functions.
     * @returns {*} Created instance.
     */
    #createInstance(service, context = null) {
        const { definition, dependencies, autoResolve } = service;

        // If it's a factory function
        if (service.type === ServiceType.FACTORY || typeof definition === 'function') {
            const deps = autoResolve ? this.#resolveDependencies(dependencies) : {};
            return definition(deps, this, context);
        }

        // If it's a class constructor
        if (typeof definition === 'function' && definition.prototype) {
            const deps = autoResolve ? this.#resolveDependencies(dependencies) : [];
            return new definition(...deps);
        }

        // If it's a plain value or object
        return definition;
    }

    /**
     * Resolve dependencies for a service.
     * @private
     * @param {Array<string>} dependencies - Dependency names.
     * @returns {Object|Array} Resolved dependencies.
     */
    #resolveDependencies(dependencies) {
        if (!dependencies || dependencies.length === 0) {
            return {};
        }

        // Check if dependencies are named or positional
        const isNamed = dependencies.some(d => typeof d === 'object');
        
        if (isNamed) {
            const result = {};
            for (const dep of dependencies) {
                if (typeof dep === 'object') {
                    for (const [key, name] of Object.entries(dep)) {
                        result[key] = this.get(name);
                    }
                } else {
                    result[dep] = this.get(dep);
                }
            }
            return result;
        }

        // Positional dependencies
        return dependencies.map(name => this.get(name));
    }

    /**
     * Get all registered service names.
     * @returns {Array<string>} Array of service names.
     */
    listServices() {
        const names = Array.from(this.#services.keys());
        if (this.#parent) {
            return [...names, ...this.#parent.listServices()];
        }
        return names;
    }

    /**
     * Get service registration info.
     * @param {string} name - Service name.
     * @returns {Object|null} Service info or null if not found.
     */
    getServiceInfo(name) {
        if (this.#services.has(name)) {
            const service = this.#services.get(name);
            return {
                name: service.name,
                type: service.type,
                dependencies: service.dependencies,
                isAlias: service.isAlias || false,
                target: service.target || null,
                resolved: service.resolved
            };
        }
        if (this.#parent) {
            return this.#parent.getServiceInfo(name);
        }
        return null;
    }

    /**
     * Remove a service from the container.
     * @param {string} name - Service name.
     * @returns {boolean} True if removed.
     */
    remove(name) {
        if (this.#services.has(name)) {
            this.#services.delete(name);
            this.#singletons.delete(name);
            return true;
        }
        return false;
    }

    /**
     * Clear all services from the container.
     */
    clear() {
        this.#services.clear();
        this.#singletons.clear();
        this.#instances.clear();
        this.#factories.clear();
        this.#resolving.clear();
    }

    /**
     * Create a child container that inherits from this one.
     * @returns {Container} Child container.
     */
    createChild() {
        return new Container(this);
    }

    /**
     * Get or create a service instance (cached).
     * @param {string} name - Service name.
     * @param {Function} factory - Factory function if service doesn't exist.
     * @param {Object} [options] - Options for registration.
     * @returns {*} Service instance.
     */
    getOrCreate(name, factory, options = {}) {
        if (this.has(name)) {
            return this.get(name);
        }
        this.register(name, factory, { ...options, type: ServiceType.SINGLETON });
        return this.get(name);
    }

    /**
     * Check if a service is a singleton.
     * @param {string} name - Service name.
     * @returns {boolean} True if singleton.
     */
    isSingleton(name) {
        if (this.#services.has(name)) {
            return this.#services.get(name).type === ServiceType.SINGLETON;
        }
        if (this.#parent) {
            return this.#parent.isSingleton(name);
        }
        return false;
    }

    /**
     * Check if a service is a factory.
     * @param {string} name - Service name.
     * @returns {boolean} True if factory.
     */
    isFactory(name) {
        if (this.#services.has(name)) {
            return this.#services.get(name).type === ServiceType.FACTORY;
        }
        if (this.#parent) {
            return this.#parent.isFactory(name);
        }
        return false;
    }

    /**
     * Get the parent container.
     * @returns {Container|null} Parent container or null.
     */
    getParent() {
        return this.#parent;
    }

    /**
     * Set the parent container.
     * @param {Container} parent - Parent container.
     * @returns {this} For chaining.
     */
    setParent(parent) {
        this.#parent = parent;
        return this;
    }

    /**
     * Create a container with default services pre-registered.
     * @param {Object} [options] - Configuration options.
     * @returns {Container} Configured container.
     */
    static createDefault(options = {}) {
        const container = new Container();
        
        // Register core services
        container.singleton('container', container);
        
        // Register utilities
        container.factory('logger', () => {
            return console;
        });
        
        container.factory('errorHandler', (deps) => {
            return {
                handle: (error) => {
                    console.error('[Luxarion]', error);
                    if (options.onError) {
                        options.onError(error);
                    }
                }
            };
        });

        return container;
    }
}

/**
 * Service type constants for external use.
 */
export const SERVICE_TYPES = ServiceType;

/**
 * Default export for convenience.
 */
export default Container;
