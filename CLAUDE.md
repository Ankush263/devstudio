# CLAUDE.md

## What This Is

DevStudio is a Scrimba-style interactive coding screencast platform. Users record videos inside a code editor, play them back, pause mid-video, edit the code live, then fork and save changes to their account. Supports HTML, CSS, JS, and React. Users can create, edit, and delete videos.

## Monorepo Layout

```
/cmd/server/main.go    — Backend entry point (PostgreSQL, Gin router, auth/scrim services, routes)
/internal/
  api/handlers/        — Gin HTTP handlers
  api/routes/          — Route registration
  api/middleware/       — JWT auth middleware
  services/            — Business logic (AuthService, ScrimService)
  db/sqlc/             — Auto-generated type-safe DB layer (DO NOT edit manually)
  db/queries/          — Raw SQL queries → run `make sqlc` after changes
  db/migrations/       — Ordered SQL migration files (context source for new queries)
  pkg/                 — Shared utilities (JWT, validation, JSON response helpers)
  config/              — Loads .env into typed Config struct via godotenv
/client/
  src/                 — React app source
  src/main.jsx         — Entry point → App.jsx (React Router v7)
  src/api/index.js     — API logic (TanStack Query)
  package.json         — All frontend dependencies
/go.mod                — All backend dependencies
```

## Backend (Go + Gin + sqlc)

- **Router:** Gin. Auth flow uses JWT issued on login, validated via `AuthMiddleware`.
- **DB:** PostgreSQL. Type-safe queries via sqlc.
- **Workflow:** Edit SQL in `internal/db/queries/` → run `make sqlc` → regenerated code lands in `internal/db/sqlc/`. Reference `internal/db/migrations/` for table schemas when writing new queries.

### API Routes

| Method | Path                   | Auth | Description                      |
| ------ | ---------------------- | ---- | -------------------------------- |
| POST   | `/api/auth/signup`     | No   | Register user                    |
| POST   | `/api/auth/login`      | No   | Login, returns JWT               |
| GET    | `/api/me`              | Yes  | Current user info                |
| POST   | `/api/scrims`          | Yes  | Create scrim                     |
| PATCH  | `/api/scrims/:scrimid` | Yes  | Attach video/oplog URLs to scrim |

### Database Tables

- **users** — `userid` (UUID PK), `username`, `email` (unique), `password` (bcrypt), `description` (JSONB), timestamps
- **scrims** — `id` (UUID PK), `user_id` (FK→users), `title`, `description`, `videodescription` (JSONB), `video_url`, `oplog_url`, `duration`, `published`, timestamps

## Frontend (React + Vite)

- **Editor:** Monaco Editor (primary code editor for recording/playback/editing)
- **Data fetching:** TanStack Query, API util attaches JWT from `localStorage` as Bearer token
- **Routing:** React Router v7
- **UI:** Tailwind CSS v4 + shadcn/ui (Radix primitives, Lucide icons)
- **Path alias:** `@/` → `client/src/`

### Key Routes

- `/scrim` — Main editor page (`Scrim.jsx`) — Monaco editor, file tabs, floating panels, video playback controls, auth modal
- `/about` — Placeholder

## Conventions

- Never manually edit files in `internal/db/sqlc/` — always regenerate via `make sqlc`
- All new SQL queries go in `internal/db/queries/`; use migration files for schema context
- All API handler logic goes in `internal/api/handlers/`; routing in `internal/api/routes/`
- Frontend API calls go through `client/src/api/index.js` using TanStack Query
- Frontend dependencies tracked in `client/package.json`; backend in `/go.mod`
