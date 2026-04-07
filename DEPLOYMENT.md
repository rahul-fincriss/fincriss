# Deployment Guide — FinCrisS Frontend

**Live URL:** https://app.fincriss.com
**VPS IP:** 104.237.11.83
**VPS path:** `~/fincriss-ui/fincriss`
**Backend compose path:** `~/fincriss-bcknd`

---

## Architecture

```
Internet → Caddy (ports 80/443, TLS) → fincriss container (nginx:80)
                                      → api container (uvicorn:8000)
```

All containers share the `fincriss-bcknd_default` Docker network. Caddy handles Let's Encrypt certificates automatically.

---

## First-Time Setup (already done)

### 1. DNS
Add an **A record** in your DNS provider:
```
A    app    104.237.11.83    TTL: 1 Hour
```
Verify propagation before proceeding:
```bash
curl -s "https://dns.google/resolve?name=app.fincriss.com&type=A" | grep -o '"data":"[^"]*"'
# Must return: "data":"104.237.11.83"
```

### 2. Clone the repo on VPS
```bash
mkdir -p ~/fincriss-ui && cd ~/fincriss-ui
git clone https://github.com/rahul-fincriss/fincriss.git
cd fincriss
```

### 3. Add frontend to backend's Caddyfile
Edit `~/fincriss-bcknd/Caddyfile` and add the frontend block:
```
api.fincriss.com {
    reverse_proxy api:8000
}

app.fincriss.com {
    reverse_proxy fincriss:80
}
```

### 4. Start the frontend container
```bash
cd ~/fincriss-ui/fincriss
docker compose up -d --build
```

### 5. Reload Caddy
```bash
cd ~/fincriss-bcknd
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

Caddy will automatically obtain a Let's Encrypt certificate. Monitor with:
```bash
docker compose logs caddy -f
# Wait for: "certificate obtained successfully"
```

If Caddy fails the first attempt (DNS not yet propagated), restart it to force a retry:
```bash
docker compose restart caddy
```

---

## Deploying Updates

```bash
cd ~/fincriss-ui/fincriss
git pull
docker compose up -d --build
```

No Caddy restart needed — the certificate persists and Caddy auto-renews it.

---

## Changing the API URL

The `VITE_API_URL` is baked into the bundle at build time. To override it:
```bash
VITE_API_URL=https://new-api.example.com docker compose up -d --build
```

Or set it permanently in a `.env` file in `~/fincriss-ui/fincriss/`:
```
VITE_API_URL=https://api.fincriss.com
```

---

## Useful Commands

```bash
# Check container status
docker compose ps

# View frontend logs
cd ~/fincriss-ui/fincriss && docker compose logs -f

# View Caddy logs (TLS issues, traffic)
cd ~/fincriss-bcknd && docker compose logs caddy -f

# Verify site is up
curl -I https://app.fincriss.com

# List all running containers
docker ps
```
