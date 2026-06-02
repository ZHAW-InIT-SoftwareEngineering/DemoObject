import { Router } from "express";
import { registry } from "../../openapi/openapiRegistry";
import { createSessionService, patchSessionService } from "../../services";
import type { Session } from "../../domain/session";
import { sessionPathsRouter } from "./paths/paths.routes";

import {
    CreateSessionRequest,
    CreateSessionResponse,
    SessionId,
    UpdateSessionRequest,
    UpdateSessionResponse,
} from "./session.dto";


export const sessionRouter = Router();


registry.registerPath({
    method: "post",
    path: "/sessions",
    summary: "Create a new session and return a sessionId (and QR payload)",
    tags: ["sessions"],
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
        404: { description: "Maze not found" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/sessions/{sessionId}",
    summary: "Update stored information (status, path or expiresAt) for a specific session",
    tags: ["sessions"],
    request: {
        params: SessionId,
        body: { content: { "application/json": { schema: UpdateSessionRequest } } }, 
        },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: UpdateSessionResponse } },
        },
        404: { description: "Session not found" },
    },
});

sessionRouter.post("/", async (req, res) => {
    const parsed = CreateSessionRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const { mazeId } = parsed.data;
    
    const session = await(createSessionService(mazeId))
    if (!session) return res.status(404).json({ error: "Maze not found" });
    
    const qrPayload = `session:${session.sessionId}`;
    const location =  req.protocol + '://' + req.get('host') + '/sessions/' + session.sessionId
    return res.status(201)
        .set('Location', location)
        .json(CreateSessionResponse.parse({
            sessionId: session.sessionId,
            userName: session.userName,
            qrPayload,
        }));
});

sessionRouter.patch("/:sessionId", async (req, res) => {
    const parsed = UpdateSessionRequest.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const update: Partial<Session> = { ...parsed.data };

    const params = SessionId.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: params.error.issues });
    const sessionId = params.data.sessionId

    const result = await patchSessionService(sessionId, update);
    if (result.status === "session-not-found") {
        return res.status(404).json({ error: "Session not found" });
    }
    if (result.status === "maze-not-found") {
        return res.status(404).json({ error: "Maze not found" });
    }
    if (result.status === "already-submitted") {
        return res.status(409).json({ error: "Final path already submitted" });
    }
    if (result.status === "invalid-path") {
        return res.status(412).json({ error: "Path must start at the maze start and end at the goal" });
    }

    return res.json(UpdateSessionResponse.parse(result.session));
})

sessionRouter.use("/:sessionId/paths", sessionPathsRouter);
