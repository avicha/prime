export default class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }
    set() {
        if (arguments[0] instanceof Vector2) {
            this.x = arguments[0].x
            this.y = arguments[0].y
        } else {
            if (arguments.length == 2) {
                this.x = arguments[0]
                this.y = arguments[1]
            }
        }
        return this
    }
    add() {
        if (arguments[0] instanceof Vector2) {
            return new Vector2(this.x + arguments[0].x, this.y + arguments[0].y)
        } else {
            if (arguments.length == 2) {
                return new Vector2(this.x + arguments[0], this.y + arguments[1])
            }
        }
        return this
    }
    addSelf() {
        if (arguments[0] instanceof Vector2) {
            this.x += arguments[0].x
            this.y += arguments[0].y
        } else {
            if (arguments.length == 2) {
                this.x += arguments[0]
                this.y += arguments[1]
            }
        }
        return this
    }
    sub() {
        if (arguments[0] instanceof Vector2) {
            return new Vector2(this.x - arguments[0].x, this.y - arguments[0].y)
        } else {
            if (arguments.length == 2) {
                return new Vector2(this.x - arguments[0], this.y - arguments[1])
            }
        }
        return this
    }
    subSelf() {
        if (arguments[0] instanceof Vector2) {
            this.x -= arguments[0].x
            this.y -= arguments[0].y
        } else {
            if (arguments.length == 2) {
                this.x -= arguments[0]
                this.y -= arguments[1]
            }
        }
        return this
    }
    scale() {
        if (arguments[0] instanceof Vector2) {
            return new Vector2(this.x * arguments[0].x, this.y * arguments[0].y)
        } else {
            if (arguments.length == 2) {
                return new Vector2(this.x * arguments[0], this.y * arguments[1])
            }
        }
        return this
    }
    //乘以一个倍数
    multiply(s) {
        return new Vector2(this.x * s, this.y * s)
    }
    multiplySelf(s) {
        this.x *= s
        this.y *= s
        return this
    }
    //除以一个倍数
    divide(s) {
        return new Vector2(this.x / s, this.y / s)
    }
    divideSelf(s) {
        this.x /= s
        this.y /= s
        return this
    }
    //判断两个向量是否相等
    equals(v) {
        return (v.x === this.x) && (v.y === this.y)
    }
    //距离的平方
    distanceToSquared(v) {
        let dx = this.x - v.x,
            dy = this.y - v.y
        return dx * dx + dy * dy
    }
    distanceTo(v) {
        return Math.sqrt(this.distanceToSquared(v))
    }
    relativeTo(point) {
        return this.add(point)
    }
    clone() {
        return new Vector2(this.x, this.y)
    }
}