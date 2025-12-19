import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const CreateSessionResponse = z.object({
    sessionId: z.uuid(),
    qrPayload: z.string(),
});
