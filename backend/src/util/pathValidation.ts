import type { Path, Maze } from "../domain";

  export function isValidPath(maze: Maze, path: Path): boolean {
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