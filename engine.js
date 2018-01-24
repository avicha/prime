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
        let event = new Event({ debug: this.opts.debug })
        event.bind(this)
        this.on('longPress', this.handleEvent.bind(this))
        this.on('tap', this.handleEvent.bind(this))
        this.on('doubleTap', this.handleEvent.bind(this))
        this.on('swipeLeft', this.handleEvent.bind(this))
        this.on('swipeRight', this.handleEvent.bind(this))
        this.on('swipeUp', this.handleEvent.bind(this))
        this.on('swipeDown', this.handleEvent.bind(this))
        Adapter.setEnableDebug({ enableDebug: this.opts.debug })
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
            Adapter.onWindowResize(({ windowWidth, windowHeight }) => {
                this.fitScreen()
                if (this.currentScene) {
                    this.currentScene.trigger('resize', { windowWidth, windowHeight })
                }
            })
        }
    }
    fitScreen() {
        let { screenWidth, screenHeight, screenSizeRatio } = this.getDisplayInfo()
        this._canvas.width = this.isCanvasRotate ? screenHeight : screenWidth
        this._canvas.height = this.isCanvasRotate ? screenWidth : screenHeight
        this._context = this._canvas.getContext('2d')
        let stageSizeRatio = this.stageWidth / this.stageHeight
        switch (this.opts.stageScaleMode) {
            case 'contain':
                this.renderStageZone = new Rectangle(0, 0, this.stageWidth, this.stageHeight)
                if (screenSizeRatio < stageSizeRatio) {
                    this.renderScreenZone = new Rectangle(0, Math.round((screenHeight - screenWidth / stageSizeRatio) / 2), screenWidth, Math.round(screenWidth / stageSizeRatio))
                } else {
                    this.renderScreenZone = new Rectangle(Math.round((screenWidth - screenHeight * stageSizeRatio) / 2), 0, screenHeight * stageSizeRatio, screenHeight)
                }
                break
            case 'cover':
                this.renderScreenZone = new Rectangle(0, 0, screenWidth, screenHeight)
                if (screenSizeRatio < stageSizeRatio) {
                    this.renderStageZone = new Rectangle(Math.round((this.stageWidth - this.stageHeight * screenSizeRatio) / 2), 0, Math.round(this.stageHeight * screenSizeRatio), this.stageHeight)
                } else {
                    this.renderStageZone = new Rectangle(0, Math.round((this.stageHeight - this.stageWidth / screenSizeRatio) / 2), this.stageWidth, Math.round(this.stageWidth / screenSizeRatio))
                }
                break
            case 'noScale':
                this.renderScreenZone = new Rectangle(0, 0, Math.min(screenWidth, this.stageWidth), Math.min(screenHeight, this.stageHeight))
                this.renderStageZone = new Rectangle(0, 0, Math.min(screenWidth, this.stageWidth), Math.min(screenHeight, this.stageHeight))
                break
            case 'fill':
                this.renderScreenZone = new Rectangle(0, 0, screenWidth, screenHeight)
                this.renderStageZone = new Rectangle(0, 0, this.stageWidth, this.stageHeight)
                break
            case 'widthFixed':
                this.renderScreenZone = new Rectangle(0, 0, screenWidth, Math.min(screenHeight, Math.round(screenWidth / stageSizeRatio)))
                this.renderStageZone = new Rectangle(0, 0, this.stageWidth, Math.min(this.stageHeight, Math.round(this.stageWidth / screenSizeRatio)))
                break
            case 'heightFixed':
                this.renderScreenZone = new Rectangle(0, 0, Math.min(screenWidth, Math.round(screenHeight * stageSizeRatio)), screenHeight)
                this.renderStageZone = new Rectangle(0, 0, Math.min(this.stageWidth, this.stageHeight * screenSizeRatio), this.stageHeight)
                break
            default:
                throw new Error(`你所选择的屏幕适配模式${this.opts.stageScaleMode}暂不被支持`)
        }
        this.ratio = new Vector2(this.renderScreenZone.width / this.renderStageZone.width, this.renderScreenZone.height / this.renderStageZone.height)
        if (this.opts.debug) {
            console.debug('renderScreenZone', this.renderScreenZone)
            console.debug('renderStageZone', this.renderStageZone)
            console.debug('ratio', this.ratio)
            console.debug('isCanvasRotate', this.isCanvasRotate)
        }
    }
    getDisplayInfo() {
        let { windowWidth, windowHeight } = Adapter.getDisplayInfo()
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
            let { x, y } = e
            let point = this.isCanvasRotate ? new Vector2(y, this._canvas.width - x) : new Vector2(x, y)
            switch (this.opts.stageScaleMode) {
                case 'contain':
                    point.subSelf(this.renderScreenZone.left, this.renderScreenZone.top)
                    point.set(point.x / this.ratio.x, point.y / this.ratio.y)
                    break
                case 'cover':
                    point.set(point.x / this.ratio.x, point.y / this.ratio.y)
                    point.addSelf(this.renderStageZone.left, this.renderStageZone.top)
                    break
                default:
                    point.set(point.x / this.ratio.x, point.y / this.ratio.y)
                    break
            }
            let entities = this.currentScene.getEntities()
            for (let len = entities.length; len; len--) {
                let entity = entities[len - 1]
                if (entity.visiable && entity.shape && entity.shape.relativeTo(entity.position).containsWithPoint(point)) {
                    e.target = entity
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
                let scene = new Scene(this, ...args)
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
        let resources = Scene.getResources()
        if (resources.length) {
            let loader = new Loader()
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
        Adapter.requestAnimationFrame(() => { this.run() })
        if (this.isRunning && this.currentScene) {
            let now = Date.now()
            let dt = this.lastUpdateTime ? now - this.lastUpdateTime : 0
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
            this._context.drawImage(this.canvas, this.renderStageZone.left, this.renderStageZone.top, this.renderStageZone.width, this.renderStageZone.height, this.renderScreenZone.left, this.renderScreenZone.top, this.renderScreenZone.width, this.renderScreenZone.height)
            if (this.isCanvasRotate) {
                this._context.restore()
            }
        }
    }
    start() {
        Adapter.triggerGC()
        if (!this.isRunning) {
            this.isRunning = true
            this.run()
        }
    }
}