import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";

export type MazeBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type MazeCoord = {
  x: number;
  y: number;
};

export type MazeCoordSegment = {
  from: MazeCoord;
  to: MazeCoord;
};

type BoundarySide = "left" | "right" | "top" | "bottom";

export function getMazeBounds(
  nodes: readonly MazesMazeIdGet200ResponseNodesInner[],
): MazeBounds {
  if (nodes.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }

  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function getMazeOpeningSide(
  startNode: MazesMazeIdGet200ResponseNodesInner,
  bounds: MazeBounds,
): BoundarySide {
  const boundaryCandidates: BoundarySide[] = [];

  if (startNode.x === bounds.minX) boundaryCandidates.push("left");
  if (startNode.x === bounds.maxX) boundaryCandidates.push("right");
  if (startNode.y === bounds.minY) boundaryCandidates.push("top");
  if (startNode.y === bounds.maxY) boundaryCandidates.push("bottom");

  return (
    boundaryCandidates[0] ??
    ([
      { side: "left" as const, distance: startNode.x - bounds.minX },
      { side: "right" as const, distance: bounds.maxX - startNode.x },
      { side: "top" as const, distance: startNode.y - bounds.minY },
      { side: "bottom" as const, distance: bounds.maxY - startNode.y },
    ].sort((a, b) => a.distance - b.distance)[0]?.side ?? "left")
  );
}

export function buildMazeWallCoordSegments(
  maze: MazesMazeIdGet200Response,
): MazeCoordSegment[] {
  const nodes = maze.nodes ?? [];
  if (nodes.length === 0) return [];

  const bounds = getMazeBounds(nodes);
  const nodeCoordById = new Map<number, MazeCoord>();

  for (const node of nodes) {
    nodeCoordById.set(node.mazeNodeId, { x: node.x, y: node.y });
  }

  const wallSegments: MazeCoordSegment[] = [];
  for (const wall of maze.walls ?? []) {
    const from = nodeCoordById.get(wall.from);
    const to = nodeCoordById.get(wall.to);
    if (!from || !to) continue;

    wallSegments.push({
      from,
      to,
    });
  }

  const startNode = nodes.find((node) => node.mazeNodeId === maze.startNodeId);
  if (!startNode) return wallSegments;

  const openingSide = getMazeOpeningSide(startNode, bounds);

  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    if (!(openingSide === "left" && y === startNode.y)) {
      wallSegments.push({
        from: { x: bounds.minX, y },
        to: { x: bounds.minX - 1, y },
      });
    }

    if (!(openingSide === "right" && y === startNode.y)) {
      wallSegments.push({
        from: { x: bounds.maxX, y },
        to: { x: bounds.maxX + 1, y },
      });
    }
  }

  for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
    if (!(openingSide === "top" && x === startNode.x)) {
      wallSegments.push({
        from: { x, y: bounds.minY },
        to: { x, y: bounds.minY - 1 },
      });
    }

    if (!(openingSide === "bottom" && x === startNode.x)) {
      wallSegments.push({
        from: { x, y: bounds.maxY },
        to: { x, y: bounds.maxY + 1 },
      });
    }
  }

  return wallSegments;
}
