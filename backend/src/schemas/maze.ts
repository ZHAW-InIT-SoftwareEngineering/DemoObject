import { z } from "zod";

// Graph with coordinates in top-left origin (x→right, y→down)
export const MazeNode = z.object({
    id: z.number().int().nonnegative(),
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
});

export const MazeEdge = z.object({
    from: z.number().int().nonnegative(),
    to: z.number().int().nonnegative(),
});

// Wall segment between two node ids (for rendering, not walkable)
export const MazeWall = z.object({
    from: z.number().int().nonnegative(),
    to: z.number().int().nonnegative(),
});

export const Maze = z.object({
    id: z.number().int().nonnegative(),
    nodes: z.array(MazeNode).min(1),
    edges: z.array(MazeEdge),
    walls: z.array(MazeWall).default([]),
});

export type Maze = z.infer<typeof Maze>;