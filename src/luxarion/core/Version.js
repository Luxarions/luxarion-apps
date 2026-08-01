/**
 * Version tracking and build metadata for Luxarion Engine.
 * 
 * @module Version
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { VERSION, VENDOR, NAME } from './Constants.js';

export const version = {
    major: 1,
    minor: 0,
    patch: 0,
    prerelease: null,
    build: '20260801',
    full: VERSION,
    vendor: VENDOR,
    name: NAME,
    
    toString() {
        return `${this.name} v${this.full}`;
    },
    
    toJSON() {
        return {
            name: this.name,
            version: this.full,
            vendor: this.vendor,
            build: this.build
        };
    }
};

export default version;
