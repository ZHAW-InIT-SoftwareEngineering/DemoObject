"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.updateSession = updateSession;
const mongo_1 = require("../db/mongo");
async function createSession(sessionId, mazeId) {
    return await (0, mongo_1.insertSessionDoc)(sessionId, mazeId);
}
;
async function getSession(sessionId) {
    return (0, mongo_1.findSessionDoc)(sessionId);
}
;
async function updateSession(sessionId, data) {
    return await (0, mongo_1.updateSessionDoc)(sessionId, data);
}
;
