import { maze1 } from "./maze1";

type EdgeKey = `${number}-${number}`;

const WIDTH = 6;

function nodeId(x: number, y: number) {
  return y * WIDTH + x;
}

function toEdgeKey(fromNodeId: number, toNodeId: number): EdgeKey {
  const normalizedFrom = Math.min(fromNodeId, toNodeId);
  const normalizedTo = Math.max(fromNodeId, toNodeId);
  return `${normalizedFrom}-${normalizedTo}`;
}

// Maze 3 keeps Maze 1's layout, but adds the weighted edges used for Dijkstra.
const weightByEdgeKey = new Map<EdgeKey, number>([
  [toEdgeKey(nodeId(1, 0), nodeId(2, 0)), 1],
  [toEdgeKey(nodeId(2, 0), nodeId(3, 0)), 1],
  [toEdgeKey(nodeId(3, 0), nodeId(4, 0)), 1],
  [toEdgeKey(nodeId(4, 0), nodeId(5, 0)), 1],

  [toEdgeKey(nodeId(2, 4), nodeId(2, 3)), 3],
  [toEdgeKey(nodeId(2, 3), nodeId(2, 2)), 3],

  [toEdgeKey(nodeId(5, 0), nodeId(5, 1)), 1],
  [toEdgeKey(nodeId(5, 1), nodeId(5, 2)), 5],
  [toEdgeKey(nodeId(5, 2), nodeId(5, 3)), 5],
  [toEdgeKey(nodeId(4, 1), nodeId(5, 1)), 9],
]);

export const maze3 = {
  ...maze1,
  mazeId: 3,
  edges: maze1.edges.map((edge) => ({
    ...edge,
    weight: weightByEdgeKey.get(toEdgeKey(edge.from, edge.to)) ?? edge.weight,
  })),
};
