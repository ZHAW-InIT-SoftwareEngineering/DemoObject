"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionDb = void 0;
const mongodb_1 = require("mongodb");
const session_1 = require("../../domain/session");
const zod_1 = require("zod");
exports.SessionDb = session_1.Session.extend({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId),
});
