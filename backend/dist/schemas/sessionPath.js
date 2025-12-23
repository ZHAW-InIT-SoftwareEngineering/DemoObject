"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePathResponse = exports.UpdatePathRequest = exports.RetrievePathResponse = exports.RetrievePathRequest = exports.StorePathResponse = exports.StorePathRequest = void 0;
const zod_1 = require("zod");
const path_1 = require("./path");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const session_1 = require("../models/session");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
const SessionApiShape = session_1.SessionPublic.omit({ createdAt: true }).extend({
    expiresAt: zod_1.z.coerce.date().optional(),
});
exports.StorePathRequest = zod_1.z.object({
    sessionId: zod_1.z.uuid(),
    path: path_1.Path,
});
exports.StorePathResponse = SessionApiShape.pick({
    mazeId: true,
    path: true,
    dsl: true,
});
exports.RetrievePathRequest = zod_1.z.object({
    sessionId: zod_1.z.uuid(),
});
exports.RetrievePathResponse = SessionApiShape.pick({
    mazeId: true,
    path: true,
    dsl: true,
});
exports.UpdatePathRequest = SessionApiShape.partial().required({ sessionId: true });
exports.UpdatePathResponse = SessionApiShape;
