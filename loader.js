import EventListener from './event_listener'
export default class Loader extends EventListener {
    constructor() {
        super()
        this._resources = []
        this.loaded = 0
        this.sum = 0
    }
    addResources(resources) {
        for (let resource of resources) {
            this._resources.push(resource)
        }
    }
    load() {
        this.sum = this._resources.length
        if (this.sum) {
            for (let resource of this._resources) {
                resource.load(err => {
                    if (!err) {
                        this.loaded++
                            this.trigger('progressUpdate', this.loaded / this.sum)
                        if (this.loaded === this.sum) {
                            this.trigger('progressComplete')
                        }
                    } else {
                        this.trigger('progressError', err);
                    }
                })
            }
        } else {
            this.trigger('progressComplete')
        }
    }
}