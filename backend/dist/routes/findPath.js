"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPathRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
exports.findPathRouter = (0, express_1.Router)();
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/algorithms/findPathBFS",
    request: {
        body: { content: { "application/json": { schema: schemas_1.FindPathBFSRequest } } },
    },
    responses: {
        200: {
            description: "Find a path for the specified maze",
            content: { "application/json": { schema: schemas_1.FindPathBFSResponse } }
        },
        400: { description: "Invalid request / Invalid maze" }
    },
});
exports.findPathRouter.post("/findPathBFS"), (req, res) => {
    const parsed = schemas_1.FindPathBFSRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { mazeId, startNodeId, endNodeId } = parsed.data;
};
