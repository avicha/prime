import Vector2 from './vector2'
export default class Rectangle {
    constructor(left = 0, top = 0, width = 0, height = 0) {
        this.left = left
        this.top = top
        this.width = width
        this.height = height
        this.right = left + width
        this.bottom = top + height
        this.pivot = new Vector2(left + width / 2, top + height / 2)
    }
    //重新调整矩形的大小
    resize() {
        this.width = this.right - this.left
        this.height = this.bottom - this.top
        this.pivot.set(this.left + this.width / 2, this.top + this.height / 2)
    }
    //设置图片的上下左右
    set(left, top, right, bottom) {
        this.left = left
        this.top = top
        this.right = right
        this.bottom = bottom
        this.resize()
    }
    //长方形增大v的大小
    inflate(v) {
        this.left -= v
        this.top -= v
        this.right += v
        this.bottom += v
        this.resize()
    }
    //返回相对于某一点的矩形
    relativeTo(point) {
        return new Rectangle(this.left + point.x, this.top + point.y, this.width, this.height)
    }
    containsWithPoint(point) {
        return point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom
    }
    intersectsWith(rectangle) {
        return rectangle.right >= this.left && rectangle.left <= this.right && rectangle.top <= this.bottom && rectangle.bottom >= this.top
    }
    draw(context, isFill = true) {
        if (isFill) {
            context.fillRect(this.left, this.top, this.width, this.height)
        }
    }
    clone() {
        return new Rectangle(this.left, this.top, this.width, this.height)
    }
}