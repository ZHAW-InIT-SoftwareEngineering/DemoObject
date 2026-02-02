import { z } from "zod";
import { Maze as MazeSchema } from "../schemas";
import { getMazeById } from "./mazeService";

type MazeType = z.infer<typeof MazeSchema>;

// Compute shortest path using BFS on an undirected graph.
export function findPathBFS(startNodeId: number, endNodeId: number, mazeId: number) {
  const maze = getMazeById(mazeId);
  if (!maze) return undefined;

  const { nodes, edges } = maze as MazeType;
  const nodeSet = new Set(nodes.map(n => n.id));
  if (!nodeSet.has(startNodeId) || !nodeSet.has(endNodeId)) return undefined;

  // Build adjacency list
  const adj = new Map<number, number[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(({ from, to }) => {
    if (adj.has(from) && adj.has(to)) {
      adj.get(from)!.push(to);
      adj.get(to)!.push(from);
    }
  });

  const queue: number[] = [];
  const visited = new Set<number>();
  const parent = new Map<number, number>();

  queue.push(startNodeId);
  visited.add(startNodeId);

  while (queue.length) {
    const current = queue.shift()!;
    if (current === endNodeId) break;

    const neighbors = adj.get(current) ?? [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        visited.add(next);
        parent.set(next, current);
        queue.push(next);
      }
    }
  }

  if (!visited.has(endNodeId)) return undefined;

  // Reconstruct path
  const path: number[] = [];
  let cur = endNodeId;
  while (cur !== undefined) {
    path.push(cur);
    const p = parent.get(cur);
    if (p === undefined) break;
    cur = p;
  }
  path.reverse();

  return { path, length: path.length - 1 };
}
