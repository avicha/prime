import GameObject from './game_object'
import Rectangle from './rectangle'
import Animation from './animation'

export default class Sprite extends GameObject {
    constructor(...args) {
        super(...args)
        this.animations = {}
        this.currentAnimation = null
        if (!this.shape && this.texture) {
            this.shape = new Rectangle(0, 0, this.texture.sizeWidth, this.texture.sizeHeight)
        }
    }
    setTexture(texture) {
        this.texture = texture
        if (!this.shape && this.texture) {
            this.shape = new Rectangle(0, 0, this.texture.sizeWidth, this.texture.sizeHeight)
        }
    }
    //添加动作为action的动画，帧序列和时间间隔
    addAnimation(action, frames, delay) {
        if (!this.texture) {
            throw new Error('你还没有为此精灵定义纹理呢！')
        }
        let a = new Animation(this.texture, frames, delay)
        this.animations[action] = a
        return this
    }
    //设置当前播放的动画，设置播放次数，播放完毕后回调函数
    setCurrentAnim(action, loopCount, callback) {
        if (!this.animations[action]) {
            throw new Error(`不存在名字为${action}的动画`)
        } else {
            this.currentAnimation = this.animations[action]
            this.currentAnimation.play(loopCount, callback)
        }
    }
    update(dt) {
        super.update(dt)
        if (this.currentAnimation) {
            this.currentAnimation.update()
        }
    }
    draw(ctx) {
        ctx.save()
        if (this.alpha != 1) {
            ctx.globalAlpha = this.alpha
        }
        if (this.currentAnimation) {
            this.currentAnimation.draw(ctx, this.position.x, this.position.y)
        } else {
            if (this.texture) {
                if (this.angle || this.scale.x !== 1 || this.scale.y !== 1) {
                    ctx.translate(this.position.x + this.texture.sizeWidth / 2, this.position.y + this.texture.sizeHeight / 2)
                    ctx.rotate(this.angle)
                    ctx.scale(this.scale.x, this.scale.y)
                    ctx.translate(-this.texture.sizeWidth / 2, -this.texture.sizeHeight / 2)
                    this.texture.drawTile(ctx, 0, 0, this.tile || 0)
                } else {
                    this.texture.drawTile(ctx, this.position.x, this.position.y, this.tile || 0)
                }
            } else {
                if (this.canvas) {
                    if (this.angle || this.scale.x !== 1 || this.scale.y !== 1) {
                        ctx.translate(this.position.x + this.canvas.width / 2, this.position.y + this.canvas.height / 2)
                        ctx.rotate(this.angle)
                        ctx.scale(this.scale.x, this.scale.y)
                        ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)
                        ctx.drawImage(this.canvas, 0, 0)
                    } else {
                        ctx.drawImage(this.canvas, this.position.x, this.position.y)
                    }
                }
            }
        }
        ctx.restore()
    }
    //碰撞根据两个精灵的形状检测碰撞
    collideWith(other) {
        if (this.shape && other.shape) {
            if (this.z == other.z) {
                return this.shape.relativeTo(this.position).intersectsWith(other.shape.relativeTo(other.position))
            } else {
                return false
            }
        } else {
            throw new Error('请先定义精灵的碰撞形状')
        }
    }
}