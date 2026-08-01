/**
 * Structured console logging utilities for Luxarion Engine.
 * 
 * @module ConsoleUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { LogLevel } from '../core/Types.js';

export class ConsoleLogger {
    constructor(prefix = '[Luxarion]', level = LogLevel.INFO) {
        this.prefix = prefix;
        this.level = level;
        this.logs = [];
    }

    setLevel(level) {
        this.level = level;
    }

    #log(level, levelName, style, ...args) {
        if (level < this.level) return;
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            timestamp,
            level: levelName,
            prefix: this.prefix,
            message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
        };
        this.logs.push(entry);
        if (this.logs.length > 500) this.logs.shift();

        if (typeof console !== 'undefined') {
            const method = levelName.toLowerCase() === 'debug' ? 'debug' :
                           levelName.toLowerCase() === 'warn' ? 'warn' :
                           levelName.toLowerCase() === 'error' ? 'error' : 'log';
            console[method](`%c${this.prefix} [${timestamp}] [${levelName}]`, style, ...args);
        }
    }

    debug(...args) {
        this.#log(LogLevel.DEBUG, 'DEBUG', 'color: #94a3b8; font-weight: bold;', ...args);
    }

    info(...args) {
        this.#log(LogLevel.INFO, 'INFO', 'color: #38bdf8; font-weight: bold;', ...args);
    }

    warn(...args) {
        this.#log(LogLevel.WARN, 'WARN', 'color: #fbbf24; font-weight: bold;', ...args);
    }

    error(...args) {
        this.#log(LogLevel.ERROR, 'ERROR', 'color: #f87171; font-weight: bold;', ...args);
    }

    getLogs() {
        return [...this.logs];
    }

    clear() {
        this.logs = [];
    }
}

export const ConsoleUtils = new ConsoleLogger();
export default ConsoleUtils;
