/**
 * Asynchronous flow control helpers for Luxarion Engine.
 * 
 * @module AsyncUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

export const AsyncUtils = {
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    timeout(promise, ms, errorMessage = 'Operation timed out') {
        let timer;
        const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(errorMessage)), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
    },

    retry(fn, retries = 3, delayMs = 100) {
        return new Promise((resolve, reject) => {
            const attempt = (remaining) => {
                fn()
                    .then(resolve)
                    .catch(err => {
                        if (remaining <= 0) {
                            reject(err);
                        } else {
                            setTimeout(() => attempt(remaining - 1), delayMs);
                        }
                    });
            };
            attempt(retries);
        });
    },

    debounce(fn, delayMs) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delayMs);
        };
    },

    throttle(fn, intervalMs) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= intervalMs) {
                lastTime = now;
                fn.apply(this, args);
            }
        };
    }
};

export default AsyncUtils;
