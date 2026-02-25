"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infraRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const openapiRegistry_1 = require("../../openapi/openapiRegistry");
const mongo_1 = require("../../db/mongo");
exports.infraRouter = (0, express_1.Router)();
const HealthzOkResponse = zod_1.z.object({
    status: zod_1.z.literal("ok"),
});
const HealthzDegradedResponse = zod_1.z.object({
    status: zod_1.z.literal("degraded"),
});
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/healthz",
    summary: "Health check endpoint",
    tags: ["infra"],
    responses: {
        200: {
            description: "Service is healthy",
            content: { "application/json": { schema: HealthzOkResponse } },
        },
        503: {
            description: "Service is degraded",
            content: { "application/json": { schema: HealthzDegradedResponse } },
        },
    },
});
exports.infraRouter.get("/healthz", async (_req, res) => {
    const healthy = await (0, mongo_1.isDbHealthy)();
    res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "degraded" });
});
