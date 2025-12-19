"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilePathResponse = exports.CompilePathRequest = exports.Path = exports.Point = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.Point = zod_1.z.object({
    x: zod_1.z.number().int(),
    y: zod_1.z.number().int()
});
exports.Path = zod_1.z.array(exports.Point).min(2);
// schema for the request of the user
exports.CompilePathRequest = zod_1.z.object({
    mazeId: zod_1.z.string().min(1),
    path: exports.Path
});
// schema for the server answer (i.e. the DSL)
exports.CompilePathResponse = zod_1.z.object({
    // Array of DSL blocks describing the path (e.g., ["RIGHT", "UP", ...])
    dsl: zod_1.z.array(zod_1.z.string())
});
