# Frontend

## Architecture Overview

Current ownership is split by scope:

- `DemoSessionProvider` at app root owns session bootstrap state: `loading`, `session`, `maze`, `error`, `hasActiveSession`, `startAdventure`.
- `MazeFlowProvider` under `/maze` owns only cross-route animation playback state: `animationState`, `startAnimation`, `completeAnimation`, `closePlayback`.
- `MazeEditorPage` is the workflow composition root. It combines:
  `useMazePathDraft` for `nodePath`, `pathKey`, `apiRequest`, undo/reset/select
  `usePathSubmission` for `dsl`, submission status, and `lastSubmittedKey`
  `useShortestPathFlow` for shortest-path data, exploration playback, and celebration state
- `Maze`, `MazePanel`, `ActionPanel`, `DslStrip`, and the overlays are mostly prop-driven UI. `Maze` keeps only transient pointer-drawing interaction state.

Route/component tree:

```text
RouterProvider
└─ DemoSessionProvider
   └─ /
      ├─ HomePage
      ├─ /maze
      │  └─ MazeFlowProvider
      │     ├─ MazeEditorPage
      │     │  ├─ DslStrip
      │     │  ├─ MazePanel -> MazePanelHeader, PathInfo, Maze
      │     │  ├─ ActionPanel
      │     │  ├─ CelebrationOverlay
      │     │  ├─ AnimationPathSelectionOverlay
      │     │  ├─ ResetPathConfirmationOverlay
      │     │  └─ AnimationView (3D preview mode)
      │     └─ MazeAnimationPage -> AnimationView
      └─ /impressum -> ImpressumPage
```

Main data flow:

- Start screen calls `startAdventure()`, which creates a session, fetches the maze, persists it, and unlocks `/maze`.
- Maze interaction updates `nodePath` in `useMazePathDraft`; `apiRequest` is derived from that path.
- Submit sends `apiRequest`, stores returned `dsl`, and marks the current `pathKey` as submitted.
- Shortest-path fetch stores the resolved path, converts it back to `nodePath`, and exposes highlighted/exploration edges to `MazePanel`.
- Animation selection writes the chosen route into `MazeFlowProvider`; `/maze/animation` reads that state and renders `AnimationView`.

## Generate API Client

The OpenAPI client is generated from the backend spec. Make sure the backend is running and `http://localhost:3000/openapi.json` is reachable, then run:

```bash
npm run gen:api
```
