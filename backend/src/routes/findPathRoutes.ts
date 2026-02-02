import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { ShortestPathRequest, ShortestPathResponse } from "../schemas";
import { findPathBFS } from "../services";
export const findPathRouter = Router();
import { z } from "zod";


const MazeId = z.object({ mazeId: z.coerce.number().int().nonnegative() })

registry.registerPath({
    method: "get",
    path: "/maze/{mazeId}/shortest-path",
    request: {
        params: MazeId,
        query: ShortestPathRequest
    },
    responses: {
        200: {
            description: "Find shortest path between two nodes using BFS",
            content: { "application/json": { schema: ShortestPathResponse } },
        },
        400: { description: "Invalid request" },
        404: { description: "Maze or path not found" },
    },
});

findPathRouter.get("/:mazeId/shortest-path", (req, res) => {
    const parameters = MazeId.safeParse(req.params)
    if (!parameters.success) return res.status(400).json({ error: parameters.error.issues })
    const mazeId = parameters.data.mazeId

    const queries = ShortestPathRequest.safeParse(req.query)
    if (!queries.success) return res.status(400).json({ error: queries.error.issues })

    const {startNodeId, endNodeId} = queries.data
    
    const result = findPathBFS(startNodeId, endNodeId, mazeId);
    if (!result) return res.status(404).json({ error: "Maze or path not found" });

    return res.json(ShortestPathResponse.parse(result));
});
