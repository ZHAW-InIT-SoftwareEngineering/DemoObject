import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { Maze } from "../schemas";
import { getMazeById } from "../services";
import { z } from "zod";

export const mazeRouter = Router();

registry.registerPath({
    method: "get",
    path: "/mazes/{mazeId}",
    summary: "Retrieve a maze definition",
    request: {
        params: z.object({ mazeId: z.string().min(1) })
    },
    responses: {
        200: {
            description: "Maze found",
            content: { "application/json": { schema: Maze } }
        },
        404: { description: "Maze not found" }
    },
});

mazeRouter.get("/:mazeId", (req, res) => {
    const { mazeId } = req.params;
    const maze = getMazeById(mazeId);

    if (!maze) return res.status(404).json({ error: "Maze not found" });

    return res.json(maze);
});
