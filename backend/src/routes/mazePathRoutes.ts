import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { CompilePathRequest, CompilePathResponse } from "../schemas";


export const mazePathRouter = Router();

registry.registerPath({
    method: "post", 
    path: "/maze-paths/compile",
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


mazePathRouter.post("/compile", (req, res) => {
    const parsed = CompilePathRequest.safeParse(req.body); 
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

    const { mazeId, path } = parsed.data
    console.log("mazeId: " + mazeId)
    console.log("path: " + path)

    // TODO
    /*
    1. loadMaze(mazeId)
    2, validPath(mazeId, path)
    3. dsl = pathToDsl(path)
    */
    const dsl = pathToDsl(path);

    return res.json(CompilePathResponse.parse({ dsl }));
});

// TODO: 
/*
1. implement real translation to DSL instead of hard coded 
2. as soon as implemented aka stable move into the service dir!!
*/
function pathToDsl(path: Array<{ x: number; y: number }>) {
  return "R3,U2,L1";
}