# WhereDidMyTimeGo

A monorepo time-tracking app: Nuxt frontend, Hono API backend, PostgreSQL via Drizzle.

## Monorepo Layout

```
WhereDidMyTimeGo/
├── frontend/          # Nuxt 3 app (UI, pages, PWA)
├── backend/           # Hono API server
├── packages/
│   ├── db/            # Drizzle schema, client, migrations
│   └── shared/        # Shared TypeScript types
├── phases/            # Build roadmap by phase
└── CONSTITUTION.md    # Architecture and product rules
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Nuxt 3, Tailwind, shadcn-vue, Pinia, ECharts |
| Backend | Hono, Zod |
| Database | PostgreSQL, Drizzle ORM |
| Future | PWA (`@vite-pwa/nuxt`), Capacitor |

## Getting Started

1. Install dependencies (from repo root):

```bash
npm install
```

2. Environment files:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

3. Set `DATABASE_URL` in root `.env`, then run migrations:

```bash
npm run db:generate
npm run db:migrate
```

4. Start frontend + backend together:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

Or run separately:

```bash
npm run dev:web
npm run dev:api
```

## API Routes (backend)

Auth (session cookie):

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`

Categories:

- `GET /api/categories`, `POST /api/categories`, `PATCH /api/categories/{id}`, `DELETE /api/categories/{id}`

Time entries:

- `GET /api/time-entries/today`, `POST /api/time-entries`, `PATCH /api/time-entries/{id}`, `DELETE /api/time-entries/{id}`

Analytics (`timezone` query param required):

- `GET /api/analytics/summary`, `GET /api/analytics/weekly`, `GET /api/analytics/categories`

Reflections:

- `GET /api/reflections/today`, `PUT /api/reflections/today`

Other:

- `GET /api/health`

Full contract: `specs/001-core-web-mvp/contracts/openapi.yaml`

During development, the frontend proxies `/api/*` to the backend.

## Roadmap

See `phases/README.md`.

## Spec Kit (global CLI + Cursor)

[GitHub Spec Kit](https://github.com/github/spec-kit) is installed **globally** and initialized in this repo for Cursor.

### Install globally (one-time, any machine)

Requires [uv](https://docs.astral.sh/uv/):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify version
```

Ensure `~/.local/bin` is on your `PATH` (add to `~/.bashrc`):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Cursor workflow in this project

Skills live in `.cursor/skills/`. Typical flow:

1. `/speckit-constitution` — project principles (synced from `CONSTITUTION.md`)
2. `/speckit-specify` — create spec (use `phases/phase-1-core-web-app.md` as input)
3. `/speckit-plan` — implementation plan
4. `/speckit-tasks` — task breakdown
5. `/speckit-implement` — execute

Optional: `/speckit-clarify`, `/speckit-checklist`, `/speckit-analyze`

Phase specs for `/speckit-specify` prompts: **`phases/`** (see `phases/README.md`).
