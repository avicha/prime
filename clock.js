export default class Clock {
    constructor(autoStart) {
        //开始时间
        this._startTime = 0
        //上一刻时间
        this._oldTime = 0
        //一共逝去时间
        this._elapsedTime = 0
        //时钟是否在运行
        this._running = false
        if (autoStart) {
            this.start()
        }
    }
    //开始计时
    start() {
        this._startTime = Date.now()
        this._oldTime = this._startTime
        this._running = true
    }
    //重新开始计时
    restart() {
        this._elapsedTime = 0
        this.start()
    }
    //停止计时
    stop() {
        this._running = false
    }
    //更新下一个时刻
    step() {
        let delta = 0
        const current = Date.now()
        if (this._running) {
            delta = current - this._oldTime
            this._oldTime = current
            this._elapsedTime += delta
        }
        return delta
    }
    //获取逝去时间
    getElapsedTime() {
        return this._elapsedTime
    }
}