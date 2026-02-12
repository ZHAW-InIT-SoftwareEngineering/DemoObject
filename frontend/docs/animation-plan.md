# 3D Animation Spec (Single Source of Truth)

This file is the only canonical specification for frontend path animation.

## Objective
When the user clicks `Show Animation`, the app runs a 3D animation of the submitted user path using the same maze layout/topology shown in the 2D `MazePanel` SVG.

## Mandatory Product Behavior
1. Trigger: animation starts from `Show Animation`.
2. Source path (MVP): animate submitted user path only.
3. Visuals: animation is 3D from the first user-visible MVP.
4. Camera mode: POV / first-person traversal along the selected path.
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

### Out of MVP
1. Shortest-path animation pipeline (follow-up phase).
2. Any pause/stop/exit controls.
3. Blender assets.
4. Visual effects beyond essential demo quality.

## Technical Direction
1. Renderer: `three` + `@react-three/fiber`.
2. Scene composition:
   - `MazeScene3D`: canvas, lighting, environment, lifecycle.
   - `MazeGeometry`: 3D primitives from graph layout.
   - `PovCameraRig`: camera motion and look-ahead.
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

## Acceptance Criteria
1. Clicking `Show Animation` plays a 3D POV traversal over the submitted user path.
2. During playback, user cannot pause/stop/quit/interfere with animation flow.
3. Playback runs to completion and returns to the prior non-animation screen.
4. Maze structure seen in 3D matches the 2D maze graph layout.
5. No TypeScript errors from animation additions.

## QA Checklist (MVP)
1. Two-node path plays correctly.
2. Long path with multiple turns plays end-to-end.
3. Path updates reset animation state correctly.
4. Failure path (forced 3D init failure) shows toast.
5. Post-animation state matches pre-animation screen state.

## Follow-Up Phase
1. Extend same pipeline to shortest-path animation (`source: "shortest"`).
2. Add visual polish (lighting/material/effects) without changing core traversal contract.
