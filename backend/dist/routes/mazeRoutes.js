"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mazeRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
const zod_1 = require("zod");
exports.mazeRouter = (0, express_1.Router)();
const MazeParams = zod_1.z.object({ mazeId: zod_1.z.coerce.number().int().nonnegative() });
openapiRegistry_1.registry.registerPath({
    method: "get",
    path: "/maze/{mazeId}",
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
exports.mazeRouter.get("/:mazeId", (req, res) => {
    const mazeId = MazeParams.safeParse(req.params);
    if (!mazeId.success)
        return res.status(400).json({ error: mazeId.error.issues });
    const maze = (0, services_1.getMazeById)(mazeId.data.mazeId);
    if (!maze)
        return res.status(404).json({ error: "Maze not found" });
    return res.json(maze);
});
