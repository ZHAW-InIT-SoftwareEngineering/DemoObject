import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { CreateSessionRequest, CreateSessionResponse } from "../schemas";
import { createSessionService } from "../services";

export const sessionRouter = Router();

registry.registerPath({
    method: "post",
    path: "/sessions/createSession",
    summary: "Create a new session and return a sessionId (and QR payload)",
    request: {
            body: { content: { "application/json": { schema: CreateSessionRequest } } }, 
        },
    responses: {
        201: {
            description: "Session created",
            content: { "application/json": { schema: CreateSessionResponse } },
        },
    },
});

sessionRouter.post("/createSession", async (req, res) => {
    const parsed = CreateSessionRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const { mazeId } = parsed.data;
    
    const sessionId = await(createSessionService(mazeId.mazeId))
    
    const qrPayload = `session:${sessionId}`;
    return res.status(201).json(CreateSessionResponse.parse({ sessionId: sessionId, qrPayload }));
});
