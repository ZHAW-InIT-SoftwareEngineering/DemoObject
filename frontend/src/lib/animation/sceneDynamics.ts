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
  const heatRise = smoothstep(0.08, 1, progressRatio);
  const finaleBoost = smoothstep(0.72, 1, progressRatio);
  return clamp(0.56 + heatRise * 0.28 + finaleBoost * 0.16, 0, 1);
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
  const riseStartY = maxFloorDimension * 0.72;
  const riseEndY = maxFloorDimension * 1.02;
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
    scale: lerp(1.35, 2.25, sunStrength),
  };
}

export function getEmergingSunVisualState(
  sunStrength: number,
): EmergingSunVisualState {
  return {
    coreOpacity: lerp(0.7, 1, sunStrength),
    coreEmissiveIntensity: lerp(2.2, 4.2, sunStrength),
    haloOpacity: lerp(0.34, 0.78, sunStrength),
    keyLightIntensity: lerp(1.1, 2.8, sunStrength),
    glowLightIntensity: lerp(0.72, 2.05, sunStrength),
  };
}

type JourneyLightingState = {
  ambientIntensity: number;
  keyLightIntensity: number;
  rimLightIntensity: number;
  hazeNear: number;
  hazeFar: number;
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
    ambientIntensity: lerp(0.36, 0.78, progressRatio),
    keyLightIntensity: lerp(1.05, 2.45, progressRatio),
    rimLightIntensity: lerp(0.24, 1.12, progressRatio),
    hazeNear: effectiveMaxFloorDimension * lerp(2.6, 1.72, progressRatio),
    hazeFar: effectiveMaxFloorDimension * lerp(10.5, 6.9, progressRatio),
    toneMappingExposure: lerp(1.18, 1.84, progressRatio),
  };
}

type HeatShimmerBandConfig = {
  x: number;
  z: number;
  width: number;
  height: number;
  rotationY: number;
  phase: number;
  speed: number;
  drift: number;
  baseOpacity: number;
};

type HeatShimmerBandState = {
  x: number;
  z: number;
  y: number;
  rotationY: number;
  scaleY: number;
  opacity: number;
};

export function createHeatShimmerBandConfigs(
  maxFloorDimension: number,
): HeatShimmerBandConfig[] {
  const span = maxFloorDimension * 0.78;
  return Array.from({ length: 18 }, (_, index) => {
    const band = index / 18;
    const x = ((index * 1.73) % 1) * 2 * span - span;
    const z = ((index * 2.21) % 1) * 2 * span - span;
    return {
      x,
      z,
      width: maxFloorDimension * (0.09 + ((index * 0.31) % 1) * 0.08),
      height: maxFloorDimension * (0.13 + ((index * 0.27) % 1) * 0.1),
      rotationY: band * Math.PI * 2,
      phase: index * 0.61,
      speed: 0.7 + ((index * 0.43) % 1) * 0.55,
      drift: 0.05 + ((index * 0.19) % 1) * 0.08,
      baseOpacity: 0.045 + ((index * 0.17) % 1) * 0.035,
    };
  });
}

export function getHeatwaveTargetIntensity(progress: number, total: number) {
  const progressRatio = getProgressRatio(progress, total);
  const lateGlare = smoothstep(0.55, 1, progressRatio);
  return clamp(0.54 + Math.pow(progressRatio, 0.72) * 0.3 + lateGlare * 0.16, 0, 1);
}

export function smoothHeatwaveIntensity(
  currentIntensity: number,
  targetIntensity: number,
  delta: number,
) {
  return smoothValue(currentIntensity, targetIntensity, delta, 3.6);
}

export function getHeatShimmerBandState(
  band: HeatShimmerBandConfig,
  elapsedTime: number,
  intensity: number,
): HeatShimmerBandState {
  const wave = Math.sin(elapsedTime * band.speed + band.phase);
  const slowWave = Math.sin(elapsedTime * band.speed * 0.47 + band.phase * 1.7);
  return {
    x: band.x + wave * band.drift * 6,
    z: band.z + slowWave * band.drift * 4,
    y: 0.42 + wave * 0.05,
    rotationY: band.rotationY + slowWave * 0.22,
    scaleY: 0.82 + intensity * 0.36 + wave * 0.12,
    opacity: clamp(band.baseOpacity * intensity * (0.72 + wave * 0.28), 0, 0.16),
  };
}

export function getHeatGlareOpacity(progress: number, total: number) {
  const progressRatio = getProgressRatio(progress, total);
  return 0.12 + smoothstep(0.46, 1, progressRatio) * 0.26;
}

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
