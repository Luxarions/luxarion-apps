import { EventDispatcher } from './EventDispatcher.js';
import { LIFECYCLE, HOOKS, ERRORS, DEFAULT, GITHUB } from './Constants.js';
import { isClass, isDisposable, isInitializable, createError, warn, warnOnce } from './Utils.js';

class LuxarionRegistry extends EventDispatcher {
    constructor() {
        super();
        this._registry = new Map();
        this._instances = new Map();
        this._singletons = new Map();
        this._factories = new Map();
        this._configs = new Map();
        this._middleware = new Map();
        this._hooks = new Map();
        this._modules = new Map();
        this._aliases = new Map();
        this._versions = new Map();
        this._lock = false;
        this._githubToken = null;
    }

    _validateName(name) {
        if (!name || typeof name !== 'string') {
            throw createError('Name must be a non-empty string', ERRORS.INVALID_NAME);
        }
        return name.trim();
    }

    _validateConstructor(constructor) {
        if (!isClass(constructor)) {
            throw createError('Constructor must be a class', ERRORS.INVALID_CONSTRUCTOR);
        }
        return constructor;
    }

    _validateDependencies(deps) {
        if (!Array.isArray(deps)) {
            throw createError('Dependencies must be an array', ERRORS.INVALID_DEPENDENCIES);
        }
        return deps;
    }

    _resolveDependencies(deps, resolving = new Set()) {
        return deps.map(dep => {
            if (resolving.has(dep)) {
                throw createError(`Circular dependency: ${[...resolving].join(' -> ')} -> ${dep}`, ERRORS.CIRCULAR_DEPENDENCY);
            }
            resolving.add(dep);
            try {
                if (this._instances.has(dep)) return this._instances.get(dep);
                if (this._registry.has(dep)) return this._createInstance(dep, resolving);
                if (this._aliases.has(dep)) {
                    const alias = this._aliases.get(dep);
                    return this._resolveDependencies([alias], resolving)[0];
                }
                throw createError(`Dependency "${dep}" not found`, ERRORS.NOT_FOUND);
            } finally {
                resolving.delete(dep);
            }
        });
    }

    _createInstance(name, resolving) {
        const entry = this._registry.get(name);
        if (!entry) throw createError(`Class "${name}" not registered`, ERRORS.NOT_FOUND);
        const { constructor, deps, isSingleton, version } = entry;
        const resolvedDeps = this._resolveDependencies(deps, resolving || new Set());
        const instance = new constructor(...resolvedDeps);
        if (isSingleton) this._singletons.set(name, instance);
        this._instances.set(name, instance);
        this._versions.set(name, version || DEFAULT.VERSION);
        this.dispatchEvent({ type: LIFECYCLE.CREATED, name, version: this._versions.get(name) });
        return instance;
    }

    _executeMiddleware(name, instance) {
        if (this._middleware.has(name)) {
            for (const fn of this._middleware.get(name)) fn(instance);
        }
        if (this._middleware.has('*')) {
            for (const fn of this._middleware.get('*')) fn(name, instance);
        }
        return instance;
    }

    _executeHooks(name, hookName, data) {
        if (this._hooks.has(name) && this._hooks.get(name)[hookName]) {
            for (const fn of this._hooks.get(name)[hookName]) fn(data);
        }
        if (this._hooks.has('*') && this._hooks.get('*')[hookName]) {
            for (const fn of this._hooks.get('*')[hookName]) fn(name, data);
        }
    }

    _checkLock() {
        if (this._lock) throw createError('Registry is locked', ERRORS.LOCKED);
        return true;
    }

    register(name, constructor, deps = DEFAULT.DEPENDENCIES, isSingleton = DEFAULT.IS_SINGLETON, version = DEFAULT.VERSION) {
        this._checkLock();
        name = this._validateName(name);
        constructor = this._validateConstructor(constructor);
        deps = this._validateDependencies(deps);
        if (this._registry.has(name)) {
            throw createError(`"${name}" already registered`, ERRORS.DUPLICATE_REGISTRATION);
        }
        this._registry.set(name, { constructor, deps, isSingleton, version });
        this.dispatchEvent({ type: LIFECYCLE.REGISTERED, name, deps, isSingleton, version });
        this._executeHooks(name, HOOKS.ON_REGISTER, { name, deps, isSingleton, version });
        return this;
    }

    registerAlias(alias, target) {
        this._checkLock();
        alias = this._validateName(alias);
        target = this._validateName(target);
        if (!this._registry.has(target)) throw createError(`Target "${target}" not registered`, ERRORS.NOT_FOUND);
        if (this._aliases.has(alias)) throw createError(`Alias "${alias}" already exists`, ERRORS.DUPLICATE_REGISTRATION);
        this._aliases.set(alias, target);
        this.dispatchEvent({ type: 'alias', alias, target });
        return this;
    }

    registerModule(name, module, deps = DEFAULT.DEPENDENCIES, version = DEFAULT.VERSION) {
        this._checkLock();
        name = this._validateName(name);
        if (this._modules.has(name)) throw createError(`Module "${name}" already registered`, ERRORS.DUPLICATE_REGISTRATION);
        this._modules.set(name, { module, deps, version });
        this.dispatchEvent({ type: 'moduleRegistered', name, deps, version });
        return this;
    }

    registerFactory(name, factory, deps = DEFAULT.DEPENDENCIES) {
        this._checkLock();
        name = this._validateName(name);
        if (typeof factory !== 'function') throw createError('Factory must be a function', ERRORS.INVALID_CONSTRUCTOR);
        this._factories.set(name, { factory, deps });
        this.dispatchEvent({ type: 'factoryRegistered', name });
        return this;
    }

    get(name) {
        name = this._validateName(name);
        if (this._aliases.has(name)) name = this._aliases.get(name);
        if (!this._registry.has(name)) throw createError(`"${name}" not registered`, ERRORS.NOT_FOUND);
        if (this._instances.has(name)) return this._instances.get(name);
        const instance = this._createInstance(name);
        this._executeMiddleware(name, instance);
        this._executeHooks(name, HOOKS.ON_GET, { instance });
        this.dispatchEvent({ type: LIFECYCLE.RETRIEVED, name, instance });
        return instance;
    }

    getSingleton(name) {
        name = this._validateName(name);
        if (this._aliases.has(name)) name = this._aliases.get(name);
        if (this._singletons.has(name)) return this._singletons.get(name);
        const instance = this.get(name);
        this._singletons.set(name, instance);
        this.dispatchEvent({ type: 'singletonCreated', name, instance });
        return instance;
    }

    getModule(name) {
        name = this._validateName(name);
        if (!this._modules.has(name)) throw createError(`Module "${name}" not registered`, ERRORS.NOT_FOUND);
        const { module, deps, version } = this._modules.get(name);
        const resolvedDeps = this._resolveDependencies(deps);
        const instance = typeof module === 'function' ? module(...resolvedDeps) : module;
        this.dispatchEvent({ type: 'moduleLoaded', name, version });
        return instance;
    }

    getConfig(name) {
        name = this._validateName(name);
        return this._configs.get(name) || {};
    }

    setConfig(name, config) {
        name = this._validateName(name);
        this._configs.set(name, config);
        this.dispatchEvent({ type: 'configSet', name, config });
        return this;
    }

    updateConfig(name, updates) {
        name = this._validateName(name);
        const current = this.getConfig(name);
        const updated = { ...current, ...updates };
        this._configs.set(name, updated);
        this.dispatchEvent({ type: 'configUpdated', name, updates });
        return this;
    }

    create(name, ...args) {
        name = this._validateName(name);
        if (this._aliases.has(name)) name = this._aliases.get(name);
        if (this._factories.has(name)) {
            const { factory, deps } = this._factories.get(name);
            const resolvedDeps = this._resolveDependencies(deps);
            const instance = factory(...resolvedDeps, ...args);
            this._executeMiddleware(name, instance);
            this._executeHooks(name, HOOKS.ON_CREATE, { instance, args });
            this.dispatchEvent({ type: 'factoryCreated', name, instance });
            return instance;
        }
        if (this._registry.has(name)) {
            const entry = this._registry.get(name);
            const resolvedDeps = this._resolveDependencies(entry.deps);
            const instance = new entry.constructor(...resolvedDeps, ...args);
            this._executeMiddleware(name, instance);
            this._executeHooks(name, HOOKS.ON_CREATE, { instance, args });
            this.dispatchEvent({ type: LIFECYCLE.CREATED, name, instance });
            return instance;
        }
        throw createError(`"${name}" not found for creation`, ERRORS.NOT_FOUND);
    }

    has(name) {
        try {
            name = this._validateName(name);
            return this._registry.has(name) || this._aliases.has(name) || this._modules.has(name);
        } catch {
            return false;
        }
    }

    hasInstance(name) {
        try {
            name = this._validateName(name);
            return this._instances.has(name) || this._singletons.has(name);
        } catch {
            return false;
        }
    }

    remove(name) {
        this._checkLock();
        name = this._validateName(name);
        let removed = false;
        if (this._registry.has(name)) {
            this._registry.delete(name);
            this._instances.delete(name);
            this._singletons.delete(name);
            this._middleware.delete(name);
            this._hooks.delete(name);
            this._versions.delete(name);
            removed = true;
        }
        if (this._aliases.has(name)) {
            this._aliases.delete(name);
            removed = true;
        }
        if (this._modules.has(name)) {
            this._modules.delete(name);
            removed = true;
        }
        if (removed) {
            this.dispatchEvent({ type: LIFECYCLE.REMOVED, name });
            this._executeHooks('*', HOOKS.ON_REMOVE, { name });
        }
        return removed;
    }

    clear() {
        this._checkLock();
        this._registry.clear();
        this._instances.clear();
        this._singletons.clear();
        this._factories.clear();
        this._configs.clear();
        this._middleware.clear();
        this._hooks.clear();
        this._modules.clear();
        this._aliases.clear();
        this._versions.clear();
        this.dispatchEvent({ type: LIFECYCLE.CLEARED });
        this._executeHooks('*', HOOKS.ON_CLEAR, {});
        return this;
    }

    use(name, middleware) {
        name = this._validateName(name);
        if (typeof middleware !== 'function') throw createError('Middleware must be a function', ERRORS.INVALID_CONSTRUCTOR);
        if (!this._middleware.has(name)) this._middleware.set(name, []);
        this._middleware.get(name).push(middleware);
        return this;
    }

    useGlobal(middleware) {
        if (typeof middleware !== 'function') throw createError('Middleware must be a function', ERRORS.INVALID_CONSTRUCTOR);
        if (!this._middleware.has('*')) this._middleware.set('*', []);
        this._middleware.get('*').push(middleware);
        return this;
    }

    hook(name, hookName, callback) {
        name = this._validateName(name);
        if (typeof callback !== 'function') throw createError('Hook callback must be a function', ERRORS.INVALID_CONSTRUCTOR);
        if (!this._hooks.has(name)) this._hooks.set(name, {});
        const hooks = this._hooks.get(name);
        if (!hooks[hookName]) hooks[hookName] = [];
        hooks[hookName].push(callback);
        return this;
    }

    once(type, listener) {
        const wrapper = (event) => {
            listener(event);
            this.off(type, wrapper);
        };
        return this.on(type, wrapper);
    }

    setGithubToken(token) {
        if (!token) token = process.env?.GITHUB_TOKEN;
        if (!token || typeof token !== 'string' || !token.startsWith(GITHUB.TOKEN_PREFIX)) {
            throw createError('Invalid GitHub token', ERRORS.INVALID_TOKEN);
        }
        this._githubToken = token;
        this.dispatchEvent({ type: 'githubTokenSet', token: '***' });
        return this;
    }

    getGithubToken() {
        if (!this._githubToken) throw createError('GitHub token not set', ERRORS.INVALID_TOKEN);
        return this._githubToken;
    }

    async githubRequest(endpoint, options = {}) {
        try {
            const token = this.getGithubToken();
            const response = await fetch(`${GITHUB.API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': GITHUB.API_VERSION,
                    ...options.headers
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw createError(`GitHub API error: ${response.status} - ${JSON.stringify(errorData)}`, ERRORS.GITHUB_ERROR);
            }
            return response.json();
        } catch (error) {
            this.dispatchEvent({ type: 'githubError', endpoint, error: error.message });
            throw error;
        }
    }

    async testGithubConnection() {
        try {
            const user = await this.githubRequest('/user');
            console.log(`✅ Connected as: ${user.login}`);
            return user;
        } catch (error) {
            console.error('❌ GitHub failed:', error.message);
            throw error;
        }
    }

    dependencies(name) {
        name = this._validateName(name);
        const entry = this._registry.get(name);
        return entry ? entry.deps : [];
    }

    isSingleton(name) {
        name = this._validateName(name);
        const entry = this._registry.get(name);
        return entry ? entry.isSingleton : false;
    }

    instanceOf(name) {
        name = this._validateName(name);
        return this._instances.has(name) || this._singletons.has(name);
    }

    getVersion(name) {
        name = this._validateName(name);
        return this._versions.get(name) || null;
    }

    lock() {
        this._lock = true;
        this.dispatchEvent({ type: LIFECYCLE.LOCKED });
        return this;
    }

    unlock() {
        this._lock = false;
        this.dispatchEvent({ type: LIFECYCLE.UNLOCKED });
        return this;
    }

    isLocked() {
        return this._lock;
    }

    reset() {
        this._checkLock();
        this._instances.clear();
        this._singletons.clear();
        this.dispatchEvent({ type: LIFECYCLE.RESET });
        this._executeHooks('*', HOOKS.ON_RESET, {});
        return this;
    }

    destroy() {
        if (this._lock) throw createError('Registry is locked', ERRORS.LOCKED);
        for (const [name, instance] of this._instances) {
            if (isDisposable(instance)) {
                try { instance.dispose(); } catch (e) { warn(`Error disposing "${name}"`, e); }
            }
            this._executeHooks(name, HOOKS.ON_DESTROY, { name });
        }
        this.clear();
        this.dispatchEvent({ type: LIFECYCLE.DESTROYED });
        return this;
    }

    stats() {
        return {
            totalRegistry: this._registry.size,
            totalInstances: this._instances.size,
            totalSingletons: this._singletons.size,
            totalFactories: this._factories.size,
            totalModules: this._modules.size,
            totalAliases: this._aliases.size,
            totalMiddlewares: this._middleware.size,
            totalHooks: this._hooks.size,
            totalEvents: Object.keys(this._listeners).length,
            isLocked: this._lock
        };
    }

    list() {
        return {
            registry: Array.from(this._registry.keys()),
            aliases: Array.from(this._aliases.keys()),
            modules: Array.from(this._modules.keys()),
            instances: Array.from(this._instances.keys()),
            singletons: Array.from(this._singletons.keys()),
            factories: Array.from(this._factories.keys())
        };
    }
}

const LuxarionRegister = new LuxarionRegistry();
Object.freeze(LuxarionRegister);

export { LuxarionRegister };
