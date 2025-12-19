"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
exports.sessionRouter = (0, express_1.Router)();
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/sessions",
    summary: "Create a new session and return a sessionId (and QR payload)",
    responses: {
        201: {
            description: "Session created",
            content: { "application/json": { schema: schemas_1.CreateSessionResponse } },
        },
    },
});
exports.sessionRouter.post("/", (_req, res) => {
    const session = (0, services_1.createSession)();
    const qrPayload = `session:${session.id}`;
    return res.status(201).json(schemas_1.CreateSessionResponse.parse({ sessionId: session.id, qrPayload }));
});
