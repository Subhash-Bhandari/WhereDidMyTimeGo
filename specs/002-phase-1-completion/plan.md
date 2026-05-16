# Implementation Plan: Phase 1 Completion — Dashboard, Categories & Polish

**Branch**: `002-phase-1-completion` | **Date**: 2026-05-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-phase-1-completion/spec.md`

## Summary

Close the remaining **Phase 1 product gaps** on top of the shipped MVP (`001-core-web-mvp`): wire the **category donut** and **today's productivity** on the dashboard, add a **categories/settings UI** for existing CRUD APIs, and deliver **FR-020 polish** (skeletons, toasts, empty states, consistent interactive states). **No new database tables or API routes** — frontend-heavy with minor store/composable updates.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 20+  
**Primary Dependencies**: Nuxt 3, Hono, Drizzle ORM, PostgreSQL, Pinia, Tailwind, shadcn-vue, Zod, Day.js, echarts, vue-echarts (all already in monorepo)  
**Storage**: PostgreSQL (`packages/db`) — **no schema changes** for this feature  
**Testing**: Manual acceptance per [quickstart.md](./quickstart.md) + Phase 1 checklist in `phases/phase-1-core-web-app.md`; privacy regression (two accounts)  
**Target Platform**: Web browsers (desktop + mobile viewport ≥375px)  
**Project Type**: Monorepo web application (`frontend/` + `backend/` + `packages/*`)  
**Performance Goals**: Reuse 001 targets; dashboard refresh remains <500ms p95 on local dataset  
**Constraints**: Online-only; session auth; UTC in DB; category APIs already implemented  
**Scale/Scope**: ~1 new page (`/settings` or `/categories`), ~6 new Vue components, shadcn Toast/Skeleton additions, README update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — **PASS**.*

| Principle | Compliance |
|-----------|------------|
| Monorepo frontend/backend split | ✅ UI in `frontend/` only |
| APIs in backend only | ✅ No new routes; uses existing `categories`, `reflections`, `analytics` |
| Drizzle in `packages/db` | ✅ No migration required |
| Zod at boundaries | ✅ Existing shared schemas; inline form validation mirrors Zod limits |
| UTC timestamps | ✅ Unchanged |
| Mobile-first polished UI | ✅ Primary goal of this feature |
| Manual tracking only | ✅ Unchanged |
| No Go services | ✅ Unchanged |
| Incremental testable slices | ✅ Four implementation phases below |

**Violations**: None. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/002-phase-1-completion/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1 (delta vs 001)
├── quickstart.md        # Phase 1
├── contracts/
│   └── README.md        # No API changes; UI + store contracts
└── tasks.md             # Phase 2 (/speckit-tasks — not created by /speckit-plan)
```

### Source Code (repository root)

```text
WhereDidMyTimeGo/
├── frontend/
│   ├── pages/
│   │   ├── index.vue              # Wire CategoryDonut + productivity prop
│   │   ├── settings.vue           # NEW — category management
│   │   ├── add.vue, analytics.vue, reflection.vue  # Polish + toasts
│   ├── layouts/default.vue        # Link to settings (header; optional mobile menu)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CategoryDonut.vue  # NEW — vue-echarts donut, today/week toggle
│   │   │   └── TodaySummaryCard.vue  # productivity already supported
│   │   ├── categories/
│   │   │   ├── CategoryForm.vue   # NEW
│   │   │   └── CategoryList.vue   # NEW
│   │   └── ui/
│   │       ├── Toast.vue / useToast  # NEW (shadcn-vue)
│   │       └── Skeleton.vue          # NEW (shadcn-vue)
│   ├── composables/
│   │   ├── useApi.ts              # Optional toast on error (non-401)
│   │   └── useToast.ts            # NEW
│   └── stores/
│       ├── categories.ts          # add create/update/delete
│       └── dashboard.ts           # fetch reflection productivity for today
├── backend/                       # No changes required (verify routes only)
├── packages/shared/               # Schemas already have max lengths
└── README.md                      # Update API section (T092)
```

**Structure Decision**: Web monorepo (unchanged). This feature extends `frontend/` only except documentation.

## Implementation Phases

Aligned with [spec.md](./spec.md) user stories.

### Phase A — Dashboard completeness (US1)

- [ ] Add `CategoryDonut.vue` (client-only ECharts donut; props: `items`, `period` toggle emit)
- [ ] Mount donut on `index.vue` using `dashboard.categoryBreakdown` (already fetched); add today/this-week toggle re-fetching `/api/analytics/categories` with `from`/`to` for today vs current Mon–Sun week
- [ ] Extend `dashboard.refresh()` to `GET /api/reflections/today?timezone=` and expose `productivityScore`
- [ ] Pass `productivityScore` to `TodaySummaryCard`; placeholder copy when null + link to `/reflection`
- [ ] Empty state when no category data (uncategorized-only or zero minutes)

### Phase B — Category management (US2, US4)

- [ ] Extend `stores/categories.ts`: `createCategory`, `updateCategory`, `deleteCategory` calling existing REST routes
- [ ] `CategoryForm.vue` — name, color preset grid, icon preset list (lucide names matching seed)
- [ ] `CategoryList.vue` — list with edit/delete confirm
- [ ] `pages/settings.vue` — compose form + list; auth middleware
- [ ] `layouts/default.vue` — "Categories" or "Settings" link in desktop header; mobile: overflow menu or link in header bar (not fifth tab)

### Phase C — UX polish (US3)

- [ ] Add shadcn-vue **Toast** and **Skeleton** to `frontend/components/ui/`
- [ ] `composables/useToast.ts` — success/error helpers
- [ ] Replace "Loading…" on dashboard/analytics with card/chart skeletons
- [ ] Empty states with CTA on analytics (no rows), reflection (optional), dashboard (existing entry empty — enhance if needed)
- [ ] Success toasts on: save reflection, save category, log time (optional — navigate home may skip)
- [ ] Audit Button/Input focus-visible classes in `components/ui/`

### Phase D — Acceptance & docs

- [ ] Run manual checklist in [quickstart.md](./quickstart.md)
- [ ] Two-account privacy spot-check (categories PATCH/DELETE by foreign id)
- [ ] Update root `README.md` API routes to match `001` OpenAPI

## Complexity Tracking

> Not applicable — no constitution violations.

## Generated Artifacts

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/README.md](./contracts/README.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Next Command

Run **`/speckit-tasks`** to break this plan into actionable tasks, then **`/speckit-implement`** to execute.
