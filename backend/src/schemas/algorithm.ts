import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const ShortestPathRequest = z.object({
    startNodeId: z.coerce.number().int().nonnegative(),
    endNodeId: z.coerce.number().int().nonnegative(),
});

export const ShortestPathResponse = z.object({
    // Sequence of node ids representing the shortest path (inclusive of start/end)
    path: z.array(z.number().int().nonnegative()),
    length: z.number().int().nonnegative(),
});
