# Tasks: Phase 1 Completion — Dashboard, Categories & Polish

**Input**: Design documents from `/specs/002-phase-1-completion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/README.md, quickstart.md

**Tests**: Not requested — manual acceptance per quickstart.md and `phases/phase-1-core-web-app.md` only.

**Organization**: Tasks grouped by user story. Builds on shipped `001-core-web-mvp` (no new API routes or DB migrations).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US4 maps to spec.md user stories

## Path Conventions

- **Frontend**: `frontend/`
- **Backend**: `backend/src/` (verify only — no new routes)
- **Docs**: `README.md`, `specs/002-phase-1-completion/quickstart.md`

---

## Phase 1: Setup (Shared UI Primitives)

**Purpose**: Add toast/skeleton primitives used by polish and category flows

- [x] T001 Verify `npm run dev` starts frontend (:3000) and backend (:3001) per `specs/002-phase-1-completion/quickstart.md`
- [x] T002 [P] Add shadcn-vue Toast primitive to `frontend/components/ui/Toast.vue` (and provider/toast viewport per shadcn-vue pattern)
- [x] T003 [P] Add shadcn-vue Skeleton primitive to `frontend/components/ui/Skeleton.vue`
- [x] T004 Create `frontend/composables/useToast.ts` with `success`/`error` helpers and mount Toast provider in `frontend/layouts/default.vue` or `frontend/app/app.vue`

**Checkpoint**: Toast and skeleton available app-wide

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared presets and API readiness — **BLOCKS user stories**

**⚠️ CRITICAL**: No user story work until this phase is complete

- [x] T005 [P] Create `frontend/constants/categoryPresets.ts` with `COLOR_PRESETS` (hex swatches) and `ICON_PRESETS` (lucide names aligned with `backend/src/services/categorySeed.ts`)
- [x] T006 Verify `backend/src/routes/categories.ts` POST/PATCH/DELETE and `backend/src/routes/analytics.ts` GET `/categories` match `specs/001-core-web-mvp/contracts/openapi.yaml` (document in PR notes if already correct)

**Checkpoint**: Presets ready; category/analytics APIs confirmed for frontend wiring

---

## Phase 3: User Story 1 — Complete dashboard at a glance (Priority: P1) 🎯 MVP

**Goal**: Category donut with today/week toggle and today's productivity on the dashboard summary

**Independent Test**: Log time in two categories, save reflection with productivity score, open dashboard — donut slices and productivity match data; toggle today/week updates proportions

### Implementation for User Story 1

- [x] T007 [P] [US1] Create `frontend/components/dashboard/CategoryDonut.client.vue` (vue-echarts donut; props: breakdown items, loading; emit period toggle)
- [x] T008 [US1] Extend `frontend/stores/dashboard.ts` to fetch `GET /api/reflections/today`, expose `productivityScore`, and refetch `GET /api/analytics/categories` with `from`/`to` for `categoryPeriod` `today` | `week` (dayjs + `useTimezone`)
- [x] T009 [US1] Update `frontend/pages/index.vue` to mount `CategoryDonut`, wire period toggle to store, pass `productivityScore` to `frontend/components/dashboard/TodaySummaryCard.vue`
- [x] T010 [US1] Update `frontend/components/dashboard/TodaySummaryCard.vue` placeholder when `productivityScore` is null (copy + `NuxtLink` to `/reflection`)
- [x] T011 [US1] Handle empty category breakdown in `frontend/pages/index.vue` / `CategoryDonut.client.vue` (zero minutes or uncategorized-only — empty state, not chart error)

**Checkpoint**: Dashboard meets spec US1 acceptance scenarios

---

## Phase 4: User Story 2 — Manage personal categories (Priority: P1)

**Goal**: In-app create, edit, delete categories via existing REST API

**Independent Test**: Create category on settings page → appears in Quick Add → log entry → shows in analytics table; delete category → entry uncategorized

### Implementation for User Story 2

- [x] T012 [US2] Extend `frontend/stores/categories.ts` with `createCategory`, `updateCategory`, `deleteCategory` calling `POST/PATCH/DELETE /api/categories`
- [x] T013 [P] [US2] Create `frontend/components/categories/CategoryForm.vue` (name, color preset grid, icon preset select; validation max 80/24/40 chars)
- [x] T014 [P] [US2] Create `frontend/components/categories/CategoryList.vue` (list rows, edit mode, delete with confirm)
- [x] T015 [US2] Create `frontend/pages/settings.vue` with `auth` middleware composing `CategoryForm` and `CategoryList`
- [x] T016 [US2] Refresh `fetchCategories()` after mutations on `frontend/pages/settings.vue` so Quick Add pickers stay in sync

**Checkpoint**: Category CRUD works end-to-end from UI

---

## Phase 5: User Story 4 — Reach category settings easily (Priority: P3)

**Goal**: Discoverable navigation to category management on desktop and mobile

**Independent Test**: From dashboard at 375px width, reach settings in ≤2 taps without horizontal scroll

### Implementation for User Story 4

- [x] T017 [US4] Add labeled Settings/Categories link in `frontend/layouts/default.vue` desktop header and mobile-accessible entry (header link or compact menu — no fifth bottom tab)

**Checkpoint**: US4 navigation acceptance scenarios pass

---

## Phase 6: User Story 3 — Polished feedback on every primary screen (Priority: P2)

**Goal**: Skeletons, toasts, empty states, consistent interactive states on primary routes

**Independent Test**: Throttle network or use empty account — skeletons while loading, empty CTAs, success/error toasts on saves

### Implementation for User Story 3

- [x] T018 [P] [US3] Add dashboard loading skeletons in `frontend/pages/index.vue` (or `frontend/components/dashboard/DashboardSkeleton.vue`) replacing plain "Loading…" text
- [x] T019 [P] [US3] Add analytics loading skeletons in `frontend/pages/analytics.vue` for chart and table areas
- [x] T020 [US3] Add analytics empty state with CTA in `frontend/pages/analytics.vue` when category rows are empty for selected period
- [x] T021 [US3] Wire success/error toasts on save in `frontend/pages/reflection.vue` via `useToast`
- [x] T022 [US3] Wire success/error toasts on category save/delete in `frontend/pages/settings.vue` via `useToast`
- [x] T023 [US3] Show error toast on failed log in `frontend/pages/add.vue` via `useToast` (keep navigate-on-success behavior)
- [x] T024 [US3] Audit `frontend/components/ui/Button.vue` and `frontend/components/ui/Input.vue` for hover, focus-visible, and disabled states per FR-011

**Checkpoint**: All four primary routes pass US3 acceptance scenarios at 375px

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, regression checks, Phase 1 closure

- [x] T025 [P] Update root `README.md` API routes section to match `specs/001-core-web-mvp/contracts/openapi.yaml`
- [x] T026 Run full manual checklist in `specs/002-phase-1-completion/quickstart.md`
- [x] T027 Privacy regression (SC-005): two accounts — user B cannot PATCH/DELETE user A category by ID; document results in PR or `specs/002-phase-1-completion/quickstart.md` notes
- [x] T028 Run Phase 1 acceptance items 3–4 from `phases/phase-1-core-web-app.md` (productivity on dashboard, category management)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start here
- **Foundational (Phase 2)**: Depends on Setup (T004 toast provider) — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Foundational — no dependency on US2/US3/US4
- **US2 (Phase 4)**: Depends on Foundational — independent of US1 (can parallel after Phase 2)
- **US4 (Phase 5)**: Depends on US2 T015 (`settings.vue` exists)
- **US3 (Phase 6)**: Depends on Setup T002–T004; best after US1/US2 pages exist to polish all routes
- **Polish (Phase 7)**: After desired user stories complete

### User Story Dependency Graph

```text
Setup → Foundational → US1 ─┐
                    → US2 ──┼→ US4 (nav)
                    → US3 ←─┘ (after Setup; polish all pages)
Polish → last
```

### Parallel Opportunities

- **Phase 1**: T002, T003 [P]
- **Phase 2**: T005 [P] while T006 verifies backend
- **US1**: T007 [P] while T008 extends store (merge at T009)
- **US2**: T013, T014 [P] before T015 integrates page
- **US3**: T018, T019 [P]
- **Polish**: T025 [P] while manual T026–T028 run

---

## Parallel Example: User Story 2

```bash
# Parallel component work:
Task T013: frontend/components/categories/CategoryForm.vue
Task T014: frontend/components/categories/CategoryList.vue

# Then sequential:
Task T012: frontend/stores/categories.ts
Task T015: frontend/pages/settings.vue
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1–2 (Setup + Foundational)
2. Complete Phase 3 (US1 — dashboard donut + productivity)
3. **STOP and VALIDATE** per quickstart Dashboard section
4. Demo if ready

### Recommended full delivery order

1. Setup + Foundational
2. US1 (dashboard)
3. US2 (categories UI)
4. US4 (navigation link)
5. US3 (polish all screens)
6. Phase 7 (README + manual + privacy)

### Incremental value

| After phase | User-visible value |
|-------------|-------------------|
| US1 | Complete home dashboard per original Phase 1 spec |
| US2 | Custom categories without API tools |
| US4 | Discoverable settings |
| US3 | Demo-ready polish (FR-020) |

---

## Notes

- Total tasks: **28**
- No backend schema migrations for this feature
- API contract unchanged — see `specs/002-phase-1-completion/contracts/README.md`
- `TodaySummaryCard.vue` already supports `productivityScore` prop — wire only
- `dashboard.ts` already fetches `categoryBreakdown` — extend period + reflection fetch
