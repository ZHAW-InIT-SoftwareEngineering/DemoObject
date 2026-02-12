export type Vec3 = [number, number, number];

export type CameraTarget = {
  position: Vec3;
  lookAt: Vec3;
};

export type WallSegment = {
  position: Vec3;
  size: Vec3;
  rotationY: number;
};

export type AnimationSceneData = {
  wallSegments: WallSegment[];
  routeLine: Vec3[];
  visibleRouteLine: Vec3[];
  startPoint: Vec3 | null;
  endPoint: Vec3 | null;
  floorSize: [number, number];
};
