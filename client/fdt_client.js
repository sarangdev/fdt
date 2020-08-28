const fdt = {
    process(event, params, settings = {}) {
        if (this.processing) return
        const path = this.path ? this.path : 'requests'
        this.processing = true
        return new Promise(async (resolve, reject) => {
            const key = Math.random().toString(36).substr(2, 40)
            firebase.database().ref(path).child(key).set({
                event,
                params,
                settings,
                ts: Date.now()
            })
            firebase.database().ref(path).on('child_changed', change => {
                if (change.key !== key) return
                if (change.val().result) {
                    firebase.database().ref(path).child(change.key).remove()
                    this.processing = false
                    resolve(change.val().result, change.key, event, params)
                }
            })
        })
    }
}