import { Path, Point, DSL, Session, Maze, PathAlgorithm } from "../../domain/index";
import { z } from "zod";

const PathExplorationStep = z.object({
    from: Point,
    to: Point,
    discovered: z.boolean(),
    improved: z.boolean(),
    candidateCost: z.number().int().nonnegative(),
});

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

export const CompilePathRequest = z.object({
    path: Path
});

export const CompilePathResponse = z.object({
    dsl: DSL
});


export const StorePathRequest = z.object({
    path: Path,
    elapsedMs: Session.shape.elapsedMs.unwrap(),
});

export const StorePathResponse = z.object({
    mazeId: Maze.shape.mazeId,
    path: Path,
    dsl: DSL,
    elapsedMs: Session.shape.elapsedMs.unwrap(),
});

export const RetrievePathRequest = z.object({
    sessionId: Session.shape.sessionId,
});

export const RetrievePathResponse = z.object({
    mazeId: Maze.shape.mazeId,
    path: Path,
    dsl: DSL,
    elapsedMs: Session.shape.elapsedMs.unwrap(),
});

export const UpdatePathResponse = Session;
