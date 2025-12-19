import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const SessionPathPayload = z.object({
    mazeId: z.string().min(1),
    path: z.array(z.number().int().nonnegative()).min(2),
});

export const SessionPathResponse = z.object({
    mazeId: z.string().min(1),
    path: z.array(z.number().int().nonnegative()).min(2),
    dsl: z.array(z.string()),
});
