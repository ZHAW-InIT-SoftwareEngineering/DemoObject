import { z } from "zod";
import { Path, PathAlgorithm, PathExplorationStep } from "../../domain/index";

export const ShortestPathResponse = z.object({
  algorithm: PathAlgorithm,
  path: Path,
  length: z.number().int().nonnegative(),
  cost: z.number().int().nonnegative(),
  explorationSteps: z.array(PathExplorationStep),
});

export const ShortestPathQuery = z.object({
  algorithm: PathAlgorithm.optional().openapi({
    param: { name: "algorithm", in: "query", required: false },
  }),
});
