import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { CompilePathRequest, CompilePathResponse } from "../schemas";
import { pathToDsl } from "../services"
import { z } from "zod";


export const mazePathRouter = Router()

const MazeId = z.object( { mazeId: z.coerce.number().int().nonnegative() })

registry.registerPath({
    method: "post", 
    path: "/maze/{mazeId}/dsl",
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

mazePathRouter.post("/:mazeId/dsl", (req, res) => {
    const parsed = CompilePathRequest.safeParse(req.body); 
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

    const mazeId = MazeId.safeParse(req.params); 
    if (!mazeId.success) return res.status(400).json({ error: mazeId.error.issues })

    const { path } = parsed.data

    // TODO: validate the path: validPath(mazeId, path)

    const dsl = pathToDsl(path);

    return res.json(CompilePathResponse.parse({ dsl }));
});