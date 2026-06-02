import { Router } from "express";
import { registry } from "../../openapi/openapiRegistry";
import { computeShortestPath, getMazeById } from "../../services";
import { Maze } from "../../domain";
import { mazeDisplayRouter } from "./display/display.routes";
import { MazeIdParams } from "./maze.dto";
import { mazePathsRouter } from "./paths/paths.routes";
import { ShortestPathQuery, ShortestPathResponse } from "./shortestPath.dto";


export const mazeRouter = Router()


registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}",
    summary: "Retrieve a maze definition",
    tags: ["mazes"],
    request: {
        params: MazeIdParams
    },
    responses: {
        200: {
            description: "Maze found",
            content: { "application/json": { schema: Maze } }
        },
        404: { description: "Maze not found" }
    },
});

registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}/shortest-path",
    tags: ["mazes"],
    request: {
        params: MazeIdParams,
        query: ShortestPathQuery,
    },
    responses: {
        200: {
            description: "Find shortest path between two nodes using BFS or Dijkstra",
            content: { "application/json": { schema: ShortestPathResponse } },
        },
        400: { description: "Invalid request" },
        404: { description: "Maze or path not found" },
    },
});

mazeRouter.get("/:mazeId", (req, res) => {
    const params = MazeIdParams.safeParse(req.params)
    if (!params.success) return res.status(400).json({ error: params.error.issues })
    const mazeId = params.data.mazeId
    
    const maze = getMazeById(mazeId)

    if (!maze) return res.status(404).json({ error: "Maze not found" });

    return res.json( maze );
});

mazeRouter.get("/:mazeId/shortest-path", (req, res) => {
    const params = MazeIdParams.safeParse(req.params)
    if (!params.success) return res.status(400).json({ error: params.error.issues })
    const mazeId = params.data.mazeId
    const query = ShortestPathQuery.safeParse(req.query)
    if (!query.success) return res.status(400).json({ error: query.error.issues })
    const algorithm = query.data.algorithm ?? "bfs"

    const result = computeShortestPath(mazeId, algorithm);
    if (!result) return res.status(404).json({ error: "Maze or path not found" });

    return res.json(ShortestPathResponse.parse(result));
});

mazeRouter.use("/:mazeId/paths", mazePathsRouter);
mazeRouter.use("/:mazeId", mazeDisplayRouter);
