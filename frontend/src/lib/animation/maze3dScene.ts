import type { MazesMazeIdGet200Response } from "@/api";
import type { AnimationSceneData, Vec3, WallSegment } from "./types";
import type { NodePath } from "@/lib/path/transforms";
import { WALL_HEIGHT, WALL_THICKNESS, WORLD_SCALE } from "./constants";
import { buildMazeWallCoordSegments, getMazeBounds } from "@/lib/mazeGeometry";

const EMPTY_SCENE_DATA: AnimationSceneData = {
  wallSegments: [],
  routeLine: [],
  visibleRouteLine: [],
  userRouteLine: [],
  shortestRouteLine: [],
  startPoint: null,
  endPoint: null,
  floorSize: [8, 8],
};

export function buildAnimationSceneData(
  maze: MazesMazeIdGet200Response | null,
  nodePath: NodePath,
  progress: number,
  userNodePath: NodePath = [],
  shortestNodePath: NodePath = [],
): AnimationSceneData {
  if (!maze) return EMPTY_SCENE_DATA;

  const nodes = maze.nodes ?? [];
  if (nodes.length === 0) return EMPTY_SCENE_DATA;

  const { minX, maxX, minY, maxY } = getMazeBounds(nodes);
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

  const appendWallFromNodePair = (
    from: Vec3 | undefined,
    to: Vec3 | undefined,
    target: WallSegment[],
  ) => {
    if (!from || !to) return;
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const distance = Math.hypot(dx, dz);
    if (distance === 0) return;

    target.push({
      position: [(from[0] + to[0]) / 2, WALL_HEIGHT / 2, (from[2] + to[2]) / 2],
      size: [distance, WALL_HEIGHT, WALL_THICKNESS],
      rotationY: Math.atan2(dz, dx) + Math.PI / 2,
    });
  };

  const wallSegments: WallSegment[] = [];
  for (const wall of buildMazeWallCoordSegments(maze)) {
    appendWallFromNodePair(
      toWorld(wall.from.x, wall.from.y),
      toWorld(wall.to.x, wall.to.y),
      wallSegments,
    );
  }

  const toRouteLine = (path: NodePath): Vec3[] =>
    path
      .map((id) => nodeWorldById.get(id))
      .filter((point): point is Vec3 => Boolean(point));

  const routeLine = toRouteLine(nodePath);
  const userRouteLine = toRouteLine(userNodePath);
  const shortestRouteLine = toRouteLine(shortestNodePath);

  const visiblePointCount = Math.min(routeLine.length, progress + 1);
  const visibleRouteLine = routeLine.slice(0, visiblePointCount);

  return {
    wallSegments,
    routeLine,
    visibleRouteLine,
    userRouteLine,
    shortestRouteLine,
    startPoint: nodeWorldById.get(maze.startNodeId) ?? null,
    endPoint: nodeWorldById.get(maze.endNodeId) ?? null,
    floorSize: [
      Math.max((maxX - minX) * WORLD_SCALE + 6, 8),
      Math.max((maxY - minY) * WORLD_SCALE + 6, 8),
    ],
  };
}
