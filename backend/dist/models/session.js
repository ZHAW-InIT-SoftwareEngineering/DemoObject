"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionPublic = exports.SessionDataClass = void 0;
const mongodb_1 = require("mongodb");
const zod_1 = require("zod");
const path_1 = require("../schemas/path");
exports.SessionDataClass = zod_1.z.object({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId).optional(),
    sessionId: zod_1.z.uuid(),
    mazeId: zod_1.z.int().nonnegative(),
    status: zod_1.z.enum(["PENDING", "READY", "CLOSED"]).default("PENDING"),
    path: path_1.Path.optional(),
    dsl: zod_1.z.array(zod_1.z.string()).optional(),
    createdAt: zod_1.z.date().default(() => new Date()),
    expiresAt: zod_1.z.date().optional(),
});
exports.SessionPublic = exports.SessionDataClass.omit({ _id: true });
