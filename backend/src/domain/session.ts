import { z } from "zod";
import { Path } from "./path";


export const Session = z.object({
    sessionId: z.uuid(),
    mazeId: z.number().int().nonnegative(),
    status: z.enum(["CREATED", "ON-GOING", "CLOSED"]).default("CREATED"),
    path: Path.optional(),
    dsl: z.array(z.string()).optional(),
    elapsedMs: z.number().int().nonnegative().optional(),
    createdAt: z.date().default(() => new Date()),
    expiresAt: z.date().optional(),
});

export type Session = z.infer<typeof Session>;
