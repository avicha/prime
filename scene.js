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
        this.sortGameObject()
        return gameObject
    }
    removeGameObject(gameObject) {
        let index = this._entities.indexOf(gameObject)
        this._entities.splice(index, 1)
        return gameObject
    }
    changeGameObjectZ(gameObject, z) {
        gameObject.z = z
        this.sortGameObject()
    }
    sortGameObject() {
        this._entities.sort((a, b) => {
            if (a.z != b.z) {
                return a.z - b.z
            } else {
                return a.createdTime - b.createdTime
            }
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