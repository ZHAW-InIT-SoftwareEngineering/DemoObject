# DemoObject Deployment Strategy (Discussion Draft)

This document captures a **discussion-first** deployment design for DemoObject on a public Ubuntu VM using Docker and GitHub Actions, with runtime configuration coming from GitHub Actions secrets/variables.

It intentionally does **not** include implementation changes yet.

## 1. Inputs and Constraints

1. VM access:
   - `ssh -i "<LINK_TO_.pem>" ubuntu@160.85.252.104`
2. VM image:
   - Ubuntu Noble with Docker preinstalled.
3. Registry preference:
   - Public images are acceptable (open-source project).
4. Deployment trigger:
   - Push to `main` branch.
5. Availability:
   - Downtime should be minimized.
6. Database:
   - MongoDB runs as container on same VM.
7. Backups:
   - Not required for now.
8. Network:
   - VM publicly reachable via floating IP `160.85.252.104`.

## 2. Current Repository Readiness

Already present:

1. Production compose file:
   - `deploy/docker-compose.prod.yaml`
   - Services: `mongo`, `api`, `frontend`
   - API is internal-only (`expose`), frontend publishes port 80.
2. Production-ready Dockerfiles:
   - `backend/Dockerfile` (multi-stage)
   - `frontend/Dockerfile` (multi-stage, Nginx runtime)
3. Reverse proxy route:
   - Frontend Nginx proxies `/api` to `api:3000`.
4. Health checks:
   - Mongo, API, and frontend checks are defined.
5. No workflows yet:
   - `.github/workflows` is currently empty.

## 3. Recommended High-Level Architecture

1. Keep one VM for now.
2. Run application services using Docker Compose:
   - `frontend` (internal service reachable by the shared edge proxy)
   - `api` (internal)
   - `mongo` (internal, persistent volume)
3. Build images in GitHub Actions.
4. Push images to GHCR.
5. Deploy by SSH from GitHub Actions to the VM.
6. Pass runtime configuration from GitHub Secrets/Variables into remote shell and compose process.
7. Do not store a manually maintained `.env` file on VM.

## 4. Registry Decision (Public Images + Secret Safety)

### Recommendation

Use **GHCR public images** with immutable tags (Git SHA).

### Why this is safe

1. Secrets should not be in images.
2. Secrets are injected at runtime only.
3. Frontend image should contain no sensitive data (static files).
4. Backend secrets remain runtime environment variables.

### Guardrails

1. Keep `.env*` excluded from Docker build context via `.dockerignore`.
2. Avoid hardcoding credentials in Dockerfile, source, or compose file defaults.
3. Never print secret values in workflow logs.

## 5. Ports and Firewall Model

Open inbound:

1. `22/tcp` (SSH) and restrict source IPs if possible.
2. `80/tcp` for HTTP.
3. `443/tcp` for HTTPS (recommended next step).

Keep closed to internet:

1. `3000/tcp` (API)
2. `27017/tcp` (MongoDB)

Note:

1. Current compose follows this pattern by attaching `frontend` to the shared external Docker network `edge`. Public ports are owned by the separate edge proxy deployment.

## 6. GitHub Actions Configuration Model

Use **Environment-scoped** secrets/variables (e.g., `production`) so deployments are isolated and easier to protect.

### Suggested GitHub Variables (non-sensitive)

1. `VM_HOST=160.85.252.104`
2. `VM_USER=ubuntu`
3. `DEPLOY_PATH=/opt/demoobject`
4. `FRONTEND_PORT=80`
5. `MONGO_DATABASE=DemoObjectDB`
6. `MONGO_COLLECTION_NAME=SessionCollection`

### Suggested GitHub Secrets (sensitive)

1. `SSH_PRIVATE_KEY` (PEM content)
2. `MONGO_ROOT_USERNAME`
3. `MONGO_ROOT_PASSWORD`

GHCR authentication uses the workflow `GITHUB_TOKEN`, and image names are computed from the lower-case GitHub repository owner.

## 7. CI/CD Workflow Design (Discussion)

## Workflow A: CI (quality gate)

Trigger:

1. `push` and `pull_request`.

Jobs:

1. Backend: install + build.
2. Frontend: install + lint + build.
3. Optional: run container build smoke checks.

Purpose:

1. Prevent broken code from reaching deploy workflow.

## Workflow B: Deploy Production

Trigger:

1. Push to `main`.

Sequence:

1. Build backend and frontend images.
2. Tag with `${{ github.sha }}` (immutable).
3. Push both images to GHCR.
4. SSH into VM.
5. On VM:
   - Ensure deploy directory exists.
   - Ensure compose file exists at deploy path.
   - Export env vars from workflow context.
   - `docker compose pull`
   - `docker compose up -d --remove-orphans`
   - Verify health endpoints.
6. Keep previous tag available for fast rollback.

## 8. Downtime Minimization Strategy

For current single-VM setup, choose a phased approach.

### Phase 1 (simple, low complexity)

1. Pull images before restart.
2. Restart only changed services.
3. Keep health checks strict.
4. Expect brief interruption during container replacement.

### Phase 2 (near-zero downtime)

1. Introduce blue/green stacks (`demoobject-blue`, `demoobject-green`).
2. Put a stable edge proxy in front (host-level Nginx/Caddy).
3. Deploy new stack in parallel.
4. Switch traffic after health checks pass.
5. Keep previous stack warm for instant rollback.

Recommendation:

1. Start with Phase 1 immediately.
2. Move to Phase 2 once baseline deployment is stable.

## 9. Runtime Secret Injection Without VM `.env`

Pattern:

1. GitHub Actions job reads secrets/vars.
2. SSH command exports env values in-memory for that command session.
3. `docker compose` consumes exported env variables.
4. No manually managed `.env` file is required.

Security note:

1. A process-level environment exists at runtime, but secrets are not committed to repo and not hand-managed on VM.

## 10. Observability and Operations (Minimal)

1. Health checks:
   - Frontend: `/healthz`
   - API: `/api/healthz` via frontend proxy or direct internal check.
2. Log access:
   - `docker compose logs -f api frontend mongo`
3. Restart policy:
   - Already `unless-stopped` in production compose.
4. Resource planning for event spikes:
   - Add VM-level monitoring and alerting before high-traffic events.
   - Consider temporary VM scale-up before known events.

## 11. Security Best Practices to Apply

1. Use GitHub Environment protection for `production` (optional reviewer approval).
2. Restrict SSH source IPs if feasible.
3. Keep Docker and OS security updates current.
4. Pin image tags by digest for strongest supply-chain control (later hardening step).
5. Optionally run image vulnerability scan in CI.

## 12. Decisions Locked Before Implementation

1. TLS approach:
   - Add TLS later. Initial rollout will use HTTP on VM IP.
2. Deployment safety level:
   - Start with Phase 1 simple restart deployment.
3. Registry visibility and naming:
   - Use GHCR public images.
   - Backend image: `ghcr.io/<lower-case-repository-owner>/demoobject-backend`
   - Frontend image: `ghcr.io/<lower-case-repository-owner>/demoobject-frontend`
4. SSH firewall policy for initial rollout:
   - Allow inbound SSH from anywhere temporarily.
   - Keep key-based auth; tighten source allowlist later.
5. Branch deployment trigger:
   - Deploy on push to `main`.

## 13. Proposed Next Step

Once the decisions above are confirmed, implementation can proceed in this order:

1. Add CI workflow.
2. Add deploy workflow.
3. Add a deployment README with operational commands.
4. Perform first deployment to VM.
5. Validate health and rollback procedure.
