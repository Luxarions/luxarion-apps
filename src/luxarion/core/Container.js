/**
 * Dependency Injection (DI) Container for Luxarion Engine.
 * Supports singletons, factories, transient instances, child containers,
 * and circular dependency detection.
 * 
 * @module Container
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { ServiceLifetime, LuxarionError } from './Types.js';

export const SERVICE_TYPES = ServiceLifetime;

export class Container {
    #services = new Map();
    #instances = new Map();
    #factories = new Map();
    #singletons = new Map();
    #aliases = new Map();
    #resolving = new Set();
    #parent = null;
    #id = `container_${Math.random().toString(36).substr(2, 9)}`;

    constructor(parent = null) {
        this.#parent = parent;
    }

    get id() {
        return this.#id;
    }

    get parent() {
        return this.#parent;
    }

    getParent() {
        return this.#parent;
    }

    /**
     * Register a service factory or constructor.
     * @param {string} name 
     * @param {Function|any} factory 
     * @param {string|object} lifetime - 'singleton' | 'factory' | 'transient' or { type }
     */
    register(name, factory, lifetime = ServiceLifetime.SINGLETON) {
        if (!name || typeof name !== 'string') {
            throw new LuxarionError('Service name must be a non-empty string', 'INVALID_SERVICE_NAME');
        }
        
        if (typeof factory !== 'function') {
            return this.registerInstance(name, factory);
        }

        const resolvedLifetime = typeof lifetime === 'object' && lifetime !== null ? (lifetime.type || ServiceLifetime.SINGLETON) : lifetime;

        this.#services.set(name, {
            factory,
            lifetime: resolvedLifetime
        });
        return this;
    }

    /**
     * Register a singleton instance or factory.
     */
    registerSingleton(name, factory) {
        return this.register(name, factory, ServiceLifetime.SINGLETON);
    }

    singleton(name, factory, options) {
        return this.register(name, factory, options?.type || ServiceLifetime.SINGLETON);
    }

    /**
     * Register a factory function called on every resolve.
     */
    registerFactory(name, factory) {
        return this.register(name, factory, ServiceLifetime.FACTORY);
    }

    factory(name, factoryFunc, options) {
        return this.register(name, factoryFunc, options?.type || ServiceLifetime.FACTORY);
    }

    /**
     * Register a direct object/value instance.
     */
    registerInstance(name, instance) {
        if (!name || typeof name !== 'string') {
            throw new LuxarionError('Service name must be a non-empty string', 'INVALID_SERVICE_NAME');
        }
        this.#instances.set(name, instance);
        this.#services.set(name, {
            factory: () => instance,
            lifetime: ServiceLifetime.SINGLETON
        });
        return this;
    }

    clear() {
        this.#services.clear();
        this.#instances.clear();
        this.#aliases.clear();
        this.#resolving.clear();
    }

    /**
     * Alias one service name to another.
     */
    alias(aliasName, targetName) {
        this.#aliases.set(aliasName, targetName);
        return this;
    }

    /**
     * Resolve a service by name.
     */
    get(name) {
        return this.resolve(name);
    }

    /**
     * Resolve a service by name.
     */
    resolve(name) {
        // Resolve alias if present
        let target = name;
        while (this.#aliases.has(target)) {
            target = this.#aliases.get(target);
        }

        // Circular dependency check
        if (this.#resolving.has(target)) {
            const chain = Array.from(this.#resolving).concat(target).join(' -> ');
            throw new LuxarionError(`Circular dependency detected: ${chain}`, 'CIRCULAR_DEPENDENCY');
        }

        // Check local instances first (registered directly or already created singleton)
        if (this.#instances.has(target)) {
            return this.#instances.get(target);
        }

        const serviceDef = this.#services.get(target);

        if (!serviceDef) {
            // Try parent container if available
            if (this.#parent) {
                return this.#parent.resolve(target);
            }
            throw new LuxarionError(`Service '${target}' not found in container`, 'SERVICE_NOT_FOUND');
        }

        // Resolve service
        this.#resolving.add(target);
        try {
            const { factory, lifetime } = serviceDef;
            let result;

            // Handle class constructors vs functions
            if (this.#isConstructor(factory)) {
                result = new factory(this);
            } else {
                result = factory(this);
            }

            if (lifetime === ServiceLifetime.SINGLETON) {
                this.#instances.set(target, result);
            }

            return result;
        } finally {
            this.#resolving.delete(target);
        }
    }

    /**
     * Check if service is registered.
     */
    has(name) {
        let target = name;
        while (this.#aliases.has(target)) {
            target = this.#aliases.get(target);
        }
        return this.#services.has(target) || this.#instances.has(target) || (this.#parent ? this.#parent.has(target) : false);
    }

    /**
     * Unregister a service.
     */
    unregister(name) {
        this.#services.delete(name);
        this.#instances.delete(name);
        this.#aliases.delete(name);
        return this;
    }

    /**
     * Create child container inheriting services.
     */
    createChild() {
        return new Container(this);
    }

    /**
     * List all registered service keys.
     */
    listServices() {
        const local = Array.from(this.#services.keys());
        const parentList = this.#parent ? this.#parent.listServices() : [];
        return Array.from(new Set([...local, ...parentList]));
    }

    #isConstructor(func) {
        try {
            Reflect.construct(String, [], func);
            return true;
        } catch {
            return false;
        }
    }
}

export default Container;
