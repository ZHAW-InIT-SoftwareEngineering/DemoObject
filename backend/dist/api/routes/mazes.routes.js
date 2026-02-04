"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mazeRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../../services");
const domain_1 = require("../../domain");
const util_1 = require("../../util");
exports.mazeRouter = (0, express_1.Router)();
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}",
    summary: "Retrieve a maze definition",
    tags: ["mazes"],
    request: {
        params: schemas_1.MazeIdParams
    },
    responses: {
        200: {
            description: "Maze found",
            content: { "application/json": { schema: domain_1.Maze } }
        },
        404: { description: "Maze not found" }
    },
});
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/mazes/{mazeId}/paths/dsl",
    summary: "Compute the DSL of a specific provided path through the maze.",
    tags: ["mazes"],
    request: {
        params: schemas_1.MazeIdParams,
        body: { content: { "application/json": { schema: schemas_1.CompilePathRequest } } },
    },
    responses: {
        200: {
            description: "Compile a user-provided maze path do DSL",
            content: { "application/json": { schema: schemas_1.CompilePathResponse } }
        },
        400: { description: "Invalid request" },
        412: { description: "Invalid path" }
    },
});
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}/shortest-path",
    tags: ["mazes"],
    request: {
        params: schemas_1.MazeIdParams
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
    const params = schemas_1.MazeIdParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const mazeId = params.data.mazeId;
    const maze = (0, services_1.getMazeById)(mazeId);
    if (!maze)
        return res.status(404).json({ error: "Maze not found" });
    return res.json(maze);
});
exports.mazeRouter.post("/:mazeId/paths/dsl", (req, res) => {
    const body = schemas_1.CompilePathRequest.safeParse(req.body);
    if (!body.success)
        return res.status(400).json({ error: body.error.issues });
    const { path } = body.data;
    const params = schemas_1.MazeIdParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const mazeId = params.data.mazeId;
    if ((0, util_1.isValidPath)(mazeId, path)) {
        const dsl = (0, services_1.computeDSLFromPath)(path);
        return res.json(schemas_1.CompilePathResponse.parse({ dsl }));
    }
    else {
        return res.status(412).json({ error: "invalid path" });
    }
});
exports.mazeRouter.get("/:mazeId/shortest-path", (req, res) => {
    const params = schemas_1.MazeIdParams.safeParse(req.params);
    if (!params.success)
        return res.status(400).json({ error: params.error.issues });
    const mazeId = params.data.mazeId;
    const result = (0, services_1.computeShortestPath)(mazeId);
    if (!result)
        return res.status(404).json({ error: "Maze or path not found" });
    return res.json(schemas_1.ShortestPathResponse.parse(result));
});
