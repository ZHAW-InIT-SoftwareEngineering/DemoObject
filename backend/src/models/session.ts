import { ObjectId } from "mongodb";
import { z } from "zod";
import { Path } from "../schemas/path";

export const SessionDataClass = z.object({
    _id: z.instanceof(ObjectId).optional(),
    sessionId: z.uuid(),
    mazeId: z.string().min(1),
    status: z.enum(["PENDING", "READY"]).default("PENDING"),
    path: Path.optional(),
    dsl: z.array(z.string()).optional(),
    createdAt: z.date().default(() => new Date()),
    expiresAt: z.date().optional(),
});

export const SessionPublic = SessionDataClass.omit({ _id: true });

export type SessionDataClass = z.infer<typeof SessionDataClass>;
export type SessionPublic = z.infer<typeof SessionPublic>;
