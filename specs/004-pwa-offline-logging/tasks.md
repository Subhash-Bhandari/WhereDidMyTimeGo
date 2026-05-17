# Tasks: Installable PWA with Offline Time Logging (Phase 3)

**Input**: Design documents from `/specs/004-pwa-offline-logging/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual acceptance per `quickstart.md` and `phases/phase-3-pwa.md`; optional idempotency integration test noted in plan (non-blocking)

**Organization**: Tasks grouped by user story (US1–US6). MVP = Phases 1–4 (install + offline shell).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US6 maps to `spec.md` user stories

## Path Conventions

- **Frontend**: `frontend/`
- **Backend**: `backend/src/`
- **DB**: `packages/db/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch, dependencies, and baseline verification

- [x] T001 Verify `npm run dev` runs frontend (:3000) and backend (:3001); Phase 1–2 flows work per `specs/001-core-web-mvp/quickstart.md`
- [ ] T002 Create git branch `004-pwa-offline-logging` from latest main (or continue on feature branch)
- [x] T003 [P] Add `idb` dependency to `frontend/package.json` and run `npm install` from repo root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: IndexedDB layer, online detection, workbox baseline, and idempotency schema — **blocks all user stories**

**⚠️ CRITICAL**: No user story work until this phase completes

- [x] T004 [P] Add `idempotency_keys` table in `packages/db/src/schema.ts` per `specs/004-pwa-offline-logging/data-model.md`
- [x] T005 Run `npm run db:generate` and `npm run db:migrate` for `idempotency_keys`
- [x] T006 [P] Create `frontend/lib/offline-db.ts` — database `wheredidmytimego-offline`, stores `pending_entries` and `meta` per data-model
- [x] T007 [P] Create `frontend/composables/useOnlineStatus.ts` — `navigator.onLine`, `online`/`offline` events, `GET /api/health` reachability probe, export `isOnlineForSync`
- [x] T008 Extend `frontend/nuxt.config.ts` — complete `pwa.manifest` (`start_url: '/'`, `orientation: portrait-primary`) and `pwa.workbox` runtimeCaching (static CacheFirst/SWR, HTML NetworkFirst, `GET /api/*` NetworkFirst, writes NetworkOnly) per `research.md` R1
- [x] T009 [P] Add `Idempotency-Key` to CORS `allowHeaders` in `backend/src/index.ts`
- [x] T010 [P] Create `backend/src/middleware/idempotency.ts` — lookup/store `(user_id, key)`, 24h TTL, replay 201 JSON body
- [x] T011 Create `frontend/lib/sync-processor.ts` skeleton — `processQueue()` FIFO stub calling offline-db (full logic in US4)

**Checkpoint**: IDB opens, health probe works, workbox registers, idempotency table exists

---

## Phase 3: User Story 1 — Install the app on my device (Priority: P1) 🎯 MVP

**Goal**: Installable PWA with manifest, icons, install banner, iOS instructions (FR-001–FR-004)

**Independent Test**: Install on Chromium; launch standalone; banner dismiss 7-day cooldown; iOS instructions visible in Safari (quickstart US1)

### Implementation for User Story 1

- [x] T012 [P] [US1] Add PWA icons under `frontend/public/icons/` — `pwa-192x192.png`, `pwa-512x512.png`, `maskable-512x512.png`, `apple-touch-icon-180x180.png`
- [x] T013 [US1] Wire icon paths in `frontend/nuxt.config.ts` `pwa.manifest.icons` and `includeAssets`
- [x] T014 [P] [US1] Create `frontend/components/pwa/PwaInstallBanner.vue` — `beforeinstallprompt`, visit count ≥2, `localStorage` `pwa_install_dismissed` 7-day cooldown
- [x] T015 [P] [US1] Create `frontend/components/pwa/PwaIosInstallHint.vue` — static Add to Home Screen steps when iOS Safari and not `display-mode: standalone`
- [x] T016 [US1] Mount `PwaInstallBanner` and `PwaIosInstallHint` in `frontend/layouts/default.vue`
- [x] T017 [US1] Increment `pwa_visit_count` in `localStorage` on client mount in `frontend/layouts/default.vue` or dedicated composable
- [ ] T018 [US1] Verify Lighthouse PWA installable + manifest fields match spec (name, short_name, theme colors)

**Checkpoint**: App installable; banner behavior matches clarifications

---

## Phase 4: User Story 6 — Open a usable app shell offline (Priority: P2)

**Goal**: Cached shell and best-effort dashboard offline (FR-005, FR-006); implement **before** offline logging so `/add` loads offline

**Independent Test**: Visit online once; go offline; relaunch → layout + `/add` work; dashboard shows cache or offline message (quickstart + spec US6)

### Implementation for User Story 6

- [x] T019 [US6] Tune `frontend/nuxt.config.ts` workbox — precache/navigate fallback includes layout and `/add` route per `research.md` R1
- [x] T020 [US6] Add offline empty state on `frontend/pages/index.vue` when offline and no cached dashboard data — CTA to Quick Add
- [x] T021 [US6] When offline with cached `GET /api/time-entries/today` / summary responses, show stale snapshot + offline badge on `frontend/pages/index.vue` (best-effort cache)
- [x] T022 [P] [US6] Add offline fallback message on `frontend/pages/analytics.vue` — last cached data or clear offline-only message (no fake live data)
- [ ] T023 [US6] Manual test: first visit online → offline reload → `/add` and dashboard behaviors per quickstart

**Checkpoint**: App shell usable offline; read paths never imply live server data when offline

---

## Phase 5: User Story 2 — Log time while offline (Priority: P1)

**Goal**: Queue creates on Quick Add when offline; pending rows on dashboard (FR-007, FR-008, FR-010)

**Independent Test**: DevTools offline → log on `/add` → toast + pending card on dashboard; survives reload (quickstart US2)

### Implementation for User Story 2

- [x] T024 [US2] Create `frontend/composables/useOfflineQueue.ts` — `enqueueEntry`, `getPendingCount`, `listPending`, `listFailed`, `clearQueue`, `removeEntry` using `offline-db.ts`
- [x] T025 [US2] Extend `frontend/pages/add.vue` — if `isOnlineForSync` use existing `POST /api/time-entries`; else `enqueueEntry` + toast “Saved offline — will sync”
- [x] T026 [US2] Extend `frontend/stores/dashboard.ts` — merge `todayEntries` with pending queue rows (`localId`, distinct pending styling helpers)
- [x] T027 [P] [US2] Create `frontend/components/dashboard/PendingEntryCard.vue` (or extend entry card) — dashed border, sync icon, pending badge
- [x] T028 [US2] Wire pending cards on `frontend/pages/index.vue` entry list using merged dashboard store
- [x] T029 [US2] Ensure queued payload uses `timeEntryCreateSchema` shape with UTC `startedAt`/`endedAt` at queue time in `frontend/pages/add.vue`
- [ ] T030 [US2] Manual test: offline submit → immediate dashboard pending row → restart browser → row persists in IDB

**Checkpoint**: Offline create works end-to-end locally; online create unchanged

---

## Phase 6: User Story 3 — See offline and sync status (Priority: P1)

**Goal**: Global offline/syncing/failed indicators (FR-009)

**Independent Test**: Toggle offline/online; see indicator states and failed-count link (quickstart)

### Implementation for User Story 3

- [x] T031 [P] [US3] Create `frontend/components/pwa/OfflineIndicator.vue` — offline message, syncing count, link to `/settings/sync` when failed &gt; 0
- [x] T032 [US3] Mount `OfflineIndicator` in `frontend/layouts/default.vue` (fixed banner or status bar per Phase 2 polish)
- [x] T033 [US3] Connect indicator to `useOnlineStatus` and `useOfflineQueue` pending/syncing counts
- [x] T034 [US3] Expose `syncing` state from `frontend/lib/sync-processor.ts` (or composable) for in-flight count during US4
- [x] T035 [US3] Add failed-count badge on settings entry in `frontend/layouts/default.vue` (or profile link) navigating to `/settings/sync`

**Checkpoint**: User can identify offline/syncing/failed states without browser alerts

---

## Phase 7: User Story 4 — Automatic sync when back online (Priority: P1)

**Goal**: Auto sync with idempotency, backoff, duplicate protection (FR-011–FR-015)

**Independent Test**: Queue offline → go online → single server row within 30s; duplicate retry does not duplicate (quickstart US4)

### Implementation for User Story 4

- [x] T036 [US4] Complete `frontend/lib/sync-processor.ts` — statuses, max 5 retries, exponential backoff, 4xx→failed, `Idempotency-Key: localId` header on POST
- [x] T037 [US4] Wire `useOfflineQueue.syncAll()` to sync-processor; update `meta.lastSyncAt` on success
- [x] T038 [US4] Register sync triggers in `frontend/plugins/offline-sync.client.ts` (or `app.vue`) — `online` event, 60s interval while visible, Background Sync tag `sync-entries` when supported
- [x] T039 [US4] On 201: remove IDB row and call `useDashboardStore().refresh()` in sync-processor
- [x] T040 [US4] On 401 during sync: redirect to login via existing auth flow; do not clear queue
- [x] T041 [US4] Apply `idempotency` middleware to `POST /` in `backend/src/routes/time-entries.ts`
- [x] T042 [US4] Ensure `createTimeEntry` response body stored in `idempotency_keys.response_body` matches `TimeEntry` JSON shape
- [x] T043 [P] [US4] Optional: add `backend/src/services/idempotency.test.ts` or script — duplicate POST same key returns one row
- [ ] T044 [US4] Manual test: double sync trigger (online + interval) → zero duplicate dashboard rows (SC-004)

**Checkpoint**: Offline entries sync automatically with idempotent server create

---

## Phase 8: User Story 5 — Resolve sync issues (Priority: P2)

**Goal**: `/settings/sync` page, edit/retry/delete failed items; sign-out queue prompt (FR-016, FR-023)

**Independent Test**: Force 4xx failed entry → fix on sync page; sign-out with queue prompts and clears (quickstart US5)

### Implementation for User Story 5

- [x] T045 [P] [US5] Create `frontend/pages/settings/sync.vue` — list failed entries with `lastError`, edit, retry, delete actions
- [x] T046 [US5] Implement edit/retry on sync page — reopen Quick Add with payload or inline form; reset status to `pending` and call `syncAll` for `localId`
- [x] T047 [US5] Add settings nav link to `/settings/sync` and wire failed badge from US3 to this route
- [x] T048 [US5] Extend `frontend/stores/auth.ts` `logout()` — if queue non-empty, modal sync-now vs discard; `clearQueue()` before `POST /api/auth/logout` when user signs out without sync
- [x] T049 [US5] Wire discard action in sign-out modal to `useOfflineQueue.clearQueue()`
- [ ] T050 [US5] Manual test: failed validation entry surfaces on sync page with readable error (SC-009)

**Checkpoint**: Failed queue manageable; sign-out respects privacy clarification

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, acceptance, regression, contract sync

- [x] T051 [P] Add “Offline behavior and limitations” section to root `README.md` (iOS Background Sync limits, sign-out queue behavior, clock skew)
- [ ] T052 Run full manual checklist in `specs/004-pwa-offline-logging/quickstart.md`
- [ ] T053 Run acceptance checklist in `phases/phase-3-pwa.md`
- [ ] T054 Phase 1–2 online regression — auth, CRUD, Quick Add, analytics, reflection (SC-008)
- [x] T055 [P] Merge `specs/004-pwa-offline-logging/contracts/openapi-phase-3.yaml` `Idempotency-Key` into `specs/001-core-web-mvp/contracts/openapi.yaml` when convenient
- [ ] T056 Lighthouse PWA audit on production build — installable + service worker (SC-006)

---

## Phase 10: Stretch (Not Blocking)

- [ ] T057 [P] Offline reflection queue — `pending_reflections` store in `frontend/lib/offline-db.ts` + reflection PUT sync (spec stretch only)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **US1 (Phase 3)** → **US6 (Phase 4)** → **US2 (Phase 5)** → **US3 (Phase 6)** → **US4 (Phase 7)** → **US5 (Phase 8)** → **Polish (Phase 9)**
- **US3** requires **US2** pending rows (optional UI) and **US4** syncing state for full indicator behavior — core offline banner can ship after US2
- **US4** requires **Foundational** idempotency schema + **US2** queue
- **US5** requires **US4** failed entries and sync processor

### User Story Dependencies

| Story | Depends on | Can start after |
|-------|------------|-----------------|
| US1 | Foundational (nuxt PWA module) | Phase 2 |
| US6 | Foundational workbox | Phase 2 |
| US2 | US6 shell (recommended), Foundational IDB | Phase 4 checkpoint |
| US3 | US2 queue, US4 for syncing count (partial after US2) | Phase 5 |
| US4 | US2 queue, Foundational idempotency | Phase 5 |
| US5 | US4 sync + failed states | Phase 7 |

### Parallel Opportunities

- **Phase 1**: T003 [P]
- **Phase 2**: T004, T006, T007, T009, T010 [P] after T001–T003
- **US1**: T012, T014, T015 [P]
- **US6**: T022 [P]
- **US2**: T027 [P]
- **US3**: T031 [P]
- **US4**: T043 [P]
- **US5**: T045 [P]
- **Polish**: T051, T055 [P]

### Parallel Example: Foundational

```bash
# After T003 npm install:
Task T004: packages/db/src/schema.ts
Task T006: frontend/lib/offline-db.ts
Task T007: frontend/composables/useOnlineStatus.ts
Task T009: backend/src/index.ts CORS
Task T010: backend/src/middleware/idempotency.ts
```

### Parallel Example: User Story 1

```bash
Task T012: frontend/public/icons/*
Task T014: frontend/components/pwa/PwaInstallBanner.vue
Task T015: frontend/components/pwa/PwaIosInstallHint.vue
```

---

## Implementation Strategy

### MVP First (Install + offline shell)

1. Complete Phase 1–2
2. Complete Phase 3 (US1) — installable app
3. Complete Phase 4 (US6) — offline shell
4. **STOP and VALIDATE** — quickstart install + offline `/add` load

### Core offline slice (recommended)

1. MVP above
2. Complete Phase 5–7 (US2, US3, US4) — offline log + sync
3. **STOP and VALIDATE** — quickstart US2–US4

### Full Phase 3

1. Add Phase 8 (US5) + Phase 9 polish
2. Phase 10 stretch only if time remains

### Suggested MVP Scope

- **Minimum**: T001–T018 (Setup + Foundational + US1) — installable PWA
- **Offline shell**: through T023 (+ US6)
- **Offline logging**: through T044 (+ US2–US4)
- **Full Phase 3 sign-off**: through T056; T057 optional

---

## Notes

- Same-origin `/api` proxy in `frontend/nuxt.config.ts` keeps session cookies on sync POSTs in dev
- Never cache authenticated POST responses in workbox
- `GET /api/health` is the reachability probe — no auth required
- Session expiry preserves queue; explicit sign-out clears queue after prompt (clarification 2026-05-17)
- Pending entries use client `localId` until server assigns numeric `id`
