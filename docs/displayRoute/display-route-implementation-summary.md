# Display Route Implementation Summary

This document summarizes the source changes for the public display route and backend-owned display animation ordering. File references are relative to the repository root.

## Behavior

The browser route `/display?mazeId=0` renders a big-screen leaderboard and maze animation view. The leaderboard still polls `GET /mazes/{mazeId}/display-feed` every two seconds for current ranking, but animation playback order is now owned by the backend through `GET /mazes/{mazeId}/display-next`.

The backend keeps one in-memory **Animation Queue** per maze. On first initialization, it queues existing Final Submissions in `submittedAt` order. On each `display-next` request, it refreshes from MongoDB, queues newly accepted Final Submissions once, and returns the next queued animation. When the queue is empty, it cycles ranked submissions from fastest to slowest. After a new-submission batch drains, ranked cycling restarts at rank `#1`.

`display-next` intentionally advances the shared cursor, so the frontend calls it only when it is ready to animate the returned item. The response exposes only public leaderboard-style fields and does not expose raw `sessionId`.

## Backend Source Files

| File | Status | Purpose |
| --- | --- | --- |
| `backend/src/services/session.service.ts` | Edited | Creates, updates, and retrieves sessions while delegating generated username creation to `sessionUsername.service.ts`. |
| `backend/src/services/sessionUsername.service.ts` | Added | Owns generated username dictionaries and uniqueness-aware session username generation. |
| `backend/src/services/display.service.ts` | Added | Owns ranked public display projection, per-maze in-memory Animation Queue state, `getDisplayFeedService`, and `getDisplayNextService`. Internal `sessionId` values are used only for backend queue bookkeeping and are stripped from public responses. |
| `backend/src/api/mazes/mazes.routes.ts` | Edited | Registers and serves `GET /mazes/{mazeId}/display-feed` and `GET /mazes/{mazeId}/display-next`, validates `mazeId`, returns `404` for unknown mazes, and parses responses through the public schemas. |
| `backend/src/api/mazes/display/display.dto.ts` | Added | Defines the public display leaderboard entry shape and response schemas for `DisplayFeedResponse` and `DisplayNextResponse`. |
| `backend/src/api/sessions/sessionPath.dto.ts` | Added | Defines stored path response schemas, including `submittedAt` for Final Submissions. |
| `backend/src/services/index.ts` | Edited | Exports `getDisplayFeedService` and `getDisplayNextService` for route usage. |
| `backend/src/api/sessions/sessions.routes.ts` | Edited | Supports Final Submission writes by accepting path submissions, preventing duplicate final submissions, and returning submission metadata used by display ranking. |
| `backend/src/api/sessions/session.dto.ts` | Edited | Updates public session DTOs for generated usernames and final-submission metadata. |
| `backend/src/db/mongo.ts` | Edited | Persists generated usernames and adds queries for Final Submissions by maze. |
| `backend/src/domain/session.ts` | Edited | Extends the session domain model with public `userName` and optional `submittedAt` final-submission data. |
| `backend/src/repositories/index.ts` | Edited | Re-exports repository functions needed by session creation, uniqueness checks, and Final Submission lookup. |
| `backend/src/repositories/sessionRepository.ts` | Edited | Adds repository access for generated username lookup and final session retrieval by maze. |
| `backend/src/util/pathValidation.ts` | Edited | Supports final path validation before accepting a submission. |
| `backend/src/util/index.ts` | Edited | Re-exports path validation helpers. |
| `backend/package.json` | Edited | Adds the generated-username dependency used by session creation. |
| `backend/package-lock.json` | Edited | Lockfile update for backend dependency changes. |

## Frontend Source Files

| File | Status | Purpose |
| --- | --- | --- |
| `frontend/src/routes/display/index.tsx` | Added | Adds the TanStack Router file route for `/display/`, validates the optional `mazeId` search param, defaults to maze `0`, and renders `DisplayPage`. |
| `frontend/src/components/app/display/DisplayPage.tsx` | Added | Implements the public display screen. It polls the display feed for leaderboard rows, requests `display-next` only after an animation completes, holds the current animation stable during feed polling, highlights and scrolls the matching leaderboard row, and shows an animated waiting state when no animation is available. |
| `frontend/src/services/displayFeed.ts` | Added | Provides typed fetch helpers for `GET /display-feed` and `GET /display-next`, including the shared public display entry type. |
| `frontend/src/hooks/useDisplayFeed.ts` | Added | Polls the display feed with abort handling, loading state, and error state. |
| `frontend/src/hooks/useAnimationScenePlayback.ts` | Edited | Passes `restartKey` and `enabled` through to edge playback so display feed polling cannot restart the active animation. |
| `frontend/src/hooks/useEdgePlayback.ts` | Edited | Adds explicit playback enablement and stable restart-key handling. Completion fires only when playback is enabled. |
| `frontend/src/hooks/index.ts` | Edited | Exports `useDisplayFeed` and the playback hooks used by the display page. |
| `frontend/src/lib/api.ts` | Edited | Provides API base path behavior used by display service fetches. |
| `frontend/src/routeTree.gen.ts` | Edited | Generated router tree update that includes the `/display/` route. |
| `frontend/src/api/models/SessionsPost201Response.ts` | Edited | Generated API model update for session creation response fields used after generated usernames were added. |
| `frontend/src/api/models/SessionsSessionIdPathsGet200Response.ts` | Edited | Generated API model update for path retrieval response changes. |
| `frontend/src/components/app/MazeEditorPage.tsx` | Edited | Integrates final-submission flow changes in the maze editor experience. |
| `frontend/src/components/app/maze/ActionPanel.tsx` | Edited | Integrates timed/final path submission controls. |
| `frontend/src/components/app/maze/mazePanel/MazePanel.tsx` | Edited | Integrates maze panel behavior with timed/final submission state. |
| `frontend/src/components/app/maze/mazePanel/MazePanelHeader.tsx` | Edited | Reflects timed/final submission state in the maze panel header. |
| `frontend/src/lib/demoSessionStorage.ts` | Edited | Updates local demo session persistence for the generated username/session flow. |

## Documentation Files

| File | Status | Purpose |
| --- | --- | --- |
| `CONTEXT.md` | Added | Defines project domain terms, including Final Submission, Display Feed, Leaderboard, and Animation Queue. |
| `docs/displayRoute/CONTEXT.md` | Added | Copy of the current root context for display-route-specific documentation locality. |
| `docs/displayRoute/display-route-implementation-summary.md` | Added | This self-contained summary of display-route-related added and edited files. |

## Dependency And Generated Artifacts

These files are present in the current worktree because dependencies were installed or generated as part of the broader display-route/final-submission work:

- `backend/node_modules/.package-lock.json`
- `backend/node_modules/.bin/unique-username`
- `backend/node_modules/.bin/usergen`
- `backend/node_modules/.bin/usernamegen`
- `backend/node_modules/.bin/uuname`
- `backend/node_modules/unique-username-generator/`

They are not application source files. They come from the backend generated-username dependency and should normally be treated as install artifacts rather than hand-edited code.

## Verification

The following checks passed after the backend Animation Queue and frontend display playback changes:

- `backend`: `npm run build`
- `frontend`: `npm run build`

`frontend`: `npm run lint` still fails on existing React Three Fiber JSX property lint configuration issues under `frontend/src/components/app/AnimationView.tsx` and `frontend/src/components/app/maze.animation/scene/*`, plus an unrelated unused import in `frontend/src/lib/theoryDsl.ts`.
