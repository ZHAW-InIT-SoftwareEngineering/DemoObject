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

  const target = useMemo(
    () => getPlaybackCameraTarget(pathPoints, progress, total),
    [pathPoints, progress, total],
  );

  useFrame((_, delta) => {
    if (!target) return;

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
