# Frontend Maze Flow State Ownership Plan

## Purpose

This document explains how to simplify the frontend maze-flow architecture by
separating state by ownership, lifetime, and consumer scope.

It is intentionally precise about:

- what is wrong with the current shape
- which state belongs where
- which provider boundaries are justified
- what each hook or provider should export
- what to migrate first

This is a design note. It describes what to implement next. It is not a claim
that all of it already exists in code.

## Current Problem

The central issue is not that there is "a large provider".

The real issue is that
`frontend/src/components/app/DemoFlowProvider.tsx`
currently acts as a facade over several unrelated lifecycles and then exposes
all of them through one large context value.

At the same time,
`frontend/src/routes/__root.tsx`
mounts `DemoFlowProvider` at app root, so root-level UI is subscribed to state
that only matters inside the maze workflow.

This creates three concrete problems:

1. State with different lifetimes is coupled together.
2. State with different consumers is published through one context.
3. Persistence and workflow bugs become hard to reason about because multiple
   concerns are coordinated in one place.

## The Four Lifecycles Currently Mixed Together

Today the maze flow mixes these categories:

1. Draft editing state
   - `nodePath`
   - `pathKey`
   - `apiRequest`
   - `selectNode`
   - `undoNodeSelection`
   - `resetPath`
   - `userPathLength`
2. Submission state
   - `dsl`
   - `submitError`
   - `submitting`
   - `lastSubmittedKey`
   - `isPathSubmitted`
3. Shortest-path fetch and playback state
   - `shortestPath`
   - `shortestPathNodePath`
   - `displayedShortestPathNodePath`
   - exploration edge state
   - celebration state
   - `hasShortestPathForCurrentSubmission`
4. Animation UI state
   - animation mode
   - path-selection dialog state
   - 3D preview commands
   - animation completion commands

These categories do not:

- update at the same frequency
- belong to the same owner
- need the same persistence model
- need the same provider scope

That mismatch is the architectural smell.

## Design Rules

Use these rules when deciding where state should live:

1. Context is only for state that must be shared by distant consumers or must
   survive route transitions.
2. Page workflow orchestration should live in page-level hooks where the
   workflow is actually owned.
3. Transient UI state should stay local and should not be published at app
   root.
4. Persisted state should be owned by the domain that creates and restores it.
5. Derived booleans should not define architecture. Persist the source state,
   derive the booleans near the consumer.

## Recommended Ownership Model

### 1. App-wide session state

Owner:

- `DemoSessionProvider`

Scope:

- app root

Why:

- session bootstrap and maze loading are genuine app-level concerns
- they are used by route guards and multiple pages

State:

- `loading`
- `session`
- `maze`
- `error`
- `hasActiveSession`
- `startAdventure`

This is already the correct high-level idea.

## 2. Draft editing state

Owner:

- `useMazeDraftState`

Scope:

- local to the maze editor flow unless another route truly needs the live draft

State:

- `nodePath`
- `pathKey`
- `apiRequest`
- `userPathLength`
- `selectNode`
- `undoNodeSelection`
- `resetPath`

Persistence:

- draft path only

Why:

- this state changes frequently
- it is driven by direct editor interaction
- root-level consumers should not re-render on node clicks

## 3. Submission state

Owner:

- `usePathSubmissionState`

Scope:

- local to the maze editor flow

Inputs:

- `sessionId`
- `mazeId`
- `pathKey`
- `apiRequest`

State:

- `dsl`
- `submitError`
- `submitting`
- `lastSubmittedKey`
- `isPathSubmitted`
- `submitPath`
- `resetSubmission`

Persistence:

- submission result keyed by submitted path

Why:

- submission state belongs to the submit/restore workflow
- it should not be owned by draft-editing code
- it should not be owned by animation code

## 4. Shortest-path state

Owner:

- `useShortestPathState`

Scope:

- local to maze editor unless `/maze/animation` must consume the same shortest
  path after route navigation

Inputs:

- `maze`
- `lastSubmittedKey`
- `userPathLength`

State:

- `shortestPath`
- `shortestPathNodePath`
- `displayedShortestPathNodePath`
- exploration edge state
- `requestShortestPath`
- `hasShortestPathForCurrentSubmission`
- celebration state if celebration is tied to shortest-path requests

Persistence:

- shortest-path result tied to the submitted path it belongs to

Why:

- shortest path is not draft state
- shortest path is not generic root-shell state
- shortest path belongs to a submission context

## 5. Animation state

Owner:

- `useMazeAnimationState`

Scope:

- route-scoped shared state if both `/maze` and `/maze/animation` need it

Inputs:

- user path snapshot
- shortest path snapshot
- submission gating flags

State:

- `animationState`
- `animationPathSelectionOpen`
- `setAnimationPathSelectionOpen`
- `selectAnimationPath`
- `open3DPreview`
- `closeAnimationView`
- `completeAnimation`
- `canUseUserPath`
- `canUseShortestPath`
- `hasAnimatablePath`
- `canShowAnimationButton`

Why:

- this is workflow UI state, not core domain state
- it is shared across the maze editor and animation route
- it is the strongest candidate for a dedicated route-scoped provider

## Recommended Provider Placement

### Keep at root

Keep only:

- `DemoSessionProvider`

Reason:

- it owns the real app-wide session/bootstrap layer

### Remove from root

Do not keep the current full maze-flow provider at app root.

Specifically,
`frontend/src/routes/__root.tsx`
should stop reading demo-flow state for overlays and animation concerns.

Root shell should ideally render only shell-level concerns such as:

- router outlet
- toaster
- devtools

### Introduce a maze route-scoped boundary

The natural route boundary is:

- `frontend/src/routes/maze.tsx`

That route already acts as the maze layout and route guard. It is the correct
place to introduce a maze-scoped provider if some state must survive navigation
between:

- `/maze`
- `/maze/animation`

### Recommended route-scoped provider

If a provider is required, it should be thin.

Recommended name:

- `MazeFlowProvider`

Recommended responsibility:

- only state that truly must survive route transitions within the maze subtree

That likely means:

- animation state
- path snapshots needed by the animation route
- shortest-path state only if the animation route depends on the exact restored
  shortest path object

It should not own:

- draft node selection mechanics
- submit API orchestration
- page-level submit/reset toasts

## Recommended Page Ownership

### `MazeEditorPage`

File:

- `frontend/src/components/app/MazeEditorPage.tsx`

This page should directly compose:

- `useMazeDraftState`
- `usePathSubmissionState`
- `useShortestPathState`

This is the page that owns the editing and submission workflow.

It should also own:

- submit handlers
- reset handlers
- toasts for submit / shortest-path actions
- local overlays unless they must survive route changes

Detailed ownership matrix:

| Field(s) | Proposed Owner | Scope | Persist | Why |
| --- | --- | --- | --- | --- |
| `nodePath`, `selectNode`, `undoNodeSelection`, `userPathLength` | `useMazePathDraft` | `MazeEditorPage` | draft only | Pure live editor interaction; changes on every click. |
| `pathKey`, `apiRequest` | derive from draft state | `MazeEditorPage` | no | They are computed from `nodePath`, not independent state. |
| `resetPath` | page-level handler in `MazeEditorPage` | `MazeEditorPage` | no | It coordinates multiple domains: reset draft plus reset submission. |
| `dsl`, `submitError`, `submitting`, `lastSubmittedKey` | `usePathSubmissionState` | `MazeEditorPage` | `dsl` yes, others no | Submission state belongs to submit/restore workflow, keyed by `mazeId + sessionId + pathKey`. |
| `isPathSubmitted` | derive in submission hook or page | `MazeEditorPage` | no | It is just `pathKey === lastSubmittedKey`. |
| `submitPath` | raw async command in submission hook; toast wrapper in page | `MazeEditorPage` | no | The page should own success/error toasts, not a shared provider. |
| `shortestPath` | `useShortestPathState`, seeded from submitted-path record | `MazeEditorPage` | yes, keyed by submitted path | The data belongs to a submitted path, but its UI owner is shortest-path workflow. |
| `shortestPathNodePath`, `displayedShortestPathNodePath` | `useShortestPathState` | `MazeEditorPage` | no | Derived/playback data for the editor view. |
| `explorationDiscoveredEdgeKeys`, `explorationSeenEdgeKeys`, `currentExplorationEdgeKey`, `currentExplorationEdgeDiscovered`, `isExplorationAnimating` | `useShortestPathState` | `MazeEditorPage` | no | This is transient playback UI, not shared app state. |
| `hasShortestPathForCurrentSubmission` | derive in shortest-path hook/page | `MazeEditorPage` | no | It is a relationship between current submission key and restored shortest-path result. |
| `requestShortestPath` | raw async command in shortest-path hook; toast wrapper in page | `MazeEditorPage` | no | Same pattern as `submitPath`. |
| `showCelebrationOverlay`, `dismissCelebrationOverlay` | editor-local UI, likely adjacent to shortest-path hook | `MazeEditorPage` | no | The overlay does not need to survive route changes. |
| `animationPathSelectionOpen`, `setAnimationPathSelectionOpen`, `showAnimationPathSelection` | editor-local UI | `MazeEditorPage` | no | The path-picker dialog is local workflow UI. |
| `canUseUserPath`, `canUseShortestPath`, `hasAnimatablePath`, `canShowAnimationButton` | derive in editor page/local animation hook | `MazeEditorPage` | no | These are derived booleans, not source state. |
| `open3DPreview` | editor-local preview command | `MazeEditorPage` | no | Preview is rendered inside the editor page, not on a separate route. |
| `animationState` | split into two owners | mixed | no | preview is editor-local; playing is the only part that should be route-scoped. |
| `selectAnimationPath` | editor-local decision handler | `MazeEditorPage` + route provider call | no | It should choose a path, capture snapshots, then either open preview or start playback. |
| `closeAnimationView` | split into `closePreview` and `closePlayback` | mixed | no | One command currently closes two different lifecycles. |
| `completeAnimation` | thin route-scoped playback provider | `/maze` subtree | no | Needed by `/maze/animation`, not by the whole app. |

### `MazeAnimationPage`

File:

- `frontend/src/components/app/MazeAnimationPage.tsx`

This page should consume only the data required to render the running animation:

- animation state
- the chosen path snapshot
- any required shortest-path snapshot

It should not need the full maze editor workflow context.

## Recommended Module Boundaries

This is the clean target API.

### `useMazeDraftState`

Exports:

- `nodePath`
- `pathKey`
- `apiRequest`
- `userPathLength`
- `selectNode`
- `undoNodeSelection`
- `resetPath`

Should not export:

- `dsl`
- `submitError`
- shortest-path data
- animation state

### `usePathSubmissionState`

Exports:

- `dsl`
- `submitError`
- `submitting`
- `lastSubmittedKey`
- `isPathSubmitted`
- `submitPath`
- `resetSubmission`

Should depend on:

- `sessionId`
- `mazeId`
- `pathKey`
- `apiRequest`

Should not own:

- node selection
- shortest-path playback
- animation dialog state

### `useShortestPathState`

Exports:

- `shortestPath`
- `shortestPathNodePath`
- `displayedShortestPathNodePath`
- `explorationDiscoveredEdgeKeys`
- `explorationSeenEdgeKeys`
- `currentExplorationEdgeKey`
- `currentExplorationEdgeDiscovered`
- `requestShortestPath`
- `hasShortestPathForCurrentSubmission`
- celebration API if still needed there

Should depend on:

- `maze`
- `lastSubmittedKey`
- `userPathLength`

Should not own:

- draft editing
- submit API state
- animation path-selection dialog state

### `useMazeAnimationState`

Exports:

- `animationState`
- `animationPathSelectionOpen`
- `setAnimationPathSelectionOpen`
- `showAnimationPathSelection`
- `selectAnimationPath`
- `open3DPreview`
- `closeAnimationView`
- `completeAnimation`
- `canUseUserPath`
- `canUseShortestPath`
- `hasAnimatablePath`
- `canShowAnimationButton`

Should depend on:

- user path snapshot
- shortest path snapshot
- submission gating flags

Should not own:

- API calls
- session persistence
- submit/restore logic

## Persistence Guidance

Persistence should follow ownership, not convenience.

Recommended split:

1. Session storage for active session/bootstrap
   - owned by the session layer
2. Session storage for draft path
   - owned by draft state
3. Session storage for submitted path results
   - owned by submission state
   - keyed by `mazeId + sessionId + pathKey`

For submitted-path results, the stored record should contain only data that
belongs to that submitted path, for example:

```ts
type PersistedSubmittedPath = {
  mazeId: number;
  sessionId: string;
  pathKey: string;
  dsl: string[] | null;
  shortestPath: MazesMazeIdShortestPathGet200Response | null;
  updatedAt: string;
};
```

Important rule:

- draft persistence must never be responsible for preserving or clearing
  shortest-path or DSL data for submitted paths

That rule removes the main source of accidental overwrite behavior.

## What Not To Do

Do not:

1. Keep the current root provider and only split its `useMemo` blocks.
   - that rearranges code but does not remove coupling
2. Add one provider per concept by default.
   - use a provider only when the state is actually cross-route or shared by
     distant consumers
3. Keep provider-owned toasts for page-local actions.
   - action toasts are easier to reason about in the page that owns the action
4. Keep a large flat context type as a permanent facade.
   - that preserves the monolith shape even if internals are slightly cleaner

## Practical Migration Order

Follow this order to reduce risk:

1. Stop using root-level maze-flow context in
   `frontend/src/routes/__root.tsx`.
2. Move maze-flow overlays out of root shell unless they truly need app-wide
   scope.
3. Let `MazeEditorPage` directly compose:
   - draft state
   - submission state
   - shortest-path state
4. Introduce a thin route-scoped provider under
   `frontend/src/routes/maze.tsx`
   only for state that must survive navigation to `/maze/animation`.
5. Make `MazeAnimationPage` consume only animation-specific shared state.
6. Remove the large flat `DemoFlowContextValue` once the last consumers are
   migrated.

## Final Decision

The recommended end-state is:

1. `DemoSessionProvider` remains at app root.
2. `DemoFlowProvider` in its current root-scoped monolithic role should be
   removed.
3. Maze editor workflow state should move into page-level hooks.
4. Only truly cross-route maze state should live in a thin route-scoped
   provider under the `/maze` route layout.

This gives the cleanest architecture because it aligns state placement with:

- who owns the workflow
- who consumes the data
- how often the state changes
- whether the state must survive route transitions

That is the correct basis for the next refactor.
