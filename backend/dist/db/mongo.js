"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDb = connectToDb;
exports.getDb = getDb;
exports.getDbCollection = getDbCollection;
const mongodb_1 = require("mongodb");
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
