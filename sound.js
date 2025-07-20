import Adapter from './adapter';

export default class Sound {
    constructor(path, obeyMuteSwitch = true) {
        this.path = path;
        //声音音量
        this.volume = 1;
        //在 iOS 系统上，默认遵循静音键设置。如果希望在静音时也能播放声音，可以设置 obeyMuteSwitch 为 false
        this.obeyMuteSwitch = obeyMuteSwitch;
        //声音audio
        this.music = null;
        //是否载入
        this.loaded = false;
        //是否在播放
        this.isPlaying = false;
        //是否循环播放
        this.isLoop = false;
        this.duration = 0;
        //是否可以播放这种格式
        this.enabled = true;
    }
    load(callback) {
        if (!this.loaded) {
            this.music = Adapter.createAudio();
            //绑定加载完成事件
            Adapter.onAudioCanplay(this.music, this.path, (err) => {
                if (!this.loaded) {
                    if (!err) {
                        this.onload(callback);
                    } else {
                        callback(err);
                    }
                }
            });
            return this;
        } else {
            this.onload(callback);
        }
    }
    onload(callback) {
        this.loaded = true;
        this.duration = this.music.duration;
        this.music.obeyMuteSwitch = this.obeyMuteSwitch;
        callback(null);
    }
    play(isLoop) {
        if (this.loaded) {
            this.isPlaying = true;
            this.isLoop = isLoop;
            this.music.loop = this.isLoop;
            Adapter.playAudio(this.music);
        } else {
            throw new Error('请先加载音频资源' + this.path);
        }
    }
    //停止
    stop() {
        if (this.loaded && this.isPlaying) {
            Adapter.stopAudio(this.music);
            this.isPlaying = false;
        }
    }
    pause() {
        if (this.loaded && this.isPlaying) {
            Adapter.pauseAudio(this.music);
            this.isPlaying = false;
        }
    }
    replay() {
        if (this.loaded) {
            Adapter.seekAudio(this.music, 0);
            this.play(this.isLoop);
        } else {
            throw new Error('请先加载音频资源' + this.path);
        }
    }
    //调大音量
    turnUp(num = 0.1) {
        if (this.volume < 1) {
            this.volume += num;
            this.volume = Math.min(this.volume, 1);
            this.music.volume = this.volume;
        }
    }
    //减少音量
    turnDown(num = 0.1) {
        if (this.volume > 0) {
            this.volume -= num;
            this.volume = Math.max(this.volume, 0);
            this.music.volume = this.volume;
        }
    }
    mute() {
        this.volume = 0;
        this.music.volume = 0;
    }
    unMute(volume = 1) {
        this.volume = volume;
        this.music.volume = this.volume;
    }
}
