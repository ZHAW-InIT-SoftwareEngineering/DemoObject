"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionDataClass = void 0;
const mongodb_1 = require("mongodb");
const zod_1 = require("zod");
exports.SessionDataClass = zod_1.z.object({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId).optional(),
    sessionId: zod_1.z.uuid(),
    mazeId: zod_1.z.string().min(1),
    status: zod_1.z.enum(["PENDING", "READY"]).default("PENDING"),
    path: zod_1.z.array(zod_1.z.number().int().nonnegative()).min(2).optional(),
    createdAt: zod_1.z.date().default(() => new Date()),
    expiresAt: zod_1.z.date().optional(),
});
