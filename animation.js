import Clock from './clock'

export default class Animation {
    constructor(texture, frames = [0], delay = 1000 / 60) {
        this.texture = texture
        this.frames = frames
        this.delay = delay
        this.isLoop = true
        this.currentFrame = 0
        this.tile = this.frames[0]
        this.timer = new Clock(false)
    }
    //播放
    play(loopCount = 0, callback = () => {}) {
        this.loopCount = loopCount
        if (!this.loopCount) {
            this.isLoop = true
        } else {
            this.isLoop = false
        }
        this.isPlaying = true
        this.ended = false
        this.callback = callback
        this.timer.start()
    }
    //暂停播放
    stop() {
        this.isPlaying = false
        this.timer.stop()
    }
    //继续开始
    resume() {
        this.isPlaying = true
        this.timer.start()
    }
    //跳转到第f帧
    gotoFrame(f) {
        this.timer.elapsedTime += (f - this.currentFrame) * this.delay
        this.update()
    }
    //下一帧
    next() {
        ++this.currentFrame
        this.tile = this.frames[this.currentFrame]
        this.timer.elapsedTime += this.delay
    }
    //重置动画
    rewind(loopCount, callback) {
        this.timer.restart()
        this.currentFrame = 0
        this.tile = this.frames[0]
        this.play(loopCount, callback)
    }
    //更新下一帧
    update() {
        if (this.isPlaying && !this.ended) {
            this.timer.step()
            //该播放第几帧
            const frameTotal = Math.floor(this.timer.getElapsedTime() / this.delay)
            //播放次数
            const count = Math.floor(frameTotal / this.frames.length)
            //如果无限次播放或者未达到播放循环次数，则播放下一帧，否则停留在最后一帧
            if (this.isLoop || count < this.loopCount) {
                this.currentFrame = frameTotal % this.frames.length
            } else {
                this.currentFrame = this.frames.length - 1
                this.isPlaying = false
                this.ended = true
                //执行回调函数
                if (this.callback) {
                    this.callback()
                }
            }
            //设置播放的格位
            this.tile = this.frames[this.currentFrame]
        }
    }
    draw(ctx, targetX, targetY) {
        this.texture.drawTile(ctx, targetX, targetY, this.tile)
    }
}