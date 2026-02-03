"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSessionResponse = exports.UpdateSessionRequest = exports.SessionPublic = exports.CreateSessionResponse = exports.CreateSessionRequest = exports.SessionId = void 0;
const zod_1 = require("zod");
const session_1 = require("../../domain/session");
exports.SessionId = zod_1.z.object({
    sessionId: session_1.Session.shape.sessionId,
});
exports.CreateSessionRequest = zod_1.z.object({
    mazeId: session_1.Session.shape.mazeId
});
exports.CreateSessionResponse = zod_1.z.object({
    sessionId: session_1.Session.shape.sessionId,
    qrPayload: zod_1.z.string(),
});
exports.SessionPublic = session_1.Session.omit({ createdAt: true });
exports.UpdateSessionRequest = exports.SessionPublic.omit({ sessionId: true }).extend({
    expiresAt: zod_1.z.coerce.date().optional(),
});
exports.UpdateSessionResponse = exports.UpdateSessionRequest;
