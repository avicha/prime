import EventListener from './event_listener'
import Loader from './loader'
import Rectangle from './rectangle'
import Vector2 from './vector2'
import Event from './event'
import Adapter from './adapter'

const defaultConfig = {
    fps: 60,
    orientation: 'portrait',
    canvas: null,
    screenColor: null,
    stageColor: null,
    stageScaleMode: 'contain',
    debug: false
}
export default class Engine extends EventListener {

    constructor(opts = {}) {
        super()
        this.opts = Object.assign({}, defaultConfig, opts)
        this._canvas = this.opts.canvas || Adapter.createCanvas(true)
        this.isRunning = false
        Adapter.setPreferredFramesPerSecond(this.opts.fps)
        const event = new Event({
            debug: this.opts.debug
        })
        event.bind(this)
        this.on('longPress', this.handleEvent.bind(this))
        this.on('tap', this.handleEvent.bind(this))
        this.on('doubleTap', this.handleEvent.bind(this))
        this.on('swipeLeft', this.handleEvent.bind(this))
        this.on('swipeRight', this.handleEvent.bind(this))
        this.on('swipeUp', this.handleEvent.bind(this))
        this.on('swipeDown', this.handleEvent.bind(this))
        this.on('touchstart', this.handleEvent.bind(this))
        this.on('touchmove', this.handleEvent.bind(this))
        this.on('touchend', this.handleEvent.bind(this))
        this.on('touchcancel', this.handleEvent.bind(this))
        Adapter.setEnableDebug({
            enableDebug: this.opts.debug
        })
        if (this.opts.debug) {
            Adapter.onError(e => {
                this.trigger('error', e)
            })
        }
    }
    setStageSize(w, h) {
        if (w && h) {
            this.stageWidth = w
            this.stageHeight = h
            this.canvas = Adapter.createCanvas()
            this.canvas.width = w
            this.canvas.height = h
            this.context = this.canvas.getContext('2d')
            this.fitScreen()
            Adapter.onWindowResize(({
                windowWidth,
                windowHeight
            }) => {
                this.fitScreen()
                if (this.currentScene) {
                    this.currentScene.trigger('resize', {
                        windowWidth,
                        windowHeight
                    })
                }
            })
        }
    }
    fitScreen() {
        const {
            screenWidth,
            screenHeight,
            screenSizeRatio
        } = this.getDisplayInfo()
        this._canvas.style.width = (this.isCanvasRotate ? screenHeight : screenWidth) + 'px'
        this._canvas.style.height = (this.isCanvasRotate ? screenWidth : screenHeight) + 'px'
        this._context = this._canvas.getContext('2d')
        const stageSizeRatio = this.stageWidth / this.stageHeight
        switch (this.opts.stageScaleMode) {
            case 'contain':
                this.renderStageZone = new Rectangle(0, 0, this.stageWidth, this.stageHeight)
                if (screenSizeRatio < stageSizeRatio) {
                    if (this.isCanvasRotate) {
                        this._canvas.width = this.stageWidth / screenSizeRatio
                        this._canvas.height = this.stageWidth
                        this.renderScreenZone = new Rectangle(0, Math.round((this._canvas.width - this.stageHeight) / 2), this.stageWidth, this.stageHeight)
                    } else {
                        this._canvas.width = this.stageWidth
                        this._canvas.height = this.stageWidth / screenSizeRatio
                        this.renderScreenZone = new Rectangle(0, Math.round((this._canvas.height - this.stageHeight) / 2), this.stageWidth, this.stageHeight)
                    }
                    this.ratio = new Vector2(screenWidth / this.stageWidth, screenWidth / this.stageWidth)
                } else {
                    if (this.isCanvasRotate) {
                        this._canvas.width = this.stageHeight
                        this._canvas.height = this.stageHeight * screenSizeRatio
                        this.renderScreenZone = new Rectangle(Math.round((this._canvas.height - this.stageWidth) / 2), 0, this.stageWidth, this.stageHeight)
                    } else {
                        this._canvas.width = this.stageHeight * screenSizeRatio
                        this._canvas.height = this.stageHeight
                        this.renderScreenZone = new Rectangle(Math.round((this._canvas.width - this.stageWidth) / 2), 0, this.stageWidth, this.stageHeight)
                    }
                    this.ratio = new Vector2(screenHeight / this.stageHeight, screenHeight / this.stageHeight)
                }
                break
            case 'cover':
                if (screenSizeRatio < stageSizeRatio) {
                    if (this.isCanvasRotate) {
                        this._canvas.width = this.stageHeight
                        this._canvas.height = this.stageHeight * screenSizeRatio
                        this.renderScreenZone = new Rectangle(Math.round((this._canvas.height - this.stageWidth) / 2), 0, this.stageWidth, this.stageHeight)
                        this.renderStageZone = new Rectangle(Math.round((this.stageWidth - this._canvas.height) / 2), 0, this._canvas.height, this._canvas.width)
                    } else {
                        this._canvas.width = this.stageHeight * screenSizeRatio
                        this._canvas.height = this.stageHeight
                        this.renderScreenZone = new Rectangle(Math.round((this._canvas.width - this.stageWidth) / 2), 0, this.stageWidth, this.stageHeight)
                        this.renderStageZone = new Rectangle(Math.round((this.stageWidth - this._canvas.width) / 2), 0, this._canvas.width, this._canvas.height)
                    }
                    this.ratio = new Vector2(screenHeight / this.stageHeight, screenHeight / this.stageHeight)
                } else {
                    if (this.isCanvasRotate) {
                        this._canvas.width = this.stageWidth / screenSizeRatio
                        this._canvas.height = this.stageWidth
                        this.renderScreenZone = new Rectangle(0, Math.round((this._canvas.width - this.stageHeight) / 2), this.stageWidth, this.stageHeight)
                        this.renderStageZone = new Rectangle(0, Math.round((this.stageHeight - this._canvas.width) / 2), this._canvas.height, this._canvas.width)
                    } else {
                        this._canvas.width = this.stageWidth
                        this._canvas.height = this.stageWidth / screenSizeRatio
                        this.renderScreenZone = new Rectangle(0, Math.round((this._canvas.height - this.stageHeight) / 2), this.stageWidth, this.stageHeight)
                        this.renderStageZone = new Rectangle(0, Math.round((this.stageHeight - this._canvas.height) / 2), this._canvas.width, this._canvas.height)
                    }
                    this.ratio = new Vector2(screenWidth / this.stageWidth, screenWidth / this.stageWidth)
                }
                break
            case 'fill':
                if (this.isCanvasRotate) {
                    this._canvas.width = this.stageHeight
                    this._canvas.height = this.stageWidth
                } else {
                    this._canvas.width = this.stageWidth
                    this._canvas.height = this.stageHeight
                }
                this.ratio = new Vector2(screenWidth / this.stageWidth, screenHeight / this.stageHeight)
                this.renderScreenZone = new Rectangle(0, 0, this.stageWidth, this.stageHeight)
                this.renderStageZone = new Rectangle(0, 0, this.stageWidth, this.stageHeight)
                break
            default:
                throw new Error(`你所选择的屏幕适配模式${this.opts.stageScaleMode}暂不被支持`)
        }
        if (this.opts.debug) {
            console.debug('renderScreenZone', this.renderScreenZone)
            console.debug('renderStageZone', this.renderStageZone)
            console.debug('ratio', this.ratio)
            console.debug('isCanvasRotate', this.isCanvasRotate)
        }
    }
    getDisplayInfo() {
        const {
            windowWidth,
            windowHeight
        } = Adapter.getDisplayInfo()
        if (this.opts.orientation == 'landscape' && windowWidth < windowHeight || this.opts.orientation == 'portrait' && windowWidth > windowHeight) {
            this.isCanvasRotate = true
            return {
                screenWidth: windowHeight,
                screenHeight: windowWidth,
                screenSizeRatio: windowHeight / windowWidth
            }
        } else {
            this.isCanvasRotate = false
            return {
                screenWidth: windowWidth,
                screenHeight: windowHeight,
                screenSizeRatio: windowWidth / windowHeight
            }
        }
    }
    handleEvent(e) {
        if (this.currentScene) {
            const {
                x,
                y
            } = e
            const {
                screenWidth,
                screenHeight
            } = this.getDisplayInfo()
            //点相对于画布的屏幕坐标
            const point = this.isCanvasRotate ? new Vector2(y, screenHeight - x) : new Vector2(x, y)
            //点相对于画布的游戏坐标
            point.set(point.x / this.ratio.x, point.y / this.ratio.y)
            //舞台相对于画布的游戏坐标
            point.subSelf(this.renderScreenZone.left, this.renderScreenZone.top)
            //最终得到的就是点相对于舞台的坐标
            const entities = this.currentScene.getEntities()
            for (let len = entities.length; len; len--) {
                const entity = entities[len - 1]
                if (entity.visible && entity.touchable && entity.shape && entity.shape.relativeTo(entity.position).containsWithPoint(point)) {
                    e.target = entity
                    break
                }
            }
            e.x = ~~point.x
            e.y = ~~point.y
            if (this.isCanvasRotate) {
                switch (e.type) {
                    case 'swipeUp':
                        e.type = 'swipeLeft'
                        break
                    case 'swipeRight':
                        e.type = 'swipeUp'
                        break
                    case 'swipeDown':
                        e.type = 'swipeRight'
                        break
                    case 'swipeLeft':
                        e.type = 'swipeDown'
                        break
                }
            }
            this.currentScene.trigger(e.type, e)
        }
    }
    launch(Scene, ...args) {
        if (this.currentScene) {
            this.currentScene.release()
        }
        this.loadSceneResource(Scene, (err) => {
            if (err) {
                this.trigger('progressError')
            } else {
                this.trigger('progressComplete')
                const scene = new Scene(this, ...args)
                this.currentScene = scene
                this.currentScene.on('switchScene', (nextScene, ...args) => {
                    this.trigger('switchScene', nextScene, ...args)
                })
                this.currentScene.on('pause', () => {
                    this.trigger('pause')
                    this.pause()
                })
                this.currentScene.on('resume', () => {
                    this.trigger('resume')
                    this.resume()
                })
                this.start()
            }
        })
    }
    loadSceneResource(Scene, callback) {
        const resources = Scene.getResources()
        if (resources.length) {
            const loader = new Loader()
            loader.addResources(resources)
            loader.on('progressUpdate', progress => {
                this.trigger('progressUpdate', progress)
            })
            loader.on('progressComplete', () => {
                callback(null)
            })
            loader.on('progressError', (err) => {
                callback(err)
            })
            loader.load()
        } else {
            callback(null)
        }
    }
    run() {
        if (this.isRunning && this.currentScene) {
            this.tick = Adapter.requestAnimationFrame(this.run.bind(this))
            const now = Date.now()
            const dt = this.lastUpdateTime ? now - this.lastUpdateTime : 0
            this.lastUpdateTime = now
            this.currentScene.update(dt / 1000)
            if (this.opts.screenColor) {
                this._context.fillStyle = this.opts.screenColor
                this._context.fillRect(0, 0, this._canvas.width, this._canvas.height)
            } else {
                this._context.clearRect(0, 0, this._canvas.width, this._canvas.height)
            }
            if (this.opts.stageColor) {
                this.context.fillStyle = this.opts.stageColor
                this.context.fillRect(0, 0, this.stageWidth, this.stageHeight)
            } else {
                this.context.clearRect(0, 0, this.stageWidth, this.stageHeight)
            }
            this.currentScene.draw(this.context)
            if (this.isCanvasRotate) {
                this._context.save()
                this._context.translate(this._canvas.width / 2, this._canvas.height / 2)
                this._context.rotate(0.5 * Math.PI)
                this._context.translate(-this._canvas.height / 2, -this._canvas.width / 2)
            }
            this._context.drawImage(this.canvas, 0, 0, this.stageWidth, this.stageHeight, this.renderScreenZone.left, this.renderScreenZone.top, this.renderScreenZone.width, this.renderScreenZone.height)
            if (this.isCanvasRotate) {
                this._context.restore()
            }
        }
    }
    start() {
        Adapter.triggerGC()
        this.isRunning = true
        this.lastUpdateTime = 0
        if (this.tick) {
            Adapter.cancelAnimationFrame(this.tick)
        }
        this.run()
    }
    pause() {
        if (this.isRunning) {
            this.isRunning = false
            Adapter.cancelAnimationFrame(this.tick)
            this.tick = 0
            this.lastUpdateTime = 0
        }
    }
    resume() {
        if (!this.isRunning) {
            this.isRunning = true
            this.lastUpdateTime = 0
            this.run()
        }
    }
}