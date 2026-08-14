export class EventDispatcher {
    constructor() {
        this._listeners = {};
    }

    addEventListener(type, listener) {
        if (!this._listeners[type]) this._listeners[type] = [];
        if (!this._listeners[type].includes(listener)) {
            this._listeners[type].push(listener);
        }
        return this;
    }

    removeEventListener(type, listener) {
        const list = this._listeners[type];
        if (list) {
            const idx = list.indexOf(listener);
            if (idx !== -1) list.splice(idx, 1);
        }
        return this;
    }

    dispatchEvent(event) {
        const list = this._listeners[event.type];
        if (list) {
            event.target = this;
            const copy = list.slice();
            for (const fn of copy) {
                fn.call(this, event);
            }
            event.target = null;
        }
        return this;
    }

    hasEventListener(type, listener) {
        const list = this._listeners[type];
        return list ? list.includes(listener) : false;
    }

    on(type, listener) {
        return this.addEventListener(type, listener);
    }

    off(type, listener) {
        return this.removeEventListener(type, listener);
    }
}

export { EventDispatcher };
