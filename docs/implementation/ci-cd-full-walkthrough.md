# DemoObject CI/CD Full Walkthrough

This document explains the current CI/CD setup in this repository, including the GitHub-hosted runner model and the SSH-based production deployment path.

## Chunk 1: CI/CD Inventory (What Exists)

1. There are three GitHub Actions workflows:
   - `.github/workflows/deploy-stack.yaml`
   - `.github/workflows/daily-audit-fix.yaml`
   - `.github/workflows/data-clean.yaml`
2. Production deployment uses `deploy/docker-compose.prod.yaml`.
3. Container images are built from:
   - `backend/Dockerfile`
   - `frontend/Dockerfile`
4. Frontend runtime routing is configured in `frontend/nginx/default.conf`.
5. Edge TLS and public ingress are handled by the separate `demo_edge` deployment.

## Chunk 2: Deploy Workflow Topology

1. `.github/workflows/deploy-stack.yaml` triggers on:
   - `push` to `main`
   - `workflow_dispatch`
2. Concurrency is:
   - `group: production-stack-deploy`
   - `cancel-in-progress: true`
3. Jobs:
   - `build_and_push_backend`
   - `build_and_push_frontend`
   - `deploy_stack`
4. `deploy_stack` waits for the backend and frontend image build jobs.
5. Every job in this workflow runs on `ubuntu-latest`.

## Chunk 3: Build-and-Push Jobs

1. Backend and frontend image builds follow the same pattern.
2. Each job uses:
   - `contents: read`
   - `packages: write`
3. Each job configures the image name from the lower-case GitHub repository owner.
4. Each job logs into GHCR with `docker/login-action@v3` using the workflow `GITHUB_TOKEN`.
5. Each job builds with `docker/build-push-action@v6`.
6. Images are tagged immutably with `${{ github.sha }}`.
7. Published image names are:
   - `ghcr.io/<lower-case-repository-owner>/demoobject-backend`
   - `ghcr.io/<lower-case-repository-owner>/demoobject-frontend`
8. Image metadata generation is disabled with:
   - `provenance: false`
   - `sbom: false`

## Chunk 4: Deploy Job Step-by-Step

1. `deploy_stack` runs on `ubuntu-latest`, not on the production VM.
2. It validates required GitHub variables:
   - `VM_HOST`
   - `VM_USER`
   - `DEPLOY_PATH`
   - `MONGO_DATABASE`
   - `MONGO_COLLECTION_NAME`
3. It validates required GitHub secrets:
   - `SSH_PRIVATE_KEY`
   - `MONGO_ROOT_USERNAME`
   - `MONGO_ROOT_PASSWORD`
4. It writes the private key to the runner, adds the VM host key with `ssh-keyscan`, and enables strict host-key checking for SSH connections.
5. It connects to `${VM_USER}@${VM_HOST}` and validates:
   - `docker version`
   - `docker compose version`
6. It uploads `deploy/docker-compose.prod.yaml` to `${DEPLOY_PATH}/docker-compose.prod.yaml` on the VM.
7. It then opens an SSH session to the VM and:
   - Logs in to GHCR on the VM using the workflow `GITHUB_TOKEN`
   - Exports runtime variables including `IMAGE_TAG=${{ github.sha }}`
   - Ensures the external Docker network `edge` exists
   - Runs `docker compose pull mongo api frontend`
   - Runs `docker compose up -d --remove-orphans mongo api frontend`
8. It waits up to about 60 seconds for:
   - `demoobject-api`
   - `demoobject-frontend`
   to report healthy status.
9. If the API or frontend never become healthy, it prints:
   - `docker ps`
   - Tail logs for `demoobject-api`
   - Tail logs for `demoobject-frontend`
10. It then verifies public reachability through the shared edge proxy from the GitHub-hosted runner by checking:
   - `http://demo.init.zhaw.ch` returns an HTTP redirect
   - the redirect points to `https://demo.init.zhaw.ch`
   - `https://demo.init.zhaw.ch` returns `200` or `304`

## Chunk 5: Runtime Stack Behavior (Compose)

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
   - `MONGO_COLLECTION_NAME=<collection>`
3. `depends_on` mongo with `condition: service_healthy`
4. Healthcheck: `wget http://127.0.0.1:3000/healthz`

### frontend

1. Image: `${FRONTEND_IMAGE}:${IMAGE_TAG}`
2. `depends_on` API healthy
3. Healthcheck: `wget http://127.0.0.1/healthz`
4. Exposes port `80` on Docker networks only.
5. Attaches to both the default project network and the external `edge` network.

### Request path model

1. Browser traffic reaches the shared Caddy deployment from `demo_edge` on ports `80` and `443`.
2. Shared Caddy forwards application traffic to `demoobject-frontend:80` over the external `edge` network.
3. Frontend Nginx proxies `/api/` to `http://api:3000/`.
4. Backend routes live at root paths such as `/mazes`, `/sessions`, and `/healthz`.

## Chunk 6: Data-Clean Workflow

1. `.github/workflows/data-clean.yaml` runs on:
   - a monthly schedule
   - `workflow_dispatch`
2. The job runs on `ubuntu-latest`.
3. It validates:
   - `VM_HOST`
   - `VM_USER`
   - `MONGO_DATABASE`
   - `MONGO_COLLECTION_NAME`
   - `SSH_PRIVATE_KEY`
   - `MONGO_ROOT_USERNAME`
   - `MONGO_ROOT_PASSWORD`
4. It connects to the VM over SSH, confirms `demoobject-mongo` is running, and then executes `mongosh` inside the container with `docker exec`.
5. The workflow does not require a self-hosted runner anymore.

## Chunk 7: Daily Audit Workflow

1. `.github/workflows/daily-audit-fix.yaml` runs on:
   - a daily schedule
   - `workflow_dispatch`
2. The job runs on `ubuntu-latest`.
3. It sets up Node.js `22` with npm caching for backend and frontend lockfiles.
4. It runs `npm ci` and `npm audit fix` in:
   - `backend`
   - `frontend`
5. If dependency changes are produced, it creates or updates a pull request with `peter-evans/create-pull-request@v7`.

## Chunk 8: Variables and Secrets Flow

| Name | Type | Used For |
| --- | --- | --- |
| `VM_HOST` | Variable | SSH host of the production VM |
| `VM_USER` | Variable | SSH user for remote Docker commands |
| `DEPLOY_PATH` | Variable | Remote VM path that receives `docker-compose.prod.yaml` |
| `MONGO_DATABASE` | Variable | Mongo init DB name and backend DB name |
| `MONGO_COLLECTION_NAME` | Variable | Backend collection name |
| `SSH_PRIVATE_KEY` | Secret | Private key used by GitHub Actions to SSH to the VM |
| `MONGO_ROOT_USERNAME` | Secret | Mongo root auth and backend connection string input |
| `MONGO_ROOT_PASSWORD` | Secret | Mongo root auth and backend connection string input |
| `GHCR_LOGIN_USERNAME` | Runtime env | Set to `${{ github.actor }}` for GHCR login |
| `GHCR_TOKEN` | Runtime env | Set to `${{ secrets.GITHUB_TOKEN }}` for GHCR push and VM pull |
| `IMAGE_TAG` | Runtime env | Set during deploy to `${{ github.sha }}` |

## Chunk 9: Operational Details and Risks

1. Deployments now target a specific host through `VM_HOST` instead of relying on self-hosted runner labels.
2. The VM must already have Docker and the Docker Compose plugin installed.
3. `VM_USER` must be allowed to run `docker` on the VM.
4. The workflow currently records the VM host key at runtime with `ssh-keyscan`.
5. `mongo:7` remains a moving major tag, so patch releases can change over time.
6. Deployment is still an in-place replacement on a single VM.
7. There is still no automatic rollback step.
8. Concurrency cancellation means a newer push to `main` can cancel an in-progress deploy.

## Chunk 10: Source Files To Keep Open

1. `.github/workflows/deploy-stack.yaml`
2. `.github/workflows/daily-audit-fix.yaml`
3. `.github/workflows/data-clean.yaml`
4. `deploy/docker-compose.prod.yaml`
5. `backend/Dockerfile`
6. `frontend/Dockerfile`
7. `frontend/nginx/default.conf`
8. `README.md`
