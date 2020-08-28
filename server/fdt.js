/**
 * Firecloud Data Transmitting
 */
const admin = require('firebase-admin')
require('dotenv').config()
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
module.exports = class {
    path = process.env.FDT_FIREBASE_COLLECTION_NAME
    constructor(onData) {
        this.onData = onData
    }

    start() {
        this.db = this.connect()
        this.subscribe()
    }

    connect() {
        console.info("Connecting")
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_SERVICE_ACCOUNT_URL
        })
        return admin.database()
    }

    subscribe() {
        console.info("Subscribe")
        this.db.ref(this.path).on('child_added', async querySnapshot => {
            if (
                querySnapshot.val().settings && querySnapshot.val().settings.cluster &&
                querySnapshot.val().settings.cluster !== process.env.FDT_CLUSTER
            ) {
                console.info(querySnapshot.key + " invalid cluster " + querySnapshot.val().cluster + ", skip")
                return
            }
            if (querySnapshot.val().processing === true) {
                console.info(querySnapshot.key + " in process, skip")
                return
            }
            this.db.ref(this.path).child(querySnapshot.key).update({
                processing: true
            })
            const res = await this.onData(querySnapshot.val().event, querySnapshot.val().params)
            if (res) {
                await this.db.ref(this.path).child(querySnapshot.key).update({
                    result: res,
                    processing: false
                })
            }

            console.info("Processed", querySnapshot.key)
        })
    }
}