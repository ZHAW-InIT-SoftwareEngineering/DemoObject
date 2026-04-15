import { z } from "zod";

export const MazeNode = z.object({
  mazeNodeId: z.number().int().nonnegative(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
});

export const MazeEdge = z.object({
  from: z.number().int().nonnegative(),
  to: z.number().int().nonnegative(),
});

export const MazeWall = z.object({
  from: z.number().int().nonnegative(),
  to: z.number().int().nonnegative(),
});

export const Maze = z.object({
  mazeId: z.number().int().nonnegative(),
  startNodeId: z.number().int().nonnegative(),
  endNodeId: z.number().int().nonnegative(),
  nodes: z.array(MazeNode).min(1),
  edges: z.array(MazeEdge),
  walls: z.array(MazeWall).default([]),
});

export type MazeNode = z.infer<typeof MazeNode>;
export type MazeEdge = z.infer<typeof MazeEdge>;
export type MazeWall = z.infer<typeof MazeWall>;
export type Maze = z.infer<typeof Maze>;
export type MazeId = Maze["mazeId"];
