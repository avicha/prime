import Text from './text'
import Rectangle from '../rectangle'
import Adapter from '../adapter'

export default class Button extends Text {
    constructor(...args) {
        super(...args)
        if (!this.width) {
            this.width = this.shape.width
        }
        if (!this.height) {
            this.height = this.shape.height
        }
        this.position.addSelf((this.canvas.width - this.width) / 2, (this.canvas.height - this.height) / 2)
        this.shape = new Rectangle(0, 0, this.width, this.height)
    }
    draw(ctx) {
        if (this.borderColor) {
            if (this.isFilled) {
                ctx.fillStyle = this.borderColor
                ctx.fillRect(this.position.x, this.position.y, this.shape.width, this.shape.height)
            } else {
                ctx.strokeStyle = this.borderColor
                ctx.lineWidth = this.borderWidth || 2
                ctx.strokeRect(this.position.x, this.position.y, this.shape.width, this.shape.height)
            }
        }
        ctx.drawImage(this.canvas, this.position.x + (this.width - this.canvas.width) / 2, this.position.y + (this.height - this.canvas.height) / 2)
    }
}