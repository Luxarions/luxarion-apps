/**
 * Type definitions and runtime validation schemas for Luxarion Engine.
 * 
 * @module Types
 * @author Luxarion Labs
 * @version 1.0.0
 */

export const ServiceLifetime = {
    SINGLETON: 'singleton',
    FACTORY: 'factory',
    TRANSIENT: 'transient',
    ALIAS: 'alias'
};

export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    OFF: 4
};

export class LuxarionError extends Error {
    constructor(message, code = 'GENERIC_ERROR', details = {}) {
        super(message);
        this.name = 'LuxarionError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

export default {
    ServiceLifetime,
    LogLevel,
    LuxarionError
};
