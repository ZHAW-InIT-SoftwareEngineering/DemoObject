import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { CompilePathRequest, CompilePathResponse } from "../schemas";
import { pathToDsl } from "../services";


export const mazePathRouter = Router();

registry.registerPath({
    method: "post", 
    path: "/mazePaths/toDSL",
    request: {
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


mazePathRouter.post("/toDSL", (req, res) => {
    const parsed = CompilePathRequest.safeParse(req.body); 
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

    const { mazeId, path } = parsed.data
    console.log("mazeId: " + mazeId)

    // TODO
    /*
    1. loadMaze(mazeId)
    2, validPath(mazeId, path)
    3. dsl = pathToDsl(path) - DONE
    */
    const dsl = pathToDsl(path);

    return res.json(CompilePathResponse.parse({ dsl }));
});
