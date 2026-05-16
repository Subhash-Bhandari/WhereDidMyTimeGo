# Implementation Plan: Core Web App — Manual Time Tracking MVP

**Branch**: `001-core-web-mvp` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-core-web-mvp/spec.md` (clarified 2026-05-15)

## Summary

Deliver a **manual time-tracking MVP**: users register/login, log time with quick entry, view dashboard (today + Mon–Sun week chart), browse analytics (time leaks, best hours), and save daily reflections. Built in the existing **monorepo** — Nuxt 3 frontend, Hono backend, Drizzle/PostgreSQL — with **polished, mobile-first UI** (shadcn-vue, ECharts).

Technical approach: session-cookie auth, UTC storage with local TZ for boundaries, analytics computed in Hono services, no offline/PWA scope in this feature.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 20+  
**Primary Dependencies**: Nuxt 3, Hono, Drizzle ORM, PostgreSQL, Pinia, Tailwind, shadcn-vue, Zod, Day.js, echarts, vue-echarts  
**Storage**: PostgreSQL (`packages/db`)  
**Testing**: Manual acceptance (spec + phase checklist); optional unit tests for parser/utils post-MVP  
**Target Platform**: Web browsers (desktop + mobile viewport ≥375px)  
**Project Type**: Monorepo web application (`frontend/` + `backend/` + `packages/*`)  
**Performance Goals**: Dashboard/analytics API <500ms p95 on local dev dataset (<10k entries/user)  
**Constraints**: Online-only; manual entry; auth required for all user data; UTC in DB  
**Scale/Scope**: Single-user personal tracker; ~5 pages; ~20 API routes; 4-day build target

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — **PASS**.*

| Principle | Compliance |
|-----------|------------|
| Monorepo frontend/backend split | ✅ `frontend/` + `backend/` |
| APIs in backend only | ✅ Hono routes; no Nuxt `server/api` for features |
| Drizzle in `packages/db` | ✅ Schema + migrations |
| Zod at boundaries | ✅ Planned in `packages/shared` + route handlers |
| UTC timestamps | ✅ `timestamptz`; TZ query param for analytics |
| Mobile-first polished UI | ✅ shadcn-vue, bottom nav, FR-020 |
| Manual tracking only | ✅ FR-022 |
| No Go services | ✅ Analytics in Hono services |
| Incremental testable slices | ✅ 4-day implementation phases below |

**Violations**: None. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-web-mvp/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── openapi.yaml
│   └── README.md
└── tasks.md             # Phase 2 (/speckit-tasks — 92 tasks)
```

### Source Code (repository root)

```text
WhereDidMyTimeGo/
├── frontend/                 # Nuxt 3
│   ├── pages/                # /, /add, /analytics, /reflection, /login
│   ├── layouts/default.vue
│   ├── components/
│   │   ├── ui/               # shadcn-vue
│   │   ├── dashboard/
│   │   ├── entries/
│   │   └── reflection/
│   ├── composables/          # useApi, useAuth
│   └── stores/               # auth, categories, dashboard
├── backend/                  # Hono
│   └── src/
│       ├── index.ts
│       ├── middleware/auth.ts
│       ├── routes/
│       └── services/
├── packages/
│   ├── db/src/schema.ts
│   └── shared/src/schemas/
├── phases/phase-1-core-web-app.md
└── CONSTITUTION.md
```

**Structure Decision**: Web monorepo (Option 2). Existing scaffold retained; Phase 1 fills routes, services, and UI components per `phases/phase-1-core-web-app.md`.

## Implementation Phases

Aligned with `phases/phase-1-core-web-app.md` and clarified spec.

### Phase A — Foundation (Day 1)

- [ ] DB migration: `password_hash`, `sessions`, `reflection_date`, indexes
- [ ] Zod schemas in `packages/shared`
- [ ] Auth routes: register, login, logout, me + bcrypt + session cookie middleware
- [ ] `GET /api/categories` (Foundational) + seed defaults on register; POST/PATCH/DELETE in US6
- [ ] `backend/src/lib/validate.ts` + shared Zod on all route boundaries
- [ ] Backend deps: `bcrypt`, `@types/bcrypt`, `dayjs` (+ utc/timezone plugins)
- [ ] `useApi`, `useAuth`, Pinia `auth` store, route middleware
- [ ] Login/register pages
- [ ] shadcn-vue: Button, Card, Input, Toast, Skeleton

### Phase B — Time entries (Day 2)

- [ ] Time entries CRUD API (auth-scoped; remove `userId` from body)
- [ ] `parseQuickEntry` util + confirm UI on Quick Add
- [ ] Quick Add page (chips, category select, Cmd+Enter)
- [ ] Time-entry SC-004 isolation check after routes mount

### Phase C — Dashboard + analytics (Day 3)

- [ ] Analytics services: weekly, category breakdown, summary (includes `timeLeaks` + `bestHours` on `GET /api/analytics/summary`)
- [ ] Analytics API routes under `backend/src/routes/analytics.ts` + `timezone` query param
- [ ] ECharts: weekly bar + category donut on dashboard
- [ ] Analytics page (period toggle, leak card, best hours)
- [ ] Dashboard summary cards + empty states

### Phase D — Reflection + polish (Day 4)

- [ ] Reflection upsert API + page (mood 5-level, productivity slider)
- [ ] Mobile bottom tab bar; 48px tap targets
- [ ] Entry edit/delete from dashboard list (US3); Quick Add only in US2
- [ ] Loading skeletons, error toasts, hover/focus states
- [ ] Manual test checklist (spec + phase doc)

## Complexity Tracking

> Not applicable — no constitution violations.

## Generated Artifacts

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| API contracts | [contracts/openapi.yaml](./contracts/openapi.yaml) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Next Command

Run **`/speckit-tasks`** to break this plan into actionable tasks, then **`/speckit-implement`** to execute.
