"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
const schemas_2 = require("../schemas");
const services_2 = require("../services");
const zod_1 = require("zod");
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
const SessionIdParams = zod_1.z.object({ sessionId: zod_1.z.uuid() });
openapiRegistry_1.registry.registerPath({
    method: "put",
    path: "/{sessionId}/paths",
    summary: "Store a user-selected path and its DSL representation bund to a session ",
    request: {
        params: SessionIdParams,
        body: { content: { "application/json": { schema: schemas_2.StorePathRequest } } },
    },
    responses: {
        200: {
            description: "Path stored",
            content: { "application/json": { schema: schemas_2.StorePathResponse } },
        },
        400: { description: "Invalid request or path" },
        404: { description: "Session not found" },
    },
});
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/{sessionId}/paths",
    summary: "Retrieve stored path for a session",
    request: { params: SessionIdParams },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: schemas_2.RetrievePathResponse } },
        },
        404: { description: "Session not found" },
    },
});
openapiRegistry_1.registry.registerPath({
    method: "patch",
    path: "/{sessionId}",
    summary: "Update stored information (status, path, dsl, expiresAt) for a specific session",
    request: {
        params: SessionIdParams,
        body: { content: { "application/json": { schema: schemas_2.UpdatePathRequest } } },
    },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: schemas_2.UpdatePathResponse } },
        },
        404: { description: "Session not found" },
    },
});
exports.sessionRouter.put("/:sessionId/paths", async (req, res) => {
    const params = SessionIdParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const body = schemas_2.StorePathRequest.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ error: body.error.issues });
    const { sessionId } = params.data;
    const { path } = body.data;
    const session = await (0, services_2.retrieveSessionService)(sessionId);
    if (!session)
        return res.status(404).json({ error: "Session not found" });
    const dsl = (0, services_2.pathToDsl)(path);
    const updated = await (0, services_2.updateSessionService)(sessionId, { path, dsl });
    if (!updated)
        return res.status(404).json({ error: "Session not found" });
    return res.json(schemas_2.StorePathResponse.parse({ mazeId: updated.mazeId, path: updated.path, dsl: updated.dsl }));
});
exports.sessionRouter.get("/:sessionId/paths", async (req, res) => {
    const parsed = SessionIdParams.safeParse(req.params);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { sessionId } = parsed.data;
    const session = await (0, services_2.retrieveSessionService)(sessionId);
    if (!session || !session.path || !session.dsl)
        return res.status(404).json({ error: "Session path not found" });
    return res.json(schemas_2.RetrievePathResponse.parse({ mazeId: session.mazeId, path: session.path, dsl: session.dsl }));
});
exports.sessionRouter.patch("/:sessionId", async (req, res) => {
    const parsed = schemas_2.UpdatePathRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const params = SessionIdParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const { path, dsl, ...rest } = parsed.data;
    const updatePayload = { ...rest };
    if (path) {
        updatePayload.path = path;
        updatePayload.dsl = dsl ?? (0, services_2.pathToDsl)(path);
    }
    else if (dsl) {
        updatePayload.dsl = dsl;
    }
    const cleanedPayload = Object.fromEntries(Object.entries(updatePayload).filter(([, value]) => value !== undefined));
    if (Object.keys(cleanedPayload).length === 0) {
        return res.status(400).json({ error: "No updates provided" });
    }
    const updatedDoc = await (0, services_2.updateSessionService)(params.data.sessionId, cleanedPayload);
    if (!updatedDoc)
        return res.status(404).json({ error: "Session not found" });
    return res.json(schemas_2.UpdatePathResponse.parse(updatedDoc));
});
