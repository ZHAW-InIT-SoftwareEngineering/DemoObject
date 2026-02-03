import type { Path } from "../domain";
import { getMazeById } from "../services";

  export function isValidPath(mazeId: number, path: Path): boolean {
    const maze = getMazeById(mazeId);
    const coordToId = new Map(maze.nodes.map(n => [`${n.x}:${n.y}`, n.mazeNodeId]));
    const nodeIds = path.map(p => {
      const id = coordToId.get(`${p.x}:${p.y}`);
      if (id === undefined) throw new Error(`No maze node at (${p.x}, ${p.y})`);
      return id;
    });

    const nodeSet = new Set(maze.nodes.map(n => n.mazeNodeId));
    const edgeSet = new Set(maze.edges.flatMap(e => [`${e.from}-${e.to}`, `${e.to}-${e.from}`]));
    if (nodeIds.some(id => !nodeSet.has(id))) return false;
    for (let i = 1; i < nodeIds.length; i++) {
      if (!edgeSet.has(`${nodeIds[i - 1]}-${nodeIds[i]}`)) return false;
    }
    return true;
  }