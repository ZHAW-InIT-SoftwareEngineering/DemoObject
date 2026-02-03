"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDomain = toDomain;
exports.toDb = toDb;
const session_1 = require("../domain/session");
function toDomain(doc) {
    const { _id, ...rest } = doc;
    return session_1.Session.parse(rest);
}
function toDb(session) {
    return session;
}
;
