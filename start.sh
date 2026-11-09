#!/usr/bin/env bash
# Starts DevStudio locally: Postgres, migrations, Go backend (:8000) and Vite frontend.
# Usage: ./start.sh        (Ctrl+C stops backend and frontend)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

log()  { printf '\033[1;34m[start]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[start]\033[0m %s\n' "$*" >&2; exit 1; }

# --- env ---------------------------------------------------------------------
[ -f .env ] || fail ".env not found in $ROOT (needs DB_URL, JWT_SECRET, AWS_* ...)"
DB_URL="$(grep -E '^DB_URL=' .env | head -1 | cut -d= -f2- | tr -d '"'"'"'')"
[ -n "$DB_URL" ] || fail "DB_URL is not set in .env"
PORT="$(grep -E '^PORT=' .env | head -1 | cut -d= -f2- | tr -d '"'"'"'')"
PORT="${PORT:-8000}"

# node/npm may only exist via nvm in interactive shells
if ! command -v npm >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use default >/dev/null
fi

for cmd in go npm psql pg_isready migrate; do
  command -v "$cmd" >/dev/null 2>&1 || fail "'$cmd' is not installed (see readme / brew install)"
done

# --- postgres ----------------------------------------------------------------
if ! pg_isready -h localhost -p 5432 -q; then
  if command -v brew >/dev/null 2>&1; then
    PG_FORMULA="$(brew list --formula | grep -E '^postgresql(@[0-9]+)?$' | sort -V | tail -1 || true)"
    [ -n "$PG_FORMULA" ] || fail "No Homebrew PostgreSQL found. Install with: brew install postgresql@18"
    log "Starting $PG_FORMULA ..."
    brew services start "$PG_FORMULA" >/dev/null
  else
    fail "PostgreSQL is not running on localhost:5432"
  fi
  for _ in $(seq 1 20); do pg_isready -h localhost -p 5432 -q && break; sleep 1; done
  pg_isready -h localhost -p 5432 -q || fail "PostgreSQL did not become ready"
fi
log "PostgreSQL is up"

# --- database + migrations ---------------------------------------------------
if ! psql "$DB_URL" -Atqc 'select 1' >/dev/null 2>&1; then
  DB_NAME="$(echo "$DB_URL" | sed -E 's#^.*/([^/?]+)(\?.*)?$#\1#')"
  log "Creating database '$DB_NAME' ..."
  createdb -h localhost "$DB_NAME" || fail "Could not create database '$DB_NAME' (check DB_URL credentials)"
fi
log "Running migrations ..."
migrate -path internal/db/migrations -database "$DB_URL" up

# --- dependencies ------------------------------------------------------------
if [ ! -d client/node_modules ] || [ client/package.json -nt client/node_modules ]; then
  log "Installing frontend dependencies ..."
  (cd client && npm install)
fi
go mod download

# --- run ---------------------------------------------------------------------
if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  fail "Port $PORT is already in use (the frontend expects the API on :$PORT)"
fi

PIDS=()
kill_tree() {
  local child
  for child in $(pgrep -P "$1" 2>/dev/null); do kill_tree "$child"; done
  kill "$1" 2>/dev/null || true
}
cleanup() {
  trap - EXIT INT TERM
  log "Shutting down ..."
  for pid in "${PIDS[@]}"; do kill_tree "$pid"; done
  wait 2>/dev/null || true
}
trap cleanup EXIT
trap 'cleanup; exit 130' INT TERM

if command -v air >/dev/null 2>&1; then
  log "Starting backend with air (hot reload) on :$PORT"
  air & PIDS+=($!)
else
  log "Starting backend on :$PORT"
  go run ./cmd/server & PIDS+=($!)
fi

log "Starting frontend (Vite)"
(cd client && npm run dev) & PIDS+=($!)

# exit (and stop the other process) as soon as either one dies
while kill -0 "${PIDS[0]}" 2>/dev/null && kill -0 "${PIDS[1]}" 2>/dev/null; do sleep 1; done
fail "A process exited; stopping everything"
