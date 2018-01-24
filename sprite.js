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
        if (this.visiable) {
            if (this.currentAnimation) {
                this.currentAnimation.draw(ctx, this.position.x, this.position.y)
            } else {
                if (this.texture) {
                    this.texture.drawTile(ctx, this.position.x, this.position.y, 0)
                }
            }
        }
    }
    //碰撞根据两个精灵的形状检测碰撞
    collideWith(other) {
        if (this.shape && other.shape) {
            return this.shape.relativeTo(this.position).intersectsWith(other.shape.relativeTo(other.position))
        } else {
            throw new Error('请先定义精灵的纹理和碰撞形状')
        }
    }
}