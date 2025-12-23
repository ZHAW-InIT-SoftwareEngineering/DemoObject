import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const Point = z.object({
    x: z.number().int(),
    y: z.number().int()
});

export const Path = z.array(Point).min(2);

export const CompilePathRequest = z.object({
    mazeId: z.string().min(1),
    path: Path
});

export const CompilePathResponse = z.object({
    dsl: z.array(z.string())
});

export type Path = z.infer<typeof Path>;
