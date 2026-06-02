import type { Maze, Path } from "../domain";

export function isValidPath(maze: Maze, path: Path): boolean {
  const coordToId = new Map(maze.nodes.map((node) => [`${node.x}:${node.y}`, node.mazeNodeId]));
  const nodeIds: number[] = [];

  for (const point of path) {
    const id = coordToId.get(`${point.x}:${point.y}`);
    if (id === undefined) {
      return false;
    }
    nodeIds.push(id);
  }

  const nodeSet = new Set(maze.nodes.map((node) => node.mazeNodeId));
  const edgeSet = new Set(maze.edges.flatMap((edge) => [`${edge.from}-${edge.to}`, `${edge.to}-${edge.from}`]));
  if (nodeIds.some((id) => !nodeSet.has(id))) return false;
  for (let i = 1; i < nodeIds.length; i++) {
    if (!edgeSet.has(`${nodeIds[i - 1]}-${nodeIds[i]}`)) return false;
  }
  return true;
}

export function isCompleteStartToGoalPath(maze: Maze, path: Path): boolean {
  if (path.length < 2) return false;
  if (!isValidPath(maze, path)) return false;

  const coordToId = new Map(maze.nodes.map((node) => [`${node.x}:${node.y}`, node.mazeNodeId]));
  const firstNodeId = coordToId.get(`${path[0].x}:${path[0].y}`);
  const lastPoint = path[path.length - 1];
  const lastNodeId = coordToId.get(`${lastPoint.x}:${lastPoint.y}`);

  return firstNodeId === maze.startNodeId && lastNodeId === maze.endNodeId;
}
