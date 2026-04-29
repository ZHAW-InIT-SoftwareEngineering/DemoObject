import { z } from "zod";
import type { Maze, MazeEdge, MazeNode } from "./maze";

export const Point = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

export const Path = z.array(Point).min(2);
export type Path = z.infer<typeof Path>;

export const PathAlgorithm = z.enum(["bfs", "dijkstra"]);
export type PathAlgorithm = z.infer<typeof PathAlgorithm>;

export const PathExplorationStep = z.object({
  from: Point,
  to: Point,
  discovered: z.boolean(),
  improved: z.boolean(),
  candidateCost: z.number().int().nonnegative(),
});
export type PathExplorationStep = z.infer<typeof PathExplorationStep>;

export type ShortestPathResult = {
  algorithm: PathAlgorithm;
  path: Path;
  length: number;
  cost: number;
  explorationSteps: PathExplorationStep[];
};

type AdjacencyEntry = {
  nodeId: number;
  weight: number;
};

export function pathToDsl(path: Array<{ x: number; y: number }>) {
  const dslBlocks: string[] = [];

  for (let i = 1; i < path.length; i += 1) {
    const prevPoint = path[i - 1];
    const currentPoint = path[i];

    const dx = currentPoint.x - prevPoint.x;
    const dy = currentPoint.y - prevPoint.y;

    dslBlocks.push(decideDirection(dx, dy));
  }

  return dslBlocks;
}

function decideDirection(dx: number, dy: number): string {
  // Screen/maze coordinates use top-left origin: y increases downward.
  // So positive dy means moving down, negative dy means moving up.
  if (dx === 0 && dy > 0) return "DOWN";
  if (dx > 0 && dy === 0) return "RIGHT";
  if (dx < 0 && dy === 0) return "LEFT";
  if (dx === 0 && dy < 0) return "UP";
  return "INVALID"; // diagonal move => not allowed!
}

function buildAdjacency(edges: MazeEdge[], nodes: MazeNode[]) {
  const adjacency = new Map<number, AdjacencyEntry[]>();

  for (const node of nodes) {
    adjacency.set(node.mazeNodeId, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.from)?.push({ nodeId: edge.to, weight: edge.weight });
    adjacency.get(edge.to)?.push({ nodeId: edge.from, weight: edge.weight });
  }

  return adjacency;
}

function buildNodeById(nodes: MazeNode[]) {
  return new Map(nodes.map((node) => [node.mazeNodeId, node]));
}

function getNodeOrThrow(nodeById: Map<number, MazeNode>, nodeId: number) {
  const node = nodeById.get(nodeId);
  if (!node) {
    throw new Error(`Maze node ${nodeId} is missing from the maze definition.`);
  }

  return node;
}

function toPoint(node: MazeNode) {
  return {
    x: node.x,
    y: node.y,
  };
}

function reconstructPath(
  endNodeId: number,
  parentByNodeId: Map<number, number>,
  nodeById: Map<number, MazeNode>,
): Path {
  const nodePath: number[] = [];
  let currentNodeId: number | undefined = endNodeId;

  while (currentNodeId !== undefined) {
    nodePath.push(currentNodeId);
    const parentNodeId = parentByNodeId.get(currentNodeId);
    if (parentNodeId === undefined) {
      break;
    }
    currentNodeId = parentNodeId;
  }

  nodePath.reverse();

  return nodePath.map((nodeId) => {
    const node = getNodeOrThrow(nodeById, nodeId);
    return { x: node.x, y: node.y };
  });
}

// Compute shortest path using BFS on an undirected unweighted graph.
export function findPathBFS(maze: Maze): ShortestPathResult | undefined {
  const { nodes, edges, startNodeId, endNodeId } = maze;

  const nodeSet = new Set(nodes.map((node) => node.mazeNodeId));
  if (!nodeSet.has(startNodeId) || !nodeSet.has(endNodeId)) return undefined;

  const adjacency = buildAdjacency(edges, nodes);
  const nodeById = buildNodeById(nodes);
  const queue: number[] = [startNodeId];
  const visited = new Set<number>([startNodeId]);
  const parentByNodeId = new Map<number, number>();
  const distanceByNodeId = new Map<number, number>([[startNodeId, 0]]);
  const explorationSteps: PathExplorationStep[] = [];

  let queueIndex = 0;
  let found = startNodeId === endNodeId;

  while (queueIndex < queue.length) {
    const currentNodeId = queue[queueIndex]!;
    queueIndex += 1;

    if (currentNodeId === endNodeId) {
      found = true;
      break;
    }

    const currentDistance = distanceByNodeId.get(currentNodeId) ?? 0;
    const neighbors = adjacency.get(currentNodeId) ?? [];

    for (const { nodeId: nextNodeId } of neighbors) {
      const discovered = !visited.has(nextNodeId);
      explorationSteps.push({
        from: toPoint(getNodeOrThrow(nodeById, currentNodeId)),
        to: toPoint(getNodeOrThrow(nodeById, nextNodeId)),
        discovered,
        improved: discovered,
        candidateCost: currentDistance + 1,
      });

      if (!discovered) {
        continue;
      }

      visited.add(nextNodeId);
      parentByNodeId.set(nextNodeId, currentNodeId);
      distanceByNodeId.set(nextNodeId, currentDistance + 1);
      queue.push(nextNodeId);

      if (nextNodeId === endNodeId) {
        found = true;
        break;
      }
    }

    if (found) {
      break;
    }
  }

  if (!visited.has(endNodeId)) return undefined;

  const path = reconstructPath(endNodeId, parentByNodeId, nodeById);

  return {
    algorithm: "bfs",
    path,
    length: path.length - 1,
    cost: path.length - 1,
    explorationSteps,
  };
}

function findLowestCostNodeId(
  openNodeIds: Set<number>,
  distanceByNodeId: Map<number, number>,
) {
  let bestNodeId: number | undefined;
  let bestCost = Number.POSITIVE_INFINITY;

  for (const nodeId of openNodeIds) {
    const currentCost = distanceByNodeId.get(nodeId) ?? Number.POSITIVE_INFINITY;
    if (currentCost < bestCost) {
      bestNodeId = nodeId;
      bestCost = currentCost;
    }
  }

  return bestNodeId;
}

// Compute the lowest-cost path using Dijkstra on an undirected weighted graph.
export function findPathDijkstra(maze: Maze): ShortestPathResult | undefined {
  const { nodes, edges, startNodeId, endNodeId } = maze;

  const nodeSet = new Set(nodes.map((node) => node.mazeNodeId));
  if (!nodeSet.has(startNodeId) || !nodeSet.has(endNodeId)) return undefined;

  const adjacency = buildAdjacency(edges, nodes);
  const nodeById = buildNodeById(nodes);
  const parentByNodeId = new Map<number, number>();
  const distanceByNodeId = new Map<number, number>();
  const openNodeIds = new Set<number>([startNodeId]);
  const settledNodeIds = new Set<number>();
  const explorationSteps: PathExplorationStep[] = [];

  for (const node of nodes) {
    distanceByNodeId.set(node.mazeNodeId, Number.POSITIVE_INFINITY);
  }
  distanceByNodeId.set(startNodeId, 0);

  while (openNodeIds.size > 0) {
    const currentNodeId = findLowestCostNodeId(openNodeIds, distanceByNodeId);
    if (currentNodeId === undefined) {
      break;
    }

    openNodeIds.delete(currentNodeId);
    if (settledNodeIds.has(currentNodeId)) {
      continue;
    }

    settledNodeIds.add(currentNodeId);
    if (currentNodeId === endNodeId) {
      break;
    }

    const currentCost = distanceByNodeId.get(currentNodeId) ?? Number.POSITIVE_INFINITY;
    const neighbors = adjacency.get(currentNodeId) ?? [];

    for (const { nodeId: nextNodeId, weight } of neighbors) {
      const knownCost = distanceByNodeId.get(nextNodeId) ?? Number.POSITIVE_INFINITY;
      const candidateCost = currentCost + weight;
      const discovered = !Number.isFinite(knownCost);
      const improved = candidateCost < knownCost;

      explorationSteps.push({
        from: toPoint(getNodeOrThrow(nodeById, currentNodeId)),
        to: toPoint(getNodeOrThrow(nodeById, nextNodeId)),
        discovered,
        improved,
        candidateCost,
      });

      if (!improved) {
        continue;
      }

      distanceByNodeId.set(nextNodeId, candidateCost);
      parentByNodeId.set(nextNodeId, currentNodeId);
      openNodeIds.add(nextNodeId);
    }
  }

  const totalCost = distanceByNodeId.get(endNodeId) ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(totalCost)) return undefined;

  const path = reconstructPath(endNodeId, parentByNodeId, nodeById);

  return {
    algorithm: "dijkstra",
    path,
    length: path.length - 1,
    cost: totalCost,
    explorationSteps,
  };
}
