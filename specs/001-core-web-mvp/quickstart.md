# Quickstart: 001-core-web-mvp

## Prerequisites

- Node.js 20+
- PostgreSQL running locally
- `uv` + `specify` CLI (optional, for Spec Kit workflow)

## Setup

```bash
# From repo root
npm install

cp .env.example .env
cp frontend/.env.example frontend/.env
# Edit .env: set DATABASE_URL (and keep PORT=3001 for the API).
# Note: root `npm run dev` does not inject `.env` into Nuxt — if Nuxt saw PORT=3001 it would
# conflict with the API. Only the backend loads `../.env` in its dev script.

npm run db:generate
npm run db:migrate
```

## Run

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Health | http://localhost:3001/api/health |

## Verify feature (manual)

1. Open http://localhost:3000 — register with password ≥8 chars
2. Confirm default categories exist
3. Quick Add: log `Coding 1h` — appears on dashboard
4. Analytics: switch This week / Last week
5. Reflection: save mood + productivity — reload persists
6. Log out — `/` redirects to login
7. **Privacy (SC-004)**: With two accounts, confirm categories, entries, analytics, and reflections never leak across users (see tasks T037, T041, T054, T077, T090)
8. **Session expired**: Clear cookie or wait for expiry, submit a form — expect redirect to login with a clear message, not a false success toast (T019)

## Key paths

| Area | Path |
|------|------|
| Spec | `specs/001-core-web-mvp/spec.md` |
| Plan | `specs/001-core-web-mvp/plan.md` |
| Data model | `specs/001-core-web-mvp/data-model.md` |
| API contract | `specs/001-core-web-mvp/contracts/openapi.yaml` |
| Phase implementation detail | `phases/phase-1-core-web-app.md` |
| Constitution | `CONSTITUTION.md` |

## Implementation order (4 days)

See `plan.md` → **Implementation Phases** section.
