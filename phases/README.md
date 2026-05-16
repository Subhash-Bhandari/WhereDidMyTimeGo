# Build Phases — WhereDidMyTimeGo

This folder is the **source of truth for Spec Kit prompts** (`/speckit-specify`, `/speckit-implement`, etc.). Each phase file is a self-contained implementation spec.

## How to use with Spec Kit (Cursor)

1. Run `/speckit-constitution` once (uses `.specify/memory/constitution.md`, aligned with root `CONSTITUTION.md`).
2. Pick the phase you are implementing (complete phases in order unless noted).
3. Run `/speckit-specify` with context from the phase file, e.g.:
   - *"Implement Phase 1 per `phases/phase-1-core-web-app.md`. Follow CONSTITUTION.md."*
4. Continue: `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`
5. Do not skip **Prerequisites** or **Definition of Done** sections in the phase file.

**Global CLI:** `specify` is installed via `uv tool install` (see root `README.md`).

## Roadmap order

| Phase | File | Outcome |
|-------|------|---------|
| 1 | `phase-1-core-web-app.md` | Manual tracking MVP: auth, CRUD, dashboard, analytics baseline, reflection |
| 2 | `phase-2-ux-enhancements.md` | Faster logging, insights, charts, streaks, polish |
| 3 | `phase-3-pwa.md` | Installable PWA + offline logging + sync |
| 4 | `phase-4-capacitor-mobile.md` | Android/iOS shells + native integrations |

## Monorepo context (all phases)

```
WhereDidMyTimeGo/
├── frontend/          # Nuxt 3 — pages, components, Pinia, PWA (Phase 3+)
├── backend/           # Hono API — all HTTP routes
├── packages/
│   ├── db/            # Drizzle schema, migrations, db client
│   └── shared/        # Shared TypeScript types + Zod schemas (expand as needed)
├── phases/            # This folder
└── CONSTITUTION.md
```

**Stack:** Nuxt 3, Tailwind, shadcn-vue, Pinia, Hono, PostgreSQL, Drizzle, Zod, Day.js, vue-echarts.

**Dev commands (root):**

```bash
npm install
npm run dev          # frontend :3000 + backend :3001
npm run db:generate
npm run db:migrate
```

## Cross-phase rules

- **Time:** Store all timestamps in **UTC** in Postgres; convert to local time only in the UI (Day.js + user timezone).
- **Auth:** Every query must filter by `user_id` — no cross-user data leaks.
- **API:** Zod validate all writes; consistent error shape `{ error: string, details?: unknown }`.
- **UI:** Mobile-first; min tap target 44px; bottom navigation on mobile from Phase 1.
- **UI quality:** The interface must be **highly interactive** and **visually polished** — not a bare admin panel. Use shadcn-vue components, smooth transitions, clear hierarchy, and intentional spacing. Every screen should feel modern, responsive, and delightful to use (see each phase’s **UI & visual design** section).
- **Tracking model:** Manual logging only until a future phase explicitly adds automation.

## Current baseline (before Phase 1 work)

Already scaffolded:

- Monorepo workspaces (`frontend`, `backend`, `packages/db`, `packages/shared`)
- Drizzle schema: `users`, `categories`, `time_entries`, `daily_reflections`
- Backend: `GET /api/health`, `POST /api/time-entries`
- Frontend placeholder pages: `/`, `/add`, `/analytics`, `/reflection`
- PWA module registered in Nuxt (not fully configured until Phase 3)

Phase 1 **implements** the real product on top of this scaffold.

## Definition of done (all phases)

- [ ] Feature works end-to-end in browser (and device, if phase requires it)
- [ ] API contracts documented in phase file are implemented and match Zod schemas
- [ ] DB changes have Drizzle migrations in `packages/db/migrations`
- [ ] No hardcoded `userId` in production paths (auth/session drives identity)
- [ ] Responsive layout verified at 375px width (iPhone SE)
- [ ] UI is interactive and visually polished (hover/focus states, loading feedback, cohesive theme — not placeholder styling)
- [ ] Errors are user-visible (toast or inline), not silent failures
- [ ] Phase **Non-Goals** were not expanded into scope creep

## Phase dependencies

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
   │            │            │
   └────────────┴────────────┴── requires auth + time_entries API from Phase 1
```

- **Phase 2** requires Phase 1 CRUD, dashboard data, and reflection storage.
- **Phase 3** requires Phase 1 API + stable entry create flow; benefits from Phase 2 quick-add UX.
- **Phase 4** requires Phase 3 mobile UX patterns; wraps same frontend codebase.
