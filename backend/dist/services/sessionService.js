"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.saveSessionSelection = saveSessionSelection;
const crypto_1 = require("crypto");
const sessions = new Map();
function createSession() {
    const id = (0, crypto_1.randomUUID)();
    const session = { id, createdAt: new Date() };
    sessions.set(id, session);
    return session;
}
function getSession(id) {
    return sessions.get(id);
}
function saveSessionSelection(id, selection) {
    const session = sessions.get(id);
    if (!session)
        return undefined;
    session.mazeId = selection.mazeId;
    session.selection = selection;
    sessions.set(id, session);
    return session;
}
