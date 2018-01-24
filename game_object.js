import Vector2 from './vector2'
import EventListener from './event_listener'
export default class GameObject extends EventListener {
    constructor(x, y, z, opts = {}) {
        super()
        //是否可见
        this.visiable = true
        //位置
        this.position = new Vector2(x, y)
        //层次
        this.z = z
        //速度
        this.speed = new Vector2(0, 0)
        //加速度
        this.acceleration = new Vector2(0, 0)
        //是否死亡，是则移除
        this.died = false
        //透明度
        this.alpha = 1
        //旋转角度
        this.angle = 0
        //缩放比例
        this.scale = new Vector2(1, 1)
        for (let key in opts) {
            this[key] = opts[key]
        }
    }
    //结束精灵生命周期
    kill() {
        this.died = true
        this.trigger('died')
        return this
    }
    update(dt) {
        //根据当前位置和加速度，速度更新精灵的位置，更新动画帧
        this.speed.addSelf(this.acceleration.multiply(dt))
        this.position.addSelf(this.speed.multiply(dt))
    }
    draw() {
        throw new Error('你必须为游戏对象定义绘画方法')
    }
}