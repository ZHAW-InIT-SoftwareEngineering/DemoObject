# DemoObject
Live under: [demo.init.zhaw.ch](https://demo.init.zhaw.ch)

Here you will find the repository containing all the files for the conceptualization and implementation of the new demo object.

## CI/CD

The workflow `.github/workflows/deploy-stack.yaml` expects the following GitHub Actions configuration.

| Name | Type | Required | Example / Default | Purpose |
| --- | --- | --- | --- | --- |
| `VM_HOST` | Variable | Yes | `160.85.252.104` | SSH host for the production VM that runs Docker Compose. |
| `VM_USER` | Variable | Yes | `ubuntu` | SSH user used by GitHub Actions to connect to the VM and run Docker commands. |
| `GHCR_USERNAME` | Variable | Yes | `gabc` | Must be the `github.com` username that owns the PAT used in `GHCR_PAT`. |
| `SSH_PRIVATE_KEY` | Secret | Yes | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Private key that matches an authorized key for `VM_USER` on `VM_HOST`. |
| `GHCR_PAT` | Secret | Yes | `ghp_...` | Classic PAT created on `github.com` with `read:packages` and `write:packages`. |
| `MONGO_DATABASE` | Variable | Yes | `DemoObjectDB` | Passed into deploy compose as database name. |
| `MONGO_COLLECTION_NAME` | Variable | Yes | `SessionCollection` | Passed into backend container environment. |
| `MONGO_ROOT_USERNAME` | Secret | Yes | `demoobject_admin` | MongoDB root user for container auth and backend DB connection string. |
| `MONGO_ROOT_PASSWORD` | Secret | Yes | `<strong-password>` | MongoDB root password for container auth and backend DB connection string. |
| `DEPLOY_PATH` | Variable | No | `./demoobject` | Target path on the deployment VM where `docker-compose.prod.yaml` is uploaded. |

Notes:

1. `BACKEND_IMAGE`, `FRONTEND_IMAGE`, and `CADDY_IMAGE` are computed in the workflow from `GHCR_USERNAME`; no extra image variables are needed.
2. The deploy, cleanup, and audit workflows now run on `ubuntu-latest` GitHub-hosted runners. Production Docker commands execute remotely on the VM over SSH.
3. Set values in `Settings -> Secrets and variables -> Actions` at repository level (or at org level with access to this repo).
4. `GHCR_PAT` must come from a regular `github.com` account, and `GHCR_USERNAME` must be set to that same username.
5. `VM_USER` must be able to run `docker` and `docker compose` on the target VM.
