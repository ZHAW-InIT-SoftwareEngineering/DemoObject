import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Vec3 } from "@/lib/animation";

// Asset slot: "(FREE) Ice Cream Shop" by LowPolyBoy, CC BY 4.0.
// Source: https://sketchfab.com/3d-models/free-ice-cream-shop-518dab2670a7465f9754875f543de202
export const ICE_CREAM_SHOP_MODEL_PATH =
  "/models/ice-cream-shop/ice-cream-shop.glb";

type IceCreamShopGoalProps = {
  endPoint: Vec3 | null;
  routeLine: Vec3[];
  progress: number;
  total: number;
};

type ModelErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type ModelErrorBoundaryState = {
  hasError: boolean;
};

function getApproachDirection(routeLine: Vec3[], endPoint: Vec3) {
  if (routeLine.length >= 2) {
    const previous = routeLine[routeLine.length - 2];
    const dx = endPoint[0] - previous[0];
    const dz = endPoint[2] - previous[2];
    const length = Math.hypot(dx, dz);
    if (length > 0.0001) return [dx / length, dz / length] as const;
  }

  return [0, 1] as const;
}

class ModelErrorBoundary extends Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  state: ModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function IceCreamShopGoal({
  endPoint,
  routeLine,
}: IceCreamShopGoalProps) {
  const [modelStatus, setModelStatus] = useState<
    "checking" | "available" | "missing"
  >("checking");

  useEffect(() => {
    let cancelled = false;

    void fetch(ICE_CREAM_SHOP_MODEL_PATH, { method: "HEAD" })
      .then((response) => {
        if (!cancelled) {
          setModelStatus(response.ok ? "available" : "missing");
        }
      })
      .catch(() => {
        if (!cancelled) setModelStatus("missing");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const placement = useMemo(() => {
    if (!endPoint) return null;
    const [approachX, approachZ] = getApproachDirection(routeLine, endPoint);
    return {
      position: [endPoint[0], 0, endPoint[2]] as Vec3,
      rotationY: Math.atan2(approachX, approachZ),
    };
  }, [endPoint, routeLine]);

  if (!endPoint || !placement) return null;

  const fallback = <ProceduralIceCreamShop />;

  return (
    <group>
      <pointLight
        position={[endPoint[0], 1.4, endPoint[2]]}
        intensity={0.72}
        distance={4.5}
        decay={1.8}
        color="#ffd08a"
      />
      <group
        position={placement.position}
        rotation={[0, placement.rotationY, 0]}
      >
        {modelStatus === "available" ? (
          <ModelErrorBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <SketchfabIceCreamShopModel />
            </Suspense>
          </ModelErrorBoundary>
        ) : (
          fallback
        )}
      </group>
    </group>
  );
}

function SketchfabIceCreamShopModel() {
  const gltf = useGLTF(ICE_CREAM_SHOP_MODEL_PATH) as { scene: THREE.Group };
  const normalized = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (object.material instanceof THREE.MeshStandardMaterial) {
        object.material.roughness = Math.max(object.material.roughness, 0.52);
      }
    });

    const bounds = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    bounds.getCenter(center);
    bounds.getSize(size);
    scene.position.set(-center.x, -bounds.min.y, -center.z);

    const targetHeight = 1.55;
    const scale = size.y > 0.0001 ? targetHeight / size.y : 1;
    return { scene, scale };
  }, [gltf.scene]);

  return (
    <primitive
      object={normalized.scene}
      scale={normalized.scale}
      dispose={null}
    />
  );
}

function ProceduralIceCreamShop() {
  return (
    <group scale={0.72}>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 1.24, 1.28]} />
        <meshStandardMaterial
          color="#f6d7a4"
          roughness={0.68}
          metalness={0.02}
        />
      </mesh>
      <mesh position={[0, 1.42, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.22, 0.58, 4]} />
        <meshStandardMaterial
          color="#df6d5f"
          roughness={0.62}
          metalness={0.03}
        />
      </mesh>
      <mesh position={[0, 0.94, -0.66]} castShadow>
        <boxGeometry args={[1.86, 0.22, 0.18]} />
        <meshStandardMaterial
          color="#f06f62"
          roughness={0.58}
          metalness={0.03}
        />
      </mesh>
      {[-0.64, -0.32, 0, 0.32, 0.64].map((x, index) => (
        <mesh key={`awning-stripe-${index}`} position={[x, 0.86, -0.77]}>
          <boxGeometry args={[0.22, 0.24, 0.12]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#fff3c4" : "#ea5c6b"}
            roughness={0.54}
            metalness={0.02}
          />
        </mesh>
      ))}
      <mesh position={[-0.36, 0.4, -0.66]}>
        <boxGeometry args={[0.34, 0.62, 0.08]} />
        <meshStandardMaterial
          color="#7fb0ad"
          roughness={0.48}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[0.38, 0.56, -0.67]}>
        <boxGeometry args={[0.48, 0.34, 0.07]} />
        <meshStandardMaterial
          color="#9bd0cf"
          emissive="#6cc4c0"
          emissiveIntensity={0.08}
          roughness={0.42}
          metalness={0.04}
        />
      </mesh>
      <group position={[0.54, 1.48, -0.75]}>
        <mesh position={[0, -0.18, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.15, 0.36, 12]} />
          <meshStandardMaterial color="#c58a48" roughness={0.74} />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshStandardMaterial
            color="#f7aac7"
            roughness={0.48}
            emissive="#ee7fad"
            emissiveIntensity={0.08}
          />
        </mesh>
        <mesh position={[0.02, 0.24, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color="#fff0b5"
            roughness={0.48}
            emissive="#ffd56a"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
      <mesh position={[0.82, 0.11, -0.48]} castShadow>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial
          color="#ffe3a6"
          roughness={0.5}
          emissive="#ffcf7c"
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  );
}
