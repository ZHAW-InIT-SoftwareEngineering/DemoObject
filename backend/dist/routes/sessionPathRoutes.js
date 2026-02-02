"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionPathRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
const zod_1 = require("zod");
exports.sessionPathRouter = (0, express_1.Router)();
const SessionIdParams = zod_1.z.object({ sessionId: zod_1.z.uuid() });
openapiRegistry_1.registry.registerPath({
    method: "put",
    path: "/session/{sessionId}/path",
    summary: "Store a user-selected path and its DSL representation bund to a session ",
    request: {
        params: SessionIdParams,
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
    method: "get",
    path: "/session/{sessionId}/path",
    summary: "Retrieve stored path for a session",
    request: { params: SessionIdParams },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: schemas_1.RetrievePathResponse } },
        },
        404: { description: "Session not found" },
    },
});
openapiRegistry_1.registry.registerPath({
    method: "patch",
    path: "/session/{sessionId}",
    summary: "Update stored path for a session",
    request: {
        params: SessionIdParams,
        body: { content: { "application/json": { schema: schemas_1.UpdatePathRequest } } },
    },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: schemas_1.UpdatePathResponse } },
        },
        404: { description: "Session not found" },
    },
});
exports.sessionPathRouter.put("/:sessionId/path", async (req, res) => {
    const params = SessionIdParams.safeParse(req.params);
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
    const dsl = (0, services_1.pathToDsl)(path);
    const updated = await (0, services_1.updateSessionService)(sessionId, { path, dsl });
    if (!updated)
        return res.status(404).json({ error: "Session not found" });
    return res.json(schemas_1.StorePathResponse.parse({ mazeId: updated.mazeId, path: updated.path, dsl: updated.dsl }));
});
exports.sessionPathRouter.get("/:sessionId/path", async (req, res) => {
    const parsed = SessionIdParams.safeParse(req.params);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { sessionId } = parsed.data;
    const session = await (0, services_1.retrieveSessionService)(sessionId);
    if (!session || !session.path || !session.dsl)
        return res.status(404).json({ error: "Session path not found" });
    return res.json(schemas_1.RetrievePathResponse.parse({ mazeId: session.mazeId, path: session.path, dsl: session.dsl }));
});
exports.sessionPathRouter.patch("/:sessionId", async (req, res) => {
    const parsed = schemas_1.UpdatePathRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const params = SessionIdParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const { path, dsl, ...rest } = parsed.data;
    const updatePayload = { ...rest };
    if (path) {
        updatePayload.path = path;
        updatePayload.dsl = dsl ?? (0, services_1.pathToDsl)(path);
    }
    else if (dsl) {
        updatePayload.dsl = dsl;
    }
    const cleanedPayload = Object.fromEntries(Object.entries(updatePayload).filter(([, value]) => value !== undefined));
    if (Object.keys(cleanedPayload).length === 0) {
        return res.status(400).json({ error: "No updates provided" });
    }
    const updatedDoc = await (0, services_1.updateSessionService)(params.data.sessionId, cleanedPayload);
    if (!updatedDoc)
        return res.status(404).json({ error: "Session not found" });
    return res.json(schemas_1.UpdatePathResponse.parse(updatedDoc));
});
