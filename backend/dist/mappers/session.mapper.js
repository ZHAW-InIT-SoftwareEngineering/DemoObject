"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDomain = toDomain;
exports.toDb = toDb;
const session_1 = require("../domain/session");
const mongodb_1 = require("mongodb");
function toDomain(doc) {
    const { _id, ...rest } = doc;
    return session_1.Session.parse(rest);
}
function toDb(session) {
    return {
        ...session,
        _id: new mongodb_1.ObjectId(),
    };
}
;
