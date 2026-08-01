/**
 * Legacy utility entry point for Luxarion Engine.
 * Re-exports all utilities from the utils directory.
 * 
 * @deprecated Use individual imports from 'utils/' instead.
 * @module Utils
 * @author Luxarion Labs
 * @version 1.0.0
 */

import utils from '../utils/index.js';

// Re-export all utility modules
export const ArrayUtils = utils.ArrayUtils;
export const ConsoleUtils = utils.ConsoleUtils;
export const AsyncUtils = utils.AsyncUtils;
export const SerializeUtils = utils.SerializeUtils;
export const TypeUtils = utils.TypeUtils;
export const ErrorUtils = utils.ErrorUtils;
export const MatrixUtils = utils.MatrixUtils;
export const DOMUtils = utils.DOMUtils;
export const SecurityCybork = utils.SecurityCybork;

// Default export for compatibility
export default utils;
