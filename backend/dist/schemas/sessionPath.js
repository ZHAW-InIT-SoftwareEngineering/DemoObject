"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionPathResponse = exports.SessionPathPayload = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.SessionPathPayload = zod_1.z.object({
    mazeId: zod_1.z.string().min(1),
    path: zod_1.z.array(zod_1.z.number().int().nonnegative()).min(2),
});
exports.SessionPathResponse = zod_1.z.object({
    mazeId: zod_1.z.string().min(1),
    path: zod_1.z.array(zod_1.z.number().int().nonnegative()).min(2),
    dsl: zod_1.z.array(zod_1.z.string()),
});
