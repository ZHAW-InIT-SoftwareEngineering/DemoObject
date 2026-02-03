"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.updateSession = updateSession;
const session_1 = require("../domain/session");
const mongo_db_1 = require("../persistence/mongo/mongo.db");
async function createSession(sessionId, mazeId) {
    const doc = session_1.Session.parse({
        sessionId: sessionId,
        mazeId: mazeId,
        createdAt: new Date(),
    });
    await (0, mongo_db_1.collection)().insertOne(doc);
    return doc;
}
;
async function getSession(sessionId) { return ((0, mongo_db_1.collection)()).findOne({ sessionId }); }
;
async function updateSession(sessionId, data) {
    const updatedDocument = await (0, mongo_db_1.collection)().findOneAndUpdate({ sessionId }, { $set: data }, { returnDocument: "after" });
    return updatedDocument ? session_1.Session.parse(updatedDocument) : null;
}
;
