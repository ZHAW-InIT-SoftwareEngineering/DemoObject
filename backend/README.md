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
DB_CONN_STRING="mongodb://localhost:27017/DemoObject"
DB_NAME=DemoObjectDB
MONGO_COLLECTION_NAME=SessionCollection
```

### `.env.docker` (container-to-container)
Used by the `api` service in Docker Compose.

```env
PORT=3000
DB_CONN_STRING=mongodb://mongo:27017/DemoObject
DB_NAME=DemoObjectDB
MONGO_COLLECTION_NAME=SessionCollection
```

## Notes
- `DB_CONN_STRING` differs between local and Docker because `localhost` inside a container points to itself, not the Mongo container.
- Mongo data is stored in the `mongo-data` Docker volume defined in `docker-compose.yaml`.
