import { ObjectId } from "mongodb";
import { z } from "zod";


export const SessionDataClass = z.object({
    _id: z.instanceof(ObjectId).optional(),
    sessionId: z.uuid(),
    mazeId: z.string().min(1),
    status: z.enum(["PENDING", "READY"]).default("PENDING"),
    path: z.array(z.number().int().nonnegative()).min(2).optional(),
    createdAt: z.date().default( () => new Date()),
    expiresAt: z.date().optional(),
});

export type SessionDataClass = z.infer<typeof SessionDataClass>;

