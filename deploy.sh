#!/usr/bin/env bash
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
VPS_USER="${VPS_USER:-root}"
VPS_HOST="104.237.11.83"
VPS_DIR="~/fincriss-ui/fincriss"
APP_URL="https://app.fincriss.com"
SSH_KEY="${SSH_KEY:-}"          # e.g. export SSH_KEY=~/.ssh/id_rsa  (optional)

SSH_OPTS=(-o StrictHostKeyChecking=no -o BatchMode=yes)
[[ -n "$SSH_KEY" ]] && SSH_OPTS+=(-i "$SSH_KEY")

# ── Helpers ───────────────────────────────────────────────────────────────────
log()  { echo "[deploy] $*"; }
fail() { echo "[deploy] ERROR: $*" >&2; exit 1; }

remote() {
  ssh "${SSH_OPTS[@]}" "${VPS_USER}@${VPS_HOST}" "$@"
}

# ── Pre-flight ────────────────────────────────────────────────────────────────
log "Checking SSH connectivity to ${VPS_HOST}..."
remote "echo 'SSH OK'" || fail "Cannot reach ${VPS_HOST}. Check your SSH key / VPS_USER."

# ── Deploy ────────────────────────────────────────────────────────────────────
log "Pulling latest code on VPS..."
remote "cd ${VPS_DIR} && git pull --ff-only"

log "Rebuilding and restarting container..."
remote "cd ${VPS_DIR} && docker compose up -d --build"

# ── Health check ──────────────────────────────────────────────────────────────
log "Waiting for app to come up..."
for i in {1..12}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$APP_URL" || true)
  if [[ "$HTTP_CODE" =~ ^(200|301|302)$ ]]; then
    log "Health check passed (HTTP $HTTP_CODE) — ${APP_URL} is live."
    exit 0
  fi
  log "  attempt $i/12: got HTTP $HTTP_CODE, retrying in 5s..."
  sleep 5
done

fail "App did not respond with 200/301/302 after 60s. Check: ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_DIR} && docker compose logs -f'"
