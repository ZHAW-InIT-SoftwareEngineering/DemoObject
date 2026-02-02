"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPathRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
exports.findPathRouter = (0, express_1.Router)();
const zod_1 = require("zod");
const MazeId = zod_1.z.object({ mazeId: zod_1.z.coerce.number().int().nonnegative() });
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/maze/{mazeId}/shortest-path",
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
exports.findPathRouter.get("/:mazeId/shortest-path", (req, res) => {
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
