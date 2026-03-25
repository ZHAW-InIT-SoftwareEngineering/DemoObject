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

export type Maze = z.infer<typeof Maze>;
export type MazeId = Maze["mazeId"];

// Archived original maze definition. This file is intentionally not imported
// by the runtime maze registry, so it is not served to the frontend.
const WIDTH = 12;
const HEIGHT = 12;

// Walls are defined between adjacent cells. Key format: `${x},${y}`.
// Vertical walls are between (x,y) and (x+1,y).
// Horizontal walls are between (x,y) and (x,y+1).
const verticalWallCoords = new Set<string>();
const horizontalWallCoords = new Set<string>();

function addVerticalWallColumn(
  x: number,
  yStart: number,
  yEnd: number,
  gaps: number[] = [],
) {
  for (let y = yStart; y <= yEnd; y++) {
    if (gaps.includes(y)) continue;
    verticalWallCoords.add(`${x},${y}`);
  }
}

function addHorizontalWallRow(
  y: number,
  xStart: number,
  xEnd: number,
  gaps: number[] = [],
) {
  for (let x = xStart; x <= xEnd; x++) {
    if (gaps.includes(x)) continue;
    horizontalWallCoords.add(`${x},${y}`);
  }
}

addVerticalWallColumn(3, 0, 11, [7]);
addVerticalWallColumn(7, 2, 11, [3]);

addHorizontalWallRow(4, 0, 6, [3]);
addHorizontalWallRow(8, 4, 11, [10]);

type Coord = [number, number];
type EdgeCoords = [Coord, Coord];

function edge(x1: number, y1: number, x2: number, y2: number): EdgeCoords {
  return [[x1, y1], [x2, y2]];
}

function setVerticalWall(x: number, y: number, isBlocked: boolean) {
  const key = `${x},${y}`;
  if (isBlocked) {
    verticalWallCoords.add(key);
  } else {
    verticalWallCoords.delete(key);
  }
}

function setHorizontalWall(x: number, y: number, isBlocked: boolean) {
  const key = `${x},${y}`;
  if (isBlocked) {
    horizontalWallCoords.add(key);
  } else {
    horizontalWallCoords.delete(key);
  }
}

function applyEdgeAdjustment(
  [[x1, y1], [x2, y2]]: EdgeCoords,
  isBlocked: boolean,
) {
  if (x1 === x2) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y < maxY; y++) {
      setHorizontalWall(x1, y, isBlocked);
    }
    return;
  }

  if (y1 === y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x < maxX; x++) {
      setVerticalWall(x, y1, isBlocked);
    }
    return;
  }

  throw new Error(
    `Unsupported diagonal edge adjustment: (${x1},${y1})-(${x2},${y2})`,
  );
}

function applyEdgeAdjustments(edges: EdgeCoords[], isBlocked: boolean) {
  for (const currentEdge of edges) {
    applyEdgeAdjustment(currentEdge, isBlocked);
  }
}

const baseBlockedEdges: EdgeCoords[] = [
  edge(1, 2, 2, 2),
  edge(1, 3, 2, 3),
  edge(0, 1, 1, 1),
  edge(0, 2, 1, 2),
  edge(0, 6, 1, 6),
  edge(0, 7, 1, 7),
  edge(1, 6, 2, 6),
  edge(1, 7, 2, 7),
  edge(1, 9, 2, 9),
  edge(0, 9, 1, 9),
  edge(1, 10, 2, 10),
  edge(5, 0, 6, 0),
  edge(5, 2, 6, 2),
  edge(8, 2, 9, 2),
  edge(9, 2, 10, 2),
  edge(10, 1, 11, 1),
  edge(8, 1, 8, 2),
  edge(9, 1, 9, 2),
  edge(11, 1, 11, 2),
  edge(8, 3, 8, 4),
  edge(9, 3, 9, 4),
  edge(1, 3, 1, 4),
  edge(1, 5, 1, 6),
  edge(1, 9, 1, 10),
  edge(2, 0, 3, 0),
  edge(2, 1, 3, 1),
  edge(2, 3, 3, 3),
];

const baseOpenEdges: EdgeCoords[] = [
  edge(4, 2, 5, 2),
  edge(2, 5, 2, 6),
  edge(1, 4, 1, 5),
  edge(3, 0, 4, 0),
  edge(3, 2, 4, 2),
];

const additionalBlockedEdges: EdgeCoords[] = [
  edge(1, 1, 2, 1),
  edge(5, 1, 6, 1),
  edge(5, 6, 5, 7),
  edge(6, 6, 6, 7),
  edge(7, 6, 7, 7),
  edge(4, 7, 4, 8),
  edge(5, 7, 5, 8),
  edge(6, 7, 6, 8),
  edge(9, 4, 10, 4),
  edge(9, 5, 10, 5),
  edge(9, 6, 10, 6),
  edge(9, 8, 10, 8),
  edge(10, 3, 10, 4),
  edge(11, 4, 11, 5),
  edge(10, 5, 10, 6),
  edge(4, 10, 4, 11),
  edge(5, 10, 5, 11),
  edge(7, 10, 7, 11),
  edge(9, 9, 9, 10),
  edge(9, 9, 10, 9),
  edge(9, 10, 10, 10),
  edge(10, 10, 10, 11),
  edge(6, 3, 7, 3),
  edge(7, 3, 8, 3),
  edge(7, 1, 8, 1),
  edge(11, 6, 11, 7),
  edge(11, 7, 11, 8),
  edge(2, 5, 2, 6),
  edge(3, 6, 3, 7),
  edge(5, 9, 5, 10),
  edge(2, 9, 2, 10),
  edge(7, 9, 7, 10),
];

const additionalOpenEdges: EdgeCoords[] = [
  edge(3, 4, 4, 4),
  edge(5, 8, 5, 9),
  edge(1, 4, 2, 4),
  edge(7, 5, 8, 5),
  edge(10, 11, 11, 11),
  edge(3, 10, 4, 10),
  edge(7, 9, 8, 9),
];

applyEdgeAdjustments(baseBlockedEdges, true);
applyEdgeAdjustments(baseOpenEdges, false);
applyEdgeAdjustments(additionalBlockedEdges, true);
applyEdgeAdjustments(additionalOpenEdges, false);

function hasVerticalWall(x: number, y: number) {
  return verticalWallCoords.has(`${x},${y}`);
}

function hasHorizontalWall(x: number, y: number) {
  return horizontalWallCoords.has(`${x},${y}`);
}

function buildMaze(mazeId: number): Maze {
  const nodes = [];
  const edges = [];
  const walls = [];

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const nodeId = y * WIDTH + x;
      nodes.push({ mazeNodeId: nodeId, x, y });

      if (x + 1 < WIDTH) {
        const rightId = y * WIDTH + (x + 1);
        if (!hasVerticalWall(x, y)) {
          edges.push({ from: nodeId, to: rightId });
        } else {
          walls.push({ from: nodeId, to: rightId });
        }
      }

      if (y + 1 < HEIGHT) {
        const downId = (y + 1) * WIDTH + x;
        if (!hasHorizontalWall(x, y)) {
          edges.push({ from: nodeId, to: downId });
        } else {
          walls.push({ from: nodeId, to: downId });
        }
      }
    }
  }

  const startNodeId = 0;
  const endNodeId = WIDTH * HEIGHT - 1;

  return { mazeId, startNodeId, endNodeId, nodes, edges, walls };
}

export const mazes: Record<number, Maze> = {
  2: buildMaze(2),
};
