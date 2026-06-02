import { z } from "zod";
import { Maze, Path, Session } from "../../../domain/index";

const DisplayLeaderboardEntry = z.object({
  userName: Session.shape.userName,
  mazeId: Maze.shape.mazeId,
  path: Path,
  elapsedMs: Session.shape.elapsedMs.unwrap(),
  submittedAt: Session.shape.submittedAt.unwrap(),
  rank: z.number().int().positive(),
  moveCount: z.number().int().nonnegative(),
  pathLength: z.number().int().nonnegative(),
});

export const DisplayFeedResponse = z.object({
  mazeId: Maze.shape.mazeId,
  generatedAt: z.date(),
  leaderboard: z.array(DisplayLeaderboardEntry),
});

export const DisplayNextResponse = z.object({
  mazeId: Maze.shape.mazeId,
  generatedAt: z.date(),
  animation: DisplayLeaderboardEntry.nullable(),
});
