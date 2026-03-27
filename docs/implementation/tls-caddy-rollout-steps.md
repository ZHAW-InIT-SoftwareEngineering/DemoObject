# TLS Rollout Steps with Caddy

This document captures the intended order for introducing TLS/HTTPS for `demo.init.zhaw.ch` using Caddy in Docker.

It is a planning guide only. It does not imply that the repository changes are complete yet.

## Goal

Serve the application only over HTTPS at `https://demo.init.zhaw.ch`, while keeping port `80` available for ACME certificate validation and HTTP-to-HTTPS redirects.

## Step 1: Define the Caddyfile

Create a deployment config file at `deploy/Caddyfile`.

Use Caddy as the public TLS terminator and reverse proxy to the internal frontend container.

Planned minimal config:

```caddyfile
demo.init.zhaw.ch {
    reverse_proxy frontend:80
}
```

Notes:

1. This is enough for automatic HTTPS with Caddy.
2. Caddy will also handle HTTP-to-HTTPS redirects automatically.
3. Port `80` should stay open for certificate validation and redirects.

## Step 2: Make Caddy the Only Public Entrypoint

Update the production Docker Compose stack so that:

1. `caddy` publishes host ports `80` and `443`.
2. `frontend` no longer publishes host port `80`.
3. `frontend` remains reachable only on the internal Docker network.

Intended request flow:

`browser -> caddy -> frontend -> api`

Reason:

1. Caddy should own TLS and public ingress.
2. Frontend Nginx should continue serving the SPA and forwarding `/api/` to `api:3000`.

## Step 3: Add the Caddy Service to Production Compose

Add a new `caddy` service to `deploy/docker-compose.prod.yaml`.

The service should:

1. Use the official Caddy image, pinned to a version.
2. Mount `deploy/Caddyfile` into `/etc/caddy/Caddyfile`.
3. Persist `/data` and `/config` in named Docker volumes.
4. Publish:
   - `80:80`
   - `443:443`
   - `443:443/udp`

Also declare the named volumes for Caddy at the bottom of the compose file.

## Step 4: Remove the Frontend Host Port Mapping

Adjust the `frontend` service in `deploy/docker-compose.prod.yaml`.

Required direction:

1. Remove the public `ports` mapping from `frontend`.
2. Optionally replace it with `expose: "80"` for clarity.

Reason:

1. `frontend` and `caddy` cannot both bind host port `80`.
2. Once Caddy is introduced, only Caddy should bind public web ports.

## Step 5: Update the Deployment Workflow

Adjust `.github/workflows/deploy-stack.yaml` so that deployment copies and runs all required runtime artifacts.

The workflow should:

1. Copy `deploy/docker-compose.prod.yaml` to the target deploy path.
2. Copy `deploy/Caddyfile` to the same deploy path.
3. Deploy `caddy` together with `mongo`, `api`, and `frontend`.

Reason:

1. The compose file alone is not enough once Caddy depends on an external config file.
2. Relative mount paths in Compose are resolved from the deployed compose location.

## Step 6: Validate the Runtime Checks

Extend deployment validation so TLS rollout is actually verified.

Checks should cover:

1. `api` container health.
2. `frontend` container health.
3. `caddy` container health or startup status.
4. Reachability of `https://demo.init.zhaw.ch`.

Optional additional check:

1. Confirm that `http://demo.init.zhaw.ch` redirects to `https://demo.init.zhaw.ch`.

## Step 7: Confirm Infrastructure Prerequisites

Before expecting certificate issuance to work, confirm:

1. `demo.init.zhaw.ch` resolves to the correct VM IP.
2. Inbound `80/tcp` is open.
3. Inbound `443/tcp` is open.
4. Inbound `443/udp` is open if HTTP/3 support is desired.

## Step 8: Deploy and Test

After the repository changes are in place:

1. Run the deployment workflow.
2. Confirm the Caddy container starts successfully.
3. Confirm a certificate is issued.
4. Open `https://demo.init.zhaw.ch` in a browser.
5. Verify that plain HTTP redirects to HTTPS.

## Expected End State

After rollout:

1. The browser connects publicly only to Caddy.
2. Caddy terminates TLS for `demo.init.zhaw.ch`.
3. Caddy proxies traffic to `frontend:80`.
4. Frontend Nginx continues to proxy `/api/` to `api:3000`.
5. The application is publicly available over HTTPS.
