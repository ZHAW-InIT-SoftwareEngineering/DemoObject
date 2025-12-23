"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionPathRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
exports.sessionPathRouter = (0, express_1.Router)();
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/sessions/storePath",
    summary: "Store a user-selected path and its DSL representation bund to a session ",
    request: {
        body: { content: { "application/json": { schema: schemas_1.StorePathRequest } } },
    },
    responses: {
        200: {
            description: "Path stored",
            content: { "application/json": { schema: schemas_1.StorePathResponse } },
        },
        400: { description: "Invalid request or path" },
        404: { description: "Session or maze not found" },
    },
});
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/sessions/retrievePath",
    summary: "Retrieve stored path for a session",
    request: { body: { content: { "application/json": { schema: schemas_1.RetrievePathRequest } } },
    },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: schemas_1.RetrievePathResponse } },
        },
        404: { description: "Session or path not found" },
    },
});
exports.sessionPathRouter.post("/storePath", async (req, res) => {
    const parsed = schemas_1.StorePathRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { sessionId, path } = parsed.data;
    const session = await ((0, services_1.retrieveSessionService)(sessionId));
    if (!session)
        return res.status(404).json({ error: "Session not found" });
    const mazeId = session.mazeId;
    console.log(`This is the session.mazeId: ${mazeId}`);
    // TODO: might consider to include the isValidPath function from pathValidation.ts
    const dsl = (0, services_1.pathToDsl)(path);
    return res.json(schemas_1.StorePathResponse.parse({ mazeId, path, dsl }));
});
exports.sessionPathRouter.post("/retrievePath", async (req, res) => {
    const parsed = schemas_1.RetrievePathRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { sessionId } = parsed.data;
    const session = await ((0, services_1.retrieveSessionService)(sessionId));
    if (!session || !session.path)
        return res.status(404).json({ error: "Session path not found" });
    return res.json(schemas_1.RetrievePathResponse.parse({ sessionId: sessionId }));
});
