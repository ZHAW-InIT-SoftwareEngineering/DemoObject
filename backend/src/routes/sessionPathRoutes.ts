import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { UpdatePathRequest, UpdatePathResponse, StorePathRequest, StorePathResponse, RetrievePathRequest, RetrievePathResponse } from "../schemas";
import { pathToDsl, retrieveSessionService, updateSessionService } from "../services";
import type { SessionDataClass } from "../models/session";
import { z } from "zod";

export const sessionPathRouter = Router();

const SessionIdParams = z.object( { sessionId: z.uuid() });

registry.registerPath({
    method: "put",
    path: "/session/{sessionId}/path",
    summary: "Store a user-selected path and its DSL representation bund to a session ",
    request: {
        params: SessionIdParams,
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
    method: "get",
    path: "/session/{sessionId}/path",
    summary: "Retrieve stored path for a session",
    request: { params: SessionIdParams },
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
    path: "/session/{sessionId}",
    summary: "Update stored path for a session",
    request: {
        params: SessionIdParams,
        body: { content: { "application/json": { schema: UpdatePathRequest } } }, 
        },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: UpdatePathResponse } },
        },
        404: { description: "Session not found" },
    },
});

sessionPathRouter.put("/:sessionId/path", async (req, res) => {
    const params = SessionIdParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: params.error.issues });

    const body = StorePathRequest.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.issues });

    const { sessionId } = params.data;
    const { path } = body.data;

    const session = await retrieveSessionService(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const dsl = pathToDsl(path);

    const updated = await updateSessionService(sessionId, { path, dsl });
    if (!updated) return res.status(404).json({ error: "Session not found" });

    return res.json(StorePathResponse.parse({ mazeId: updated.mazeId, path: updated.path, dsl: updated.dsl }));
});

sessionPathRouter.get("/:sessionId/path", async (req, res) => {
    const parsed = SessionIdParams.safeParse(req.params)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

    const { sessionId } = parsed.data
    const session = await retrieveSessionService(sessionId)

    if (!session || !session.path || !session.dsl) return res.status(404).json({ error: "Session path not found" })

    return res.json(RetrievePathResponse.parse({ mazeId: session.mazeId, path: session.path, dsl: session.dsl }))
});


sessionPathRouter.patch("/:sessionId", async (req, res) => {
    const parsed = UpdatePathRequest.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    
    const params = SessionIdParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: params.error.issues });

    const { path, dsl, ...rest } = parsed.data;
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

    const updatedDoc = await updateSessionService(params.data.sessionId, cleanedPayload);
    if (!updatedDoc) return res.status(404).json({ error: "Session not found" });
    
    return res.json(UpdatePathResponse.parse(updatedDoc));
})
