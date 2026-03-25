import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  CAMERA_HEIGHT,
  CAMERA_LOOK_HEIGHT,
  getPlaybackCameraTarget,
  type Vec3,
} from "@/lib/animation";

type AnimationCameraRigProps = {
  pathPoints: Vec3[];
  progress: number;
  total: number;
};

const ORBIT_DURATION_SECONDS = 4.4;

function toVector3(point: Vec3) {
  return new THREE.Vector3(point[0], point[1], point[2]);
}

export function AnimationCameraRig({
  pathPoints,
  progress,
  total,
}: AnimationCameraRigProps) {
  const { camera } = useThree();
  const initializedRef = useRef(false);
  const currentPositionRef = useRef(new THREE.Vector3());
  const currentLookRef = useRef(new THREE.Vector3());
  const orbitStartedAtRef = useRef<number | null>(null);
  const orbitCenterRef = useRef(new THREE.Vector3());
  const orbitBaseAngleRef = useRef(0);
  const orbitRadiusRef = useRef(3);

  const target = useMemo(
    () => getPlaybackCameraTarget(pathPoints, progress, total),
    [pathPoints, progress, total],
  );

  useFrame((state, delta) => {
    if (!target) return;

    const reachedEnd =
      total > 0 &&
      progress >= total &&
      pathPoints.length >= 2;

    if (reachedEnd && orbitStartedAtRef.current === null) {
      const end = toVector3(pathPoints[pathPoints.length - 1]);
      const prev = toVector3(pathPoints[pathPoints.length - 2]);
      const approach = end.clone().sub(prev);
      if (approach.lengthSq() === 0) {
        approach.set(0, 0, 1);
      } else {
        approach.normalize();
      }

      orbitStartedAtRef.current = state.clock.getElapsedTime();
      orbitCenterRef.current.copy(end);
      orbitBaseAngleRef.current = Math.atan2(approach.z, approach.x) + 0.3;
      orbitRadiusRef.current = THREE.MathUtils.clamp(
        2.8 + end.distanceTo(prev) * 0.45,
        2.8,
        4.4,
      );
    } else if (!reachedEnd) {
      orbitStartedAtRef.current = null;
    }

    if (reachedEnd && orbitStartedAtRef.current !== null) {
      const elapsed = state.clock.getElapsedTime() - orbitStartedAtRef.current;
      const orbitRatio = THREE.MathUtils.clamp(
        elapsed / ORBIT_DURATION_SECONDS,
        0,
        1,
      );
      const easedOrbitRatio = THREE.MathUtils.smoothstep(orbitRatio, 0, 1);
      const angle = orbitBaseAngleRef.current + easedOrbitRatio * Math.PI * 2;
      const radius = orbitRadiusRef.current;
      const orbitalLift = CAMERA_HEIGHT + 0.4 + Math.sin(easedOrbitRatio * Math.PI) * 0.28;
      const center = orbitCenterRef.current;

      const targetPosition = new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        center.y + orbitalLift,
        center.z + Math.sin(angle) * radius,
      );
      const targetLookAt = center
        .clone()
        .add(new THREE.Vector3(0, CAMERA_LOOK_HEIGHT * 0.92, 0));

      if (!initializedRef.current) {
        currentPositionRef.current.copy(targetPosition);
        currentLookRef.current.copy(targetLookAt);
        initializedRef.current = true;
      }

      const alpha = 1 - Math.exp(-8.5 * delta);
      currentPositionRef.current.lerp(targetPosition, alpha);
      currentLookRef.current.lerp(targetLookAt, alpha);

      camera.position.copy(currentPositionRef.current);
      camera.lookAt(currentLookRef.current);
      return;
    }

    const targetPosition = toVector3(target.position).add(
      new THREE.Vector3(0, CAMERA_HEIGHT, 0),
    );

    const lookDirection = toVector3(target.lookAt).sub(toVector3(target.position));
    if (lookDirection.lengthSq() === 0) lookDirection.set(0, 0, 1);

    const targetLookAt = toVector3(target.position)
      .add(lookDirection.normalize().multiplyScalar(2))
      .add(new THREE.Vector3(0, CAMERA_LOOK_HEIGHT, 0));

    if (!initializedRef.current) {
      currentPositionRef.current.copy(targetPosition);
      currentLookRef.current.copy(targetLookAt);
      initializedRef.current = true;
    }

    const alpha = 1 - Math.exp(-7 * delta);
    currentPositionRef.current.lerp(targetPosition, alpha);
    currentLookRef.current.lerp(targetLookAt, alpha);

    camera.position.copy(currentPositionRef.current);
    camera.lookAt(currentLookRef.current);
  });

  return null;
}
