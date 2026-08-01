/**
 * Version information for Luxarion Engine.
 * Provides version constants and utilities for version management.
 * 
 * @module Version
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { VERSION, NAME, VENDOR, ENGINE_URL, ENGINE_DOCS } from './Constants.js';

// Version components from the main version string
export const VERSION_MAJOR = parseInt(VERSION.split('.')[0], 10);
export const VERSION_MINOR = parseInt(VERSION.split('.')[1], 10);
export const VERSION_PATCH = parseInt(VERSION.split('.')[2] || '0', 10);
export const VERSION_BRANCH = `${VERSION_MAJOR}.${VERSION_MINOR}`;
export const VERSION_NUMBER = VERSION_PATCH === 0 ? VERSION_BRANCH : `${VERSION_BRANCH}.${VERSION_PATCH}`;
export const VERSION_STATUS = 'stable';
export const VERSION_BUILD = 'official';
export const VERSION_FULL_NAME = `${NAME} v${VERSION_NUMBER}.${VERSION_STATUS}.${VERSION_BUILD}`;
export const VERSION_HASH = '0000000';
export const VERSION_TIMESTAMP = Date.now();

/**
 * Version information object containing all version details.
 * @typedef {Object} VersionInfo
 * @property {string} VERSION - The version string.
 * @property {string} NAME - The engine name.
 * @property {string} VENDOR - The vendor name.
 * @property {number} MAJOR - The major version number.
 * @property {number} MINOR - The minor version number.
 * @property {number} PATCH - The patch version number.
 * @property {string} BRANCH - The version branch (major.minor).
 * @property {string} NUMBER - The full version number.
 * @property {string} STATUS - The release status.
 * @property {string} BUILD - The build type.
 * @property {string} FULL_NAME - The complete version name.
 * @property {string} WEBSITE - The website URL.
 * @property {string} DOCS_URL - The documentation URL.
 * @property {string} HASH - The commit hash.
 * @property {number} TIMESTAMP - The build timestamp.
 * @property {function(): string} toString - Returns the full version name.
 */

/**
 * Version info singleton for easy access.
 */
export const version = {
    VERSION,
    NAME,
    VENDOR,
    MAJOR: VERSION_MAJOR,
    MINOR: VERSION_MINOR,
    PATCH: VERSION_PATCH,
    BRANCH: VERSION_BRANCH,
    NUMBER: VERSION_NUMBER,
    STATUS: VERSION_STATUS,
    BUILD: VERSION_BUILD,
    FULL_NAME: VERSION_FULL_NAME,
    WEBSITE: ENGINE_URL,
    DOCS_URL: ENGINE_DOCS,
    HASH: VERSION_HASH,
    TIMESTAMP: VERSION_TIMESTAMP,
    toString: () => VERSION_FULL_NAME
};

// Individual exports for backward compatibility
export { VERSION, NAME, VENDOR };

/**
 * Default export for convenience.
 */
export default version;
