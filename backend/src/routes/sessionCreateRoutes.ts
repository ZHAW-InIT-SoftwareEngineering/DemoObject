import { Router } from "express";
import { registry } from "../openapi/openapiRegistry";
import { CreateSessionResponse } from "../schemas";
import { createSession } from "../services";

export const sessionRouter = Router();

registry.registerPath({
    method: "post",
    path: "/sessions",
    summary: "Create a new session and return a sessionId (and QR payload)",
    responses: {
        201: {
            description: "Session created",
            content: { "application/json": { schema: CreateSessionResponse } },
        },
    },
});

sessionRouter.post("/", (_req, res) => {
    const session = createSession();
    const qrPayload = `session:${session.id}`;
    return res.status(201).json(CreateSessionResponse.parse({ sessionId: session.id, qrPayload }));
});
