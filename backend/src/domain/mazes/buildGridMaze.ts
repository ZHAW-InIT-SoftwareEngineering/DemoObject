import type { Maze } from "../maze";

type WallKey = `${number}-${number}`;

export type AdjacentWall = {
  from: number;
  to: number;
};

export type AdjacentWeightedEdge = AdjacentWall & {
  weight: number;
};

type BuildGridMazeConfig = {
  mazeId: number;
  blockedWalls: readonly AdjacentWall[];
  weightedEdges?: readonly AdjacentWeightedEdge[];
  startNodeId?: number;
  endNodeId?: number;
};

function toWallKey(fromNodeId: number, toNodeId: number): WallKey {
  const minNodeId = Math.min(fromNodeId, toNodeId);
  const maxNodeId = Math.max(fromNodeId, toNodeId);
  return `${minNodeId}-${maxNodeId}`;
}

export function createGridMazeFactory(width: number, height: number) {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new Error(`Grid mazes require positive integer dimensions. Received ${width}x${height}.`);
  }

  const totalNodes = width * height;

  function assertNodeIdInBounds(nodeId: number, label = "Node id") {
    if (!Number.isInteger(nodeId) || nodeId < 0 || nodeId >= totalNodes) {
      throw new Error(`${label} ${nodeId} is out of bounds for a ${width}x${height} maze`);
    }
  }

  function getNodeCoord(nodeId: number) {
    assertNodeIdInBounds(nodeId);

    return {
      x: nodeId % width,
      y: Math.floor(nodeId / width),
    };
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

  function weightedEdge(
    fromNodeId: number,
    toNodeId: number,
    weight: number,
  ): AdjacentWeightedEdge {
    if (!Number.isInteger(weight) || weight <= 0) {
      throw new Error(`Edge weights must be positive integers. Received ${weight}.`);
    }

    return {
      ...wall(fromNodeId, toNodeId),
      weight,
    };
  }

  function createBlockedWallKeySet(walls: readonly AdjacentWall[]) {
    const wallKeys = new Set<WallKey>();

    for (const currentWall of walls) {
      const wallKey = toWallKey(currentWall.from, currentWall.to);
      if (wallKeys.has(wallKey)) {
        throw new Error(
          `Duplicate wall definition detected: ${currentWall.from} <-> ${currentWall.to}`,
        );
      }
      wallKeys.add(wallKey);
    }

    return wallKeys;
  }

  function createEdgeWeightByKey(weightedEdges: readonly AdjacentWeightedEdge[]) {
    const edgeWeightByKey = new Map<WallKey, number>();

    for (const weightedConnection of weightedEdges) {
      const edgeKey = toWallKey(weightedConnection.from, weightedConnection.to);
      if (edgeWeightByKey.has(edgeKey)) {
        throw new Error(
          `Duplicate edge weight definition detected: ${weightedConnection.from} <-> ${weightedConnection.to}`,
        );
      }

      edgeWeightByKey.set(edgeKey, weightedConnection.weight);
    }

    return edgeWeightByKey;
  }

  function buildMaze({
    mazeId,
    blockedWalls,
    weightedEdges = [],
    startNodeId = 0,
    endNodeId = totalNodes - 1,
  }: BuildGridMazeConfig): Maze {
    assertNodeIdInBounds(startNodeId, "Start node id");
    assertNodeIdInBounds(endNodeId, "End node id");

    const blockedWallKeys = createBlockedWallKeySet(blockedWalls);
    const edgeWeightByKey = createEdgeWeightByKey(weightedEdges);
    const nodes: Maze["nodes"] = [];
    const edges: Maze["edges"] = [];
    const walls: Maze["walls"] = [];

    for (const blockedWallKey of blockedWallKeys) {
      if (edgeWeightByKey.has(blockedWallKey)) {
        throw new Error(`Cannot assign a weight to a blocked wall (${blockedWallKey}).`);
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nodeId = y * width + x;
        nodes.push({ mazeNodeId: nodeId, x, y });

        if (x + 1 < width) {
          const rightId = nodeId + 1;
          const rightEdgeKey = toWallKey(nodeId, rightId);
          if (blockedWallKeys.has(rightEdgeKey)) {
            walls.push({ from: nodeId, to: rightId });
          } else {
            edges.push({
              from: nodeId,
              to: rightId,
              weight: edgeWeightByKey.get(rightEdgeKey) ?? 1,
            });
          }
        }

        if (y + 1 < height) {
          const downId = nodeId + width;
          const downEdgeKey = toWallKey(nodeId, downId);
          if (blockedWallKeys.has(downEdgeKey)) {
            walls.push({ from: nodeId, to: downId });
          } else {
            edges.push({
              from: nodeId,
              to: downId,
              weight: edgeWeightByKey.get(downEdgeKey) ?? 1,
            });
          }
        }
      }
    }

    return { mazeId, startNodeId, endNodeId, nodes, edges, walls };
  }

  return { buildMaze, wall, weightedEdge };
}
