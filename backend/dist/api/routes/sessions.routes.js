"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../../openapi/openapiRegistry");
const services_1 = require("../../services");
const schemas_1 = require("../schemas");
exports.sessionRouter = (0, express_1.Router)();
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/sessions",
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
openapiRegistry_1.registry.registerPath({
    method: "put",
    path: "/sessions/{sessionId}/paths",
    summary: "Store a user-selected path and its automatically transpiled DSL representation bund to a session ",
    request: {
        params: schemas_1.SessionId,
        body: { content: { "application/json": { schema: schemas_1.StorePathRequest } } },
    },
    responses: {
        200: {
            description: "Path stored",
            content: { "application/json": { schema: schemas_1.StorePathResponse } },
        },
        400: { description: "Invalid request or path" },
        404: { description: "Session not found" },
    },
});
openapiRegistry_1.registry.registerPath({
    method: "patch",
    path: "/sessions/{sessionId}",
    summary: "Update stored information (status, path or expiresAt) for a specific session",
    request: {
        params: schemas_1.SessionId,
        body: { content: { "application/json": { schema: schemas_1.UpdateSessionResponse } } },
    },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: schemas_1.UpdateSessionResponse } },
        },
        404: { description: "Session not found" },
    },
});
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/sessions/{sessionId}/paths",
    summary: "Retrieve stored path for a session",
    request: { params: schemas_1.SessionId },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: schemas_1.RetrievePathResponse } },
        },
        404: { description: "Session not found" },
    },
});
exports.sessionRouter.post("/", async (req, res) => {
    const parsed = schemas_1.CreateSessionRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { mazeId } = parsed.data;
    const sessionId = await ((0, services_1.createSessionService)(mazeId));
    const qrPayload = `session:${sessionId}`;
    const location = req.protocol + '://' + req.get('host') + '/sessions/' + sessionId;
    return res.status(201)
        .set('Location', location)
        .json(schemas_1.CreateSessionResponse.parse({ sessionId: sessionId, qrPayload }));
});
exports.sessionRouter.put("/:sessionId/paths", async (req, res) => {
    const params = schemas_1.SessionId.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const body = schemas_1.StorePathRequest.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ error: body.error.issues });
    const { sessionId } = params.data;
    const { path } = body.data;
    const session = await (0, services_1.retrieveSessionService)(sessionId);
    if (!session)
        return res.status(404).json({ error: "Session not found" });
    const dsl = (0, services_1.computeDSLFromPath)(path);
    const updated = await (0, services_1.updateSessionService)(sessionId, { path, dsl });
    if (!updated)
        return res.status(404).json({ error: "Session not found" });
    return res.json(schemas_1.StorePathResponse.parse({ mazeId: updated.mazeId, path: updated.path, dsl: updated.dsl }));
});
exports.sessionRouter.patch("/:sessionId", async (req, res) => {
    const parsed = schemas_1.UpdateSessionRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const path = parsed.data.path;
    const params = schemas_1.SessionId.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const sessionId = params.data.sessionId;
    const updatedDoc = await (0, services_1.storePathAndDSLForSession)(sessionId, path);
    return res.json(schemas_1.UpdatePathResponse.parse(updatedDoc));
});
exports.sessionRouter.get("/:sessionId/paths", async (req, res) => {
    const parsed = schemas_1.SessionId.safeParse(req.params);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { sessionId } = parsed.data;
    const session = await (0, services_1.retrieveSessionService)(sessionId);
    if (!session || !session.path || !session.dsl)
        return res.status(404).json({ error: "Session path not found" });
    return res.json(schemas_1.RetrievePathResponse.parse({ mazeId: session.mazeId, path: session.path, dsl: session.dsl }));
});
