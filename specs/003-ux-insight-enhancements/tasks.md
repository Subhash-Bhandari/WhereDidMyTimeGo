# Tasks: UX and Insight Enhancements (Phase 2)

**Input**: Design documents from `/specs/003-ux-insight-enhancements/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Optional Vitest for shared parser (recommended in research.md); manual acceptance per quickstart.md

**Organization**: Tasks grouped by user story (US1–US7). MVP = Phase 1–3 (US1 only).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US7 maps to spec.md user stories

## Path Conventions

- **Frontend**: `frontend/`
- **Backend**: `backend/src/`
- **DB**: `packages/db/src/`
- **Shared**: `packages/shared/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline and branch for Phase 2 work

- [x] T001 Verify `npm run dev` runs frontend (:3000) and backend (:3001); Phase 1 flows work per `specs/001-core-web-mvp/quickstart.md`
- [x] T002 Create git branch `003-ux-insight-enhancements` from latest main (or continue on feature branch)
- [x] T003 [P] Add Vitest to `packages/shared/package.json` and config for unit-testing `parseEntry.ts` (recommended, non-blocking)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and route wiring patterns before user stories

**⚠️ CRITICAL**: Complete before story implementation that depends on shared contracts

- [x] T004 [P] Add `parseEntrySchema`, `parseEntryResultSchema`, and `ParseConfidence` enum in `packages/shared/src/schemas/parseEntry.ts`
- [x] T005 [P] Add `entryTemplateSchema`, `entryTemplateCreateSchema` in `packages/shared/src/schemas/templates.ts`
- [x] T006 [P] Extend `packages/shared/src/schemas/analytics.ts` with `bestHourInsightSchema`, `correlationInsightSchema`, `analyticsInsightsSchema` (max 3 leaks/hours)
- [x] T007 [P] Add `reflectionStreakSchema` in `packages/shared/src/schemas/reflection.ts`
- [x] T008 Export new schemas from `packages/shared/src/index.ts`

**Checkpoint**: Shared Zod contracts ready for backend routes and frontend types

---

## Phase 3: User Story 1 — Natural language logging (Priority: P1) 🎯 MVP

**Goal**: Type shorthand on Quick Add; live preview of title, duration, suggested category; override before save (FR-001–FR-006)

**Independent Test**: Enter `food donation app 2h` → preview shows 120 min + Coding suggestion; override category; save → dashboard shows entry (quickstart US1)

### Implementation for User Story 1

- [x] T009 [US1] Add `category_keywords` table and unique `(user_id, keyword)` index in `packages/db/src/schema.ts`
- [x] T010 [US1] Run `npm run db:generate` and `npm run db:migrate` for `category_keywords`
- [x] T011 [P] [US1] Create `backend/src/services/categoryKeywordSeed.ts` mapping keywords to default category names per `data-model.md`
- [x] T012 [US1] Call `seedCategoryKeywords(userId)` from `backend/src/services/auth.ts` after `seedDefaultCategories` on register
- [x] T013 [P] [US1] Implement `packages/shared/src/parseEntry.ts` — normalize, first duration match, title cleanup, keyword→categoryId inference, confidence levels per `research.md` R1–R2
- [x] T014 [US1] Create `backend/src/services/parseEntryService.ts` — load user keywords from DB, invoke shared `parseQuickEntry`
- [x] T015 [US1] Create `backend/src/routes/parse-entry.ts` with `POST /api/parse-entry` (auth, Zod body, user-scoped)
- [x] T016 [US1] Mount parse route in `backend/src/index.ts` as `app.route('/api', parseEntryRoutes)` or `/api/parse-entry` per existing pattern
- [x] T017 [P] [US1] Create `frontend/components/add/ParsePreview.vue` — shows title, minutes, category name, confidence badge
- [x] T018 [P] [US1] Create `frontend/components/add/QuickParseInput.vue` — debounced input, calls shared parse locally and optional `POST /api/parse-entry` on blur
- [x] T019 [US1] Refactor `frontend/pages/add.vue` — wire QuickParseInput + ParsePreview; apply suggestions to time entry form; remove `frontend/utils/parseQuickEntry.ts` in favor of `@wheredidmytimego/shared`
- [x] T020 [US1] Add `quick_add_confirm_always` toggle and confirm step in `frontend/pages/add.vue` when localStorage flag set (FR-006)
- [x] T021 [P] [US1] Add Vitest tests for canonical phrases in `packages/shared/src/parseEntry.test.ts` (SC-001 examples)
- [x] T022 [US1] Optional dev script or SQL note in `specs/003-ux-insight-enhancements/quickstart.md` to backfill keywords for existing users

**Checkpoint**: Parse preview end-to-end on `/add` without templates or shortcuts

---

## Phase 4: User Story 2 — Entry templates (Priority: P2)

**Goal**: Save and one-tap apply reusable logging presets (FR-007–FR-008)

**Independent Test**: Create template "DSA practice"; tap chip → form filled; save entry (quickstart US2)

### Implementation for User Story 2

- [x] T023 [US2] Add `entry_templates` table in `packages/db/src/schema.ts` per `data-model.md`
- [x] T024 [US2] Run `npm run db:generate` and `npm run db:migrate` for `entry_templates`
- [x] T025 [US2] Create `backend/src/services/templates.ts` — list/create/delete scoped by `userId`
- [x] T026 [US2] Create `backend/src/routes/templates.ts` with `GET/POST /api/templates` and `DELETE /api/templates/:id`
- [x] T027 [US2] Mount templates routes in `backend/src/index.ts`
- [x] T028 [P] [US2] Create `frontend/components/add/TemplateChips.vue` — horizontal scroll, tap to fill form, long-press/delete with confirm
- [x] T029 [US2] Add "Save as template" action on `frontend/pages/add.vue` posting to `POST /api/templates`
- [x] T030 [US2] Handle null `categoryId` when template category was deleted — empty category picker on apply

**Checkpoint**: Templates CRUD and chips work independently of analytics/streaks

---

## Phase 5: User Story 3 — Keyboard shortcuts (Priority: P2)

**Goal**: Log and navigate without mouse; documented help modal (FR-009–FR-011)

**Independent Test**: From Quick Add, `/` focus, `1` select category, Cmd/Ctrl+Enter save, `?` opens help (quickstart US3)

### Implementation for User Story 3

- [x] T031 [P] [US3] Create `frontend/composables/useKeyboardShortcuts.ts` — register/cleanup; skip when focus in input/textarea/contenteditable
- [x] T032 [P] [US3] Create `frontend/components/common/KeyboardShortcutsModal.vue` — lists global and Quick Add bindings
- [x] T033 [US3] Wire Quick Add shortcuts in `frontend/pages/add.vue` — `/`, `f`, `1-5`, `Esc`, Cmd/Ctrl+Enter, Cmd/Ctrl+Shift+Enter; remove duplicate raw `window` listener if superseded
- [x] T034 [US3] Wire global shortcuts in `frontend/layouts/default.vue` — `a` → `/add`, `d` → `/`, `?` → open modal
- [x] T035 [US3] Ensure global `a`/`d` do not fire while typing in Quick Add shorthand field

**Checkpoint**: Shortcuts work; help modal accurate

---

## Phase 6: User Story 4 — Actionable insights (Priority: P2)

**Goal**: Analytics shows time-leak, best-hours, and productivity–coding correlation cards (FR-012–FR-014)

**Independent Test**: With seeded data, analytics shows leak card (week basis), best-hours for range, correlation when thresholds met (quickstart US4)

### Implementation for User Story 4

- [x] T036 [US4] Update `backend/src/services/analytics/timeLeaks.ts` — ≥30 min candidate filter, ≥60 min emit, >20% growth, sort desc, return top 3 (clarification + FR-012)
- [x] T037 [US4] Extend `backend/src/services/analytics/bestHours.ts` — accept `from`/`to` Date range and optional `categoryId`; return up to 3 blocks with `endHour`; tie-break latest hour first
- [x] T038 [US4] Create `backend/src/services/analytics/correlations.ts` — productivity score (1–10) vs daily Coding minutes ≥120 / <120; ≥5 days and ≥1.5 delta per spec assumptions
- [x] T039 [US4] Create `backend/src/routes/analytics-insights.ts` (or extend `backend/src/routes/analytics.ts`) with `GET /api/analytics/insights?timezone&from&to&categoryId?` — leaks always calendar week; bestHours/correlations use `from`/`to`
- [x] T040 [US4] Mount insights route in `backend/src/index.ts`
- [x] T041 [P] [US4] Create `frontend/components/analytics/InsightCard.vue` — base styled wrapper (accent border/gradient per FR-022)
- [x] T042 [P] [US4] Create `frontend/components/analytics/TimeLeakCard.vue` — plain-language copy; subtitle "This week vs last week"
- [x] T043 [P] [US4] Create `frontend/components/analytics/BestHoursCard.vue` — hour range copy from insight payload
- [x] T044 [P] [US4] Create `frontend/components/analytics/CorrelationCard.vue` — productivity correlation copy
- [x] T045 [US4] Fetch and render insight cards on `frontend/pages/analytics.vue` using default week range until US5 picker lands

**Checkpoint**: Insight cards render with test data; time leaks ignore custom range (subtitle explains)

---

## Phase 7: User Story 5 — Analytics date range (Priority: P2)

**Goal**: Presets + custom range; all charts and range-based insights stay in sync; persist selection (FR-015–FR-017)

**Independent Test**: Switch Last 30 days → charts and best-hours/correlation update; leaks still weekly; return visit restores range (quickstart US5)

### Implementation for User Story 5

- [x] T046 [P] [US5] Create `frontend/composables/useAnalyticsRange.ts` — presets (Today, This week, Last week, Last 30 days, Custom), compute local `from`/`to`, persist `analytics_date_range` in localStorage
- [x] T047 [US5] Create `frontend/components/analytics/DateRangePicker.vue` — preset chips + custom date inputs; validate end ≥ start
- [x] T048 [US5] Refactor `frontend/pages/analytics.vue` — single range drives `GET /api/analytics/categories` and `GET /api/analytics/insights`; refetch on change (SC-006)
- [x] T049 [US5] Empty state when custom range has no entries (no error toast)

**Checkpoint**: Date picker controls charts + best-hours + correlation; leaks labeled weekly

---

## Phase 8: User Story 6 — Reflection streaks (Priority: P3)

**Goal**: Dashboard streak badge; reflection calendar dots; current resets after gap (FR-018–FR-020)

**Independent Test**: 3 consecutive reflection days → badge 3; skip day → 0; longest preserved (quickstart US6)

### Implementation for User Story 6

- [x] T050 [US6] Create `backend/src/services/reflections/streak.ts` — `currentStreak`, `longestStreak`, `lastReflectionDate` from `daily_reflections` using local calendar dates
- [x] T051 [US6] Add `GET /api/reflections/streak` in `backend/src/routes/reflections.ts` with `timezone` query
- [x] T052 [P] [US6] Create `frontend/components/reflection/StreakBadge.vue` — flame icon + count for dashboard
- [x] T053 [P] [US6] Create `frontend/components/reflection/ReflectionCalendar.vue` — last 30 local days filled/empty markers
- [x] T054 [US6] Mount `StreakBadge` on `frontend/pages/index.vue` and calendar + streak detail on `frontend/pages/reflection.vue`

**Checkpoint**: Streak API and UI match clarified reset rules

---

## Phase 9: User Story 7 — Product polish (Priority: P3)

**Goal**: Skeletons, empty states, onboarding tour, micro-interactions, mobile nav polish (FR-021–FR-023)

**Independent Test**: Skeletons on analytics load; onboarding shows once; insight cards visually distinct (quickstart US7)

### Implementation for User Story 7

- [x] T055 [P] [US7] Add skeleton placeholders for insight card row on `frontend/pages/analytics.vue` while insights fetch
- [x] T056 [US7] Add empty states with CTA on analytics when no data for selected range; retry button on failed insights fetch
- [x] T057 [US7] Implement 3-step onboarding tour on first visit (`onboarding_done` in localStorage) targeting Quick Add, analytics, reflection — dismiss persists
- [x] T058 [P] [US7] Add subtle transitions — parse preview fade-in on `ParsePreview.vue`, chip select on `TemplateChips.vue`, streak badge pulse on increment
- [x] T059 [US7] Audit `frontend/layouts/default.vue` mobile bottom nav — active state, safe-area padding, lucide icons

**Checkpoint**: Phase 2 feels more polished than Phase 1 (SC-009 subjective check)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Acceptance, docs, optional nice-to-have, regression

- [x] T060 [P] Merge new paths from `specs/003-ux-insight-enhancements/contracts/openapi-phase-2.yaml` into `specs/001-core-web-mvp/contracts/openapi.yaml` (or document delta only in README)
- [x] T061 Run full manual checklist in `specs/003-ux-insight-enhancements/quickstart.md`
- [x] T062 Run acceptance criteria in `phases/phase-2-ux-enhancements.md`
- [x] T063 Phase 1 regression pass — auth, CRUD, dashboard, reflection upsert (SC-008)
- [x] T064 Two-account privacy check — `DELETE /api/templates/:id`, `POST /api/parse-entry` isolated per user
- [x] T065 [P] (Nice-to-have) Evening reflection nudge after 8 PM local on `frontend/layouts/default.vue` — dismissible per day; not required for sign-off

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **User Stories (Phases 3–9)** → **Polish (Phase 10)**
- Recommended story order: **US1 → US2 → US3 → US4 → US5 → US6 → US7**

### User Story Dependencies

| Story | Depends on | Can start after |
|-------|------------|-----------------|
| US1 | Foundational | Phase 2 |
| US2 | Foundational | Phase 2 (independent of US1 UI but benefits from `/add`) |
| US3 | US1 `/add` page exists | Phase 3 checkpoint |
| US4 | Foundational, existing analytics page | Phase 2 |
| US5 | US4 insights endpoint + cards | Phase 6 checkpoint |
| US6 | Auth + reflections (Phase 1) | Phase 2 |
| US7 | US1–US6 surfaces exist | Phase 9 after core stories |

### Parallel Opportunities

- **Phase 2**: T004–T007 all [P]
- **US1**: T011, T013, T017, T018, T021 in parallel after T009–T010
- **US2**: T028 parallel with T025–T027 after migration
- **US3**: T031, T032 parallel
- **US4**: T041–T044 parallel after T039–T040
- **US5**: T046 parallel before T048
- **US6**: T052, T053 parallel after T050–T051
- **US7**: T055, T058 parallel

### Parallel Example: User Story 1

```bash
# After T010 migration:
Task T011: backend/src/services/categoryKeywordSeed.ts
Task T013: packages/shared/src/parseEntry.ts
Task T017: frontend/components/add/ParsePreview.vue
Task T018: frontend/components/add/QuickParseInput.vue
```

### Parallel Example: User Story 4

```bash
# After T040 route mounted:
Task T041: InsightCard.vue
Task T042: TimeLeakCard.vue
Task T043: BestHoursCard.vue
Task T044: CorrelationCard.vue
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1–2
2. Complete Phase 3 (US1)
3. **STOP and VALIDATE** — quickstart US1 + parse examples
4. Demo one-step logging

### Incremental Delivery

1. US1 → US2 → US3 (logging speed complete)
2. US4 → US5 (analytics intelligence)
3. US6 → US7 (habit + polish)
4. Phase 10 acceptance

### Suggested MVP Scope

- **Minimum**: T001–T022 (Setup + Foundational + US1)
- **Logging slice**: through T035 (+ US2–US3)
- **Full Phase 2**: through T064; T065 optional

---

## Notes

- Delete `backend/src/utils/parseQuickEntry.ts` after shared parser ships; update any imports
- `GET /api/analytics/summary` remains for dashboard totals; analytics page prefers `/api/analytics/insights` for cards
- Time leak thresholds: ≥30 min to qualify, ≥60 min to emit, >20% WoW — see clarifications in spec.md
