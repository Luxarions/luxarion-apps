/**
 * Error formatting and stack trace normalization for Luxarion Engine.
 * 
 * @module ErrorUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { LuxarionError } from '../core/Types.js';

export const ErrorUtils = {
    normalize(error) {
        if (error instanceof LuxarionError) {
            return error;
        }
        if (error instanceof Error) {
            return new LuxarionError(error.message, 'WRAPPED_ERROR', {
                originalName: error.name,
                stack: error.stack
            });
        }
        return new LuxarionError(String(error), 'UNKNOWN_ERROR');
    },

    formatStack(error) {
        const norm = this.normalize(error);
        return `[${norm.code}] ${norm.name}: ${norm.message}\n` + (norm.stack || 'No stack trace available');
    }
};

export default ErrorUtils;
