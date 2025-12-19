import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const FindPathBFSRequest = z.object({
    mazeId: z.string().min(1),
    startNodeId: z.number().int().nonnegative(),
    endNodeId: z.number().int().nonnegative(),
});

export const FindPathBFSResponse = z.object({
    // Sequence of node ids representing the shortest path (inclusive of start/end)
    path: z.array(z.number().int().nonnegative()),
    length: z.number().int().nonnegative(),
});
