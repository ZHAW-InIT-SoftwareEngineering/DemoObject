import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);


export const CreateSessionRequest = z.object({
    mazeId: z.object({ mazeId: z.string().min(1) })
});

export const CreateSessionResponse = z.object({
    sessionId: z.uuid(),
    qrPayload: z.string(),
});
