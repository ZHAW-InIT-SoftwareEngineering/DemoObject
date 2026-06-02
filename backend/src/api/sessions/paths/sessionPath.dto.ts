import { z } from "zod";
import { DSL, Maze, Path, Session } from "../../../domain/index";

export const StorePathRequest = z.object({
  path: Path,
  elapsedMs: Session.shape.elapsedMs.unwrap(),
});

export const StorePathResponse = z.object({
  mazeId: Maze.shape.mazeId,
  path: Path,
  dsl: DSL,
  elapsedMs: Session.shape.elapsedMs.unwrap(),
  submittedAt: Session.shape.submittedAt.unwrap(),
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
