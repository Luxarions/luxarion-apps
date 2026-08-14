export const VERSION = '1.0.0';

export const LIFECYCLE = {
    REGISTERED: 'registered',
    CREATED: 'created',
    RETRIEVED: 'instanceRetrieved',
    REMOVED: 'removed',
    CLEARED: 'cleared',
    RESET: 'reset',
    DESTROYED: 'destroyed',
    LOCKED: 'locked',
    UNLOCKED: 'unlocked'
};

export const HOOKS = {
    ON_REGISTER: 'onRegister',
    ON_GET: 'onGet',
    ON_CREATE: 'onCreate',
    ON_REMOVE: 'onRemove',
    ON_CLEAR: 'onClear',
    ON_RESET: 'onReset',
    ON_DESTROY: 'onDestroy'
};

export const SCOPES = {
    SINGLETON: 'singleton',
    TRANSIENT: 'transient',
    FACTORY: 'factory',
    MODULE: 'module'
};

export const ERRORS = {
    INVALID_NAME: 'LXRN_INVALID_NAME',
    INVALID_CONSTRUCTOR: 'LXRN_INVALID_CONSTRUCTOR',
    INVALID_DEPENDENCIES: 'LXRN_INVALID_DEPENDENCIES',
    DUPLICATE_REGISTRATION: 'LXRN_DUPLICATE_REGISTRATION',
    NOT_FOUND: 'LXRN_NOT_FOUND',
    CIRCULAR_DEPENDENCY: 'LXRN_CIRCULAR_DEPENDENCY',
    LOCKED: 'LXRN_LOCKED',
    INVALID_TOKEN: 'LXRN_INVALID_TOKEN',
    GITHUB_ERROR: 'LXRN_GITHUB_ERROR',
    INVALID_CONFIG: 'LXRN_INVALID_CONFIG'
};

export const DEFAULT = {
    VERSION: '1.0.0',
    IS_SINGLETON: false,
    DEPENDENCIES: [],
    CONFIG: {}
};

export const GITHUB = {
    TOKEN_PREFIX: 'ghp_',
    API_URL: 'https://api.github.com',
    API_VERSION: 'application/vnd.github.v3+json'
};

export const MIDDLEWARE = {
    GLOBAL: '*'
};

export const EVENT = {
    WILDCARD: '*'
};
