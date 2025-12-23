"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.updateSession = updateSession;
const mongo_1 = require("../db/mongo");
const mongodb_1 = require("mongodb");
const session_1 = require("../models/session");
const collection = () => (0, mongo_1.getDbCollection)(process.env.DEMO_OBJECT_COLLECTION_NAME);
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
    const result = await collection().findOneAndUpdate({ sessionId }, { $set: data }, { returnDocument: "after" });
    return result ? session_1.SessionDataClass.parse(result) : null;
}
