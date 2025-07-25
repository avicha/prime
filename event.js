import EventListener from './event_listener';
import Adapter from './adapter';

const defaultEventConfig = {
    longPressDelay: 750,
    tapMaxX: 10,
    tapMaxY: 10,
    swipeRightAngle: 30,
    swipeLeftAngle: 30,
    swipeDownAngle: 30,
    swipeUpAngle: 30,
    swipeMinX: 30,
    swipeMinY: 30,
    debug: false,
};
export default class Event extends EventListener {
    constructor(opts) {
        super();
        this.opts = Object.assign({}, defaultEventConfig, opts);
        this.target = this;
        this.startTouchInfo = {};
        this.lastTouchInfo = {};
        this.endTouchInfo = {};
        this.moveDistanceX = {};
        this.moveDistanceY = {};
        this.longPressTick = {};
        this.lastTapInfo = null;
        Adapter.onTouchStart(this.onTouchStart.bind(this));
        Adapter.onTouchMove(this.onTouchMove.bind(this));
        Adapter.onTouchEnd(this.onTouchEnd.bind(this));
        Adapter.onTouchCancel(this.onTouchCancel.bind(this));
    }
    bind(target) {
        this.target = target;
    }
    onTouchStart({ touches, _changedTouches, _timestamp = Date.now(), _preventDefault }) {
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const x = touch.clientX;
            const y = touch.clientY;
            const identifier = touch.identifier;
            if (!this.startTouchInfo[identifier]) {
                this.target.trigger('touchstart', {
                    type: 'touchstart',
                    x,
                    y,
                    identifier,
                    touch,
                });
                if (this.opts.debug) {
                    console.debug(`${identifier} touchstart`, x, y);
                }
                this.startTouchInfo[identifier] = {
                    x,
                    y,
                    identifier,
                };
                this.lastTouchInfo[identifier] = {
                    x,
                    y,
                    identifier,
                };
                this.longPressTick[identifier] = Adapter.setTimeout(() => {
                    this.longPress(identifier);
                }, this.opts.longPressDelay);
                this.moveDistanceX[identifier] = this.moveDistanceY[identifier] = 0;
            }
        }
    }
    longPress(identifier) {
        this.cancelLongPress(identifier);
        this.target.trigger('longPress', {
            type: 'longPress',
            ...this.startTouchInfo[identifier],
        });
        if (this.opts.debug) {
            console.debug('longPress', {
                type: 'longPress',
                ...this.startTouchInfo[identifier],
            });
        }
    }
    cancelLongPress(identifier) {
        if (this.longPressTick[identifier]) {
            Adapter.clearTimeout(this.longPressTick[identifier]);
            this.longPressTick[identifier] = null;
        }
    }
    onTouchMove({ touches, _changedTouches, _timestamp = Date.now() }) {
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const x = touch.clientX;
            const y = touch.clientY;
            const identifier = touch.identifier;
            this.target.trigger('touchmove', {
                type: 'touchmove',
                x,
                y,
                identifier,
                touch,
            });
            if (this.opts.debug) {
                console.debug(`${identifier} touchmove`, x, y);
            }
            if (x != this.startTouchInfo[identifier].x || y != this.startTouchInfo[identifier].y) {
                this.cancelLongPress(identifier);
            }
            const dx = x - this.lastTouchInfo[identifier].x;
            const dy = y - this.lastTouchInfo[identifier].y;
            this.lastTouchInfo[identifier] = {
                x,
                y,
                identifier,
            };
            this.moveDistanceX[identifier] += Math.abs(dx);
            this.moveDistanceY[identifier] += Math.abs(dy);
        }
    }
    onTouchEnd({ _touches, changedTouches, timestamp = Date.now() }) {
        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];
            const x = touch.clientX;
            const y = touch.clientY;
            const identifier = touch.identifier;
            this.target.trigger('touchend', {
                type: 'touchend',
                x,
                y,
                identifier,
                touch,
            });
            if (this.opts.debug) {
                console.debug(`${identifier} touchend`, x, y);
            }
            this.cancelLongPress(identifier);
            this.endTouchInfo[identifier] = {
                x,
                y,
                identifier,
            };
            if (
                this.moveDistanceX[identifier] <= this.opts.tapMaxX &&
                this.moveDistanceY[identifier] <= this.opts.tapMaxY
            ) {
                this.target.trigger('tap', {
                    type: 'tap',
                    ...this.endTouchInfo[identifier],
                });
                if (this.opts.debug) {
                    console.debug('tap', {
                        type: 'tap',
                        ...this.endTouchInfo[identifier],
                    });
                }
                if (changedTouches.length == 1) {
                    if (this.lastTapInfo) {
                        const dt = timestamp - this.lastTapInfo.timestamp;
                        const dx = x - this.lastTapInfo.x;
                        const dy = y - this.lastTapInfo.y;
                        if (dt <= 250 && dx <= this.opts.tapMaxX && dy <= this.opts.tapMaxY) {
                            this.target.trigger('doubleTap', {
                                type: 'doubleTap',
                                ...this.endTouchInfo[identifier],
                            });
                            if (this.opts.debug) {
                                console.debug('doubleTap', {
                                    type: 'doubleTap',
                                    ...this.endTouchInfo[identifier],
                                });
                            }
                        }
                    } else {
                        this.lastTapInfo = {};
                    }
                    this.lastTapInfo.x = x;
                    this.lastTapInfo.y = y;
                    this.lastTapInfo.identifier = identifier;
                    this.lastTapInfo.timestamp = timestamp;
                }
            } else {
                const dx = x - this.startTouchInfo[identifier].x;
                const dy = y - this.startTouchInfo[identifier].y;
                const angle = (Math.atan(dy / dx) * 180) / Math.PI;
                let direction;
                if (dx > 0 && Math.abs(angle) < this.opts.swipeRightAngle) {
                    direction = 'Right';
                }
                if (dx < 0 && Math.abs(angle) < this.opts.swipeLeftAngle) {
                    direction = 'Left';
                }
                if (dy > 0 && Math.abs(angle) > 90 - this.opts.swipeDownAngle) {
                    direction = 'Down';
                }
                if (dy < 0 && Math.abs(angle) > 90 - this.opts.swipeUpAngle) {
                    direction = 'Up';
                }
                if (
                    ((direction == 'Left' || direction == 'Right') && Math.abs(dx) > this.opts.swipeMinX) ||
                    ((direction == 'Up' || direction == 'Down') && Math.abs(dy) > this.opts.swipeMinY)
                ) {
                    this.target.trigger('swipe' + direction, {
                        type: 'swipe' + direction,
                        ...this.startTouchInfo[identifier],
                    });
                    if (this.opts.debug) {
                        console.debug('swipe' + direction, {
                            type: 'swipe' + direction,
                            ...this.startTouchInfo[identifier],
                        });
                    }
                }
            }
            this.startTouchInfo[identifier] = null;
        }
    }
    onTouchCancel({ _touches, changedTouches, _timestamp = Date.now() }) {
        for (let i = 0; i < changedTouches.length; i++) {
            const touch = changedTouches[i];
            const x = touch.clientX;
            const y = touch.clientY;
            const identifier = touch.identifier;
            this.target.trigger('touchcancel', {
                type: 'touchcancel',
                x,
                y,
                identifier,
                touch,
            });
            this.cancelLongPress(identifier);
        }
    }
}
