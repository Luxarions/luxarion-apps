/**
 * DOM utility functions for Luxarion Engine.
 * Provides helpers for creating and managing DOM elements.
 * 
 * @module DOMUtils
 * @author Luxarion Labs
 * @version 1.0.0
 */

/**
 * Create element with namespace (HTML namespace).
 * @param {string} name - Element tag name.
 * @param {string} [namespace='http://www.w3.org/1999/xhtml'] - XML namespace.
 * @returns {Element} Created element.
 */
export function createElementNS(name, namespace = 'http://www.w3.org/1999/xhtml') {
    return document.createElementNS(namespace, name);
}

/**
 * Create canvas element with display block style.
 * @param {number} [width] - Canvas width.
 * @param {number} [height] - Canvas height.
 * @returns {HTMLCanvasElement} Created canvas element.
 */
export function createCanvasElement(width = 0, height = 0) {
    const canvas = createElementNS('canvas');
    canvas.style.display = 'block';
    if (width > 0) canvas.width = width;
    if (height > 0) canvas.height = height;
    return canvas;
}

/**
 * Create an element with specified attributes and children.
 * @param {string} tag - Element tag name.
 * @param {Object} [attributes] - Element attributes.
 * @param {Array|string} [children] - Child elements or text content.
 * @returns {Element} Created element.
 */
export function createElement(tag, attributes = {}, children = null) {
    const element = document.createElement(tag);
    
    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key === 'dataset') {
            for (const [dataKey, dataValue] of Object.entries(value)) {
                element.dataset[dataKey] = dataValue;
            }
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    }
    
    // Add children
    if (children) {
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            for (const child of children) {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            }
        } else if (children instanceof Node) {
            element.appendChild(children);
        }
    }
    
    return element;
}

/**
 * Get element by ID with error handling.
 * @param {string} id - Element ID.
 * @param {Element} [context=document] - Context element.
 * @returns {Element|null} Element or null if not found.
 */
export function getElement(id, context = document) {
    return context.getElementById(id) || null;
}

/**
 * Query selector with error handling.
 * @param {string} selector - CSS selector.
 * @param {Element} [context=document] - Context element.
 * @returns {Element|null} Element or null if not found.
 */
export function querySelector(selector, context = document) {
    return context.querySelector(selector) || null;
}

/**
 * Query selector all with error handling.
 * @param {string} selector - CSS selector.
 * @param {Element} [context=document] - Context element.
 * @returns {Array<Element>} Array of matching elements.
 */
export function querySelectorAll(selector, context = document) {
    return Array.from(context.querySelectorAll(selector) || []);
}

/**
 * Add classes to an element.
 * @param {Element} element - Target element.
 * @param {...string} classes - Classes to add.
 * @returns {Element} The element.
 */
export function addClass(element, ...classes) {
    element.classList.add(...classes);
    return element;
}

/**
 * Remove classes from an element.
 * @param {Element} element - Target element.
 * @param {...string} classes - Classes to remove.
 * @returns {Element} The element.
 */
export function removeClass(element, ...classes) {
    element.classList.remove(...classes);
    return element;
}

/**
 * Toggle a class on an element.
 * @param {Element} element - Target element.
 * @param {string} className - Class to toggle.
 * @param {boolean} [force] - Force state.
 * @returns {boolean} True if class is present after toggle.
 */
export function toggleClass(element, className, force) {
    return element.classList.toggle(className, force);
}

/**
 * Check if element has a class.
 * @param {Element} element - Target element.
 * @param {string} className - Class to check.
 * @returns {boolean} True if class is present.
 */
export function hasClass(element, className) {
    return element.classList.contains(className);
}

/**
 * Set element styles.
 * @param {Element} element - Target element.
 * @param {Object} styles - Style object.
 * @returns {Element} The element.
 */
export function setStyles(element, styles) {
    Object.assign(element.style, styles);
    return element;
}

/**
 * Get element computed style.
 * @param {Element} element - Target element.
 * @param {string} property - CSS property.
 * @param {string} [pseudoElement] - Pseudo element.
 * @returns {string} Computed style value.
 */
export function getComputedStyle(element, property, pseudoElement = null) {
    return getComputedStyle(element, pseudoElement)[property];
}

/**
 * Check if element is visible.
 * @param {Element} element - Target element.
 * @returns {boolean} True if element is visible.
 */
export function isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           element.offsetParent !== null;
}

/**
 * Check if element is in viewport.
 * @param {Element} element - Target element.
 * @param {number} [offset=0] - Offset in pixels.
 * @returns {boolean} True if element is in viewport.
 */
export function isInViewport(element, offset = 0) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return rect.top + offset < viewportHeight &&
           rect.bottom - offset > 0 &&
           rect.left + offset < viewportWidth &&
           rect.right - offset > 0;
}

/**
 * Default export for convenience.
 */
export default {
    createElementNS,
    createCanvasElement,
    createElement,
    getElement,
    querySelector,
    querySelectorAll,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    setStyles,
    getComputedStyle,
    isVisible,
    isInViewport
};
