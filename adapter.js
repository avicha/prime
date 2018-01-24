const is_weixin_minigame = (typeof wx != 'undefined') && !!wx.createCanvas
const is_weixin_miniprogram = (typeof wx != 'undefined') && !!wx.createSelectorQuery

let platform = 'unknown'
if (is_weixin_minigame) {
    platform = 'weixin_minigame'
} else {
    if (is_weixin_miniprogram) {
        platform = 'weixin_miniprogram'
    } else {
        const is_weixin_browser = /MicroMessenger/i.test(window.navigator && window.navigator.userAgent)
        const is_mobile_browser = /Mobile/i.test(window.navigator && window.navigator.userAgent)
        const is_web_browser = !!window.navigator.userAgent
        if (is_weixin_browser) {
            platform = 'weixin_web'
        } else {
            if (is_mobile_browser) {
                platform = 'mobile_web'
            } else {
                if (is_web_browser) {
                    platform = 'pc_web'
                }
            }
        }
    }
}


export default class Adapter {
    static platform = platform
    static setPlatform(platform) {
        Adapter.platform = platform
    }
    static createCanvas(isAppendToBody) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.createCanvas()
            default:
                let canvas = document.createElement('canvas')
                if (isAppendToBody) {
                    document.body.appendChild(canvas)
                }
                return canvas
        }
    }
    static createAudio() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.createInnerAudioContext()
            default:
                let audio = new Audio()
                return audio
        }
    }
    static createImage() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.createImage()
            default:
                let image = new Image()
                return image
        }
    }
    static setPreferredFramesPerSecond(fps) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.setPreferredFramesPerSecond(fps)
            default:
                if (fps != 60) {
                    Adapter.requestAnimationFrame = (fn) => { window.setTimeout(fn, 1000 / fps) }
                }
                return
        }
    }
    static requestAnimationFrame(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return requestAnimationFrame(...args)
            default:
                requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame
                return requestAnimationFrame(...args)
        }
    }
    static cancelAnimationFrame(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return cancelAnimationFrame(...args)
            default:
                cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame
                return cancelAnimationFrame(...args)
        }
    }
    static setTimeout(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return setTimeout(...args)
            default:
                return window.setTimeout(...args)
        }
    }
    static clearTimeout(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return clearTimeout(...args)
            default:
                return window.clearTimeout(...args)
        }
    }
    static setInterval(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return setInterval(...args)
            default:
                return window.setInterval(...args)
        }
    }
    static clearInterval(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return clearInterval(...args)
            default:
                return window.clearInterval(...args)
        }
    }
    static onTouchStart(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onTouchStart(callback)
                break
            default:
                let dom = document.getElementsByTagName('canvas') ? document.getElementsByTagName('canvas')[0] : window
                dom.addEventListener('touchstart', callback)
                break
        }
    }
    static onTouchMove(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onTouchMove(callback)
                break
            default:
                let dom = document.getElementsByTagName('canvas') ? document.getElementsByTagName('canvas')[0] : window
                dom.addEventListener('touchmove', (e) => {
                    e.preventDefault()
                    callback(e)
                })
                break
        }
    }
    static onTouchEnd(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onTouchEnd(callback)
                break
            default:
                let dom = document.getElementsByTagName('canvas') ? document.getElementsByTagName('canvas')[0] : window
                dom.addEventListener('touchend', callback)
                break
        }
    }
    static onTouchCancel(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onTouchCancel(callback)
                break
            default:
                let dom = document.getElementsByTagName('canvas') ? document.getElementsByTagName('canvas')[0] : window
                dom.addEventListener('touchcancel', callback)
                break
        }
    }
    static onError(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.onError(callback)
                break
            default:
                window.onerror = (msg, url, line, col, err) => {
                    callback({ message: msg, stack: err && err.stack })
                }
                break
        }
    }
    static onAudioCanplay(audio, callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                audio.onCanplay(callback)
                break
            default:
                audio.addEventListener('canplay', callback)
                break
        }
    }
    static seekAudio(audio, position) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                audio.seek(position)
                break
            default:
                audio.currentTime = position
                break
        }
    }
    static getTextLineHeight({
        fontStyle,
        fontWeight,
        fontSize,
        fontFamily,
        text
    }) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.getTextLineHeight({
                    fontStyle,
                    fontWeight,
                    fontSize,
                    fontFamily,
                    text
                })
            default:
                return fontSize
        }
    }
    static getDisplayInfo() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                let { screenWidth, screenHeight, windowWidth, windowHeight, pixelRatio } = wx.getSystemInfoSync()
                return { screenWidth, screenHeight, windowWidth, windowHeight, pixelRatio }
            default:
                return {
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    pixelRatio: window.devicePixelRatio
                }
        }
    }
    static triggerGC() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.triggerGC()
                break
        }
    }
    static setEnableDebug(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.setEnableDebug(...args)
                break
        }
    }
}