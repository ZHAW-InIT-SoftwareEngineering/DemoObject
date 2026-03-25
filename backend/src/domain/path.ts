import { z } from "zod"
import { Maze } from "./maze";


export const Point = z.object({
    x: z.number().int(),
    y: z.number().int()
});

export const Path = z.array(Point).min(2);
export type Path = z.infer<typeof Path>
export const PathExplorationStep = z.object({
    from: Point,
    to: Point,
    discovered: z.boolean(),
});
export type PathExplorationStep = z.infer<typeof PathExplorationStep>;

export function pathToDsl(path: Array<{ x: number; y: number }>) {
    const dslBlocks: string[] = [];

    for (let i = 1; i < path.length; i++) {
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
    if (dx === 0 && dy > 0) return 'DOWN';
    if (dx > 0 && dy === 0) return 'RIGHT';
    if (dx < 0 && dy === 0) return 'LEFT';
    if (dx === 0 && dy < 0) return 'UP';
    return 'INVALID'; // diagonal move => not allowed!
}

// Compute shortest path using BFS on an undirected graph.
export function findPathBFS(maze: Maze) {
  const { nodes, edges, startNodeId, endNodeId } = maze;

  const nodeSet = new Set(nodes.map((n) => n.mazeNodeId));
  if (!nodeSet.has(startNodeId) || !nodeSet.has(endNodeId)) return undefined;

  // Build adjacency list
  const adj = new Map<number, number[]>();
  nodes.forEach((n) => adj.set(n.mazeNodeId, []));
  edges.forEach(({ from, to }) => {
    if (adj.has(from) && adj.has(to)) {
      adj.get(from)!.push(to);
      adj.get(to)!.push(from);
    }
  });

  const queue: number[] = [];
  const visited = new Set<number>();
  const parent = new Map<number, number>();
  const explorationSteps: PathExplorationStep[] = [];

  queue.push(startNodeId);
  visited.add(startNodeId);

  let found = startNodeId === endNodeId;
  while (queue.length) {
    const current = queue.shift()!;
    if (current === endNodeId) {
      found = true;
      break;
    }

    const neighbors = adj.get(current) ?? [];
    for (const next of neighbors) {
      const currentNode = nodes.find((n) => n.mazeNodeId === current)!;
      const nextNode = nodes.find((n) => n.mazeNodeId === next)!;
      const discovered = !visited.has(next);
      explorationSteps.push({
        from: { x: currentNode.x, y: currentNode.y },
        to: { x: nextNode.x, y: nextNode.y },
        discovered,
      });

      if (!visited.has(next)) {
        visited.add(next);
        parent.set(next, current);
        queue.push(next);
        if (next === endNodeId) {
          found = true;
          break;
        }
      }
    }

    if (found) break;
  }

  if (!visited.has(endNodeId)) return undefined;

  // Reconstruct path (node ids -> coordinates)
  const nodePath: number[] = [];
  let cur = endNodeId;
  while (cur !== undefined) {
    nodePath.push(cur);
    const p = parent.get(cur);
    if (p === undefined) break;
    cur = p;
  }
  nodePath.reverse();

  const path: Path = nodePath.map((id) => {
    const node = nodes.find((n) => n.mazeNodeId === id);
    return { x: node!.x, y: node!.y };
  });

  return { path, length: path.length - 1, explorationSteps };
};
