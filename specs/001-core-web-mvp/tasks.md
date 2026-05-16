# Tasks: Core Web App — Manual Time Tracking MVP

**Input**: Design documents from `/specs/001-core-web-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Not requested — manual acceptance per spec.md and quickstart.md only.

**Organization**: Tasks grouped by user story. Updated per `/speckit-analyze` remediation (2026-05-15).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US6 maps to spec.md user stories

## Path Conventions

- **Frontend**: `frontend/`
- **Backend**: `backend/src/routes/*` (modular routes mounted from `backend/src/index.ts`)
- **DB**: `packages/db/src/`
- **Shared**: `packages/shared/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tooling and shared packages ready for feature work

- [ ] T001 Verify monorepo installs and `npm run dev` starts frontend (:3000) and backend (:3001) per `quickstart.md`
- [x] T002 [P] Add `bcrypt`, `@types/bcrypt`, `dayjs`, and `dayjs` plugins (`utc`, `timezone`) to `backend/package.json`
- [ ] T003 [P] Add shadcn-vue CLI components (Button, Card, Input, Label, Select, Toast, Skeleton, Badge, Dialog) to `frontend/components/ui/` and add `echarts` + `vue-echarts` to `frontend/package.json`
- [x] T004 [P] Create `packages/shared/src/schemas/auth.ts` with register/login Zod schemas (password min 8 chars)
- [x] T005 [P] Create `packages/shared/src/schemas/category.ts` with category create/update Zod schemas
- [x] T006 [P] Create `packages/shared/src/schemas/time-entry.ts` with time entry create/update Zod schemas (duration ±1 min rule)
- [x] T007 [P] Create `packages/shared/src/schemas/reflection.ts` with mood enum and productivity 1–10 Zod schemas
- [x] T008 [P] Create `packages/shared/src/schemas/analytics.ts` with summary response shape including `timeLeaks` and `bestHours` types
- [x] T009 [P] Export all schemas from `packages/shared/src/index.ts`
- [x] T010 [P] Create `backend/src/lib/errors.ts` with standard `{ error, details? }` helpers and HTTP status mappers
- [x] T011 [P] Create `frontend/composables/useTimezone.ts` to expose IANA timezone from browser for API query params

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, backend skeleton, shared validation, and read-only categories API — **BLOCKS all user stories**

**⚠️ CRITICAL**: No user story work until this phase is complete

- [x] T012 Extend `packages/db/src/schema.ts` with `users.password_hash`, `sessions` table, `daily_reflections.reflection_date` + `updated_at`, and unique `(user_id, reflection_date)`
- [x] T013 Add indexes on `time_entries (user_id, started_at DESC)`, `time_entries (user_id, category_id)`, `daily_reflections (user_id, reflection_date)` in `packages/db/src/schema.ts`
- [x] T014 Run `npm run db:generate` and `npm run db:migrate` to apply migrations in `packages/db/migrations/`
- [x] T015 [P] Create `backend/src/middleware/auth.ts` to resolve session cookie → `userId` on Hono context (completed in US1)
- [x] T016 Refactor `backend/src/index.ts` to mount modular `backend/src/routes/*` and apply global CORS + error handler
- [x] T017 [P] Create `backend/src/routes/health.ts` and mount `GET /api/health` via `backend/src/index.ts`
- [x] T018 [P] Create `backend/src/lib/validate.ts` helper to parse request bodies with `packages/shared` Zod schemas and return 400 on failure
- [x] T019 [P] Create `frontend/composables/useApi.ts` with `$fetch`, `credentials: 'include'`, error toast hook-up, and on 401 redirect to `/login` with a clear session-expired message (no false “saved” success; spec edge case)
- [x] T020 [P] Create `backend/src/services/categorySeed.ts` with default categories (Coding, Learning, Entertainment, Health, Other) per `data-model.md`
- [x] T021 [P] Create `backend/src/lib/dates.ts` with Mon–Sun week range helpers using `dayjs` + timezone plugins (per `research.md`)
- [x] T022 [P] Create `backend/src/services/categories.ts` with `listForUser(userId)` scoped query
- [x] T023 [P] Create `backend/src/routes/categories.ts` with **GET `/api/categories` only** (user-scoped, auth required)
- [x] T024 Mount `backend/src/routes/categories.ts` GET handler in `backend/src/index.ts` behind auth middleware

**Checkpoint**: Foundation ready — `GET /api/categories` available before US2 Quick Add

---

## Phase 3: User Story 1 — Secure account and private data (Priority: P1) 🎯 MVP

**Goal**: Users register, login, logout; sessions isolate data per user (FR-001–FR-003, SC-004)

**Independent Test**: Register → logout → login; second account cannot access first account's data on any authenticated route

### Implementation for User Story 1

- [x] T025 [P] [US1] Create `backend/src/services/auth.ts` with bcrypt hash/verify and session create/destroy
- [x] T026 [P] [US1] Create `backend/src/routes/auth.ts` with `POST /api/auth/register`, `login`, `logout`, `GET /api/auth/me` using `backend/src/lib/validate.ts` + shared auth schemas
- [x] T027 [US1] Mount `backend/src/routes/auth.ts` in `backend/src/index.ts` and set httpOnly `session_id` cookie on register/login
- [x] T028 [US1] Call `categorySeed.ts` from register handler in `backend/src/routes/auth.ts` after user creation
- [x] T029 [US1] Complete `backend/src/middleware/auth.ts` to validate session from DB and return 401 when missing
- [x] T030 [US1] Add user-ownership guard helper in `backend/src/lib/authz.ts` (reject access when `resource.userId !== session userId`)
- [x] T031 [P] [US1] Create `frontend/stores/auth.ts` Pinia store with `user`, `login`, `logout`, `fetchMe`, `register`
- [x] T032 [P] [US1] Create `frontend/composables/useAuth.ts` wrapping auth store actions
- [x] T033 [P] [US1] Create `frontend/middleware/auth.ts` Nuxt route guard redirecting guests to `/login`
- [x] T034 [P] [US1] Create `frontend/pages/login.vue` with login form and link to register
- [x] T035 [P] [US1] Create `frontend/pages/register.vue` with register form (password ≥8 validation message)
- [x] T036 [US1] Apply `auth` middleware to protected pages in `frontend/pages/index.vue`, `add.vue`, `analytics.vue`, `reflection.vue`
- [x] T037 [US1] Privacy check (SC-004): two test accounts — `GET /api/auth/me` and `GET /api/categories` return only the signed-in user's data (time-entry isolation verified in T041)

**Checkpoint**: Auth works; categories seeded; isolation verified for read routes

---

## Phase 4: User Story 2 — Fast manual time logging (Priority: P1)

**Goal**: Quick Add flow — create entries with chips and shorthand parse (FR-006–FR-007, FR-013–FR-014). **Edit/delete on dashboard is US3.**

**Independent Test**: Log "DSA 1h" via Quick Add → `GET /api/time-entries/today` returns entry; optional isolated edit/delete on `/add` test list only

### Implementation for User Story 2

- [x] T038 [P] [US2] Create `backend/src/services/timeEntries.ts` with create/update/delete/list and duration validation (all queries scoped by `userId`)
- [x] T039 [P] [US2] Extend `backend/src/utils/parseQuickEntry.ts` for client-side or shared parse preview
- [x] T040 [US2] Create `backend/src/routes/time-entries.ts` with CRUD + `GET /today` per `contracts/openapi.yaml` (Zod via `validate.ts`, auth-scoped, no `userId` in body)
- [x] T041 [US2] Mount `backend/src/routes/time-entries.ts` in `backend/src/index.ts` behind auth middleware; verify SC-004 — user B cannot read user A entries via `GET /api/time-entries/today` or by entry ID
- [x] T042 [P] [US2] Create `frontend/stores/categories.ts` with `fetchCategories()` calling `GET /api/categories` (available from T023–T024)
- [x] T043 [P] [US2] Create `frontend/components/entries/QuickAddForm.vue` with title, category select, duration chips, optional advanced times
- [x] T044 [P] [US2] Create `frontend/components/entries/ParsePreview.vue` for shorthand confirm before submit
- [x] T045 [US2] Implement `frontend/pages/add.vue` using QuickAddForm, ParsePreview, Cmd+Enter submit, success toast
- [x] T046 [P] [US2] Create `frontend/components/entries/EntryListItem.vue` for title, category chip, duration display
- [x] T047 [P] [US2] Create `frontend/components/entries/EntryEditDialog.vue` (reusable component; wiring on dashboard deferred to US3)
- [ ] T048 [US2] Optional: on `frontend/pages/add.vue` only — show today's entries list with edit/delete to verify CRUD in isolation (not dashboard)

**Checkpoint**: Quick Add complete; categories load in form; no `userId` in client payloads

---

## Phase 5: User Story 3 — Dashboard (Priority: P1)

**Goal**: Today summary, Mon–Sun chart, category distribution, today entries with edit/delete (FR-008–FR-012)

**Independent Test**: Dashboard totals match logged data; edit/delete from today list updates totals

### Implementation for User Story 3

- [ ] T049 [P] [US3] Create `backend/src/services/analytics/summary.ts` for today vs yesterday and week vs last week totals (user-scoped; return `timeLeaks: []` and `bestHours: []` until US4 T063 fills them — satisfies openapi `AnalyticsSummary`)
- [x] T050 [P] [US3] Create `backend/src/services/analytics/weekly.ts` for seven daily totals Mon–Sun (user-scoped)
- [x] T051 [P] [US3] Create `backend/src/services/analytics/categoryBreakdown.ts` for distribution in date range (user-scoped; rename avoids clash with entity categories service)
- [x] T052 [US3] Create `backend/src/routes/analytics.ts` with `GET /summary`, `/weekly`, `/categories` accepting `timezone` query param (Zod on inputs)
- [x] T053 [US3] Mount `backend/src/routes/analytics.ts` in `backend/src/index.ts` behind auth middleware
- [x] T054 [US3] Privacy check: user B cannot read user A analytics via `GET /api/analytics/*` with manipulated IDs (SC-004)
- [x] T055 [P] [US3] Create `frontend/stores/dashboard.ts` with fetch summary, weekly, category breakdown, today entries
- [x] T056 [P] [US3] Create `frontend/components/dashboard/TodaySummaryCard.vue` (hero minutes, entry count, vs yesterday)
- [x] T057 [P] [US3] Create `frontend/components/dashboard/WeeklyChart.vue` using vue-echarts bar chart Mon–Sun
- [x] T058 [P] [US3] Create `frontend/components/dashboard/CategoryDonut.vue` with today/this-week toggle
- [x] T059 [US3] Implement `frontend/pages/index.vue` dashboard layout with summary, charts, today EntryList, empty state CTA to `/add`
- [x] T060 [US3] Wire `EntryEditDialog` and delete actions from dashboard today list in `frontend/pages/index.vue` (FR-008 on dashboard)

**Checkpoint**: Dashboard complete with integrated edit/delete

---

## Phase 6: User Story 4 — Analytics (Priority: P2)

**Goal**: Period toggle, category table, time leak + best hours via extended `GET /api/analytics/summary` (FR-015–FR-017)

**Independent Test**: Toggle This week / Last week; leak when ≥60 min and >20%; `GET /api/analytics/summary` returns `timeLeaks` and `bestHours` (no `/insights` route)

### Implementation for User Story 4

- [x] T061 [P] [US4] Create `backend/src/services/analytics/timeLeaks.ts` implementing ≥60 min + >20% week-over-week logic (user-scoped)
- [x] T062 [P] [US4] Create `backend/src/services/analytics/bestHours.ts` for top 2 hours by logged minutes (user-scoped, local TZ)
- [x] T063 [US4] Extend `backend/src/services/analytics/summary.ts` and `GET /api/analytics/summary` in `backend/src/routes/analytics.ts` to include `timeLeaks` and `bestHours` per `contracts/openapi.yaml`
- [x] T064 [P] [US4] Create `frontend/components/analytics/PeriodToggle.vue` (This week / Last week)
- [x] T065 [P] [US4] Create `frontend/components/analytics/TimeLeakCard.vue` with insight copy template
- [x] T066 [P] [US4] Create `frontend/components/analytics/BestHoursCard.vue`
- [x] T067 [P] [US4] Create `frontend/components/analytics/CategoryTable.vue` (category, hours, percent)
- [x] T068 [US4] Implement `frontend/pages/analytics.vue` consuming summary (with leaks/hours), weekly, and category breakdown endpoints

**Checkpoint**: Analytics page complete; contract matches implementation

---

## Phase 7: User Story 5 — Daily reflection (Priority: P2)

**Goal**: One reflection per local day (FR-018–FR-019)

**Independent Test**: Save reflection → reload persists; upsert same day does not duplicate

### Implementation for User Story 5

- [ ] T069 [P] [US5] Create `backend/src/services/reflections.ts` with get/upsert by `(userId, reflectionDate)` using shared reflection schema
- [x] T070 [US5] Create `backend/src/routes/reflections.ts` with `GET/PUT /api/reflections/today` and `timezone` param (Zod validated)
- [x] T071 [US5] Mount `backend/src/routes/reflections.ts` in `backend/src/index.ts` behind auth middleware
- [x] T072 [P] [US5] Create `frontend/components/reflection/MoodSelector.vue` (great, good, okay, low, bad)
- [x] T073 [P] [US5] Create `frontend/components/reflection/ReflectionForm.vue` with productivity slider, sleep, notes
- [x] T074 [US5] Implement `frontend/pages/reflection.vue` with load-on-mount and save upsert
- [ ] T075 [US5] Show today's productivity score on `frontend/components/dashboard/TodaySummaryCard.vue` from reflection API

**Checkpoint**: Reflection flow complete

---

## Phase 8: User Story 6 — Categories management and mobile UX (Priority: P2)

**Goal**: Category POST/PATCH/DELETE + settings UI; mobile nav (FR-005, FR-020–FR-021). **GET `/api/categories` already exists from Foundational.**

**Independent Test**: Create custom category → appears in Quick Add; bottom tabs at 375px

### Implementation for User Story 6

- [x] T076 [US6] Extend `backend/src/routes/categories.ts` with POST, PATCH, DELETE (set null on delete) using `validate.ts` + category schemas
- [x] T077 [US6] Privacy check: user B cannot PATCH/DELETE user A category by ID (SC-004)
- [ ] T078 [P] [US6] Create `frontend/components/categories/CategoryForm.vue` for name, color picker, icon select
- [ ] T079 [P] [US6] Create `frontend/components/categories/CategoryList.vue` with edit/delete actions
- [ ] T080 [US6] Add categories management to `frontend/pages/settings.vue` (or section on `frontend/pages/add.vue`)
- [ ] T081 [P] [US6] Create `frontend/components/nav/MobileTabBar.vue` with Dashboard, Add, Analytics, Reflection routes
- [x] T082 [US6] Update `frontend/layouts/default.vue` with desktop top nav + mobile bottom tab bar and safe-area padding
- [x] T083 [US6] Ensure primary buttons/chips meet 44–48px tap targets on mobile in `frontend/pages/add.vue` and layout

**Checkpoint**: Category management + mobile navigation complete

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: FR-020 polish, Zod coverage audit, privacy verification, acceptance

- [ ] T084 [P] Add skeleton loaders to dashboard and analytics cards in `frontend/components/dashboard/` and `frontend/components/analytics/`
- [ ] T085 [P] Add empty states with CTA to all primary pages (`index.vue`, `add.vue`, `analytics.vue`, `reflection.vue`)
- [ ] T086 [P] Add hover/focus-visible states and disabled loading states on forms using `frontend/components/ui/`
- [ ] T087 Enforce field max lengths (title 500, notes 2000) in `packages/shared/src/schemas/*` and show inline errors in forms
- [ ] T088 Audit all write routes in `backend/src/routes/*.ts` use `backend/src/lib/validate.ts` with shared Zod schemas (constitution §3)
- [x] T089 Remove legacy monolithic `POST /api/time-entries` handler from `backend/src/index.ts` if still present after `backend/src/routes/time-entries.ts` mount
- [ ] T090 Privacy regression pass (SC-004): document results — account isolation, user-scoped analytics, user-scoped categories, no cross-account entry/reflection access by ID
- [ ] T091 Run full manual test checklist from `specs/001-core-web-mvp/quickstart.md` and `phases/phase-1-core-web-app.md`
- [ ] T092 [P] Update root `README.md` API routes section to match `contracts/openapi.yaml`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories** (includes `GET /api/categories`)
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on US1 + Foundational T023–T024 (`GET /api/categories`)
- **US3 (Phase 5)**: Depends on US2 (entries); owns dashboard edit/delete (T060)
- **US4 (Phase 6)**: Depends on US2; extends analytics summary (T063)
- **US5 (Phase 7)**: Depends on US1; **T075 requires US3** (`TodaySummaryCard.vue`); may parallel US4 after US3
- **US6 (Phase 8)**: Depends on US1 + US2; adds category mutating routes to existing `categories.ts`
- **Polish (Phase 9)**: After desired stories

### User Story Dependency Graph

```text
Setup → Foundational (incl. GET /api/categories) → US1 → US2 → US3
                                              ↘     ↘→ US4 (after US2)
                                               ↘→ US5 (after US3 for T075)
                                                ↘→ US6 (POST/PATCH/DELETE + mobile UI)
Polish → last
```

### Parallel Opportunities

- **Phase 1**: T002–T011 [P] after T001
- **Phase 2**: T015–T024 [P] after T012–T014 sequential
- **US1**: T025–T026, T031–T035 [P] before T027–T029, T036–T037
- **US2**: T038–T039, T042–T047 [P]
- **US3**: T049–T051, T055–T058 [P]
- **US4**: T061–T062, T064–T067 [P]
- **US6**: T078–T081 [P]

---

## Implementation Strategy

### MVP First (User Stories 1–3)

1. Phases 1–2 (Setup + Foundational including `GET /api/categories`)
2. US1 → US2 → US3
3. Validate per `quickstart.md` + privacy tasks T037, T054, T090

### Suggested MVP Scope

**Minimum shippable**: Through US3 (auth, logging, dashboard with edit/delete).  
**Full Phase 1 spec**: Through Phase 9.

---

## Notes

- Total tasks: **92**
- All API routes live under `backend/src/routes/*` mounted from `backend/src/index.ts`
- No `GET /api/analytics/insights` — use extended `GET /api/analytics/summary`
- Constitution: Zod validation via `backend/src/lib/validate.ts` + `packages/shared` schemas (T018, T088)
