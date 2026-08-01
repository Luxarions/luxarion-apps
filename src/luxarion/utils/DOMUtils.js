/**
 * DOM manipulation and element creation helpers for Luxarion Engine.
 * 
 * @module DOMUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

export const DOMUtils = {
    createElement(tag, attributes = {}, children = []) {
        if (typeof document === 'undefined') return null;
        const el = document.createElement(tag);

        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.slice(2).toLowerCase();
                el.addEventListener(eventName, value);
            } else {
                el.setAttribute(key, value);
            }
        }

        const childList = Array.isArray(children) ? children : [children];
        for (const child of childList) {
            if (typeof child === 'string' || typeof child === 'number') {
                el.appendChild(document.createTextNode(String(child)));
            } else if (child instanceof HTMLElement) {
                el.appendChild(child);
            }
        }

        return el;
    },

    empty(element) {
        if (!element) return;
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    getViewportSize() {
        if (typeof window === 'undefined') return { width: 0, height: 0 };
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    }
};

export default DOMUtils;
