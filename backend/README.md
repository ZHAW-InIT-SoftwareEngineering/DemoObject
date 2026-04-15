# DemoObject Backend

Node/Express API with MongoDB storage.

## Run Options

### 1) Local API + Mongo in Docker (recommended for development)
This keeps hot-reload via `npm run dev` and only runs Mongo in Docker.

1. Start Mongo:

```bash
docker compose -f docker-compose.yaml up mongo -d --build
```

2. Run the API locally:

```bash
npm run dev
```

The API is available at `http://localhost:3000` by default.

### 2) Full Docker Compose (recommended for non-development usage)
This runs both Mongo and the API in containers. It is not ideal for development because changes require rebuilding the image.

```bash
docker compose -f docker-compose.yaml up -d --build
```

## Environment Variables

### `.env` (local development)
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

### `.env.docker` (container-to-container)
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

## Notes
- `DB_CONN_STRING` differs between local and Docker because `localhost` inside a container points to itself, not the Mongo container.
- Mongo data is stored in the `mongo-data` Docker volume defined in `docker-compose.yaml`.

## Editing Maze Walls

The shared maze schema lives in [src/domain/maze.ts](./src/domain/maze.ts).
The runtime maze definitions live in:

- [src/domain/mazes/maze0.ts](./src/domain/mazes/maze0.ts)
- [src/domain/mazes/maze1.ts](./src/domain/mazes/maze1.ts)

Both use the shared grid builder in [src/domain/mazes/buildGridMaze.ts](./src/domain/mazes/buildGridMaze.ts).

Do not add entries directly to the generated `walls` array inside `buildMaze()`.
That array is derived automatically from the `blockedWalls` list above it.

The current runtime mazes are:

- `maze 0`: `10x10`
- `maze 1`: `6x6`

Node ids are assigned row-by-row:

```txt
mazeNodeId = y * WIDTH + x
```

With the current `WIDTH = 10`, the first rows look like this:

```txt
row 0 => 0  1  2  3  4  5  6  7  8  9
row 1 => 10 11 12 13 14 15 16 17 18 19
row 2 => 20 21 22 23 24 25 26 27 28 29
```

Use exactly one representation for manual wall edits:

```ts
wall(fromNodeId, toNodeId)
```

If you want to add a wall between two adjacent fields, add it to `blockedWalls`.

Example:

```ts
wall(18, 19)
```

If you want to remove or reopen a wall, delete that line from `blockedWalls`.

The frontend dev tooltip shows the node id for each field, so you can copy the ids directly from there.

Rules:
- The two node ids must be orthogonally adjacent.
- `wall(18, 19)` blocks left/right movement between those two fields.
- `wall(18, 28)` blocks up/down movement between those two fields.
- `wall(...)` normalizes the order automatically, so `wall(19, 18)` is equivalent.

Current layout note:
- In each maze file, `blockedWalls` is the single source of truth for the layout.
