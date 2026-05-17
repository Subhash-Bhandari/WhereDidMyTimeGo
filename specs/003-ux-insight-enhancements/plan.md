# Implementation Plan: UX and Insight Enhancements (Phase 2)

**Branch**: `003-ux-insight-enhancements` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-ux-insight-enhancements/spec.md`

## Summary

Deliver **Phase 2** on the existing monorepo: **rule-based natural language logging** with live preview, **entry templates**, **keyboard shortcuts**, a dedicated **`/api/analytics/insights`** endpoint (weekly time leaks + range-aware best hours + productivity correlation), **analytics date range picker**, **reflection streaks**, and a **polish pass** (insight cards, skeletons, onboarding). Two new tables: `category_keywords`, `entry_templates`. Reuse and extend existing `timeLeaks` / `bestHours` services; move parser to **`packages/shared`**.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 20+  
**Primary Dependencies**: Nuxt 3, Hono, Drizzle ORM, PostgreSQL, Pinia, Tailwind, shadcn-vue, Zod, Day.js, ECharts, vue-echarts, lucide-vue-next  
**Storage**: PostgreSQL (`packages/db`) — **2 new tables**, migrations required  
**Testing**: Manual [quickstart.md](./quickstart.md); recommended Vitest for shared parser; two-account privacy on new routes  
**Target Platform**: Web browsers (375px+ mobile-first)  
**Project Type**: Monorepo (`frontend/` + `backend/` + `packages/db` + `packages/shared`)  
**Performance Goals**: Parse preview debounced ~300ms; insights API <1s p95 on local seed data; no regression on summary endpoint  
**Constraints**: Rule-based parse only; session auth; UTC in DB; time leaks **always** calendar week per clarifications  
**Scale/Scope**: ~6 new API routes, ~12 new Vue components/composables, 4 analytics services, 1 migration

## Constitution Check

*GATE: Passed before Phase 0. Re-checked after Phase 1 design — **PASS**.*

| Principle | Compliance |
|-----------|------------|
| Monorepo frontend/backend split | ✅ UI in `frontend/`; HTTP in `backend/` |
| APIs in backend only | ✅ New routes in `backend/src/routes/` |
| Drizzle in `packages/db` | ✅ New tables + migration |
| Zod at boundaries | ✅ `packages/shared` schemas for new endpoints |
| UTC storage, local presentation | ✅ Insights use timezone query + local date bounds |
| Mobile-first polished UI | ✅ Phase F polish; shadcn + motion |
| Keyboard-first / fast logging | ✅ Core Phase 2 goal |
| Insights required | ✅ Dedicated insights endpoint + cards |
| No Go / no auto-tracking / no AI | ✅ Spec out of scope |
| Incremental testable slices | ✅ Phases A–F below |

**Violations**: None. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/003-ux-insight-enhancements/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── README.md
│   └── openapi-phase-2.yaml
└── tasks.md             # Phase 2 (/speckit-tasks — not created by /speckit-plan)
```

### Source Code (repository root)

```text
WhereDidMyTimeGo/
├── packages/
│   ├── db/src/
│   │   └── schema.ts                    # + category_keywords, entry_templates
│   └── shared/src/
│       ├── parseEntry.ts                # NEW — extended parser + confidence
│       └── schemas/
│           ├── templates.ts             # NEW
│           ├── analytics.ts             # EXTEND — insights response
│           └── reflection.ts            # EXTEND — streak response
├── backend/src/
│   ├── routes/
│   │   ├── parse-entry.ts               # NEW
│   │   ├── templates.ts                 # NEW
│   │   ├── analytics-insights.ts        # NEW (or extend analytics.ts)
│   │   └── reflections.ts               # EXTEND — GET /streak
│   ├── services/
│   │   ├── categoryKeywordSeed.ts       # NEW — called from register
│   │   ├── parseEntryService.ts         # NEW — load keywords, call shared parse
│   │   ├── templates.ts                 # NEW
│   │   ├── reflections/streak.ts        # NEW
│   │   └── analytics/
│   │       ├── timeLeaks.ts             # EXTEND — 30 min gate, top 3
│   │       ├── bestHours.ts             # EXTEND — from/to, 3 blocks, category filter
│   │       └── correlations.ts          # NEW
│   └── index.ts                         # Mount new routes
├── frontend/
│   ├── composables/
│   │   ├── useKeyboardShortcuts.ts      # NEW
│   │   ├── useAnalyticsRange.ts         # NEW
│   │   └── useToast.ts                  # EXISTS — reuse
│   ├── components/
│   │   ├── add/
│   │   │   ├── QuickParseInput.vue      # NEW
│   │   │   ├── ParsePreview.vue         # NEW
│   │   │   └── TemplateChips.vue        # NEW
│   │   ├── analytics/
│   │   │   ├── DateRangePicker.vue      # NEW
│   │   │   ├── InsightCard.vue          # NEW
│   │   │   ├── TimeLeakCard.vue         # NEW
│   │   │   └── BestHoursCard.vue        # NEW
│   │   ├── reflection/
│   │   │   ├── StreakBadge.vue          # NEW
│   │   │   └── ReflectionCalendar.vue   # NEW (30-day dots)
│   │   └── common/
│   │       └── KeyboardShortcutsModal.vue # NEW
│   ├── pages/
│   │   ├── add.vue                      # Wire parse, templates, shortcuts
│   │   ├── analytics.vue                # Date picker + insight cards
│   │   ├── index.vue                    # Streak badge
│   │   └── reflection.vue               # Calendar + streak
│   └── layouts/default.vue              # Global shortcuts a/d/?
└── phases/phase-2-ux-enhancements.md    # Acceptance reference
```

**Structure Decision**: Web monorepo (unchanged). Backend + DB + shared for new domain logic; frontend-heavy for UX.

## Implementation Phases

Aligned with [spec.md](./spec.md) priorities and `phases/phase-2-ux-enhancements.md` order.

### Phase A — Parser + parse API + Quick Add preview (US1, P1)

- [ ] Add `category_keywords` + migration; `seedCategoryKeywords` on register (+ optional backfill script)
- [ ] Implement `packages/shared/src/parseEntry.ts` (pipeline R1–R2 in [research.md](./research.md))
- [ ] `POST /api/parse-entry` + `parseEntryService` (load keywords for user)
- [ ] Zod schemas + types: `ParseEntryResult`, confidence enum
- [ ] `QuickParseInput.vue` + `ParsePreview.vue` on `/add` (debounced client parse; optional server refresh on blur)
- [ ] Wire overrides into existing time entry form; `localStorage` `quick_add_confirm_always`
- [ ] Remove duplicate `frontend/utils/parseQuickEntry.ts` → import from shared
- [ ] Vitest: canonical parse examples (recommended)

### Phase B — Entry templates (US2, P2)

- [ ] `entry_templates` table + migration
- [ ] `GET/POST/DELETE /api/templates` + Zod + user scoping
- [ ] `TemplateChips.vue` + “Save as template” on `/add`
- [ ] Handle deleted category on apply (empty category)

### Phase C — Keyboard shortcuts (US3, P2)

- [ ] `useKeyboardShortcuts.ts` with input-focus guard
- [ ] Quick Add: `/`, `f`, `1-5`, `Esc`, Cmd/Ctrl+Enter, Cmd/Ctrl+Shift+Enter
- [ ] `default.vue`: global `a`, `d`, `?` → `KeyboardShortcutsModal.vue`
- [ ] Document keys in modal copy

### Phase D — Analytics insights + date range (US4–US5, P2)

- [ ] `GET /api/analytics/insights` aggregating:
  - `timeLeaks` — week-based (unchanged semantics per clarification)
  - `bestHours` — `from`/`to`, optional `categoryId`, top 3
  - `correlations` — productivity vs coding minutes threshold
- [ ] Fix `computeTimeLeaks`: ≥30 min candidate, ≥60 emit, top 3, >20% growth
- [ ] `DateRangePicker.vue` + `useAnalyticsRange` + localStorage persist
- [ ] Refactor `analytics.vue`: fetch insights + category breakdown with same range; subtitle on leak cards (“This week vs last week”)
- [ ] `InsightCard`, `TimeLeakCard`, `BestHoursCard`, correlation card component

### Phase E — Reflection streak (US6, P3)

- [ ] `GET /api/reflections/streak?timezone`
- [ ] `StreakBadge.vue` on dashboard
- [ ] `ReflectionCalendar.vue` on reflection page (30 local days)
- [ ] Clarified behavior: gap → current 0, longest preserved

### Phase F — Product polish (US7, P3)

- [ ] Skeletons on analytics insight section (extend existing patterns)
- [ ] Distinct insight card styling (accent border/gradient)
- [ ] Empty states + retry on failed insights fetch
- [ ] Onboarding tour (3 steps, `onboarding_done`)
- [ ] Micro-interactions: parse preview fade-in, chip select, streak pulse (subtle)
- [ ] Mobile nav active state audit (safe-area)

### Phase G — Nice-to-have (after A–F)

- [ ] Evening reflection nudge (8 PM local, dismissible per day) — **not blocking**

### Phase H — Acceptance

- [ ] Run [quickstart.md](./quickstart.md)
- [ ] Phase 2 acceptance checklist in `phases/phase-2-ux-enhancements.md`
- [ ] Phase 1 regression (SC-008)
- [ ] Merge `contracts/openapi-phase-2.yaml` paths into root API docs / 001 openapi when convenient

## Complexity Tracking

> Not applicable — no constitution violations.

## Generated Artifacts

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/README.md](./contracts/README.md), [contracts/openapi-phase-2.yaml](./contracts/openapi-phase-2.yaml) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Next Command

Run **`/speckit-tasks`** to generate `tasks.md`, then **`/speckit-implement`** to execute.
