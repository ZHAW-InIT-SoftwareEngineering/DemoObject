"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.updateSession = updateSession;
const mongo_1 = require("../db/mongo");
const session_1 = require("../domain/session");
function getCollectionName() {
    const name = process.env.SESSION_COLLECTION_NAME;
    if (!name)
        throw new Error("DEMO_OBJECT_COLLECTION_NAME is not set in the environment");
    return name;
}
;
const collection = () => (0, mongo_1.getDbCollection)(getCollectionName());
async function createSession(sessionId, mazeId) {
    const doc = session_1.Session.parse({
        sessionId: sessionId,
        mazeId: mazeId,
        createdAt: new Date(),
    });
    await collection().insertOne(doc);
    return doc;
}
;
async function getSession(sessionId) { return (collection()).findOne({ sessionId }); }
;
async function updateSession(sessionId, data) {
    const updatedDocument = await collection().findOneAndUpdate({ sessionId }, { $set: data }, { returnDocument: "after" });
    return updatedDocument ? session_1.Session.parse(updatedDocument) : null;
}
;
