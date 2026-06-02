import { z } from "zod";
import { Path } from "./path";


export const Session = z.object({
    sessionId: z.uuid(),
    mazeId: z.number().int().nonnegative(),
    userName: z.string().min(1),
    status: z.enum(["CREATED", "ON-GOING", "CLOSED"]).default("CREATED"),
    path: Path.optional(),
    dsl: z.array(z.string()).optional(),
    elapsedMs: z.number().int().nonnegative().optional(),
    submittedAt: z.date().optional(),
    createdAt: z.date().default(() => new Date()),
    expiresAt: z.date().optional(),
});

export type Session = z.infer<typeof Session>;
