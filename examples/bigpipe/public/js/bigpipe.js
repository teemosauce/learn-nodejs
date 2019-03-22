function BigPipe() {
    this.callbacks = {}
}


BigPipe.prototype = {
    ready(key, callback) {
        if (!this.callbacks[key]) {
            this.callbacks[key] = []
        }

        this.callbacks[key].push(callback)
    },

    set(key, data) {
        var callbacks = this.callbacks[key]

        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].call(this, data)
        }
    }
}