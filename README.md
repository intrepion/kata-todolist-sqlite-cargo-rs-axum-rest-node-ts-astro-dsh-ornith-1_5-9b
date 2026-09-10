# To Do List — SQL Server Domain Model Kata

A learning kata (not a product) for building a signed-in, single-tenant To Do list where SQLite is the single source of truth, Astro is UI + a thin REST client, and two people can have the same folder open. The server is the authority; the browser only caches and reconciles after reload.

## Decisions, settled

| Question | Answer |
| --- | --- |
| Real product or kata? | **Kata** — clean, well-explained choices over production hardening. |
| Multi-tenant / accounts? | **Single-tenant**: each task's list belongs to one signed-in owner; folders organize that owner's list, not separate tenants. |
| Auth model | **Signed-in, frictionless**: zero-setup device-code sign-in (e.g. "code is 123-456"), no secret password, server issue a session token. |
| What is a task / fields | **One task per owner**, fields: `title`, `state` (is-done), and `deleted`; plus a `tags` array and a stable JSON `state` payload for the done flag. |
| Data model / storage shape | **Normalized, two tables**: `tasks` (current-state snapshot) and `field_versions` (immutable per-(owner, task, field) revision). |
| Cross-language source of truth | **SQLite is authoritative**; Astro is UI + REST client; local mirror reconciles after reload. |
| REST API surface | CRUD over `/owners/{owner_id}/tasks`, task get/commit, per-owner `GET/PATCH/DELETE`; owner-level `/me` and `/sessions`; `POST /reset/:owner_id/sessions/:token` for recovery. |
| Error handling | Typed `Result<T, String>` messages + REST status codes (400/404/409/422). Conflict when a newer revision exists on the same task -> 409. |
| Schema registry | A `field_versions` table maps `(owner_id, task_id, field)` to the current field version, plus schema versions and payload schemas. |
| Cross-session sync | Live-poll + optimistic-conflict loop on the client; server resolves by comparing latest revisions of the same task. |
| Folders | **A folder is a grouping feature** (named groups like "Personal"), not a directory. |
| Docs | **Working app + documentation**. |

## Context / ADRs

- **`CONTEXT.md`** — glossary of the model and terms (the domain vocabulary; no implementation).
- **`docs/adr/0001-field-versions.md`** — track each field on its own forward-only line via field versions, not a single task.
- **`docs/adr/0002-conflict-and-sessions.md`** — last-writer-wins on a whole task, keyed by task version; one owner per field; explicit owner sessions.
- **`docs/adr/0003-reset-on-conflict.md`** — after a conflicting revision loses, reset that owner's current schema version and hand them a recovery token.

## Layout

```
.
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-field-versions.md
│       ├── 0002-conflict-and-sessions.md
│       └── 0003-reset-on-conflict.md
├── server/    # Rust binary — SQL/CRUD model layer; authoritative source of truth
│   └── src/
├── web/       # Astro + Vite SPA — UI + typed REST client + optimistic-conflict
│   └── src/
└── .gitignore
```

## Run the kata

### Server

```bash
cd server
cargo add sqlx --features sqlite,uuid,chrono
cargo add axum  serde  serde_json

# Testing mode: in-memory SQLite, no file
sqlx query "CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, owner_id TEXT, title TEXT, state TEXT NOT NULL DEFAULT '{}', completed BOOLEAN, deleted BOOLEAN, version INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP), tags JSON);"
echo 'DATABASE_URL="sqlite://:memory:?mode=rwc"' > .env   # not gitignored

PORT=8000 cargo run -- --config .env
# -> http://localhost:8000/health  (also /users/{id}/tasks, /users/{id}/tasks/{taskId}, commit)
```

### Web

```bash
cd web
pnpm install
pnpm dev -- --port 4321
# -> http://localhost:4321/   (login -> task list + detail; owner page reads all tasks)
```
