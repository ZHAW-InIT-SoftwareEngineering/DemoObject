"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSession = insertSession;
exports.findSessionById = findSessionById;
exports.updateSessionById = updateSessionById;
const mongo_1 = require("../../db/mongo");
const mongo_db_1 = require("./mongo.db");
function getCollectionName() {
    const name = process.env.SESSION_COLLECTION_NAME;
    if (!name) {
        throw new Error("SESSION_COLLECTION_NAME is not set in the environment");
    }
    return name;
}
const collection = () => (0, mongo_1.getDbCollection)(getCollectionName());
async function insertSession(doc) {
    const insertToDb = mongo_db_1.SessionDb.parse(doc);
    const result = await collection().insertOne(insertToDb);
    return { ...doc, _id: result.insertedId };
}
async function findSessionById(sessionId) {
    return collection().findOne({ sessionId });
}
async function updateSessionById(sessionId, data) {
    const result = await collection().findOneAndUpdate({ sessionId }, { $set: data }, { returnDocument: "after" });
    return result;
}
