import { z } from "zod";
import { Session } from "../../domain/session";


export const SessionId = z.object({
    sessionId: Session.shape.sessionId, 
});


export const CreateSessionRequest = z.object({
    mazeId: Session.shape.mazeId
});

export const CreateSessionResponse = z.object({
    sessionId: Session.shape.sessionId,
    qrPayload: z.string(),
});

export const SessionPublic = Session.omit({ createdAt: true });

export const UpdateSessionRequest = SessionPublic.partial().extend({
    expiresAt: z.coerce.date().optional(),
});
