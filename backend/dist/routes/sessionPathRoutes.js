"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionPathRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
exports.sessionPathRouter = (0, express_1.Router)();
const ParamsSchema = zod_1.z.object({ sessionId: zod_1.z.string().uuid() });
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/sessions/{sessionId}/path",
    summary: "Store a user-selected path for a session",
    request: {
        params: ParamsSchema,
        body: { content: { "application/json": { schema: schemas_1.SessionPathPayload } } },
    },
    responses: {
        200: {
            description: "Path stored",
            content: { "application/json": { schema: schemas_1.SessionPathResponse } },
        },
        400: { description: "Invalid request or path" },
        404: { description: "Session or maze not found" },
    },
});
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/sessions/{sessionId}/path",
    summary: "Retrieve stored path for a session",
    request: { params: ParamsSchema },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: schemas_1.SessionPathResponse } },
        },
        404: { description: "Session or path not found" },
    },
});
// Validate that each consecutive hop exists in the maze edges
function isValidPath(mazeId, nodePath) {
    const maze = (0, services_1.getMazeById)(mazeId);
    if (!maze)
        return false;
    const nodeSet = new Set(maze.nodes.map(n => n.id));
    const edgeSet = new Set(maze.edges.map(e => `${e.from}-${e.to}`).concat(maze.edges.map(e => `${e.to}-${e.from}`)));
    for (const nodeId of nodePath) {
        if (!nodeSet.has(nodeId))
            return false;
    }
    for (let i = 1; i < nodePath.length; i++) {
        const key = `${nodePath[i - 1]}-${nodePath[i]}`;
        if (!edgeSet.has(key))
            return false;
    }
    return true;
}
exports.sessionPathRouter.post("/:sessionId/path", (req, res) => {
    const params = ParamsSchema.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const parsed = schemas_1.SessionPathPayload.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { sessionId } = params.data;
    const session = (0, services_1.getSession)(sessionId);
    if (!session)
        return res.status(404).json({ error: "Session not found" });
    const { mazeId, path } = parsed.data;
    if (!isValidPath(mazeId, path))
        return res.status(400).json({ error: "Invalid path for maze" });
    // Optionally derive DSL; we need coordinates to use pathToDsl, so project node IDs to coords
    const maze = (0, services_1.getMazeById)(mazeId);
    const coordsPath = path.map(id => {
        const node = maze.nodes.find(n => n.id === id);
        return { x: node?.x ?? 0, y: node?.y ?? 0 };
    });
    const dsl = (0, services_1.pathToDsl)(coordsPath);
    (0, services_1.saveSessionSelection)(sessionId, { mazeId, path, dsl });
    return res.json(schemas_1.SessionPathResponse.parse({ mazeId, path, dsl }));
});
exports.sessionPathRouter.get("/:sessionId/path", (req, res) => {
    const params = ParamsSchema.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const session = (0, services_1.getSession)(params.data.sessionId);
    if (!session || !session.selection)
        return res.status(404).json({ error: "Session path not found" });
    const { mazeId, path, dsl } = session.selection;
    return res.json(schemas_1.SessionPathResponse.parse({ mazeId, path, dsl }));
});
