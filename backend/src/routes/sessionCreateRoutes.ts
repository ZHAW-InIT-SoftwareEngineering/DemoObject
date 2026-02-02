import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { CreateSessionRequest, CreateSessionResponse } from "../schemas";
import { createSessionService } from "../services";

export const sessionRouter = Router();

registry.registerPath({
    method: "post",
    path: "/session",
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
