import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { Maze, CompilePathRequest, CompilePathResponse, ShortestPathRequest, ShortestPathResponse } from "../schemas";
import { getMazeById, findPathBFS } from "../services";
import { z } from "zod";
import { pathToDsl } from "../services"

export const mazeRouter = Router()

const MazeParams = z.object({ mazeId: z.coerce.number().int().nonnegative() })
const MazeId = z.object( { mazeId: z.coerce.number().int().nonnegative() })


registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}",
    summary: "Retrieve a maze definition",
    request: {
        params: MazeParams
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
    request: {
        params: MazeId,
        body: { content: { "application/json": { schema: CompilePathRequest } } },
    },
    responses: {
        200: {
            description: "Compile a user-provided maze path do DSL",
            content: {"application/json": {schema: CompilePathResponse}}
        },
        400: { description: "Invalid request / invalid path"}
    },
});

registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}/shortest-path",
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

mazeRouter.get("/:mazeId", (req, res) => {
    const mazeId = MazeParams.safeParse(req.params)
    if (!mazeId.success) return res.status(400).json({ error: mazeId.error.issues })
    
    const maze = getMazeById(mazeId.data.mazeId)

    if (!maze) return res.status(404).json({ error: "Maze not found" });

    return res.json(maze);
});

mazeRouter.post("/:mazeId/paths/dsl", (req, res) => {
    const parsed = CompilePathRequest.safeParse(req.body); 
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

    const mazeId = MazeId.safeParse(req.params); 
    if (!mazeId.success) return res.status(400).json({ error: mazeId.error.issues })

    const { path } = parsed.data

    // TODO: validate the path: validPath(mazeId, path)

    const dsl = pathToDsl(path);

    return res.json(CompilePathResponse.parse({ dsl }));
});

mazeRouter.get("/:mazeId/shortest-path", (req, res) => {
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
