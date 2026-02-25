"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDb = connectToDb;
exports.isDbHealthy = isDbHealthy;
exports.insertSessionDoc = insertSessionDoc;
exports.findSessionDoc = findSessionDoc;
exports.updateSessionDoc = updateSessionDoc;
const mongodb_1 = require("mongodb");
const session_1 = require("../domain/session");
require("dotenv/config");
let client = null;
let db = null;
function validateEnvEntry(envVariableName) {
    const variable = process.env[envVariableName];
    if (!variable) {
        throw new Error(`${envVariableName} is not defined in the .env! Add a .env variable called: ${envVariableName}.`);
    }
    return variable;
}
;
// currently db and connection uri is hard wired => however only one Db needed atm
async function connectToDb() {
    if (db)
        return db;
    const uri = validateEnvEntry("DB_CONN_STRING");
    const dbName = validateEnvEntry("DB_NAME");
    client = new mongodb_1.MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log(`SUCCESSFULLY CONNECTED TO ${dbName}`);
    return db;
}
async function isDbHealthy() {
    if (!client) {
        return false;
    }
    try {
        await client.db("admin").command({ ping: 1 });
        return true;
    }
    catch {
        return false;
    }
}
function getDb() {
    if (!db) {
        throw new Error("Database not initialized. Call connectToDatabase() first.");
    }
    else {
        return db;
    }
}
function getDbCollection(dbCollectionName) {
    return getDb().collection(dbCollectionName);
}
function getCollectionName() {
    const name = process.env.SESSION_COLLECTION_NAME;
    if (!name)
        throw new Error("SESSION_COLLECTION_NAME is not set in the environment");
    return name;
}
;
const collection = () => getDbCollection(getCollectionName());
async function insertSessionDoc(sessionId, mazeId) {
    const doc = session_1.Session.parse({
        sessionId: sessionId,
        mazeId: mazeId,
        createdAt: new Date(),
    });
    await collection().insertOne(doc);
    return doc;
}
;
async function findSessionDoc(sessionId) { return await (collection()).findOne({ sessionId }); }
;
async function updateSessionDoc(sessionId, data) {
    const updatedDocument = await collection().findOneAndUpdate({ sessionId }, { $set: data }, { returnDocument: "after" });
    return updatedDocument ? session_1.Session.parse(updatedDocument) : null;
}
;
