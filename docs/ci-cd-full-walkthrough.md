# DemoObject CI/CD Full Walkthrough

This document explains the current CI/CD setup in this repository in chunked form, from top-level pipeline design down to exact runtime behavior.

## Chunk 1: CI/CD Inventory (What Exists)

1. There is one GitHub Actions workflow: `.github/workflows/deploy-stack.yml`.
2. Production deployment uses `deploy/docker-compose.prod.yml`.
3. Container images are built from:
   - `backend/Dockerfile`
   - `frontend/Dockerfile`
4. Frontend runtime routing and health endpoint are configured in:
   - `frontend/nginx/default.conf`

## Chunk 2: Pipeline Topology

1. Triggers:
   - `push` to `main`
   - `workflow_dispatch` (manual trigger)
2. Concurrency:
   - `group: production-stack-deploy`
   - `cancel-in-progress: true`
3. Jobs:
   - `build_and_push_backend`
   - `build_and_push_frontend`
   - `deploy_stack`
4. Job dependencies:
   - `deploy_stack` waits for both build jobs (`needs`).

## Chunk 3: Build-and-Push Backend Job

1. Runs on self-hosted runner labels: `[self-hosted, Linux, X64]`.
2. Uses permissions:
   - `contents: read`
   - `packages: write`
3. Validates required registry config:
   - Secret `GHCR_PAT`
   - Variable `GHCR_USERNAME`
4. Logs into GHCR with `docker/login-action@v3`.
5. Builds and pushes backend image with:
   - Context: `./backend`
   - Dockerfile: `./backend/Dockerfile`
   - Tag: `ghcr.io/<GHCR_USERNAME>/demoobject-backend:${{ github.sha }}`
6. Uses immutable commit SHA tags.
7. Sets:
   - `provenance: false`
   - `sbom: false`

## Chunk 4: Build-and-Push Frontend Job

1. Same runner, permission, and GHCR auth pattern as backend.
2. Builds and pushes:
   - `ghcr.io/<GHCR_USERNAME>/demoobject-frontend:${{ github.sha }}`
3. Frontend image internals:
   - Build stage compiles static assets (`npm run build`).
   - Runtime stage serves them with Nginx.

## Chunk 5: Deploy Job Step-by-Step

1. Runs on self-hosted runner labels: `[self-hosted, Linux, X64]`.
2. Requires both build jobs to pass first.
3. Validates required non-secret variables:
   - `DEPLOY_PATH`
   - `BACKEND_IMAGE`
   - `MONGO_DATABASE`
   - `SESSION_COLLECTION_NAME`
4. Validates required secrets:
   - `GHCR_PAT`
   - `MONGO_ROOT_USERNAME`
   - `MONGO_ROOT_PASSWORD`
5. Checks Docker and Docker Compose availability.
6. Logs into GHCR again for pull during deploy.
7. Ensures deploy directory exists and copies:
   - `deploy/docker-compose.prod.yml` -> `${DEPLOY_PATH}/docker-compose.prod.yml`
8. Exports runtime env vars (including `IMAGE_TAG=${{ github.sha }}`) and runs:
   - `docker compose -f "${DEPLOY_PATH}/docker-compose.prod.yml" pull mongo api frontend`
   - `docker compose -f "${DEPLOY_PATH}/docker-compose.prod.yml" up -d --remove-orphans mongo api frontend`
9. Health wait loop:
   - Polls `demoobject-api` and `demoobject-frontend` up to 30 times, sleeping 2s each (about 60s max).
10. On timeout:
   - Prints `docker ps`
   - Prints tail logs for API/frontend
   - Exits with failure

## Chunk 6: Runtime Stack Behavior (Compose)

### Services

1. `mongo`
2. `api`
3. `frontend`

### mongo

1. Image: `mongo:7`
2. Command enables auth: `--bind_ip_all --auth`
3. Uses:
   - `MONGO_INITDB_ROOT_USERNAME`
   - `MONGO_INITDB_ROOT_PASSWORD`
   - `MONGO_INITDB_DATABASE`
4. Persists data in named volume: `mongo-data`
5. Healthcheck uses `mongosh ... db.adminCommand('ping')`

### api

1. Image: `${BACKEND_IMAGE}:${IMAGE_TAG}`
2. Environment:
   - `PORT=3000`
   - `DB_CONN_STRING=mongodb://<rootuser>:<rootpass>@mongo:27017/<db>?authSource=admin`
   - `DB_NAME=<db>`
   - `SESSION_COLLECTION_NAME=<collection>`
3. `depends_on` mongo with `condition: service_healthy`
4. Healthcheck: `wget http://127.0.0.1:3000/healthz`

### frontend

1. Image: `${FRONTEND_IMAGE}:${IMAGE_TAG}`
2. `depends_on` API healthy
3. Publishes: `${FRONTEND_PORT:-80}:80`
4. Healthcheck: `wget http://127.0.0.1/healthz`

### Request path model

1. Browser hits frontend Nginx on port 80 (or configured host port).
2. Frontend Nginx proxies `/api/` to `http://api:3000/`.
3. Backend routes live at root paths (`/mazes`, `/sessions`, `/healthz`), so proxying `/api/<x>` -> `/<x>` aligns correctly.

## Chunk 7: Variables and Secrets Flow

| Name | Type | Used For |
| --- | --- | --- |
| `GHCR_USERNAME` | Variable | Build image names under `ghcr.io/<user>/...` |
| `GHCR_PAT` | Secret | GHCR login for push and pull |
| `DEPLOY_PATH` | Variable | Target path on self-hosted host where compose file is copied |
| `FRONTEND_PORT` | Variable | Host port mapped to frontend container port 80 |
| `MONGO_DATABASE` | Variable | Mongo DB init and backend DB name |
| `SESSION_COLLECTION_NAME` | Variable | Backend collection name |
| `MONGO_ROOT_USERNAME` | Secret | Mongo root auth + backend connection string |
| `MONGO_ROOT_PASSWORD` | Secret | Mongo root auth + backend connection string |
| `IMAGE_TAG` | Runtime env | Set during deploy to `${{ github.sha }}` |

## Chunk 8: What This Setup Is and Is Not

1. It is a combined build/publish/deploy workflow for `main`.
2. It is not yet a full CI quality-gate pipeline.
3. There are no workflow-level lint/test/typecheck gates before deployment.
4. There is no automatic rollback step.
5. Deployment strategy is in-place container replacement on a single host.

## Chunk 9: Operational Details and Risks

1. Runner selection uses generic labels (`self-hosted`, `Linux`, `X64`).
   - If multiple runners match, target host selection can be ambiguous.
2. `mongo:7` is a moving major tag.
   - Patch-level changes may be pulled over time.
3. Secrets are not committed, but they are present in job runtime environment.
4. Pipeline verifies API/frontend health after deployment.
5. Concurrency cancellation means a new push can cancel a previous in-progress deploy.

## Chunk 10: Documentation Drift to Be Aware Of

1. Root `README.md` references `.github/workflows/deploy-backend.yml`, but current file is `.github/workflows/deploy-stack.yml`.
2. `docs/deployment-strategy.md` is a discussion draft and contains statements that are now outdated (for example, implying workflows were not yet added at that time).

## Source Files You Should Keep Open While Learning

1. `.github/workflows/deploy-stack.yml`
2. `deploy/docker-compose.prod.yml`
3. `backend/Dockerfile`
4. `frontend/Dockerfile`
5. `frontend/nginx/default.conf`
6. `backend/src/api/routes/infra.routes.ts`
7. `backend/src/db/mongo.ts`
8. `README.md`
9. `docs/deployment-strategy.md`
