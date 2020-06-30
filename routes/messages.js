/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const mongoose = require('mongoose')
const fs = require('fs')

//const mongoURI = "mongodb://user:password@mongodb:27017/guestbook"
//const mongoURI = "mongodb://localhost:27017/guestbook"
//Tested with mongo running locally.
//const mongoURI = "mongodb://localhost:27017/user1-guestbook"

const username = "#USERNAME#"
const password = "#PASSWORD#"
const server = "#SERVERNAME#"
const database = "#USERNAME#-guestbook"

const mongoURI = "mongodb://" +
                username + ":" + password + "@" + server + "/" + database +
                "?authSource=admin&replicaSet=replset"

var sslCA = [fs.readFileSync('./keys/mongodb.cert')];
var options = {
  useNewUrlParser: true,
  connectTimeoutMS: 20000,
  reconnectTries: 1,
  ssl: true,
  sslValidate: true,
  sslCA,
};


const db = mongoose.connection;

db.on('disconnected', () => {
    console.error(`Disconnected: unable to reconnect to ${mongoURI}`)
    throw new Error(`Disconnected: unable to reconnect to ${mongoURI}`) 
})
db.on('error', (err) => {
    console.error(`Unable to connect to ${mongoURI}: ${err}`);
});

db.once('open', () => {
  console.log(`connected to ${mongoURI}`);
});

const connectToMongoDB = async () => {
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        connectTimeoutMS: 2000,
        reconnectTries: 1,
        ssl: true,
        sslValidate: true,
        sslCA,
    })
};

const messageSchema = mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'] },
    body: { type: String, required: [true, 'Message Body is required'] },
    timestamps: {}
});

const messageModel = mongoose.model('Message', messageSchema);

const construct = (params) => {
    const name = params.name
    const body = params.body
    const message = new messageModel({ name: name, body: body })
    return message
};

const save = (message) => {
    console.log("saving message...")
    message.save((err) => {
        if (err) { throw err }
    })
};

// Constructs and saves message
const create = (params) => {
    try {
        const msg = construct(params)
        const validationError = msg.validateSync()
        if (validationError) { throw validationError }
        save(msg)
    } catch (error) {
        throw error
    }
}

module.exports = {
    create: create,
    messageModel: messageModel,
    connectToMongoDB: connectToMongoDB
}

