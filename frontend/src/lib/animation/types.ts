export type Vec3 = [number, number, number];

export type CameraTarget = {
  position: Vec3;
  lookAt: Vec3;
};

export type AnimationSceneData = {
  mazeEdgeLines: Vec3[][];
  routeLine: Vec3[];
  visibleRouteLine: Vec3[];
  startPoint: Vec3 | null;
  endPoint: Vec3 | null;
  floorSize: [number, number];
};
