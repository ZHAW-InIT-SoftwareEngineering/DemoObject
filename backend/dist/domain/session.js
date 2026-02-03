"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const zod_1 = require("zod");
const path_1 = require("./path");
exports.Session = zod_1.z.object({
    sessionId: zod_1.z.uuid(),
    mazeId: zod_1.z.number().int().nonnegative(),
    status: zod_1.z.enum(["CREATED", "ON-GOING", "CLOSED"]).default("CREATED"),
    path: path_1.Path.optional(),
    dsl: zod_1.z.array(zod_1.z.string()).optional(),
    createdAt: zod_1.z.date().default(() => new Date()),
    expiresAt: zod_1.z.date().optional(),
});
