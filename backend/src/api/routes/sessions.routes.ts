import { Router } from "express";
import { registry } from "../../openapi/openapiRegistry";
import { createSessionService, 
         retrieveSessionService, 
         updateSessionService, 
         storePathAndDSLForSession, 
         computeDSLFromPath } from "../../services";
import type { Session } from "../../domain/session";

import { UpdatePathResponse, 
         StorePathRequest, 
         StorePathResponse, 
         RetrievePathResponse, 
         SessionId, 
         CreateSessionRequest, 
         CreateSessionResponse, 
         UpdateSessionRequest,
         UpdateSessionResponse} from "../schemas";


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

registry.registerPath({
    method: "put",
    path: "/sessions/{sessionId}/paths",
    summary: "Store a user-selected path and its automatically transpiled DSL representation bund to a session ",
    request: {
        params: SessionId,
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
    method: "patch",
    path: "/sessions/{sessionId}",
    summary: "Update stored information (status, path or expiresAt) for a specific session",
    request: {
        params: SessionId,
        body: { content: { "application/json": { schema: UpdateSessionResponse } } }, 
        },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: UpdateSessionResponse } },
        },
        404: { description: "Session not found" },
    },
});

registry.registerPath({
    method: "get",
    path: "/sessions/{sessionId}/paths",
    summary: "Retrieve stored path for a session",
    request: { params: SessionId },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: RetrievePathResponse } },
        },
        404: { description: "Session not found" },
    },
});

sessionRouter.post("/", async (req, res) => {
    const parsed = CreateSessionRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const { mazeId } = parsed.data;
    
    const sessionId = await(createSessionService(mazeId))
    
    const qrPayload = `session:${sessionId}`;
    const location =  req.protocol + '://' + req.get('host') + '/sessions/' + sessionId
    return res.status(201)
        .set('Location', location)
        .json(CreateSessionResponse.parse({ sessionId: sessionId, qrPayload }));
});

sessionRouter.put("/:sessionId/paths", async (req, res) => {
    const params = SessionId.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: params.error.issues });

    const body = StorePathRequest.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.issues });

    const { sessionId } = params.data;
    const { path } = body.data;

    const session = await retrieveSessionService(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const dsl = computeDSLFromPath(path);

    const updated = await updateSessionService(sessionId, { path, dsl });
    if (!updated) return res.status(404).json({ error: "Session not found" });

    return res.json(StorePathResponse.parse({ mazeId: updated.mazeId, path: updated.path, dsl: updated.dsl }));
});

sessionRouter.patch("/:sessionId", async (req, res) => {
    const parsed = UpdateSessionRequest.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const update: Partial<Session> = { ...parsed.data };

    const params = SessionId.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: params.error.issues });
    const sessionId = params.data.sessionId

    if (update.path) {
        update.dsl = computeDSLFromPath(update.path);
    }

    const updatedDoc = await updateSessionService(sessionId, update);
    if (!updatedDoc) return res.status(404).json({ error: "Session not found" });

    return res.json(UpdateSessionResponse.parse(updatedDoc));
})

sessionRouter.get("/:sessionId/paths", async (req, res) => {
    const parsed = SessionId.safeParse(req.params)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

    const { sessionId } = parsed.data
    const session = await retrieveSessionService(sessionId)

    if (!session || !session.path || !session.dsl) return res.status(404).json({ error: "Session path not found" })

    return res.json(RetrievePathResponse.parse({ mazeId: session.mazeId, path: session.path, dsl: session.dsl }))
});
