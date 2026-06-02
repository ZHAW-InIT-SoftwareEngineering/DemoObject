# Frontend

React 18 + Vite frontend for DemoObject. Current package version:
`1.0.0`.

This README reflects the current branch that is intended to merge to `main`.
It includes the timed maze flow, theory gates, final-submission handling, 3D
animation, and public display screen.

## Routes

```text
/
/maze
/maze/animation
/theory/dsl
/theory/shortestPath
/display?mazeId=0
/impressum
```

- `/` starts or restores the participant session.
- `/maze` hosts the timed maze editor and submission workflow.
- `/maze/animation` plays a selected submitted path or shortest path in 3D.
- `/theory/dsl` and `/theory/shortestPath` are required before the timed maze
  can start.
- `/display?mazeId=0` is the public leaderboard and path-animation screen.

## Architecture Overview

Current ownership is split by scope:

- `DemoSessionProvider` at app root owns session bootstrap state:
  `loading`, `session`, `maze`, `error`, `hasActiveSession`,
  `startAdventure`.
- `MazeFlowProvider` under `/maze` owns cross-route animation playback state:
  `animationState`, `startAnimation`, `completeAnimation`, `closePlayback`.
- `MazeEditorPage` is the participant workflow composition root. It combines:
  - `useMazePathDraft` for `nodePath`, `pathKey`, `apiRequest`, undo/reset/select.
  - `useMazeTimer` for persisted elapsed-time state.
  - `useMazeTheoryProgress` for the DSL/shortest-path theory gate.
  - `usePathSubmission` for final path submission, returned DSL, submission
    status, and `lastSubmittedKey`.
  - `useShortestPathFlow` for shortest-path data, exploration playback, and
    celebration state.
- `DisplayPage` is the public display composition root. It polls
  `display-feed`, requests `display-next` only when ready to animate, keeps the
  active animation stable while leaderboard polling continues, and highlights
  the active leaderboard row.
- `Maze`, `MazePanel`, `ActionPanel`, `DslStrip`, and overlays are mostly
  prop-driven UI. `Maze` keeps only transient pointer-drawing interaction state.

Route/component tree:

```text
RouterProvider
└─ DemoSessionProvider
   ├─ / -> HomePage
   ├─ /theory
   │  ├─ /dsl -> TheoryDslPage
   │  └─ /shortestPath -> TheoryShortestPathPage
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
   ├─ /display -> DisplayPage -> AnimationView
   └─ /impressum -> ImpressumPage
```

## Data Flow

- Start screen calls `startAdventure()`, which creates a session, fetches maze
  `0`, persists both in session storage, and unlocks `/maze`.
- Session creation returns `sessionId`, generated `userName`, and `qrPayload`.
- Maze interaction updates `nodePath` in `useMazePathDraft`; `apiRequest` is
  derived from that path.
- Submit sends `apiRequest` plus `elapsedMs`. The backend accepts only complete
  start-to-goal paths and treats the first accepted path as the final
  submission for that session.
- The returned DSL is shown only for the submitted path.
- Shortest-path fetch stores the resolved path, converts it back to `nodePath`,
  and exposes highlighted/exploration edges to `MazePanel`.
- Animation selection writes the chosen route into `MazeFlowProvider`;
  `/maze/animation` reads that state and renders `AnimationView`.
- The display route reads public display data directly through
  `src/services/displayFeed.ts`; it does not use generated API client wrappers
  yet.

## API Base Path

`src/lib/api.ts` uses:

```ts
import.meta.env.VITE_API_BASE_URL ?? "/api"
```

In development, Vite proxies `/api` to `http://localhost:3000`. In production,
the frontend container serves the built app behind Caddy and talks to the API
through the same `/api` path.

## Generate API Client

The OpenAPI client in `src/api` is generated from the backend spec. Make sure
the backend is running and `http://localhost:3000/openapi.json` is reachable,
then run:

```bash
npm run gen:api
```

Regenerate after backend route or DTO changes. The current generated client
already includes the session username and final-submission response changes.

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run gen:api
```

Known status: `npm run build` is the primary frontend verification for this
branch. `npm run lint` may still report existing React Three Fiber JSX property
configuration issues and an unrelated unused import noted in the display-route
implementation summary.
