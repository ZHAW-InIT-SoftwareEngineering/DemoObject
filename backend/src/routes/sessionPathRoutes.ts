import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { StorePathRequest, StorePathResponse, RetrievePathRequest, RetrievePathResponse } from "../schemas";
import { pathToDsl, retrieveSessionService } from "../services";
import { isValidPath } from "../util";

export const sessionPathRouter = Router();

registry.registerPath({
    method: "post",
    path: "/sessions/storePath",
    summary: "Store a user-selected path and its DSL representation bund to a session ",
    request: {
        body: { content: { "application/json": { schema: StorePathRequest } } },
    },
    responses: {
        200: {
            description: "Path stored",
            content: { "application/json": { schema: StorePathResponse } },
        },
        400: { description: "Invalid request or path" },
        404: { description: "Session or maze not found" },
    },
});

registry.registerPath({
    method: "post",
    path: "/sessions/retrievePath",
    summary: "Retrieve stored path for a session",
    request: {body: { content: { "application/json": { schema: RetrievePathRequest } } }, 
            },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: RetrievePathResponse } },
        },
        404: { description: "Session or path not found" },
    },
});

sessionPathRouter.post("/storePath", async (req, res) => {
    const parsed = StorePathRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { sessionId, path } = parsed.data;
    const session = await(retrieveSessionService(sessionId));
    if (!session) return res.status(404).json({ error: "Session not found" });
    
    const mazeId = session.mazeId
    console.log(`This is the session.mazeId: ${mazeId}`)
    // TODO: might consider to include the isValidPath function from pathValidation.ts

    const dsl = pathToDsl(path);

    return res.json(StorePathResponse.parse({ mazeId, path, dsl }));
});

sessionPathRouter.post("/retrievePath", async (req, res) => {
    const parsed = RetrievePathRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { sessionId } = parsed.data;
    const session = await(retrieveSessionService(sessionId))
    if (!session || !session.path) return res.status(404).json({ error: "Session path not found" });
    
    return res.json(RetrievePathResponse.parse({sessionId: sessionId}));
});
