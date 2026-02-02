import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { Maze } from "../schemas";
import { getMazeById } from "../services";
import { z } from "zod";

export const mazeRouter = Router()

const MazeParams = z.object({ mazeId: z.coerce.number().int().nonnegative() })

registry.registerPath({
    method: "get",
    path: "/maze/{mazeId}",
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

mazeRouter.get("/:mazeId", (req, res) => {
    const mazeId = MazeParams.safeParse(req.params)
    if (!mazeId.success) return res.status(400).json({ error: mazeId.error.issues })
    
    const maze = getMazeById(mazeId.data.mazeId)

    if (!maze) return res.status(404).json({ error: "Maze not found" });

    return res.json(maze);
});
