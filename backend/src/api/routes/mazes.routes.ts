import { Router } from "express";
import { registry } from "../../openapi/openapiRegistry";
import {
  CompilePathRequest,
  CompilePathResponse,
  ShortestPathQuery,
  ShortestPathResponse,
  MazeIdParams,
} from "../schemas";
import { getMazeById, computeDSLFromPath, computeShortestPath } from "../../services";
import { Maze } from "../../domain";
import { isValidPath } from "../../util";


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
    method: "post", 
    path: "/mazes/{mazeId}/paths/dsl",
    summary: "Compute the DSL of a specific provided path through the maze.",
    tags: ["mazes"],
    request: {
        params: MazeIdParams,
        body: { content: { "application/json": { schema: CompilePathRequest } } },
    },
    responses: {
        200: {
            description: "Compile a user-provided maze path do DSL",
            content: {"application/json": {schema: CompilePathResponse}}
        },
        400: { description: "Invalid request"},
        404: { description: "Maze not found" },
        412: { description: "Invalid path"}
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

mazeRouter.post("/:mazeId/paths/dsl", (req, res) => {
    const body = CompilePathRequest.safeParse(req.body); 
    if (!body.success) return res.status(400).json({ error: body.error.issues })
    const { path } = body.data
    
    const params = MazeIdParams.safeParse(req.params); 
    if (!params.success) return res.status(400).json({ error: params.error.issues })
    const mazeId = params.data.mazeId

    const maze = getMazeById(mazeId)
    if (!maze) return res.status(404).json({ error: "Maze not found" });

    if (isValidPath(maze, path)){
        const dsl = computeDSLFromPath(path);
        return res.json(CompilePathResponse.parse({ dsl }));
    } else {
        return res.status(412).json({ error: "invalid path" })
    }
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
