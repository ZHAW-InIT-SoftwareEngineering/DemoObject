import type { Vec3 } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(min: number, max: number, value: number) {
  if (min === max) return value < min ? 0 : 1;
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

function smoothValue(current: number, target: number, delta: number, speed: number) {
  const smoothing = 1 - Math.exp(-delta * speed);
  return lerp(current, target, smoothing);
}

export function getProgressRatio(progress: number, total: number) {
  return total > 0 ? clamp(progress / total, 0, 1) : 1;
}

export function getFlickerTorchIntensity(elapsedTime: number, phase: number) {
  const t = elapsedTime + phase;
  const pulse = Math.sin(t * 2.3) * 0.2 + Math.sin(t * 7.1) * 0.08;
  return 1.95 + pulse;
}

type EmergingSunVisualState = {
  coreOpacity: number;
  coreEmissiveIntensity: number;
  haloOpacity: number;
  keyLightIntensity: number;
  glowLightIntensity: number;
};

type EmergingSunPlacement = {
  position: Vec3;
  scale: number;
};

export function getEmergingSunTargetStrength(progress: number, total: number) {
  const progressRatio = getProgressRatio(progress, total);
  const emergenceRatio = clamp((progressRatio - 0.24) / 0.76, 0, 1);
  const easedBaseRatio = Math.pow(emergenceRatio, 0.75);
  const finaleBoost = smoothstep(0.7, 1, progressRatio);
  return clamp(easedBaseRatio * 0.85 + finaleBoost * 0.35, 0, 1);
}

export function smoothEmergingSunStrength(
  currentStrength: number,
  targetStrength: number,
  delta: number,
) {
  return smoothValue(currentStrength, targetStrength, delta, 4.5);
}

export function getEmergingSunPlacement(
  maxFloorDimension: number,
  endPoint: Vec3 | null,
  sunStrength: number,
): EmergingSunPlacement {
  const riseStartY = maxFloorDimension * 0.28;
  const riseEndY = maxFloorDimension * 0.86;
  const anchorX = endPoint?.[0] ?? maxFloorDimension * 0.3;
  const anchorZ = endPoint?.[2] ?? -maxFloorDimension * 0.3;
  const anchorLength = Math.hypot(anchorX, anchorZ);
  const outwardX = anchorLength > 0.0001 ? anchorX / anchorLength : Math.SQRT1_2;
  const outwardZ = anchorLength > 0.0001 ? anchorZ / anchorLength : -Math.SQRT1_2;
  const horizontalOffset = maxFloorDimension * 0.62;

  return {
    position: [
      anchorX + outwardX * horizontalOffset,
      lerp(riseStartY, riseEndY, sunStrength),
      anchorZ + outwardZ * horizontalOffset,
    ],
    scale: lerp(0.9, 1.95, sunStrength),
  };
}

export function getEmergingSunVisualState(
  sunStrength: number,
): EmergingSunVisualState {
  return {
    coreOpacity: lerp(0, 1, sunStrength),
    coreEmissiveIntensity: lerp(0.3, 3, sunStrength),
    haloOpacity: lerp(0, 0.72, sunStrength),
    keyLightIntensity: lerp(0, 1.9, sunStrength),
    glowLightIntensity: lerp(0, 1.55, sunStrength),
  };
}

type JourneyLightingState = {
  ambientIntensity: number;
  keyLightIntensity: number;
  rimLightIntensity: number;
  fogNear: number;
  fogFar: number;
  toneMappingExposure: number;
};

export function getJourneyLightingTargetRatio(progress: number, total: number) {
  const progressRatio = getProgressRatio(progress, total);
  const acceleratedRatio = Math.pow(progressRatio, 0.58);
  const finaleBoost = smoothstep(0.62, 1, progressRatio);
  return clamp(acceleratedRatio * 0.84 + finaleBoost * 0.32, 0, 1);
}

export function smoothJourneyLightingRatio(
  currentRatio: number,
  targetRatio: number,
  delta: number,
) {
  return smoothValue(currentRatio, targetRatio, delta, 4.4);
}

export function getJourneyLightingState(
  progressRatio: number,
  maxFloorDimension: number,
): JourneyLightingState {
  const effectiveMaxFloorDimension = Math.max(maxFloorDimension, 1);
  return {
    ambientIntensity: lerp(0.04, 0.64, progressRatio),
    keyLightIntensity: lerp(0.25, 1.72, progressRatio),
    rimLightIntensity: lerp(0.08, 1.02, progressRatio),
    fogNear: effectiveMaxFloorDimension * lerp(1.9, 2.8, progressRatio),
    fogFar: effectiveMaxFloorDimension * lerp(6, 11.5, progressRatio),
    toneMappingExposure: lerp(1.1, 2.15, progressRatio),
  };
}

type GroundFogLayerConfig = {
  radius: number;
  baseOpacity: number;
  driftSpeed: number;
  pulseSpeed: number;
  phase: number;
  y: number;
};

type GroundFogLayerState = {
  rotationZ: number;
  y: number;
  opacity: number;
};

export function createGroundFogLayerConfigs(maxFloorDimension: number): GroundFogLayerConfig[] {
  return [
    {
      radius: maxFloorDimension * 0.72,
      baseOpacity: 0.07,
      driftSpeed: 0.03,
      pulseSpeed: 0.4,
      phase: 0.2,
      y: 0.08,
    },
    {
      radius: maxFloorDimension * 0.93,
      baseOpacity: 0.06,
      driftSpeed: -0.02,
      pulseSpeed: 0.34,
      phase: 1.4,
      y: 0.11,
    },
    {
      radius: maxFloorDimension * 1.1,
      baseOpacity: 0.05,
      driftSpeed: 0.016,
      pulseSpeed: 0.28,
      phase: 2.1,
      y: 0.14,
    },
  ];
}

export function getGroundFogLayerState(
  layer: GroundFogLayerConfig,
  elapsedTime: number,
): GroundFogLayerState {
  return {
    rotationZ: elapsedTime * layer.driftSpeed,
    y: layer.y + Math.sin(elapsedTime * 0.25 + layer.phase) * 0.02,
    opacity:
      layer.baseOpacity +
      Math.sin(elapsedTime * layer.pulseSpeed + layer.phase) * 0.015,
  };
}

type StormCloudConfig = {
  x: number;
  z: number;
  y: number;
  scale: number;
  sway: number;
  phase: number;
  brightenBias: number;
  dissolveStart: number;
  dissolveStrength: number;
};

type StormCloudPosition = {
  x: number;
  y: number;
  z: number;
};

type StormCloudVisualState = {
  alpha: number;
  brightenRatio: number;
};

export function createStormCloudConfigs(maxFloorDimension: number): StormCloudConfig[] {
  return Array.from({ length: 18 }, (_, index) => {
    const xBand = maxFloorDimension * 0.92;
    const zBand = maxFloorDimension * 0.8;
    const x = ((index * 1.91) % 1) * 2 * xBand - xBand;
    const z = ((index * 2.37) % 1) * 2 * zBand - zBand;
    const baseScale = 1.2 + ((index * 1.41) % 1) * 1.2;
    const isLargeCloud = index % 5 === 0 || index === 7;
    const shouldDissolve = index % 3 === 0 || index % 7 === 0;
    return {
      x,
      z,
      y: 5.5 + (index % 4) * 0.42,
      scale: isLargeCloud ? baseScale * 1.55 : baseScale,
      sway: 0.028 + (index % 5) * 0.007,
      phase: index * 0.73,
      brightenBias: 0.72 + ((index * 0.19) % 1) * 0.46,
      dissolveStart: shouldDissolve
        ? 0.3 + ((index * 0.11) % 1) * 0.2
        : 0.62 + ((index * 0.17) % 1) * 0.12,
      dissolveStrength: shouldDissolve ? 0.95 : 0.35,
    };
  });
}

export function getStormCloudTargetProgressRatio(progress: number, total: number) {
  return Math.pow(getProgressRatio(progress, total), 0.8);
}

export function smoothStormCloudProgress(
  currentRatio: number,
  targetRatio: number,
  delta: number,
) {
  return smoothValue(currentRatio, targetRatio, delta, 3.8);
}

export function getStormCloudPosition(
  cloud: StormCloudConfig,
  elapsedTime: number,
  progressRatio: number,
): StormCloudPosition {
  return {
    x: cloud.x + Math.sin(elapsedTime * cloud.sway + cloud.phase) * 1.2,
    z: cloud.z + Math.cos(elapsedTime * cloud.sway * 0.7 + cloud.phase) * 0.8,
    y:
      cloud.y +
      Math.sin(elapsedTime * 0.09 + cloud.phase) * 0.07 +
      progressRatio * cloud.dissolveStrength * 0.16,
  };
}

export function getStormCloudVisualState(
  cloud: StormCloudConfig,
  progressRatio: number,
): StormCloudVisualState {
  const dissolveRatio = clamp(
    (progressRatio - cloud.dissolveStart) / (1 - cloud.dissolveStart),
    0,
    1,
  );
  const baseAlpha = clamp(1 - dissolveRatio * cloud.dissolveStrength, 0, 1);
  const finalFadeRatio = smoothstep(0.42, 1, progressRatio);
  return {
    alpha: baseAlpha * (1 - finalFadeRatio),
    brightenRatio: clamp(progressRatio * cloud.brightenBias, 0, 1),
  };
}

type ThunderStormState = {
  nextStormAt: number;
  burstsLeft: number;
  nextFlashAt: number;
  flashUntil: number;
  flashPower: number;
};

export const FLOWER_PETAL_COLORS = [
  "#ffd166",
  "#ff8fab",
  "#ffb3c6",
  "#ffc6ff",
  "#c4f1be",
  "#f9a826",
] as const;
export const FLOWER_PETAL_COUNT = 96;
export const FLOWER_FOUNTAIN_VISIBILITY_EPSILON = 0.001;
const FLOWER_CYCLE_SECONDS = 1.9;
const FLOWER_START_RATIO = 0.82;

type FlowerPetalConfig = {
  phase: number;
  speed: number;
  angle: number;
  spread: number;
  lift: number;
  spin: number;
  scale: number;
  colorIndex: number;
};

type FlowerPetalFrameState = {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
};

export function createFlowerPetalConfigs(
  count: number = FLOWER_PETAL_COUNT,
): FlowerPetalConfig[] {
  return Array.from({ length: count }, (_, index) => ({
    phase: (index * 0.173) % 1,
    speed: 0.9 + ((index * 0.137) % 1) * 0.85,
    angle: ((index * 2.399) % 1) * Math.PI * 2,
    spread: 0.6 + ((index * 0.193) % 1) * 0.9,
    lift: 1.35 + ((index * 0.219) % 1) * 1.7,
    spin: (0.85 + ((index * 0.119) % 1) * 1.7) * (index % 2 === 0 ? 1 : -1),
    scale: 0.09 + ((index * 0.157) % 1) * 0.08,
    colorIndex: index % FLOWER_PETAL_COLORS.length,
  }));
}

export function getFlowerFountainActivation(progress: number, total: number) {
  return smoothstep(FLOWER_START_RATIO, 1, getProgressRatio(progress, total));
}

export function getFlowerFountainGlowPosition(origin: Vec3): Vec3 {
  return [origin[0], origin[1] + 0.5, origin[2]];
}

export function getFlowerFountainGlowIntensity(
  activation: number,
  elapsedTime: number,
) {
  const pulse = 0.82 + Math.sin(elapsedTime * 6.2) * 0.18;
  return activation * 1.3 * pulse;
}

export function getFlowerPetalFrameState(
  petal: FlowerPetalConfig,
  elapsedTime: number,
  activation: number,
  origin: Vec3,
): FlowerPetalFrameState {
  const life = ((elapsedTime * petal.speed) / FLOWER_CYCLE_SECONDS + petal.phase) % 1;
  const riseArc = 1 - Math.pow(life * 2 - 1, 2);
  const swirl = life * Math.PI * 2.2 + elapsedTime * petal.spin * 0.48;
  const burstPower = 0.72 + activation * 0.62;
  const radial = petal.spread * burstPower * (0.3 + life * 1.2);

  const x = origin[0] + Math.cos(petal.angle + swirl) * radial;
  const z = origin[2] + Math.sin(petal.angle + swirl) * radial;
  const y = origin[1] + 0.16 + riseArc * petal.lift * burstPower + life * 0.14;
  const scale = petal.scale * (0.6 + riseArc * 0.95) * (0.62 + activation * 0.7);

  return {
    x,
    y,
    z,
    rotationX: life * Math.PI * 2,
    rotationY: petal.angle + swirl * 0.35,
    rotationZ: swirl,
    scale,
  };
}

export function createThunderStormState(): ThunderStormState {
  return {
    nextStormAt: 0.9,
    burstsLeft: 0,
    nextFlashAt: 0,
    flashUntil: 0,
    flashPower: 0,
  };
}

export function advanceThunderStormState(
  stormState: ThunderStormState,
  elapsedTime: number,
  random: () => number = Math.random,
): ThunderStormState {
  let nextStormAt = stormState.nextStormAt;
  let burstsLeft = stormState.burstsLeft;
  let nextFlashAt = stormState.nextFlashAt;
  let flashUntil = stormState.flashUntil;
  let flashPower = stormState.flashPower;
  let changed = false;

  if (burstsLeft === 0 && elapsedTime >= nextStormAt) {
    burstsLeft = 2 + Math.floor(random() * 3);
    nextFlashAt = elapsedTime + 0.15 + random() * 0.45;
    nextStormAt = elapsedTime + 3.2 + random() * 4.6;
    changed = true;
  }

  if (burstsLeft > 0 && elapsedTime >= nextFlashAt) {
    flashPower = 5.4 + random() * 4.2;
    flashUntil = elapsedTime + 0.04 + random() * 0.07;
    nextFlashAt = elapsedTime + 0.11 + random() * 0.19;
    burstsLeft -= 1;
    changed = true;
  }

  if (!changed) return stormState;

  return {
    nextStormAt,
    burstsLeft,
    nextFlashAt,
    flashUntil,
    flashPower,
  };
}

export function getThunderLightPosition(elapsedTime: number, maxFloorDimension: number) {
  return {
    x: Math.sin(elapsedTime * 0.12) * maxFloorDimension * 0.24,
    z: Math.cos(elapsedTime * 0.08) * maxFloorDimension * 0.2,
  };
}

export function getThunderLightIntensity(
  elapsedTime: number,
  currentIntensity: number,
  delta: number,
  stormState: ThunderStormState,
) {
  if (elapsedTime <= stormState.flashUntil) {
    return stormState.flashPower;
  }
  return Math.max(0, currentIntensity - delta * 18);
}
