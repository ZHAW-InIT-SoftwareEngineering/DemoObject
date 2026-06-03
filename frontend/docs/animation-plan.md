# 3D Animation Spec (Single Source of Truth)

This file is the only canonical specification for frontend path animation.

## Objective
When the user clicks `Show Animation`, the app runs a 3D POV animation of the selected maze path using the same maze layout/topology shown in the 2D `MazePanel` SVG.

The visual story is an urban heatwave. The participant is moving through a baked asphalt maze toward an ice cream shop destination before the ice cream melts.

## Mandatory Product Behavior
1. Trigger: animation starts from `Show Animation`.
2. Source path (MVP): animate submitted user path only.
3. Visuals: animation is 3D from the first user-visible MVP.
4. Camera mode: POV / first-person traversal along the selected path. Do not switch the main playback to a third-person runner.
5. Interruption rules: no stop, no pause, no quit, no interruption controls.
6. Completion behavior: after playback ends, return to the same normal screen shown before animation started.
7. Failure behavior (MVP): if 3D rendering/initialization fails, show a toast error.

## Scope
### In MVP
1. 3D maze rendering using runtime `maze.nodes` and `maze.edges`.
2. Time-based camera movement across ordered path segments.
3. Stable animation state model: `idle | playing | done`.
4. Disable conflicting actions while animation is playing.
5. Reset animation state when the underlying submitted path changes.
6. Urban heatwave visual treatment: harsh warm light, asphalt floor, warm sky haze, and subtle shimmer.
7. Ice cream shop goal marker at the maze end, with screen-edge heat cues and a completion flower fountain.

### Out of MVP
1. Shortest-path animation pipeline (follow-up phase).
2. Any pause/stop/exit controls.
3. Third-person character animation.
4. Storm effects, thunder/lightning, dark clouds, or ground fog layers.
5. Visible asset credit text inside the animation HUD.

## Technical Direction
1. Renderer: `three` + `@react-three/fiber`.
2. Scene composition:
   - `MazeScene3D`: canvas, lighting, environment, lifecycle.
   - `MazeGeometry`: 3D primitives from graph layout.
   - `PovCameraRig`: camera motion and look-ahead.
   - `HeatwaveAtmosphere`: urban perimeter, harsh warm atmosphere, shimmer.
   - `IceCreamShopGoal`: model/fallback destination and melting details.
3. Motion: `requestAnimationFrame`/frame-loop driven interpolation by elapsed time.
4. Keep motion logic independent from visual styling so polish can evolve without changing traversal behavior.

## Data Contracts
Animation input must be renderer-agnostic and path-source-agnostic:

```ts
type RuntimeAnimationPath = {
  nodeIds: number[];
  edgeKeys: string[];
  source: "user" | "shortest";
};
```

MVP rule:
- `source` must be `"user"` for launched animation.

## Layout Fidelity Requirement
The 3D maze must preserve the same graph layout relationships as the 2D SVG maze:
1. Node identity mapping is deterministic (`mazeNodeId` preserved).
2. Edge connectivity is identical.
3. Relative spatial structure is preserved via deterministic coordinate transform from 2D coordinates to 3D world coordinates.

## Integration Plan
1. Keep existing path selection/submission flow.
2. Build animation payload from submitted user path state.
3. `Show Animation` transitions app view to animation mode.
4. On complete, transition back to normal maze screen.
5. On runtime failure, show toast and keep app usable.

## Visual Requirements
1. The maze remains first-person during playback and preserves the submitted path traversal.
2. The scene reads as hot urban pavement: warm daylight, asphalt-like floor, simple city perimeter, and heat shimmer.
3. No dark clouds, thunder flashes, lightning, rain, or ground fog layers are present.
4. The ice cream shop appears at the endpoint and does not block the traversed path.
5. Melting urgency is visible through subtle screen-edge glare/drips without floor puddles obscuring the goal tile.
6. The flower fountain appears as the completion effect around the goal during first-person playback.

## Asset Credits
- [(FREE) Ice Cream Shop](https://sketchfab.com/3d-models/free-ice-cream-shop-518dab2670a7465f9754875f543de202) by [LowPolyBoy](https://sketchfab.com/lowPolyBoy), licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
- Runtime model path: `frontend/public/models/ice-cream-shop/ice-cream-shop.glb`.
- If the GLB is absent, `IceCreamShopGoal` renders a local low-poly fallback and keeps the playback functional.

## Acceptance Criteria
1. Clicking `Show Animation` plays a 3D POV traversal over the submitted user path.
2. During playback, user cannot pause/stop/quit/interfere with animation flow.
3. Playback runs to completion and returns to the prior non-animation screen.
4. Maze structure seen in 3D matches the 2D maze graph layout.
5. No TypeScript errors from animation additions.
6. Heatwave visuals and ice cream destination are present in normal participant playback and display playback.

## QA Checklist (MVP)
1. Two-node path plays correctly.
2. Long path with multiple turns plays end-to-end.
3. Path updates reset animation state correctly.
4. Failure path (forced 3D init failure) shows toast.
5. Post-animation state matches pre-animation screen state.

## Follow-Up Phase
1. Extend same pipeline to shortest-path animation (`source: "shortest"`).
2. Add visual polish (lighting/material/effects) without changing core traversal contract.
