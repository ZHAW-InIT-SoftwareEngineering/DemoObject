"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSessionResponse = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.CreateSessionResponse = zod_1.z.object({
    sessionId: zod_1.z.uuid(),
    qrPayload: zod_1.z.string(),
});
