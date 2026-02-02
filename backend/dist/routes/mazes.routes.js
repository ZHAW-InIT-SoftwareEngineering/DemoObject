"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mazeRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
const zod_1 = require("zod");
const services_2 = require("../services");
exports.mazeRouter = (0, express_1.Router)();
const MazeParams = zod_1.z.object({ mazeId: zod_1.z.coerce.number().int().nonnegative() });
const MazeId = zod_1.z.object({ mazeId: zod_1.z.coerce.number().int().nonnegative() });
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}",
    summary: "Retrieve a maze definition",
    request: {
        params: MazeParams
    },
    responses: {
        200: {
            description: "Maze found",
            content: { "application/json": { schema: schemas_1.Maze } }
        },
        404: { description: "Maze not found" }
    },
});
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/mazes/{mazeId}/paths/dsl",
    request: {
        params: MazeId,
        body: { content: { "application/json": { schema: schemas_1.CompilePathRequest } } },
    },
    responses: {
        200: {
            description: "Compile a user-provided maze path do DSL",
            content: { "application/json": { schema: schemas_1.CompilePathResponse } }
        },
        400: { description: "Invalid request / invalid path" }
    },
});
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}/shortest-path",
    request: {
        params: MazeId,
        query: schemas_1.ShortestPathRequest
    },
    responses: {
        200: {
            description: "Find shortest path between two nodes using BFS",
            content: { "application/json": { schema: schemas_1.ShortestPathResponse } },
        },
        400: { description: "Invalid request" },
        404: { description: "Maze or path not found" },
    },
});
exports.mazeRouter.get("/:mazeId", (req, res) => {
    const mazeId = MazeParams.safeParse(req.params);
    if (!mazeId.success)
        return res.status(400).json({ error: mazeId.error.issues });
    const maze = (0, services_1.getMazeById)(mazeId.data.mazeId);
    if (!maze)
        return res.status(404).json({ error: "Maze not found" });
    return res.json(maze);
});
exports.mazeRouter.post("/:mazeId/paths/dsl", (req, res) => {
    const parsed = schemas_1.CompilePathRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const mazeId = MazeId.safeParse(req.params);
    if (!mazeId.success)
        return res.status(400).json({ error: mazeId.error.issues });
    const { path } = parsed.data;
    // TODO: validate the path: validPath(mazeId, path)
    const dsl = (0, services_2.pathToDsl)(path);
    return res.json(schemas_1.CompilePathResponse.parse({ dsl }));
});
exports.mazeRouter.get("/:mazeId/shortest-path", (req, res) => {
    const parameters = MazeId.safeParse(req.params);
    if (!parameters.success)
        return res.status(400).json({ error: parameters.error.issues });
    const mazeId = parameters.data.mazeId;
    const queries = schemas_1.ShortestPathRequest.safeParse(req.query);
    if (!queries.success)
        return res.status(400).json({ error: queries.error.issues });
    const { startNodeId, endNodeId } = queries.data;
    const result = (0, services_1.findPathBFS)(startNodeId, endNodeId, mazeId);
    if (!result)
        return res.status(404).json({ error: "Maze or path not found" });
    return res.json(schemas_1.ShortestPathResponse.parse(result));
});
