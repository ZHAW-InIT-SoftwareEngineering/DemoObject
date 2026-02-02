"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortestPathResponse = exports.ShortestPathRequest = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.ShortestPathRequest = zod_1.z.object({
    startNodeId: zod_1.z.coerce.number().int().nonnegative(),
    endNodeId: zod_1.z.coerce.number().int().nonnegative(),
});
exports.ShortestPathResponse = zod_1.z.object({
    // Sequence of node ids representing the shortest path (inclusive of start/end)
    path: zod_1.z.array(zod_1.z.number().int().nonnegative()),
    length: zod_1.z.number().int().nonnegative(),
});
