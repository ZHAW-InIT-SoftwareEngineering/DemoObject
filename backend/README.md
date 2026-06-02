# DemoObject Backend

Node/Express API with MongoDB storage. Current package version: `1.0.0`.

This README reflects the current branch that is intended to merge to `main`.
The backend owns session creation, generated display usernames, maze retrieval,
path validation, DSL compilation, shortest-path calculation, final timed
submissions, public leaderboard data, and backend-owned display animation
ordering.

## API Surface

The server exposes:

- `GET /healthz`
- `GET /openapi.json`
- `GET /docs`
- `GET /mazes/{mazeId}`
- `POST /mazes/{mazeId}/paths/dsl`
- `GET /mazes/{mazeId}/shortest-path?algorithm=bfs|dijkstra`
- `GET /mazes/{mazeId}/display-feed`
- `GET /mazes/{mazeId}/display-next`
- `POST /sessions`
- `PUT /sessions/{sessionId}/paths`
- `PATCH /sessions/{sessionId}`
- `GET /sessions/{sessionId}/paths`

## Current Domain Status

- Sessions are stored in MongoDB.
- Each new session receives a generated public `userName`.
- A final submission is accepted only once per session.
- Final submissions must start at the maze start, follow valid edges, end at the
  goal, and include `elapsedMs`.
- The backend computes and stores the DSL for accepted final submissions.
- Display feed responses expose public leaderboard fields and do not expose raw
  `sessionId` values.
- Display animation ordering is held in memory per maze. It queues newly seen
  final submissions once, then cycles ranked submissions from fastest to
  slowest.

Ranking order:

1. Lower `elapsedMs`.
2. Earlier `submittedAt`.
3. Lexicographic `userName`.

## Run Options

### 1. Local API + Mongo in Docker

Recommended for development. This keeps hot reload via `npm run dev` and runs
only Mongo in Docker.

Start Mongo:

```bash
docker compose -f docker-compose.yaml up mongo -d --build
```

Run the API locally:

```bash
npm run dev
```

The API is available at `http://localhost:3000` by default.

### 2. Full Docker Compose

This runs both Mongo and the API in containers. It is useful for container
verification, but local code changes require rebuilding the image.

```bash
docker compose -f docker-compose.yaml up -d --build
```

## Environment Variables

### `.env` for Local Development

Used by `npm run dev`.

```env
PORT=3000
DB_CONN_STRING="mongodb://localhost:27017"
DB_NAME=DemoObjectDB
MONGO_COLLECTION_NAME=SessionCollection
```

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | Yes | `3000` | Local port used by the Express API. The frontend Vite proxy expects the backend on this port by default. |
| `DB_CONN_STRING` | Yes | `mongodb://localhost:27017` | MongoDB connection string for local development. |
| `DB_NAME` | Yes | `DemoObjectDB` | MongoDB database name the backend opens after connecting. |
| `MONGO_COLLECTION_NAME` | Yes | `SessionCollection` | MongoDB collection used to store session documents. |

### `.env.docker` for Container-to-Container

Used by the `api` service in Docker Compose.

```env
PORT=3000
DB_CONN_STRING=mongodb://mongo:27017/DemoObject
DB_NAME=DemoObjectDB
MONGO_COLLECTION_NAME=SessionCollection
```

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | Yes | `3000` | Port exposed by the API container. |
| `DB_CONN_STRING` | Yes | `mongodb://mongo:27017/DemoObject` | MongoDB connection string from the API container to the Mongo container on the Docker network. |
| `DB_NAME` | Yes | `DemoObjectDB` | MongoDB database name the backend opens after connecting. |
| `MONGO_COLLECTION_NAME` | Yes | `SessionCollection` | MongoDB collection used to store session documents. |

Notes:

- `DB_CONN_STRING` differs between local and Docker because `localhost` inside a
  container points to itself, not the Mongo container.
- Mongo data is stored in the `mongo-data` Docker volume defined in
  `docker-compose.yaml`.
- Production compose injects an authenticated Mongo connection string from
  `MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`, and `MONGO_DATABASE`.

## Runtime Mazes

The shared maze schema lives in [src/domain/maze.ts](./src/domain/maze.ts).
Runtime maze definitions live in:

- [src/domain/mazes/maze0.ts](./src/domain/mazes/maze0.ts): `10x10`, default timed maze.
- [src/domain/mazes/maze1.ts](./src/domain/mazes/maze1.ts): `6x6`, smaller manual maze.
- [src/domain/mazes/maze2.ts](./src/domain/mazes/maze2.ts): `24x24`, deterministic generated perfect maze.
- [src/domain/mazes/maze3.ts](./src/domain/mazes/maze3.ts): `6x6`, maze `1` layout with selected weighted edges for Dijkstra.

All runtime mazes are registered through
[src/domain/mazes/index.ts](./src/domain/mazes/index.ts).

## Editing Maze Walls

Manual grid mazes use the shared builder in
[src/domain/mazes/buildGridMaze.ts](./src/domain/mazes/buildGridMaze.ts).

Do not add entries directly to the generated `walls` array inside `buildMaze()`.
That array is derived automatically from each maze's `blockedWalls` list or
generated wall list.

For manual maze editing, `blockedWalls` is the source of truth. Each entry
describes one blocked connection between two orthogonally adjacent fields:

Node ids are assigned row-by-row:

```txt
mazeNodeId = y * WIDTH + x
```

With `WIDTH = 10`, the first rows look like this:

```txt
row 0 => 0  1  2  3  4  5  6  7  8  9
row 1 => 10 11 12 13 14 15 16 17 18 19
row 2 => 20 21 22 23 24 25 26 27 28 29
```

Use exactly one representation for manual wall edits:

```ts
wall(fromNodeId, toNodeId)
```

Example:

```ts
wall(18, 19)
```

Rules:

- The two node ids must be orthogonally adjacent.
- `wall(18, 19)` blocks left/right movement between those two fields.
- `wall(18, 28)` blocks up/down movement between those two fields.
- `wall(...)` normalizes the order automatically, so `wall(19, 18)` is equivalent.

To add a wall between two adjacent fields, add it to `blockedWalls`. To remove
or reopen a wall, delete that line from `blockedWalls`.

The practical editing workflow is:

1. Start the backend in development mode:

```bash
npm run dev
```

2. Start the frontend in development mode from `../frontend`:

```bash
npm run dev
```

3. Open the maze in the browser and hover over fields/walls in dev mode. The
   frontend dev tooltip exposes the node ids needed to identify the wall between
   two adjacent fields.
4. Add or remove the corresponding `wall(fromNodeId, toNodeId)` entry in the
   maze file.
5. Restart or let the backend reload, then refresh the frontend and verify the
   wall visually.

## Check Mongo On The VM

If you are connected to the deployment VM, Mongo runs in the `demoobject-mongo`
container.

Check that Mongo is running:

```bash
docker ps --filter name=demoobject-mongo
```

Open `mongosh` with auth:

```bash
docker exec -it demoobject-mongo sh -lc 'mongosh --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin'
```

Run the following commands only after you see the `mongosh` prompt.

```javascript
show dbs
use DemoObjectDB
show collections
db.SessionCollection.findOne()
db.SessionCollection.find().sort({ createdAt: -1 }).limit(20).pretty()
db.SessionCollection.countDocuments()
```

If your database or collection name is different, use the values from your
deploy `.env`.

## Commands

```bash
npm run dev
npm run build
npm start
```
