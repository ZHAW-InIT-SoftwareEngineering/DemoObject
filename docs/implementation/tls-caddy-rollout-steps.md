# Shared Edge Rollout

Public TLS and ingress for `demo.init.zhaw.ch` are now owned by the separate
`demo_edge` deployment, not by this repository.

## Request Flow

`browser -> demo_edge Caddy -> demoobject-frontend -> demoobject-api`

The DemoObject production stack owns only:

1. `mongo`
2. `api`
3. `frontend`

The shared edge stack owns:

1. Caddy
2. host ports `80` and `443`
3. TLS certificates
4. domain routing

## DemoObject Requirements

The frontend container must be attached to the external Docker network `edge`
and must be reachable as `demoobject-frontend:80`.

The production compose file declares:

```yaml
services:
  frontend:
    container_name: demoobject-frontend
    expose:
      - "80"
    networks:
      - default
      - edge

networks:
  edge:
    external: true
```

## VM Requirements

Create the shared network once:

```bash
docker network create edge
```

The DemoObject deploy workflow also creates the network if it is missing.

## Edge Requirements

The `demo_edge` Caddyfile must route the domain to the DemoObject frontend:

```caddyfile
demo.init.zhaw.ch {
    reverse_proxy demoobject-frontend:80
}
```

The old DemoObject-owned Caddy container must not be running, because only the
shared edge proxy should bind public ports `80` and `443`.
