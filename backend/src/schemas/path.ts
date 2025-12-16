import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const Point = z.object({
    x: z.number().int(),
    y: z.number().int()
});

export const Path = z.array(Point).min(2);

// schema for the request of the user
export const CompilePathRequest = z.object({
    mazeId: z.string().min(1),
    path: Path
});

// schema for the server answer (i.e. the DSL)
export const CompilePathResponse = z.object({
    // TODO instead of a string probably an array of "blocks" i.e.: [RIGHT, LEFT, LEFT, STRAIGHT, ...]
    dsl: z.string()
});
