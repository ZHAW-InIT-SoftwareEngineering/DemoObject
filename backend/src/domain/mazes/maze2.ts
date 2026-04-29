import { createGridMazeFactory, type AdjacentWall } from "./buildGridMaze";

const WIDTH = 24;
const HEIGHT = 24;
const MAZE_SEED = 2774;

const { wall, buildMaze } = createGridMazeFactory(WIDTH, HEIGHT);

function nodeId(x: number, y: number) {
  return y * WIDTH + x;
}

function wallKey(fromNodeId: number, toNodeId: number) {
  const normalizedFrom = Math.min(fromNodeId, toNodeId);
  const normalizedTo = Math.max(fromNodeId, toNodeId);
  return `${normalizedFrom}-${normalizedTo}`;
}

function createSeededRandom(seed: number) {
  let currentSeed = seed >>> 0;

  return () => {
    currentSeed += 0x6d2b79f5;
    let next = currentSeed;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(items: T[], random: () => number) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(random() * (i + 1));
    [items[i], items[swapIndex]] = [items[swapIndex]!, items[i]!];
  }
}

function getAdjacentNodeIds(currentNodeId: number) {
  const x = currentNodeId % WIDTH;
  const y = Math.floor(currentNodeId / WIDTH);
  const neighbors: number[] = [];

  if (x > 0) neighbors.push(nodeId(x - 1, y));
  if (x + 1 < WIDTH) neighbors.push(nodeId(x + 1, y));
  if (y > 0) neighbors.push(nodeId(x, y - 1));
  if (y + 1 < HEIGHT) neighbors.push(nodeId(x, y + 1));

  return neighbors;
}

const carvedEdgeKeys = (() => {
  const random = createSeededRandom(MAZE_SEED);
  const visitedNodeIds = new Set<number>([0]);
  const stack = [0];
  const edgeKeys = new Set<string>();

  while (stack.length > 0) {
    const currentNodeId = stack[stack.length - 1]!;
    const unvisitedNeighborNodeIds = getAdjacentNodeIds(currentNodeId).filter(
      (neighborNodeId) => !visitedNodeIds.has(neighborNodeId),
    );

    shuffleInPlace(unvisitedNeighborNodeIds, random);

    const nextNodeId = unvisitedNeighborNodeIds[0];
    if (nextNodeId === undefined) {
      stack.pop();
      continue;
    }

    visitedNodeIds.add(nextNodeId);
    edgeKeys.add(wallKey(currentNodeId, nextNodeId));
    stack.push(nextNodeId);
  }

  if (visitedNodeIds.size !== WIDTH * HEIGHT) {
    throw new Error(`Maze 2 generation did not visit all nodes. Visited ${visitedNodeIds.size}.`);
  }

  if (edgeKeys.size !== WIDTH * HEIGHT - 1) {
    throw new Error(`Maze 2 generation did not produce a spanning tree. Carved ${edgeKeys.size} edges.`);
  }

  return edgeKeys;
})();

const blockedWalls = (() => {
  const walls: AdjacentWall[] = [];

  // Build a deterministic perfect maze by carving a spanning tree and blocking
  // every remaining adjacency. This maximizes wall density while preserving a
  // single valid route between any two cells.
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const currentNodeId = nodeId(x, y);

      if (x + 1 < WIDTH) {
        const rightNodeId = nodeId(x + 1, y);
        if (!carvedEdgeKeys.has(wallKey(currentNodeId, rightNodeId))) {
          walls.push(wall(currentNodeId, rightNodeId));
        }
      }

      if (y + 1 < HEIGHT) {
        const downNodeId = nodeId(x, y + 1);
        if (!carvedEdgeKeys.has(wallKey(currentNodeId, downNodeId))) {
          walls.push(wall(currentNodeId, downNodeId));
        }
      }
    }
  }

  return walls;
})();

export const maze2 = buildMaze({
  mazeId: 2,
  blockedWalls,
});
