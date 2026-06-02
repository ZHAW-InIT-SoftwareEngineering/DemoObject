# DemoObject Context

## Domain Terms

- **Participant**: A person solving the timed maze in the browser. A participant owns one session for the active maze run.
- **Generated Username**: A public, server-generated display name assigned when a session is created. It uses the `AdjectiveNounNumber` shape, for example `BraveComet42`, and is safe to show on the shared display.
- **Timed Maze**: A maze run where elapsed time is captured client-side and submitted with the participant path. Maze `0` is the v1 timed maze.
- **Final Submission**: The one accepted path for a participant session. It must start at the maze start node, follow valid maze edges, end at the goal node, and includes `elapsedMs`, `dsl`, and `submittedAt`.
- **Leaderboard**: Ranked final submissions for one maze. Ranking uses fastest `elapsedMs`, then earlier `submittedAt`, then `userName`.
- **Display Feed**: The public read API for the big-screen display, exposed at `GET /mazes/{mazeId}/display-feed`. It returns generated usernames and final path data, but not raw session IDs.
- **Animation Queue**: The backend-owned ordered set of Final Submissions that the shared display sequence animates once before ranked playback resumes. It is scoped per maze and kept in memory for v1. When the Animation Queue initializes, existing Final Submissions are queued in `submittedAt` order. Browser reloads do not own playback ordering; the backend Animation Queue state and ranked playback cursor do.
