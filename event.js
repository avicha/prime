import EventListener from './event_listener'
import Adapter from './adapter'

const defaultEventConfig = {
    longPressDelay: 750,
    moveDetect: false,
    tapMaxX: 10,
    tapMaxY: 10,
    swipeRightAngle: 30,
    swipeLeftAngle: 30,
    swipeDownAngle: 30,
    swipeUpAngle: 30,
    swipeMinX: 30,
    swipeMinY: 30,
    debug: false
}
export default class Event extends EventListener {
    constructor(opts) {
        super()
        this.opts = Object.assign({}, defaultEventConfig, opts)
        this.target = this
        this.startTouchInfo = {}
        this.lastTouchInfo = {}
        this.endTouchInfo = {}
        this.moveDistanceX = 0
        this.moveDistanceY = 0
        this.lastTapInfo = null
        Adapter.onTouchStart(this.onTouchStart.bind(this))
        Adapter.onTouchMove(this.onTouchMove.bind(this))
        Adapter.onTouchEnd(this.onTouchEnd.bind(this))
        Adapter.onTouchCancel(this.onTouchCancel.bind(this))
    }
    bind(target) {
        this.target = target
    }
    onTouchStart({ touches, changedTouches, timestamp = Date.now(), type = 'touchstart' }) {
        this.target.trigger('touchstart', { touches, changedTouches, timestamp, type })
        let x = touches[0].pageX
        let y = touches[0].pageY
        let identifier = touches[0].identifier
        this.startTouchInfo.x = x
        this.startTouchInfo.y = y
        this.startTouchInfo.identifier = identifier
        this.startTouchInfo.timestamp = timestamp
        this.lastTouchInfo.x = x
        this.lastTouchInfo.y = y
        this.lastTouchInfo.identifier = identifier
        this.lastTouchInfo.timestamp = timestamp
        this.longPressTick = Adapter.setTimeout(() => {
            this.longPress()
        }, this.opts.longPressDelay)
        this.moveDistanceX = this.moveDistanceY = 0
    }
    longPress() {
        this.cancelLongPress()
        this.target.trigger('longPress', { type: 'longPress', ...this.startTouchInfo })
        if (this.opts.debug) {
            console.debug('longPress', { type: 'longPress', ...this.startTouchInfo })
        }
    }
    cancelLongPress() {
        if (this.longPressTick) {
            Adapter.clearTimeout(this.longPressTick)
            this.longPressTick = null
        }
    }
    onTouchMove({ touches, changedTouches, timestamp = Date.now(), type = 'touchmove' }) {
        this.target.trigger('touchmove', { touches, changedTouches, timestamp, type })
        this.cancelLongPress()
        let x = touches[0].pageX
        let y = touches[0].pageY
        let identifier = touches[0].identifier
        let dx = x - this.lastTouchInfo.x
        let dy = y - this.lastTouchInfo.y
        this.lastTouchInfo.x = x
        this.lastTouchInfo.y = y
        this.lastTouchInfo.identifier = identifier
        this.lastTouchInfo.timestamp = timestamp
        if (this.opts.moveDetect) {
            let direction = Math.abs(dx) >=
                Math.abs(dy) ? (dx > 0 ? 'Right' : 'Left') : (dy > 0 ? 'Down' : 'Up')
            this.target.trigger('move' + direction, { type: 'move' + direction, dx, dy, ...this.lastTouchInfo })
            if (this.opts.debug) {
                console.debug('move' + direction, { type: 'move' + direction, dx, dy, ...this.lastTouchInfo })
            }
        }
        this.moveDistanceX += Math.abs(dx)
        this.moveDistanceY += Math.abs(dy)

    }
    onTouchEnd({ touches, changedTouches, timestamp = Date.now(), type = 'touchend' }) {
        this.target.trigger('touchend', { touches, changedTouches, timestamp, type })
        this.cancelLongPress()
        let x = changedTouches[0].pageX
        let y = changedTouches[0].pageY
        let identifier = changedTouches[0].identifier
        this.endTouchInfo.x = x
        this.endTouchInfo.y = y
        this.endTouchInfo.identifier = identifier
        this.endTouchInfo.timestamp = timestamp
        if ((this.moveDistanceX <= this.opts.tapMaxX) && (this.moveDistanceY <= this.opts.tapMaxY)) {
            this.target.trigger('tap', { type: 'tap', ...this.endTouchInfo })
            if (this.opts.debug) {
                console.debug('tap', { type: 'tap', ...this.endTouchInfo })
            }
            if (this.lastTapInfo) {
                let dt = timestamp - this.lastTapInfo.timestamp
                let dx = x - this.lastTapInfo.x
                let dy = y - this.lastTapInfo.y
                if ((dt <= 250) && (dx <= this.opts.tapMaxX) && (dy <= this.opts.tapMaxY)) {
                    this.target.trigger('doubleTap', { type: 'doubleTap', ...this.endTouchInfo })
                    if (this.opts.debug) {
                        console.debug('doubleTap', { type: 'doubleTap', ...this.endTouchInfo })
                    }
                }
            } else {
                this.lastTapInfo = {}
            }
            this.lastTapInfo.x = x
            this.lastTapInfo.y = y
            this.lastTapInfo.identifier = identifier
            this.lastTapInfo.timestamp = timestamp
        } else {
            let dx = x - this.startTouchInfo.x
            let dy = y - this.startTouchInfo.y
            let angle = Math.atan(dy / dx) * 180 / Math.PI
            let direction
            if (dx > 0 && Math.abs(angle) < this.opts.swipeRightAngle) {
                direction = 'Right'
            }
            if (dx < 0 && Math.abs(angle) < this.opts.swipeLeftAngle) {
                direction = 'Left'
            }
            if (dy > 0 && Math.abs(angle) > (90 - this.opts.swipeDownAngle)) {
                direction = 'Down'
            }
            if (dy < 0 && Math.abs(angle) > (90 - this.opts.swipeUpAngle)) {
                direction = 'Up'
            }
            if (((direction == 'Left' || direction == 'Right') && Math.abs(dx) > this.opts.swipeMinX) || ((direction == 'Up' || direction == 'Down') && Math.abs(dy) > this.opts.swipeMinY)) {
                this.target.trigger('swipe' + direction, { type: 'swipe' + direction, ...this.startTouchInfo })
                if (this.opts.debug) {
                    console.debug('swipe' + direction, { type: 'swipe' + direction, ...this.startTouchInfo })
                }
            }
        }
    }
    onTouchCancel({ touches, changedTouches, timestamp = Date.now(), type = 'touchcancel' }) {
        this.target.trigger('touchcancel', { touches, changedTouches, timestamp, type })
        this.cancelLongPress()
    }
}