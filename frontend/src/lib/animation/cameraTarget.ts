import type { CameraTarget, Vec3 } from "./types";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function subVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalizeVec3(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]);
  if (length === 0) return [0, 0, 1];
  return [v[0] / length, v[1] / length, v[2] / length];
}

function addVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scaleVec3(v: Vec3, scalar: number): Vec3 {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getPlaybackCameraTarget(
  pathPoints: Vec3[],
  progress: number,
  total: number,
): CameraTarget | null {
  if (pathPoints.length === 0) return null;

  if (pathPoints.length === 1) {
    return {
      position: pathPoints[0],
      lookAt: addVec3(pathPoints[0], [0, 0, 1]),
    };
  }

  const segmentCount = pathPoints.length - 1;
  const clampedProgress = clamp(progress, 0, total);
  const ratio = total > 0 ? clampedProgress / total : 0;
  const distance = ratio * segmentCount;

  if (distance >= segmentCount) {
    const end = pathPoints[pathPoints.length - 1];
    const prev = pathPoints[pathPoints.length - 2];
    const direction = normalizeVec3(subVec3(end, prev));
    return {
      position: end,
      lookAt: addVec3(end, direction),
    };
  }

  const index = Math.floor(distance);
  const t = distance - index;
  const from = pathPoints[index];
  const to = pathPoints[index + 1];
  const direction = normalizeVec3(subVec3(to, from));

  return {
    position: lerpVec3(from, to, t),
    lookAt: addVec3(lerpVec3(from, to, t), scaleVec3(direction, 1.5)),
  };
}
