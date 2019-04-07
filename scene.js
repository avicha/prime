import EventListener from './event_listener'
export default class Scene extends EventListener {
    constructor(game) {
        super()
        this.shape = game.renderStageZone
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
        if (!gameObject.relative && gameObject.fixed) {
            gameObject.relative = this
        }
        gameObject._updatePosition()
        gameObject.on('died', () => {
            this.removeGameObject(gameObject)
        })
        this.sortGameObject()
        return gameObject
    }
    removeGameObject(gameObject) {
        const index = this._entities.indexOf(gameObject)
        this._entities.splice(index, 1)
        return gameObject
    }
    changeGameObjectZ(gameObject, z) {
        gameObject.z = z
        this.sortGameObject()
    }
    sortGameObject() {
        this._entities.sort((a, b) => {
            return a.z * a.createdTime - b.z * b.createdTime
        })
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
            if (entity.draw && entity.visible) {
                entity.draw(ctx)
            }
        }
    }
}