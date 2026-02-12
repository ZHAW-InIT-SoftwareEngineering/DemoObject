import type { MazesMazeIdGet200Response } from "@/api";
import type { AnimationSceneData, Vec3 } from "./types";
import { edgeKeysToNodePath } from "./pathFromEdgeKeys";

const EMPTY_SCENE_DATA: AnimationSceneData = {
  mazeEdgeLines: [],
  routeLine: [],
  visibleRouteLine: [],
  startPoint: null,
  endPoint: null,
  floorSize: [8, 8],
};

const WORLD_SCALE = 2;

export function buildAnimationSceneData(
  maze: MazesMazeIdGet200Response | null,
  edgeKeys: string[],
  progress: number,
): AnimationSceneData {
  if (!maze) return EMPTY_SCENE_DATA;

  const nodes = maze.nodes ?? [];
  const edges = maze.edges ?? [];
  if (nodes.length === 0) return EMPTY_SCENE_DATA;

  const minX = Math.min(...nodes.map((n) => n.x));
  const maxX = Math.max(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxY = Math.max(...nodes.map((n) => n.y));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const toWorld = (x: number, y: number): Vec3 => [
    (x - centerX) * WORLD_SCALE,
    0,
    (y - centerY) * WORLD_SCALE,
  ];

  const nodeWorldById = new Map<number, Vec3>();
  for (const node of nodes) {
    nodeWorldById.set(node.mazeNodeId, toWorld(node.x, node.y));
  }

  const mazeEdgeLines: Vec3[][] = [];
  for (const edge of edges) {
    const from = nodeWorldById.get(edge.from);
    const to = nodeWorldById.get(edge.to);
    if (!from || !to) continue;
    mazeEdgeLines.push([from, to]);
  }

  const routeNodeIds = edgeKeysToNodePath(edgeKeys);
  const routeLine = routeNodeIds
    .map((id) => nodeWorldById.get(id))
    .filter((point): point is Vec3 => Boolean(point));

  const visiblePointCount = Math.min(routeLine.length, progress + 1);
  const visibleRouteLine = routeLine.slice(0, visiblePointCount);

  return {
    mazeEdgeLines,
    routeLine,
    visibleRouteLine,
    startPoint: nodeWorldById.get(maze.startNodeId) ?? null,
    endPoint: nodeWorldById.get(maze.endNodeId) ?? null,
    floorSize: [
      Math.max((maxX - minX) * WORLD_SCALE + 6, 8),
      Math.max((maxY - minY) * WORLD_SCALE + 6, 8),
    ],
  };
}
