import GameObject from '../game_object';
import Rectangle from '../rectangle';
import Adapter from '../adapter';

export default class Text extends GameObject {
    static ALIGN = {
        LEFT: 'left',
        CENTER: 'center',
        RIGHT: 'right',
    };
    static VALIGN = {
        BOTTOM: 'bottom',
        TOP: 'top',
        MIDDLE: 'middle',
    };
    constructor(
        x,
        y,
        z,
        {
            text = '',
            isStroke = false,
            align = Text.ALIGN.LEFT,
            valign = Text.VALIGN.TOP,
            fontSize = 16,
            lineHeight = 0,
            fontFamily = 'Arial',
            fontVariant = 'normal',
            fontWeight = 'normal',
            fontStyle = 'normal',
            fontColor = '#000',
            ...rest
        }
    ) {
        const opts = {
            text,
            isStroke,
            align,
            valign,
            fontSize,
            lineHeight,
            fontFamily,
            fontVariant,
            fontWeight,
            fontStyle,
            fontColor,
            ...rest,
        };
        super(x, y, z, opts);
        this.alignX = x;
        this.valignY = y;
        this.texts = this.text.split('\n');
        this.canvas = Adapter.createCanvas();
        this.context = this.canvas.getContext('2d');
        const _lineHeight = Adapter.getTextLineHeight({
            fontStyle,
            fontWeight,
            fontSize,
            fontFamily,
            text,
        });
        if (!this.lineHeight) {
            this.lineHeight = _lineHeight;
        }
        this.font = `${this.fontStyle} ${this.fontVariant} ${this.fontWeight} ${this.fontSize}px/${this.lineHeight}px ${this.fontFamily}`;
        this.drawText();
    }
    setText(text) {
        this.text = text;
        this.texts = this.text.split('\n');
        this.drawText();
        return this;
    }
    drawText() {
        let longestText = '',
            longestLength = 0;
        for (let text of this.texts) {
            if (text.length > longestLength) {
                longestText = text;
                longestLength = text.length;
            }
        }
        this.context.textAlign = Text.ALIGN.LEFT;
        this.context.textBaseline = Text.VALIGN.TOP;
        this.context.font = this.font;
        if (this.isStroke) {
            this.context.strokeStyle = this.fontColor;
        } else {
            this.context.fillStyle = this.fontColor;
        }
        const textWidth = this.context.measureText(longestText).width;
        const textHeight = this.lineHeight * this.texts.length;
        this.canvas.width = this.width || textWidth;
        this.canvas.height = this.height || textHeight;
        const offsetLeft = (this.canvas.width - textWidth) / 2;
        const offsetTop = (this.canvas.height - textHeight) / 2 + (this.lineHeight - this.fontSize) / 2;
        this.shape = new Rectangle(0, 0, this.canvas.width, this.canvas.height);
        this.context = this.canvas.getContext('2d');
        this.context.textAlign = Text.ALIGN.LEFT;
        this.context.textBaseline = Text.VALIGN.TOP;
        this.context.font = this.font;
        if (this.isStroke) {
            this.context.strokeStyle = this.fontColor;
        } else {
            this.context.fillStyle = this.fontColor;
        }
        this.texts.forEach((text, i) => {
            if (this.isStroke) {
                this.context.strokeText(text, offsetLeft, i * this.lineHeight + offsetTop);
            } else {
                this.context.fillText(text, offsetLeft, i * this.lineHeight + offsetTop);
            }
        });
        switch (this.align) {
            case Text.ALIGN.LEFT:
                this._position.x = this.alignX;
                break;
            case Text.ALIGN.CENTER:
                this._position.x = this.alignX - this.canvas.width / 2;
                break;
            case Text.ALIGN.RIGHT:
                this._position.x = this.alignX - this.canvas.width;
                break;
        }
        switch (this.valign) {
            case Text.VALIGN.TOP:
                this._position.y = this.valignY;
                break;
            case Text.VALIGN.MIDDLE:
                this._position.y = this.valignY - this.canvas.height / 2;
                break;
            case Text.VALIGN.BOTTOM:
                this._position.y = this.valignY - this.canvas.height;
                break;
        }
    }
    draw(ctx) {
        ctx.save();
        if (this.alpha != 1) {
            ctx.globalAlpha = this.alpha;
        }
        if (this.angle || this.scale.x !== 1 || this.scale.y !== 1) {
            ctx.translate(this.position.x + this.canvas.width / 2, this.position.y + this.canvas.height / 2);
            ctx.rotate(this.angle);
            ctx.scale(this.scale.x, this.scale.y);
            ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
            ctx.drawImage(this.canvas, 0, 0);
        } else {
            ctx.drawImage(this.canvas, ~~this.position.x, ~~this.position.y);
        }
        ctx.restore();
    }
}
