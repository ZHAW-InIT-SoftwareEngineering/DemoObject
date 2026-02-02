"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.updateSession = updateSession;
const mongo_1 = require("../db/mongo");
const mongodb_1 = require("mongodb");
const session_1 = require("../models/session");
function getCollectionName() {
    const name = process.env.DEMO_OBJECT_COLLECTION_NAME;
    if (!name)
        throw new Error("DEMO_OBJECT_COLLECTION_NAME is not set in the environment");
    return name;
}
const collection = () => (0, mongo_1.getDbCollection)(getCollectionName());
async function createSession(sessionId, mazeId) {
    const doc = session_1.SessionDataClass.parse({
        _id: new mongodb_1.ObjectId(),
        sessionId: sessionId,
        mazeId: mazeId,
        status: "PENDING",
        createdAt: new Date(),
    });
    await collection().insertOne(doc);
    return doc;
}
async function getSession(sessionId) { return (collection()).findOne({ sessionId }); }
async function updateSession(sessionId, data) {
    const updatedDocument = await collection().findOneAndUpdate({ sessionId }, { $set: data }, { returnDocument: "after" });
    return updatedDocument ? session_1.SessionDataClass.parse(updatedDocument) : null;
}
