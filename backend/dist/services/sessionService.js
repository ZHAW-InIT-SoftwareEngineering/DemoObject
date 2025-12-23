"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionService = createSessionService;
exports.updateSessionPathService = updateSessionPathService;
exports.retrieveSessionService = retrieveSessionService;
const crypto_1 = require("crypto");
const repositories_1 = require("../repositories");
async function createSessionService(mazeId) {
    console.log(`This is the mazeId: ${mazeId}}`);
    const sessionId = (0, crypto_1.randomUUID)();
    const doc = await (0, repositories_1.createSession)(sessionId, mazeId);
    console.log(`in mongodb created doc:\n ${(JSON.stringify(doc))}`);
    return doc.sessionId;
}
function updateSessionPathService(id, data) {
    return (0, repositories_1.updateSessionPath)(id, data);
}
async function retrieveSessionService(sessionId) {
    const doc = await ((0, repositories_1.getSession)(sessionId));
    return doc;
}
