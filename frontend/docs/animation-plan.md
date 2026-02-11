# Path Animation Plan (3D First)

## Goal
- Implement path animation incrementally with minimal risk.
- Reuse the current path array.
- Satisfy the non-functional requirement that animation must be 3D and eye-catching.

## Non-Functional Requirement
- The animation must be 3D from the first user-visible version.
- The result should act as an eye-catcher, not only a technical preview.
- The user cannot stop or pause the animation once it starts.

## Technology Decision
- MVP rendering: `three.js` via `@react-three/fiber` in the current React + TypeScript app.
- MVP perspective: POV/first-person camera moving along the path.
- Blender is optional for asset polish and should not block MVP.
- Keep animation logic renderer-agnostic so visuals can evolve without changing core motion code.

## Key Concepts
- `three.js`: browser 3D rendering/runtime library (WebGL).
- Blender: 3D content creation tool (models/animations), exports `.glb/.gltf`.
- Typical flow: Blender creates assets, Three.js loads and renders them.

## Phase 1: MVP 3D Animation (Required)
1. Add animation state model:
   - `idle | playing | done`
2. Add controls:
   - `Show Animation` (already added)
   - optional `Replay` (only after `done`)
   - no pause/stop controls
3. Build animation engine:
   - Use `requestAnimationFrame`.
   - Animate the POV camera from node `i` to node `i+1`.
   - Interpolate position with progress `t` in `[0, 1]`.
4. Render in 3D from day one:
   - Draw maze nodes/edges as simple 3D primitives (spheres/lines/boxes).
   - Move camera with look-ahead direction (no character animation needed in MVP).
   - Add key light + rim light, and subtle environment/background.
4. Data input:
   - Use the submitted user path array as source.
   - Keep shortest-path animation as a follow-up pass.
5. UX behavior:
   - Disable conflicting actions while animation is playing.
   - Animation is non-interruptible once started.
   - Reset animation when path changes.
6. Done criteria:
   - POV camera travels full path smoothly in a 3D scene.
   - Non-interruptible playback is stable.
   - 3D presentation is visually strong enough for demo impact.
   - No TypeScript errors.

## Suggested Implementation Shape
1. Add a hook `usePathAnimation`:
   - Input: `points`, `speed`, `isPlaying`
   - Output: current interpolated position, segment index, state controls
2. Render layer:
   - Build `Maze3DScene` with `@react-three/fiber`.
   - Drive camera transform from animation state (POV path traversal).
   - Keep maze interaction and animation concerns separated.
3. Trigger flow:
   - `Show Animation` starts animation of user path.
   - Later, chain shortest-path animation after user-path completes.

## Phase 2: Eye-Catcher Polish
1. Improve camera choreography:
   - intro angle, follow movement, and finish framing.
2. Improve visual style:
   - stronger materials, shadows, fog, and background treatment.
3. Add effects carefully:
   - path glow/trail, checkpoint pulse, subtle motion blur.
4. Keep frame time stable on common laptop hardware.

## Phase 3: Optional Blender Assets
1. Create/export `.glb` maze tiles/player.
2. Load assets in Three.js scene.
3. Keep motion logic unchanged (same path engine).

## Why This Order
- Meets 3D requirement in MVP.
- Delivers visible impact early while keeping implementation risk controlled.
- Keeps Blender as an enhancement path, not a dependency for first delivery.
