import Adapter from './adapter';

export default class Texture {
    constructor(path, rows = 1, columns = 1, sizeWidth, sizeHeight) {
        this.path = path;
        this.rows = rows;
        this.columns = columns;
        this.sizeWidth = sizeWidth;
        this.sizeHeight = sizeHeight;
        this.loaded = false;
    }
    //加载图片
    load(callback) {
        if (!this.loaded) {
            this.image = Adapter.createImage();
            this.image.onload = () => {
                this.onload(callback);
            };
            this.image.src = this.path;
        } else {
            this.onload(callback);
        }
        return this;
    }
    //重新加载图片
    reload(callback) {
        this.loaded = false;
        this.load(callback);
    }
    //加载完成回调函数
    onload(callback) {
        this.loaded = true;
        this.canvas = Adapter.createCanvas();
        this.canvas.width = this.width = this.image.width;
        this.canvas.height = this.height = this.image.height;
        this.context = this.canvas.getContext('2d');
        this.context.drawImage(this.image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
        this.tileWidth = this.width / this.columns;
        this.tileHeight = this.height / this.rows;
        //sizeWidth，sizeHeight为实际描绘的大小，不设置则默认为图片格点的大小
        if (this.sizeWidth == undefined) {
            this.sizeWidth = this.tileWidth;
        }
        if (this.sizeHeight == undefined) {
            this.sizeHeight = this.tileHeight;
        }
        callback(null);
    }
    //描绘图片某个格点到某个位置
    drawTile(ctx, targetX, targetY, tile = 0) {
        if (this.loaded) {
            const sourceX = (tile % this.columns) * this.tileWidth;
            const sourceY = parseInt(tile / this.columns) * this.tileHeight;
            ctx.drawImage(
                this.canvas,
                sourceX,
                sourceY,
                this.tileWidth,
                this.tileHeight,
                ~~targetX,
                ~~targetY,
                this.sizeWidth,
                this.sizeHeight
            );
        } else {
            throw new Error('请先加载纹理资源' + this.path);
        }
    }
}
