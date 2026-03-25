import { Path, Point, DSL, Session, Maze } from "../../domain/index";
import { z } from "zod";

const PathExplorationStep = z.object({
    from: Point,
    to: Point,
    discovered: z.boolean(),
});

export const ShortestPathResponse = z.object({
    path: Path,
    length: z.number().int().nonnegative(),
    explorationSteps: z.array(PathExplorationStep),
});

export const CompilePathRequest = z.object({
    path: Path
});

export const CompilePathResponse = z.object({
    dsl: DSL
});


export const StorePathRequest = z.object({
    path: Path,
});

export const StorePathResponse = z.object({
    mazeId: Maze.shape.mazeId,
    path: Path,
    dsl: DSL
});

export const RetrievePathRequest = z.object({
    sessionId: Session.shape.sessionId,
});

export const RetrievePathResponse = z.object({
    mazeId: Maze.shape.mazeId,
    path: Path,
    dsl: DSL
});

export const UpdatePathResponse = Session;
