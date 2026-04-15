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

const WIDTH = 10;
const HEIGHT = 10;

// Node ids are assigned row-by-row from top-left to bottom-right:
// `mazeNodeId = y * WIDTH + x`
// row 0 => 0  1  2  3  4  5  6  7  8  9
// row 1 => 10 11 12 13 14 15 16 17 18 19
// row 2 => 20 21 22 23 24 25 26 27 28 29

type WallKey = `${number}-${number}`;
type AdjacentWall = {
  from: number;
  to: number;
};

function getNodeCoord(nodeId: number) {
  if (nodeId < 0 || nodeId >= WIDTH * HEIGHT) {
    throw new Error(`Node id ${nodeId} is out of bounds for a ${WIDTH}x${HEIGHT} maze`);
  }

  return {
    x: nodeId % WIDTH,
    y: Math.floor(nodeId / WIDTH),
  };
}

function toWallKey(fromNodeId: number, toNodeId: number): WallKey {
  const minNodeId = Math.min(fromNodeId, toNodeId);
  const maxNodeId = Math.max(fromNodeId, toNodeId);
  return `${minNodeId}-${maxNodeId}`;
}

function wall(fromNodeId: number, toNodeId: number): AdjacentWall {
  const from = getNodeCoord(fromNodeId);
  const to = getNodeCoord(toNodeId);
  const manhattanDistance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

  if (manhattanDistance !== 1) {
    throw new Error(
      `Walls can only be defined between orthogonally adjacent node ids: ${fromNodeId} <-> ${toNodeId}`,
    );
  }

  const normalizedFrom = Math.min(fromNodeId, toNodeId);
  const normalizedTo = Math.max(fromNodeId, toNodeId);
  return { from: normalizedFrom, to: normalizedTo };
}

function createBlockedWallKeySet(walls: readonly AdjacentWall[]) {
  const wallKeys = new Set<WallKey>();

  for (const currentWall of walls) {
    const wallKey = toWallKey(currentWall.from, currentWall.to);
    if (wallKeys.has(wallKey)) {
      throw new Error(`Duplicate wall definition detected: ${currentWall.from} <-> ${currentWall.to}`);
    }
    wallKeys.add(wallKey);
  }

  return wallKeys;
}

// Single source of truth for the active maze layout.
// Add `wall(fromId, toId)` to block movement between two adjacent fields.
// Remove the line again if you want to reopen that connection.
const blockedWalls: AdjacentWall[] = [

  wall(31,41),
  wall(32,42),
  wall(1,11),
  wall(11,12),
  wall(46,56),
  wall(96,97),
  wall(5,15),
  wall(17,27),
  wall(69,79),
  wall(95,96),
  wall(74,75),
  wall(71,72),
  wall(65,75),

  // Barrier between columns 0 and 1.
  wall(10, 11),

  // Barrier between columns 1 and 2.
  wall(41, 42),

  // Barrier between columns 2 and 3.
  wall(2, 3),
  wall(22, 23),
  wall(32, 33),
  wall(42, 43),
  wall(52, 53),
  wall(62, 63),
  wall(82, 83),

  // Barrier between columns 5 and 6.
  wall(15, 16),
  wall(25, 26),
  wall(35, 36),
  wall(45, 46),
  wall(55, 56),
  wall(65, 66),
  wall(85, 86),

  // Barrier between columns 7 and 8.
  wall(7, 8),
  wall(17, 18),
  wall(37, 38),
  wall(57, 58),
  wall(67, 68),
  wall(77, 78),
  wall(87, 88),

  // Barrier between rows 2 and 3.
  wall(20, 30),
  wall(21, 31),
  wall(24, 34),
  wall(25, 35),
  wall(26, 36),
  wall(27, 37),
  wall(28, 38),

  // Barrier between columns 3 and 4
  wall(13, 14),
  wall(33, 34),

  // Barrier between rows 4 and 5
  wall(44, 45),
  wall(49, 59),
  wall(48, 49),

  // Barrier between columns 4 and 5
  wall(44, 54),

  // Barrier between rows 5 and 6.
  wall(51, 61),
  wall(52, 62),
  wall(53, 63),
  wall(54, 64),
  wall(57, 67),
  wall(58, 68),

  // Barrier between rows 7 and 8.
  wall(70, 80),
  wall(72, 82),
  wall(73, 83),
  wall(74, 84),
  wall(84, 85),
  wall(76, 86),
  wall(78, 88),

  // Barrier between rows 8 and 9.
  wall(18, 19),
  wall(28, 29),
  wall(68, 69),
  wall(82, 92),

  // Barrier between columns 8 and 9.
  wall(84, 94)

];

const blockedWallKeys = createBlockedWallKeySet(blockedWalls);

function buildMaze(mazeId: number): Maze {
  const nodes: Maze["nodes"] = [];
  const edges: Maze["edges"] = [];
  const walls: Maze["walls"] = [];

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const nodeId = y * WIDTH + x;
      nodes.push({ mazeNodeId: nodeId, x, y });

      if (x + 1 < WIDTH) {
        const rightId = nodeId + 1;
        if (blockedWallKeys.has(toWallKey(nodeId, rightId))) {
          walls.push({ from: nodeId, to: rightId });
        } else {
          edges.push({ from: nodeId, to: rightId });
        }
      }

      if (y + 1 < HEIGHT) {
        const downId = nodeId + WIDTH;
        if (blockedWallKeys.has(toWallKey(nodeId, downId))) {
          walls.push({ from: nodeId, to: downId });
        } else {
          edges.push({ from: nodeId, to: downId });
        }
      }
    }
  }

  const startNodeId = 0;
  const endNodeId = WIDTH * HEIGHT - 1;

  return { mazeId, startNodeId, endNodeId, nodes, edges, walls };
}
export const mazes: Record<number, Maze> = {
  0: buildMaze(0),
};
