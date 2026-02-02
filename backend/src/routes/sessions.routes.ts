import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { CreateSessionRequest, CreateSessionResponse } from "../schemas";
import { createSessionService } from "../services";
import { UpdatePathRequest, UpdatePathResponse, StorePathRequest, StorePathResponse, RetrievePathRequest, RetrievePathResponse } from "../schemas";
import { pathToDsl, retrieveSessionService, updateSessionService } from "../services";
import type { SessionDataClass } from "../models/session";
import { z } from "zod";

export const sessionRouter = Router();


registry.registerPath({
    method: "post",
    path: "/sessions",
    summary: "Create a new session and return a sessionId (and QR payload)",
    request: {
            body: { content: { "application/json": { schema: CreateSessionRequest } } }, 
        },
    responses: {
        201: {
            description: "Session created",
            headers: {
                Location: {
                    description: "Cannoncial URI of the new created session resource", 
                    schema: {type: "string", format: "uri"}
                },
            },
            content: { "application/json": { schema: CreateSessionResponse } },
        },
    },
});

sessionRouter.post("/", async (req, res) => {
    const parsed = CreateSessionRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const { mazeId } = parsed.data;
    
    const sessionId = await(createSessionService(mazeId))
    
    const qrPayload = `session:${sessionId}`;
    const location =  req.protocol + '://' + req.get('host') + '/session/' + sessionId
    return res.status(201)
        .set('Location', location)
        .json(CreateSessionResponse.parse({ sessionId: sessionId, qrPayload }));
});

const SessionIdParams = z.object( { sessionId: z.uuid() });

registry.registerPath({
    method: "put",
    path: "/{sessionId}/paths",
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
    path: "/{sessionId}/paths",
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
    path: "/{sessionId}",
    summary: "Update stored information (status, path, dsl, expiresAt) for a specific session",
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

sessionRouter.put("/:sessionId/paths", async (req, res) => {
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

sessionRouter.get("/:sessionId/paths", async (req, res) => {
    const parsed = SessionIdParams.safeParse(req.params)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

    const { sessionId } = parsed.data
    const session = await retrieveSessionService(sessionId)

    if (!session || !session.path || !session.dsl) return res.status(404).json({ error: "Session path not found" })

    return res.json(RetrievePathResponse.parse({ mazeId: session.mazeId, path: session.path, dsl: session.dsl }))
});


sessionRouter.patch("/:sessionId", async (req, res) => {
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

