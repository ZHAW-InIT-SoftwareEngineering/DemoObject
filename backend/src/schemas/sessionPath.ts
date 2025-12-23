import { z } from "zod";
import { Path } from "./path";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const StorePathRequest = z.object({
    sessionId: z.uuid(),
    path: Path,
});

export const StorePathResponse = z.object({
    mazeId: z.string().min(1),
    path: Path,
    dsl: z.array(z.string()),
});

export const RetrievePathRequest = z.object({
    sessionId: z.uuid(),
});

export const RetrievePathResponse = z.object({
    mazeId: z.string().min(1),
    path: Path,
    dsl: z.array(z.string()),
});
