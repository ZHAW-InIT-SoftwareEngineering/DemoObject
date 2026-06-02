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
    userName: Session.shape.userName,
    qrPayload: z.string(),
});

export const SessionPublic = Session.omit({ createdAt: true });

export const UpdateSessionRequest = SessionPublic.omit({
    sessionId: true,
    userName: true,
    dsl: true,
    submittedAt: true,
}).extend({
    expiresAt: z.coerce.date().optional(),
});

export const UpdateSessionResponse = UpdateSessionRequest;
