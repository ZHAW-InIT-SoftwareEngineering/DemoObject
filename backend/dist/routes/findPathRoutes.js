"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPathRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
exports.findPathRouter = (0, express_1.Router)();
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/maze-paths/findPath",
    request: {
        body: { content: { "application/json": { schema: schemas_1.FindPathBFSRequest } } },
    },
    responses: {
        200: {
            description: "Find shortest path between two nodes using BFS",
            content: { "application/json": { schema: schemas_1.FindPathBFSResponse } },
        },
        400: { description: "Invalid request" },
        404: { description: "Maze or path not found" },
    },
});
exports.findPathRouter.post("/find-shortest", (req, res) => {
    const parsed = schemas_1.FindPathBFSRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const result = (0, services_1.findPathBFS)(parsed.data);
    if (!result)
        return res.status(404).json({ error: "Maze or path not found" });
    return res.json(schemas_1.FindPathBFSResponse.parse(result));
});
