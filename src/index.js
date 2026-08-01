/**
 * Luxarion Engine - Main Entry Point
 * 
 * @module luxarion-engine
 * @author Luxarion Labs
 * @version 1.0.0
 */

// Core exports
export { default as Constants } from './core/Constants.js';
export { default as Version } from './core/Version.js';
export { default as Types } from './core/Types.js';
export { default as Container, SERVICE_TYPES } from './core/Container.js';
export { default as Luxarion, LuxarionEngine } from './core/Luxarion.js';

// Utils exports
export * from './utils/index.js';

// Default export
import Luxarion from './core/Luxarion.js';
export default Luxarion;
