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
    path: "/session",
    summary: "Create a new session and return a sessionId (and QR payload)",
    request: {
        body: { content: { "application/json": { schema: schemas_1.CreateSessionRequest } } },
    },
    responses: {
        201: {
            description: "Session created",
            headers: {
                Location: {
                    description: "Cannoncial URI of the new created session resource",
                    schema: { type: "string", format: "uri" }
                },
            },
            content: { "application/json": { schema: schemas_1.CreateSessionResponse } },
        },
    },
});
exports.sessionRouter.post("/", async (req, res) => {
    const parsed = schemas_1.CreateSessionRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { mazeId } = parsed.data;
    const sessionId = await ((0, services_1.createSessionService)(mazeId));
    const qrPayload = `session:${sessionId}`;
    const location = req.protocol + '://' + req.get('host') + '/session/' + sessionId;
    return res.status(201)
        .set('Location', location)
        .json(schemas_1.CreateSessionResponse.parse({ sessionId: sessionId, qrPayload }));
});
