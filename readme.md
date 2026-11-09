# DevStudio

**Interactive coding screencasts. Pause the lesson, edit the code yourself, and fork it into your own project.**

DevStudio is a Scrimba-style platform. Instead of a flat video of someone's screen, a "scrim" stores **narration audio** plus a **timestamped log of every editor operation** (keystrokes, cursor moves, file snapshots). During playback the code is rebuilt live in a real Monaco editor. You can stop at any moment and the code in front of you is real, editable, and runnable.

---

## Table of Contents

- [Use Cases](#use-cases)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Development Workflow](#development-workflow)
- [Roadmap / Known Gaps](#roadmap--known-gaps)

---

## Use Cases

### 🎓 For learners: watch, pause, tinker
1. Open a scrim from **Browse** (public scrims; no account needed to browse).
2. Press **Play**. The instructor's voice plays while their code types itself into the editor, cursor included.
3. Press **Pause** whenever you like. The editor becomes editable. Change the code, then watch the live preview and console update.
4. Like your version? Click **Fork & Save** to keep it as your own scrim.

> *Example:* a CSS flexbox lesson reaches `justify-content: center`. You pause, try `space-between`, and see the result in the preview straight away.

### 🎙️ For creators: record lessons inside the editor
1. Sign up or log in, then open the editor (`/scrim`).
2. Add files (`index.html`, `style.css`, `index.js`, or `App.jsx` with React mode on).
3. Press **Record**, talk through your code, and press **Stop**.
4. Save. The audio and operation log are uploaded to S3 and the scrim appears under **My Scrims**.

> *Example:* record a 5-minute "Build a counter in React" walkthrough. Viewers get your narration and a codebase they can actually run.

### 🍴 For everyone: fork and build on someone else's work
- Forking at time `t` creates a new scrim owned by you. It contains the original recording **cut off at `t`** plus your edited files.
- All of your forks are listed under **My Forks**, each linked back to the original (`forked_from_id`).

> *Example:* a teacher records a starter exercise. Each student pauses at the "your turn" moment, finishes the exercise, and forks it as their submission.

### Supported languages
| Mode | Files | Preview |
|------|-------|---------|
| Vanilla | HTML, CSS, JS | Combined into a sandboxed `<iframe srcdoc>` |
| React | JSX (+ CSS) | React 18 UMD + Babel Standalone, transpiled in the browser |

`console.log`, `console.warn`, and `console.error` output from the preview is sent to the built-in console panel through `postMessage`.

---

## How It Works

```
┌───────────────── Recording ─────────────────┐
│ Mic ──► MediaRecorder ──► audio/webm blob   │
│ Monaco events ──► oplog[] (JSON)            │
│   snapshot · edit · cursor · mousemove      │
└───────────────────┬─────────────────────────┘
                    │  POST /api/upload?type=video|oplog
                    ▼
              ┌──────────┐        ┌────────────┐
              │  Go API  │──────► │  AWS S3    │  audio + oplog files
              │  (Gin)   │        └────────────┘
              │          │──────► PostgreSQL     scrim metadata + URLs
              └──────────┘
                    ▲
┌───────────────── Playback ──────────────────┐
│ <audio> clock drives a requestAnimationFrame│
│ loop. Ops with op.time <= audio.currentTime │
│ are applied to Monaco (applyEdits/cursor)   │
└─────────────────────────────────────────────┘
```

### The oplog
A recording is a JSON array of time-stamped operations (`time` is seconds since recording started):

```jsonc
[
  { "time": 0,    "type": "snapshot",  "files": [{ "id": "f-1", "name": "index.html", "content": "..." }] },
  { "time": 1.42, "type": "edit",      "fileId": "f-1",
    "changes": [{ "range": { "startLineNumber": 3, "startColumn": 5, "endLineNumber": 3, "endColumn": 5 }, "text": "h" }],
    "snapshot": "<full file content after edit>" },
  { "time": 1.50, "type": "cursor",    "fileId": "f-1", "position": { "lineNumber": 3, "column": 6 } },
  { "time": 1.51, "type": "mousemove", "x": 0.42, "y": 0.17 }
]
```

- **Edits** record Monaco's own change ranges, so playback calls `model.applyEdits()` and the result matches the original keystroke for keystroke.
- **Cursor** events are throttled to about 30 ms and **mousemove** to about 16 ms (one per frame). Mouse coordinates are stored as fractions of the editor size, so they still line up at a different window size.
- **Seeking** rebuilds the editor state at time `t` by replaying the log from the first snapshot.
- **Pause** saves the current audio time, the oplog index, and the files, so playback can resume exactly where it stopped.

### Forking
`POST /api/scrims/:id/fork` sends `fork_time`, `fork_oplog_index`, and the current file snapshots. The server then:
1. downloads the original oplog from S3 and cuts it at `fork_oplog_index`,
2. uploads the cut log as a new S3 object,
3. creates a new scrim that **reuses the original audio URL**, with `duration = ceil(fork_time)` (the player stops at that point),
4. sets `forked_from_id` to point at the original.

### Auth
On login, the API issues a JWT (default expiry `24h`). The client keeps it in `localStorage` under `jwt` and sends it as `Authorization: Bearer <token>`. `AuthMiddleware` checks the token and puts `userID` into the Gin context. When the API returns a 401, the client clears the token.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go, [Gin](https://gin-gonic.com/), [sqlc](https://sqlc.dev/), [golang-migrate](https://github.com/golang-migrate/migrate), JWT, bcrypt |
| Database | PostgreSQL (`pgcrypto` for UUIDs) |
| Storage | AWS S3 (`aws-sdk-go`) for audio and oplog files |
| Frontend | React 19, Vite, React Router v7, TanStack Query |
| Editor | Monaco (`@monaco-editor/react`) |
| UI | Tailwind CSS v4, shadcn/ui (Radix), Lucide icons |
| Dev tooling | [air](https://github.com/air-verse/air) hot reload (optional), ESLint |

---

## Project Structure

```
.
├── cmd/server/main.go          # Entry point: config, DB, S3, services, CORS, routes
├── internal/
│   ├── api/
│   │   ├── handlers/           # auth, scrim, scrimfiles, upload
│   │   ├── routes/             # Route registration
│   │   ├── middleware/         # JWT auth + error handler
│   │   └── dto/                # DB row → JSON response mappers
│   ├── services/               # AuthService, ScrimService, ScrimFilesService, S3Service
│   ├── db/
│   │   ├── migrations/         # Ordered SQL migrations (schema source of truth)
│   │   ├── queries/            # Hand-written SQL for sqlc
│   │   └── sqlc/               # GENERATED: do not edit by hand
│   ├── pkg/                    # jwt, response, validator helpers
│   └── config/                 # Typed config loaded from .env
├── client/
│   └── src/
│       ├── App.jsx             # Router + QueryClient
│       ├── pages/Home.jsx      # Dashboard, Browse, My Scrims, My Forks, Create
│       ├── pages/Scrim.jsx     # Editor: record / play / pause / fork, preview, console
│       ├── pages/scrim/        # FileExplorer, FileTabBar, FloatingPanel, ScrimSidebar
│       └── components/ui/      # shadcn components
├── Makefile                    # migrate-up / migrate-down / migrate-create / sqlc
├── sqlc.yml
├── start.sh                    # One-command local dev launcher
└── .air.toml                   # Hot-reload config
```

---

## Getting Started

### Prerequisites
- **Go** (version in `go.mod`)
- **Node.js** 20+ and npm
- **PostgreSQL** 14+ running on `localhost:5432`
- **golang-migrate** CLI: `brew install golang-migrate`
- **sqlc** (only needed if you change SQL): `brew install sqlc`
- **air** (optional, for hot reload): `go install github.com/air-verse/air@latest`
- An **AWS S3 bucket** and credentials with `PutObject`/`GetObject` access. Objects must be publicly readable, or served through a bucket policy, so the browser can fetch the audio and oplog.

### Quick start (macOS)
```bash
git clone https://github.com/Ankush263/devstudio.git
cd devstudio
# create .env (see Configuration below)
./start.sh
```
`start.sh` does the following:
1. starts Homebrew PostgreSQL if it isn't running,
2. creates the database from `DB_URL` if it's missing and runs migrations,
3. installs frontend dependencies when `package.json` has changed,
4. starts the API on `:8000` (with `air` if it's installed) and the Vite dev server,
5. stops both processes on Ctrl+C or if either one exits.

Open the URL Vite prints (usually http://localhost:5173).

### Manual start
```bash
make migrate-up              # apply DB migrations
go run ./cmd/server          # API on :8000
cd client && npm install && npm run dev
```

> ⚠️ The frontend currently hard-codes `API_BASE = 'http://localhost:8000/api'`, so the backend must run on port 8000.

---

## Configuration

Create a `.env` in the repo root:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | API port |
| `DB_URL` | — | Postgres URL, e.g. `postgres://user:pass@localhost:5432/devstudio?sslmode=disable` |
| `JWT_SECRET` | — | Secret used to sign JWTs |
| `TOKEN_EXPIRY` | `24h` | JWT lifetime (Go duration) |
| `AWS_ACCESS_KEY` | — | IAM access key |
| `AWS_SECRET_KEY` | — | IAM secret key |
| `AWS_REGION` | `ap-south-1` | Bucket region |
| `S3_BUCKET` | `project-devstudio` | Bucket for audio and oplog files |

---

## API Reference

Base URL: `http://localhost:8000/api`. 🔒 means the endpoint needs `Authorization: Bearer <jwt>`.

### Auth
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | `{ username?, email, password }` (password ≥ 8 chars) | Register |
| POST | `/auth/login` | `{ email, password }` | Returns `{ token }` |
| GET 🔒 | `/me` | — | Current user |

### Scrims
| Method | Path | Description |
|--------|------|-------------|
| GET | `/scrims/public` | List published scrims (no auth) |
| GET 🔒 | `/scrims` | List the current user's scrims |
| GET 🔒 | `/scrims/myforks` | List the current user's forks |
| GET 🔒 | `/scrims/:scrimid` | Get one scrim |
| POST 🔒 | `/scrims` | Create a scrim |
| PATCH 🔒 | `/scrims/:scrimid` | Attach `videourl` / `oplogurl` / `duration` |
| POST 🔒 | `/scrims/:scrimid/fork` | Fork at a point in time |

Create/attach body:
```json
{ "title": "Flexbox basics", "description": "...", "videourl": "https://...", "oplogurl": "https://...",
  "duration": 312, "published": true, "videodescription": {} }
```

Fork body:
```json
{ "title": "Fork of Flexbox basics", "fork_time": 87.4, "fork_oplog_index": 1203,
  "file_snapshots": [{ "id": "f-1", "name": "style.css", "content": "..." }] }
```

### Scrim files
| Method | Path | Description |
|--------|------|-------------|
| POST 🔒 | `/scrimfiles` | `{ scrimid, filename, location, language, content, description }` |
| GET 🔒 | `/scrimfiles/:scrimid` | List the files in a scrim |

### Upload
| Method | Path | Description |
|--------|------|-------------|
| POST 🔒 | `/upload?type=video` | multipart `file` → stored as `videos/<uuid>.webm` (audio/webm) |
| POST 🔒 | `/upload?type=oplog` | multipart `file` → stored as `oplogs/<uuid>.json` |

Both return `{ "url": "https://<bucket>.s3.<region>.amazonaws.com/..." }`.

**Example: record-and-save flow from the command line**
```bash
TOKEN=$(curl -s -X POST localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"me@example.com","password":"supersecret"}' | jq -r .token)

AUDIO=$(curl -s -X POST "localhost:8000/api/upload?type=video" \
  -H "Authorization: Bearer $TOKEN" -F file=@recording.webm | jq -r .url)
OPLOG=$(curl -s -X POST "localhost:8000/api/upload?type=oplog" \
  -H "Authorization: Bearer $TOKEN" -F file=@oplog.json | jq -r .url)

curl -X POST localhost:8000/api/scrims -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"Hello\",\"videourl\":\"$AUDIO\",\"oplogurl\":\"$OPLOG\",\"duration\":60,\"published\":true}"
```
> The `jq` paths assume the standard response wrapper in `internal/pkg/response`. Adjust them if your responses are nested under `data`.

---

## Data Model

```
users ──< scrims ──< scrimfiles
            │
            └── forked_from_id ──► scrims.id
```

- **users**: `userid` UUID PK, `username`, `email` (unique), `password` (bcrypt), `enabled`, `description` JSONB, timestamps
- **scrims**: `id` UUID PK, `user_id` → users, `title`, `description`, `videodescription` JSONB, `video_url`, `oplog_url`, `duration` (s), `published`, `mode`, `files` JSONB, `forked_from_id` → scrims, timestamps
- **scrimfiles**: `id` UUID PK, `scrim_id` → scrims (`ON DELETE CASCADE`), `filename`, `language`, `location`, `content`, `description` JSONB, timestamps

---

## Development Workflow

### Changing the schema
```bash
make migrate-create name=add_tags_to_scrims   # creates up/down files
# edit internal/db/migrations/00000N_add_tags_to_scrims.{up,down}.sql
make migrate-up
make migrate-down                              # roll back one step
```

### Adding a query
1. Write SQL with sqlc annotations in `internal/db/queries/*.sql`.
2. Run `make sqlc`. Code is regenerated into `internal/db/sqlc/` (never edit that folder by hand).
3. Call the new query from a service in `internal/services/`, expose it through a handler in `internal/api/handlers/`, and register it in `internal/api/routes/`.

### Frontend
```bash
cd client
npm run dev      # dev server
npm run lint     # ESLint
npm run build    # production build → client/dist
```
The `@/` import alias resolves to `client/src/`.

---

## Roadmap / Known Gaps

- Recordings capture **microphone audio + the editor oplog**, not a screen video. The `video_url` column and `type=video` upload hold the `audio/webm` file.
- No delete endpoint for scrims yet.
- `API_BASE` is hard-coded in the client; it should come from a Vite env var (`VITE_API_URL`).
- CORS allows all origins; restrict it before deploying.
- The React preview loads React 18, ReactDOM, and Babel from unpkg, so it needs network access.
