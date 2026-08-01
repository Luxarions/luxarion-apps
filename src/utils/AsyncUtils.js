/**
 * Async utility functions for Luxarion Engine.
 * Provides helpers for yielding to the main thread and probing WebGL sync objects.
 * 
 * @module AsyncUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * Yield to main thread, allowing other tasks to run.
 * Uses scheduler.yield() if available, otherwise requestAnimationFrame,
 * and falls back to setTimeout(0) for non-browser environments.
 * @returns {Promise<void>}
 */
export function yieldToMain() {
    // Check for scheduler API (Chrome/Edge)
    if (typeof self !== 'undefined' &&
        typeof self.scheduler !== 'undefined' &&
        typeof self.scheduler.yield !== 'undefined') {
        return self.scheduler.yield();
    }
    
    // Check for requestAnimationFrame (browser)
    if (typeof requestAnimationFrame !== 'undefined') {
        return new Promise(resolve => {
            requestAnimationFrame(resolve);
        });
    }
    
    // Fallback to setTimeout
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
}

/**
 * Probe WebGL sync object until complete.
 * @param {WebGL2RenderingContext} gl - WebGL2 context.
 * @param {WebGLSync} sync - WebGL sync object.
 * @param {number} [interval=1] - Polling interval in ms.
 * @returns {Promise<void>}
 * @throws {Error} If WebGL wait fails.
 */
export function probeAsync(gl, sync, interval = 1) {
    return new Promise(function(resolve, reject) {
        function probe() {
            const status = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);
            switch (status) {
                case gl.WAIT_FAILED:
                    reject(new Error('WebGL wait failed'));
                    break;
                case gl.TIMEOUT_EXPIRED:
                    setTimeout(probe, interval);
                    break;
                default:
                    resolve();
            }
        }
        setTimeout(probe, interval);
    });
}

/**
 * Delay execution for a specified time.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>} Promise that resolves after delay.
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff.
 * @param {Function} fn - Async function to retry.
 * @param {Object} [options] - Retry options.
 * @param {number} [options.maxAttempts=5] - Maximum retry attempts.
 * @param {number} [options.initialDelay=100] - Initial delay in ms.
 * @param {number} [options.maxDelay=10000] - Maximum delay in ms.
 * @param {number} [options.backoffFactor=2] - Backoff multiplier.
 * @param {Function} [options.shouldRetry] - Function to determine if retry should occur.
 * @returns {Promise<*>} Result of the operation.
 * @throws {Error} If all attempts fail.
 */
export async function retry(fn, options = {}) {
    const {
        maxAttempts = 5,
        initialDelay = 100,
        maxDelay = 10000,
        backoffFactor = 2,
        shouldRetry = (error) => true
    } = options;

    let lastError;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt === maxAttempts || !shouldRetry(error)) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * backoffFactor, maxDelay);
        }
    }

    throw lastError;
}

/**
 * Timeout a promise after a specified duration.
 * @param {Promise} promise - Promise to timeout.
 * @param {number} ms - Timeout in milliseconds.
 * @param {string} [message='Operation timed out'] - Timeout error message.
 * @returns {Promise} Promise with timeout.
 */
export function timeout(promise, ms, message = 'Operation timed out') {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(message));
        }, ms);
    });

    return Promise.race([
        promise,
        timeoutPromise
    ]).finally(() => {
        clearTimeout(timeoutId);
    });
}

/**
 * Throttle a function to execute at most once per interval.
 * @param {Function} fn - Function to throttle.
 * @param {number} interval - Throttle interval in ms.
 * @param {Object} [options] - Throttle options.
 * @param {boolean} [options.leading=false] - Execute on leading edge.
 * @param {boolean} [options.trailing=true] - Execute on trailing edge.
 * @returns {Function} Throttled function.
 */
export function throttle(fn, interval, options = {}) {
    const { leading = false, trailing = true } = options;
    let timeoutId = null;
    let lastArgs = null;
    let lastCallTime = 0;

    function invoke() {
        if (lastArgs) {
            fn(...lastArgs);
            lastArgs = null;
            lastCallTime = Date.now();
        }
    }

    return function throttled(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;

        if (timeSinceLastCall >= interval) {
            if (leading) {
                fn(...args);
                lastCallTime = now;
                return;
            }
        }

        lastArgs = args;

        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        if (trailing) {
            const remaining = Math.max(0, interval - timeSinceLastCall);
            timeoutId = setTimeout(invoke, remaining);
        }
    };
}

/**
 * Debounce a function to execute after a delay.
 * @param {Function} fn - Function to debounce.
 * @param {number} delay - Debounce delay in ms.
 * @param {Object} [options] - Debounce options.
 * @param {boolean} [options.leading=false] - Execute on leading edge.
 * @param {boolean} [options.trailing=true] - Execute on trailing edge.
 * @returns {Function} Debounced function.
 */
export function debounce(fn, delay, options = {}) {
    const { leading = false, trailing = true } = options;
    let timeoutId = null;
    let lastArgs = null;
    let hasPending = false;

    function invoke() {
        if (lastArgs) {
            fn(...lastArgs);
            lastArgs = null;
            hasPending = false;
        }
    }

    return function debounced(...args) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        if (leading && !hasPending) {
            fn(...args);
            hasPending = true;
            return;
        }

        lastArgs = args;

        if (trailing) {
            timeoutId = setTimeout(invoke, delay);
        }
    };
}

/**
 * Default export for convenience.
 */
export default {
    yieldToMain,
    probeAsync,
    delay,
    retry,
    timeout,
    throttle,
    debounce
};
