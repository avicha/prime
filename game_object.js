import Vector2 from './vector2'
import EventListener from './event_listener'
export default class GameObject extends EventListener {
    constructor(x, y, z, opts = {}) {
        super()
        //父组件
        this.parent = null
        //创建时间
        this.createdTime = Date.now()
        //是否可见
        this.visible = true
        //位置
        this._position = new Vector2(x, y)
        this.position = new Vector2(x, y)
        //相对对象的位置
        this.relative = null
        //相对方向
        this.fixed = null
        //层次
        this.z = z
        //速度
        this.speed = new Vector2(0, 0)
        //加速度
        this.acceleration = new Vector2(0, 0)
        //是否死亡，是则移除
        this.died = false
        //是否静态的，是则停止自动更新速度和位置
        this.silent = false
        //是否可触摸的，否则不参与touch事件
        this.touchable = true
        //透明度
        this.alpha = 1
        //旋转角度
        this.angle = 0
        //缩放比例
        this.scale = new Vector2(1, 1)
        Object.assign(this, opts)
        this._updatePosition()
    }
    //结束精灵生命周期
    kill() {
        this.died = true
        this.trigger('died')
        return this
    }
    setPosition() {
        this._position.set(arguments)
    }
    setPositionX(x) {
        this._position.x = x
    }
    setPositionY(y) {
        this._position.y = y
    }
    _updatePosition() {
        if (this.relative && this.relative.shape) {
            switch (this.fixed) {
                case 'top-left':
                    this.position.set(this.relative.shape.left + this._position.x, this.relative.shape.top + this._position.y)
                    break
                case 'top-center':
                    this.position.set(this.relative.shape.pivot.x + this._position.x, this.relative.shape.top + this._position.y)
                    break
                case 'top-right':
                    this.position.set(this.relative.shape.right + this._position.x, this.relative.shape.top + this._position.y)
                    break
                case 'middle-left':
                    this.position.set(this.relative.shape.left + this._position.x, this.relative.shape.pivot.y + this._position.y)
                    break
                case 'middle-center':
                    this.position.set(this.relative.shape.pivot.x + this._position.x, this.relative.shape.pivot.y + this._position.y)
                    break
                case 'middle-right':
                    this.position.set(this.relative.shape.right + this._position.x, this.relative.shape.pivot.y + this._position.y)
                    break
                case 'bottom-left':
                    this.position.set(this.relative.shape.left + this._position.x, this.relative.shape.bottom + this._position.y)
                    break
                case 'bottom-center':
                    this.position.set(this.relative.shape.pivot.x + this._position.x, this.relative.shape.bottom + this._position.y)
                    break
                case 'bottom-right':
                    this.position.set(this.relative.shape.right + this._position.x, this.relative.shape.bottom + this._position.y)
                    break
                case 'top':
                    this.position.set(this._position.x, this.relative.shape.top + this._position.y)
                    break
                case 'bottom':
                    this.position.set(this._position.x, this.relative.shape.bottom + this._position.y)
                    break
                case 'left':
                    this.position.set(this.relative.shape.left + this._position.x, this._position.y)
                    break
                case 'right':
                    this.position.set(this.relative.shape.right + this._position.x, this._position.y)
                    break
                case 'center':
                    this.position.set(this.relative.shape.pivot.x + this._position.x, this._position.y)
                    break
                case 'middle':
                    this.position.set(this._position.x, this.relative.shape.pivot.y + this._position.y)
                    break
                default:
                    this.position.set(this.relative.shape.left + this._position.x, this.relative.shape.top + this._position.y)
                    break
            }
        } else {
            this.position.set(this._position)
        }
    }
    update(dt) {
        if (!this.silent) {
            //根据当前位置和加速度，速度更新精灵的位置，更新动画帧
            this.speed.addSelf(this.acceleration.multiply(dt))
            this._position.addSelf(this.speed.multiply(dt))
        }
        this._updatePosition()
    }
    draw() {
        throw new Error('你必须为游戏对象定义绘画方法')
    }
}