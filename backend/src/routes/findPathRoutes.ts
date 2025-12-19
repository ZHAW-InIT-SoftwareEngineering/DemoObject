import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { FindPathBFSRequest, FindPathBFSResponse } from "../schemas";
import { findPathBFS } from "../services";

export const findPathRouter = Router();

registry.registerPath({
    method: "post",
    path: "/maze-paths/findPath",
    request: {
        body: { content: { "application/json": { schema: FindPathBFSRequest } } },
    },
    responses: {
        200: {
            description: "Find shortest path between two nodes using BFS",
            content: { "application/json": { schema: FindPathBFSResponse } },
        },
        400: { description: "Invalid request" },
        404: { description: "Maze or path not found" },
    },
});

findPathRouter.post("/findPath", (req, res) => {
    const parsed = FindPathBFSRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const result = findPathBFS(parsed.data);
    if (!result) return res.status(404).json({ error: "Maze or path not found" });

    return res.json(FindPathBFSResponse.parse(result));
});
