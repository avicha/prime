import EventListener from './event_listener'
export default class Scene extends EventListener {
    constructor() {
        super()
        this._entities = []
    }
    static getResources() {
        return []
    }
    getEntities() {
        return this._entities
    }
    addGameObject(gameObject) {
        this._entities.push(gameObject)
        gameObject.on('died', () => {
            this.removeGameObject(gameObject)
        })
        this._entities.sort((a, b) => {
            return a.z - b.z
        })
        return gameObject
    }
    removeGameObject(gameObject) {
        let index = this._entities.indexOf(gameObject)
        this._entities.splice(index, 1)
        return gameObject
    }
    release() {
        for (let entity of this._entities) {
            entity.kill()
        }
    }
    update(dt) {
        for (let entity of this._entities) {
            if (entity.update) {
                entity.update(dt)
            }
        }
        return this
    }
    draw(ctx) {
        for (let entity of this._entities) {
            if (entity.draw) {
                ctx.save()
                //描绘之前，操作画布
                if (entity.alpha != 1) {
                    ctx.globalAlpha = entity.alpha
                }
                if (entity.angle) {
                    ctx.rotate(entity.angle)
                }
                if (entity.scale.x != 1 || entity.scale.y != 1) {
                    ctx.scale(entity.scale.x, entity.scale.y)
                }
                entity.draw(ctx)
                //描绘之后恢复画布
                ctx.restore()
                if (entity.alpha != 1) {
                    ctx.globalAlpha = 1
                }
            }
        }
    }
}