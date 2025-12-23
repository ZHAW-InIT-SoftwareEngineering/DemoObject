"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievePathResponse = exports.RetrievePathRequest = exports.StorePathResponse = exports.StorePathRequest = void 0;
const zod_1 = require("zod");
const path_1 = require("./path");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.StorePathRequest = zod_1.z.object({
    sessionId: zod_1.z.uuid(),
    path: path_1.Path,
});
exports.StorePathResponse = zod_1.z.object({
    mazeId: zod_1.z.string().min(1),
    path: path_1.Path,
    dsl: zod_1.z.array(zod_1.z.string()),
});
exports.RetrievePathRequest = zod_1.z.object({
    sessionId: zod_1.z.uuid(),
});
exports.RetrievePathResponse = zod_1.z.object({
    mazeId: zod_1.z.string().min(1),
    path: path_1.Path,
    dsl: zod_1.z.array(zod_1.z.string()),
});
