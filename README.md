# DemoObject
Here you will find the repository containing all the files for the conceptualization and implementation of the new demo object.

## CI/CD

The workflow `.github/workflows/deploy-backend.yml` expects the following GitHub Actions configuration.

| Name | Type | Required | Example / Default | Purpose |
| --- | --- | --- | --- | --- |
| `GHCR_USERNAME` | Variable | Yes | `gabc` | Must be the `github.com` username that owns the PAT used in `GHCR_PAT`. |
| `GHCR_PAT` | Secret | Yes | `ghp_...` | Classic PAT created on `github.com` with `read:packages` and `write:packages`. |
| `MONGO_DATABASE` | Variable | Yes | `DemoObjectDB` | Passed into deploy compose as database name. |
| `SESSION_COLLECTION_NAME` | Variable | Yes | `SessionCollection` | Passed into backend container environment. |
| `MONGO_ROOT_USERNAME` | Secret | Yes | `demoobject_admin` | MongoDB root user for container auth and backend DB connection string. |
| `MONGO_ROOT_PASSWORD` | Secret | Yes | `<strong-password>` | MongoDB root password for container auth and backend DB connection string. |
| `DEPLOY_PATH` | Variable | No | `./demoobject` | Target path on self-hosted runner where `docker-compose.prod.yaml` is copied. |
| `FRONTEND_PORT` | Variable | No | `80` | Host port mapping for frontend in production compose file. |

Notes:

1. `BACKEND_IMAGE` and `FRONTEND_IMAGE` are computed in the workflow from `GHCR_USERNAME`; no extra variable is needed.
2. This current workflow runs on a self-hosted runner and does not use `VM_HOST`, `VM_USER`, or `SSH_PRIVATE_KEY`.
3. Set values in `Settings -> Secrets and variables -> Actions` at repository level (or at org level with access to this repo).
4. `GHCR_PAT` must come from a regular `github.com` account, and `GHCR_USERNAME` must be set to that same username.
