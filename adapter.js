const is_weixin_minigame = typeof wx != 'undefined' && !!wx.createCanvas;
const is_weixin_miniprogram = typeof wx != 'undefined' && !!wx.createSelectorQuery;

let platform = 'unknown';
if (is_weixin_minigame) {
    platform = 'weixin_minigame';
} else {
    if (is_weixin_miniprogram) {
        platform = 'weixin_miniprogram';
    } else {
        const is_weixin_browser = /MicroMessenger/i.test(window.navigator && window.navigator.userAgent);
        const is_mobile_browser = /Mobile/i.test(window.navigator && window.navigator.userAgent);
        const is_web_browser = !!window.navigator.userAgent;
        if (is_weixin_browser) {
            platform = 'weixin_web';
        } else {
            if (is_mobile_browser) {
                platform = 'mobile_web';
            } else {
                if (is_web_browser) {
                    platform = 'pc_web';
                }
            }
        }
    }
}

export default class Adapter {
    static platform = platform;
    static setPlatform(platform) {
        Adapter.platform = platform;
    }
    static resourceBasePath = ['weixin_minigame', 'weixin_miniprogram'].includes(platform) ? '/resources' : '';
    static createCanvas(isAppendToBody) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.createCanvas();
            default:
                const canvas = document.createElement('canvas');
                if (isAppendToBody) {
                    document.body.appendChild(canvas);
                }
                return canvas;
        }
    }
    static createAudio() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.createInnerAudioContext();
            default:
                const audio = new Audio();
                return audio;
        }
    }
    static createImage() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.createImage();
            default:
                const image = new Image();
                return image;
        }
    }
    static setPreferredFramesPerSecond(fps) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.setPreferredFramesPerSecond(fps);
            default:
                if (fps != 60) {
                    Adapter.requestAnimationFrame = (fn) => {
                        window.setTimeout(fn, 1000 / fps);
                    };
                }
                return;
        }
    }
    static requestAnimationFrame(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return requestAnimationFrame(...args);
            default:
                requestAnimationFrame =
                    window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame;
                return requestAnimationFrame(...args);
        }
    }
    static cancelAnimationFrame(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return cancelAnimationFrame(...args);
            default:
                cancelAnimationFrame =
                    window.cancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    window.mozCancelAnimationFrame ||
                    window.oCancelAnimationFrame ||
                    window.msCancelAnimationFrame;
                return cancelAnimationFrame(...args);
        }
    }
    static cancelAnimationFrame(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return cancelAnimationFrame(...args);
            default:
                cancelAnimationFrame =
                    window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
                return cancelAnimationFrame(...args);
        }
    }
    static setTimeout(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return setTimeout(...args);
            default:
                return window.setTimeout(...args);
        }
    }
    static clearTimeout(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return clearTimeout(...args);
            default:
                return window.clearTimeout(...args);
        }
    }
    static setInterval(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return setInterval(...args);
            default:
                return window.setInterval(...args);
        }
    }
    static clearInterval(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return clearInterval(...args);
            default:
                return window.clearInterval(...args);
        }
    }
    static onTouchStart(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onTouchStart(callback);
                break;
            default:
                const dom = document.getElementsByTagName('canvas')
                    ? document.getElementsByTagName('canvas')[0]
                    : window;
                dom.addEventListener('touchstart', callback);
                break;
        }
    }
    static onTouchMove(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onTouchMove(callback);
                break;
            default:
                const dom = document.getElementsByTagName('canvas')
                    ? document.getElementsByTagName('canvas')[0]
                    : window;
                dom.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    callback(e);
                });
                break;
        }
    }
    static onTouchEnd(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onTouchEnd(callback);
                break;
            default:
                const dom = document.getElementsByTagName('canvas')
                    ? document.getElementsByTagName('canvas')[0]
                    : window;
                dom.addEventListener('touchend', callback);
                break;
        }
    }
    static onTouchCancel(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onTouchCancel(callback);
                break;
            default:
                const dom = document.getElementsByTagName('canvas')
                    ? document.getElementsByTagName('canvas')[0]
                    : window;
                dom.addEventListener('touchcancel', callback);
                break;
        }
    }
    static onError(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.onError(callback);
                break;
            default:
                window.onerror = (msg, url, line, col, err) => {
                    callback({
                        message: msg,
                        stack: err && err.stack,
                    });
                };
                break;
        }
    }
    static onWindowResize(callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.onWindowResize(callback);
                break;
            default:
                window.addEventListener('resize', () => {
                    callback({
                        windowWidth: Math.max(window.innerWidth, document.documentElement.clientWidth),
                        windowHeight: Math.max(window.innerHeight, document.documentElement.clientHeight),
                    });
                });
                break;
        }
    }
    static onAudioCanplay(audio, src, callback) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                audio.onCanplay(() => {
                    callback(null);
                });
                audio.src = src;
                break;
            default:
                const URL = window.URL || window.webkitURL;
                if (URL && window.location.origin != 'file://') {
                    //绑定加载完成事件
                    const xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            const url = URL.createObjectURL(this.response);
                            audio.src = url;
                            callback(null);
                        }
                    };
                    xhr.onerror = (e) => {
                        callback(e);
                    };
                    xhr.open('GET', src);
                    xhr.responseType = 'blob';
                    xhr.send();
                } else {
                    audio.addEventListener('canplaythrough', (e) => {
                        callback(null);
                    });
                    audio.src = src;
                }
                break;
        }
    }
    static playAudio(audio) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                audio.play();
                break;
            case 'weixin_web':
                wx.getNetworkType({
                    complete(res) {
                        audio.play();
                    },
                });
            default:
                audio.play();
                break;
        }
    }
    static seekAudio(audio, position) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                audio.seek(position);
                break;
            default:
                audio.currentTime = position;
                break;
        }
    }
    static stopAudio(audio) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                audio.stop();
                break;
            default:
                audio.currentTime = 0;
                audio.pause();
                break;
        }
    }
    static pauseAudio(audio) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                audio.pause();
                break;
            default:
                audio.pause();
                break;
        }
    }
    static setStorage(key, data) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.setStorageSync(key, data);
                break;
            default:
                localStorage.setItem(key, JSON.stringify(data));
                break;
        }
    }
    static getStorage(key, defaultValue) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.getStorageSync(key) || defaultValue;
            default:
                return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : defaultValue;
        }
    }
    static removeStorage(key) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.removeStorageSync(key);
            default:
                return localStorage.removeItem(key);
        }
    }
    static clearStorage() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.clearStorageSync();
            default:
                return localStorage.clear();
        }
    }
    static getAllStorage() {
        const obj = {};
        switch (Adapter.platform) {
            case 'weixin_minigame':
                const storageInfo = wx.getStorageInfoSync();
                storageInfo.keys.forEach((key) => {
                    obj[key] = wx.getStorageSync(key);
                });
                return obj;
            default:
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    obj[key] = localStorage.getItem(key);
                }
                return obj;
        }
    }
    static getTextLineHeight({ fontStyle, fontWeight, fontSize, fontFamily, text }) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                return wx.getTextLineHeight({
                    fontStyle,
                    fontWeight,
                    fontSize,
                    fontFamily,
                    text,
                });
            default:
                return fontSize;
        }
    }
    static getDisplayInfo() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                const { screenWidth, screenHeight, windowWidth, windowHeight, pixelRatio } = wx.getSystemInfoSync();
                return {
                    screenWidth,
                    screenHeight,
                    windowWidth,
                    windowHeight,
                    pixelRatio,
                };
            default:
                return {
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    windowWidth: Math.max(window.innerWidth, document.documentElement.clientWidth),
                    windowHeight: Math.max(window.innerHeight, document.documentElement.clientHeight),
                    pixelRatio: window.devicePixelRatio,
                };
        }
    }
    static triggerGC() {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.triggerGC();
                break;
        }
    }
    static setEnableDebug(...args) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.setEnableDebug(...args);
                break;
        }
    }
    static alert({ title, content, callback }) {
        switch (Adapter.platform) {
            case 'weixin_minigame':
                wx.showModal({
                    title,
                    content,
                    showCancel: false,
                    cancelText: '取消',
                    confirmText: '确定',
                    success(res) {
                        if (res.confirm && callback) {
                            callback();
                        }
                    },
                });
                break;
            default:
                window.alert(content);
                if (callback) {
                    callback();
                }
                break;
        }
    }
}
