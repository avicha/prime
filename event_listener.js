export default class EventListener {
    constructor() {
        this._events = {};
    }
    on(evt, fn) {
        if (this._events[evt]) {
            this._events[evt].push(fn);
        } else {
            this._events[evt] = [fn];
        }
    }
    trigger(evt, ...args) {
        if (this._events[evt]) {
            for (let fn of this._events[evt]) {
                fn.apply(this, args);
            }
        }
    }
}
