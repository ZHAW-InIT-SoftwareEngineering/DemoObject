import { z } from "zod";

export const MazeIdParams = z.object({
    mazeId: z.coerce
      .number()
      .int()
      .nonnegative()
      .openapi({ param: { name: "mazeId", in: "path", required: true } }),
});
