# HTTPS Setup with Host Nginx + DuckDNS + Certbot

This guide sets up HTTPS on the VM using host-level Nginx (outside Docker), while keeping the Docker application stack HTTP-only and private on loopback.

## Target Architecture

1. Public traffic hits host Nginx on ports `80` and `443`.
2. Host Nginx proxies to `http://127.0.0.1:8080`.
3. Docker `frontend` container is only exposed on `127.0.0.1:${FRONTEND_PORT}` (default `8080`).
4. Docker `api` and `mongo` stay internal to Docker network.
5. TLS certs are managed by Certbot on the host (no cert files mounted into containers).

## Repository Expectations

This repository is configured for this model:

1. `deploy/docker-compose.prod.yaml` publishes frontend as `127.0.0.1:${FRONTEND_PORT:-8080}:80`.
2. `.github/workflows/deploy-stack.yaml` no longer validates or mounts `fullchain.pem` / `privkey.pem`.
3. Frontend container Nginx runs HTTP only.

## GitHub Actions Variables/Secrets

Set these in repository (or org) Actions configuration:

1. Variables:
   - `GHCR_USERNAME`
   - `MONGO_DATABASE`
   - `SESSION_COLLECTION_NAME`
   - `DEPLOY_PATH` (optional; default `./demoobject`)
   - `APP_UPSTREAM_PORT` (recommended `8080`)
   - `DOMAIN` (for example `yourname.duckdns.org`)
   - `DUCKDNS_SUBDOMAIN` (for example `yourname`)
   - `LE_EMAIL` (for example `you@example.com`)
2. Secrets:
   - `GHCR_PAT`
   - `MONGO_ROOT_USERNAME`
   - `MONGO_ROOT_PASSWORD`
   - `DUCKDNS_TOKEN`

Do not set `TLS_CERTS_DIR` or `FRONTEND_TLS_PORT` for this model.

## Automated Bootstrap Behavior

`deploy-stack.yaml` now expects the variables/secrets above and will, on deploy:

1. Install/ensure host packages: `nginx`, `certbot`, `python3-certbot-nginx`, `curl`, `cron`.
2. Create persistent DuckDNS files:
   - `/etc/default/duckdns`
   - `/opt/duckdns/update.sh`
   - `/etc/cron.d/duckdns`
3. Write host Nginx reverse proxy config:
   - `/etc/nginx/sites-available/demoobject`
4. Enable/reload `nginx`.
5. Obtain first certificate if missing via:
   - `certbot --nginx -d <DOMAIN> --redirect`
6. Enable `certbot.timer` for renewals.

## One-Time Commands on the VM (still required outside CI)

Run these only once if they are not already in place:

### 1) Open network access on VM and cloud firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

Also ensure your cloud security group/network ACL allows inbound TCP `80` and `443`.

### 2) Trigger deploy workflow

Push to `main` or run the workflow manually (`workflow_dispatch`).

### 3) Verify bootstrap output

```bash
sudo test -f /etc/default/duckdns && echo "duckdns env file: ok"
sudo test -f /opt/duckdns/update.sh && echo "duckdns updater script: ok"
sudo test -f /etc/cron.d/duckdns && echo "duckdns cron: ok"
sudo test -f /etc/nginx/sites-available/demoobject && echo "nginx site: ok"
systemctl list-timers --all | grep certbot
sudo nginx -t
```

## Deploy Path Notes

1. The GitHub Actions deploy workflow still deploys app containers.
2. Host Nginx remains outside Docker and does not get replaced by app deploys.
3. `FRONTEND_PORT` is derived in workflow from `APP_UPSTREAM_PORT`; configure only `APP_UPSTREAM_PORT`.

## Troubleshooting

1. `certbot` fails challenge:
   - Confirm DNS points to VM (`getent ahostsv4 <domain>`).
   - Confirm inbound `80/tcp` is open.
   - Confirm Nginx is running and serving that domain.
2. `502 Bad Gateway` from Nginx:
   - Check app container is up: `docker ps`.
   - Check upstream binding: `docker ps --format 'table {{.Names}}\t{{.Ports}}'` should show `127.0.0.1:8080->80/tcp` for `demoobject-frontend`.
3. Renewal dry-run fails:
   - Check Nginx config validity (`sudo nginx -t`).
   - Check `certbot.timer` is active.
