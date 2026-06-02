# DemoObject

Live under: [demo.init.zhaw.ch](https://demo.init.zhaw.ch)

Here you will find the repository containing all the files for the conceptualization and implementation of the new demo object.

The current implementation includes the participant maze flow, generated display
usernames, final timed path submissions, shortest-path/DSL support, a public
display route, MongoDB persistence, and production Docker Compose deployment.

## Applications

- `frontend`: React 18 + Vite + TanStack Router app.
  - Participant entry point: `/`
  - Maze flow: `/maze`
  - 3D animation playback: `/maze/animation`
  - Public display screen: `/display?mazeId=0`
- `backend`: Node/Express API with MongoDB storage and generated OpenAPI docs.
  - API base in development: `http://localhost:3000`
  - OpenAPI JSON: `http://localhost:3000/openapi.json`
  - Swagger UI: `http://localhost:3000/docs`
- `deploy/docker-compose.prod.yaml`: production stack with Mongo, API,
  frontend, and Caddy.
- `caddy`: reverse proxy image for `demo.init.zhaw.ch`.

Package versions are currently `1.0.0` for both `frontend/package.json` and
`backend/package.json`.

## Current Product Flow

1. A participant starts at `/`.
2. The frontend creates a backend session for maze `0`.
3. The backend assigns a generated public username such as `BraveComet42`.
4. The participant must visit the DSL and shortest-path theory screens before
   the timed maze can start.
5. The participant draws a path from start to goal and submits it once.
6. The backend validates the path, stores `elapsedMs`, computes the DSL, sets
   `submittedAt`, and prevents later final-submission changes for that session.
7. `/display?mazeId=0` polls the leaderboard feed and asks the backend for the
   next path to animate.

## Runtime Features

- Static maze definitions live in `backend/src/domain/mazes`.
- Runtime mazes currently registered: `0`, `1`, `2`, and `3`.
- Maze `0` is the default timed participant maze.
- Maze `2` is a deterministic generated `24x24` perfect maze.
- Maze `3` reuses maze `1` layout with selected weighted edges for Dijkstra.
- Final submissions are ranked by `elapsedMs`, then `submittedAt`, then
  `userName`.
- The display animation queue is backend-owned and in memory per maze. Existing
  final submissions are queued once on first display initialization; new final
  submissions are queued once as they appear; otherwise playback cycles ranked
  entries from fastest to slowest.

## Local Development

Backend:

```bash
cd backend
docker compose -f docker-compose.yaml up mongo -d --build
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:3000`.

Useful checks:

```bash
cd backend && npm run build
cd frontend && npm run build
```

Regenerate the frontend OpenAPI client after backend API/schema changes:

```bash
cd frontend
npm run gen:api
```

## CI/CD

The workflow `.github/workflows/deploy-stack.yaml` expects the following GitHub
Actions configuration.

| Name | Type | Required | Example / Default | Purpose |
| --- | --- | --- | --- | --- |
| `VM_HOST` | Variable | Yes | `160.85.252.104` | SSH host for the production VM that runs Docker Compose. |
| `VM_USER` | Variable | Yes | `ubuntu` | SSH user used by GitHub Actions to connect to the VM and run Docker commands. |
| `SSH_PRIVATE_KEY` | Secret | Yes | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Private key that matches an authorized key for `VM_USER` on `VM_HOST`. |
| `MONGO_DATABASE` | Variable | Yes | `DemoObjectDB` | Passed into deploy compose as database name. |
| `MONGO_COLLECTION_NAME` | Variable | Yes | `SessionCollection` | Passed into backend container environment. |
| `MONGO_ROOT_USERNAME` | Secret | Yes | `demoobject_admin` | MongoDB root user for container auth and backend DB connection string. |
| `MONGO_ROOT_PASSWORD` | Secret | Yes | `<strong-password>` | MongoDB root password for container auth and backend DB connection string. |
| `DEPLOY_PATH` | Variable | No | `./demoobject` | Target path on the deployment VM where `docker-compose.prod.yaml` is uploaded. |

Notes:

1. `BACKEND_IMAGE`, `FRONTEND_IMAGE`, and `CADDY_IMAGE` are computed in the workflow from the lower-case GitHub repository owner; no extra image variables are needed.
2. The deploy, cleanup, and audit workflows run on `ubuntu-latest` GitHub-hosted runners. Production Docker commands execute remotely on the VM over SSH.
3. Set values in `Settings -> Secrets and variables -> Actions` at repository level, or at org level with access to this repo.
4. GHCR authentication uses the workflow `GITHUB_TOKEN`; no personal access token is required for normal GitHub-hosted deploys from this repository.
5. `VM_USER` must be able to run `docker` and `docker compose` on the target VM.
