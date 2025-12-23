"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindPathBFSResponse = exports.FindPathBFSRequest = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.FindPathBFSRequest = zod_1.z.object({
    mazeId: zod_1.z.string().min(1),
    startNodeId: zod_1.z.number().int().nonnegative(),
    endNodeId: zod_1.z.number().int().nonnegative(),
});
exports.FindPathBFSResponse = zod_1.z.object({
    // Sequence of node ids representing the shortest path (inclusive of start/end)
    path: zod_1.z.array(zod_1.z.number().int().nonnegative()),
    length: zod_1.z.number().int().nonnegative(),
});
