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

    // TODO
    /*
    1. loadMaze(mazeId)
    2, validPath(mazeId, path)
    3. dsl = pathToDsl(path) - DONE
    */
    const dsl = pathToDsl(path);

    return res.json(CompilePathResponse.parse({ dsl }));
});

function pathToDsl(path: Array<{ x: number; y: number }>) {
    const dslBlocks: string[] = [];

    for (let i = 1; i < path.length; i++) {
        const prevPoint = path[i - 1];
        const currentPoint = path[i];

        const dx = currentPoint.x - prevPoint.x;
        const dy = currentPoint.y - prevPoint.y;

        dslBlocks.push(decideDirection(dx, dy));
    }
    
    return dslBlocks;
}

function decideDirection(dx: number, dy: number): string {
    if (dx === 0 && dy > 0) return 'UP';
    if (dx > 0 && dy === 0) return 'RIGHT';
    if (dx < 0 && dy === 0) return 'LEFT';
    if (dx === 0 && dy < 0) return 'DOWN';
    return 'INVALID'; // diagonal move => not allowed!
}
