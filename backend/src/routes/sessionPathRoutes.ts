import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { UpdatePathRequest, UpdatePathResponse, StorePathRequest, StorePathResponse, RetrievePathRequest, RetrievePathResponse } from "../schemas";
import { pathToDsl, retrieveSessionService, updateSessionService } from "../services";
import type { SessionDataClass } from "../models/session";

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
        404: { description: "Session not found" },
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
        404: { description: "Session not found" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/sessions/updateSession",
    summary: "Update stored path for a session",
    request: {body: { content: { "application/json": { schema: UpdatePathRequest } } }, 
            },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: UpdatePathResponse } },
        },
        404: { description: "Session not found" },
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

    const updated = await updateSessionService(sessionId, { path, dsl });
    if (!updated) return res.status(404).json({ error: "Session not found" });

    return res.json(StorePathResponse.parse({ mazeId: updated.mazeId, path: updated.path, dsl: updated.dsl }));
});

sessionPathRouter.post("/retrievePath", async (req, res) => {
    const parsed = RetrievePathRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { sessionId } = parsed.data;
    const session = await(retrieveSessionService(sessionId))
    if (!session || !session.path || !session.dsl) return res.status(404).json({ error: "Session path not found" });
    
    return res.json(RetrievePathResponse.parse({ mazeId: session.mazeId, path: session.path, dsl: session.dsl }));
});


sessionPathRouter.patch("/updateSession", async (req, res) => {
    const parsed = UpdatePathRequest.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { sessionId, path, dsl, ...rest } = parsed.data;
    const updatePayload: Partial<SessionDataClass> = { ...rest };

    if (path) {
        updatePayload.path = path;
        updatePayload.dsl = dsl ?? pathToDsl(path);
    } else if (dsl) {
        updatePayload.dsl = dsl;
    }

    const cleanedPayload = Object.fromEntries(
        Object.entries(updatePayload).filter(([, value]) => value !== undefined)
    ) as Partial<SessionDataClass>;
    if (Object.keys(cleanedPayload).length === 0) {
        return res.status(400).json({ error: "No updates provided" });
    }

    const updatedDoc = await updateSessionService(sessionId, cleanedPayload);
    if (!updatedDoc) return res.status(404).json({ error: "Session not found" });
    
    return res.json(UpdatePathResponse.parse(updatedDoc));
})
