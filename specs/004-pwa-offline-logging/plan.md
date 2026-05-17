# Implementation Plan: Installable PWA with Offline Time Logging (Phase 3)

**Branch**: `004-pwa-offline-logging` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-pwa-offline-logging/spec.md`

## Summary

Deliver **Phase 3** on the existing monorepo: fully configure **`@vite-pwa/nuxt`** (manifest, icons, workbox), **IndexedDB offline queue** for time-entry creates, **automatic sync** with reachability check, **idempotent `POST /api/time-entries`**, merged **dashboard pending UI**, **`/settings/sync`** failed-entry page, install banner + offline indicator, and README **offline limitations** doc. One new DB table: `idempotency_keys`.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 20+  
**Primary Dependencies**: Nuxt 3, `@vite-pwa/nuxt`, `idb`, Hono, Drizzle ORM, PostgreSQL, Pinia, Tailwind, shadcn-vue, Zod, Day.js  
**Storage**: PostgreSQL (`idempotency_keys`) + browser IndexedDB (`wheredidmytimego-offline`) + Workbox caches  
**Testing**: Manual [quickstart.md](./quickstart.md); DevTools offline; Lighthouse PWA; idempotency integration test (recommended)  
**Target Platform**: Installable PWA — Chromium desktop/Android primary; iOS Safari best-effort (document limits)  
**Project Type**: Monorepo (`frontend/` + `backend/` + `packages/db` + `packages/shared`)  
**Performance Goals**: Sync within 30s of reconnect (SC-003); reachability probe &lt;500ms; no regression online Quick Add  
**Constraints**: HTTPS in prod; same-origin `/api` proxy in dev; POST never cached; offline write scope = time entry create only  
**Scale/Scope**: ~1 migration, 1 middleware, ~8 frontend modules/components, workbox config, README section

## Constitution Check

*GATE: Passed before Phase 0. Re-checked after Phase 1 design — **PASS**.*

| Principle | Compliance |
|-----------|------------|
| Monorepo frontend/backend split | ✅ PWA + IDB in `frontend/`; idempotency in `backend/` |
| APIs in backend only | ✅ Idempotency on existing create route |
| Drizzle in `packages/db` | ✅ `idempotency_keys` migration |
| Zod at boundaries | ✅ Reuse `timeEntryCreateSchema`; store validated response JSON |
| UTC storage, local presentation | ✅ Queue/sync payloads ISO UTC; Day.js in UI |
| Mobile-first polished UI | ✅ Styled offline indicator, pending cards, sync page |
| Fast logging | ✅ Offline path on Quick Add unchanged UX |
| Phase 3 evolution path | ✅ `@vite-pwa/nuxt` per constitution §6 |
| Incremental testable slices | ✅ Phases A–H below |
| No Go / no push / no native | ✅ Spec out of scope |

**Violations**: None. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-pwa-offline-logging/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── README.md
│   └── openapi-phase-3.yaml
└── tasks.md             # /speckit-tasks — not created by /speckit-plan
```

### Source Code (repository root)

```text
WhereDidMyTimeGo/
├── packages/
│   └── db/src/
│       └── schema.ts                    # + idempotency_keys
├── backend/src/
│   ├── middleware/idempotency.ts        # NEW
│   ├── routes/time-entries.ts             # EXTEND — wrap POST
│   └── index.ts                           # CORS Idempotency-Key
├── frontend/
│   ├── nuxt.config.ts                     # EXTEND — pwa manifest, workbox, icons
│   ├── public/icons/                      # NEW — pwa-192, 512, maskable, apple-touch
│   ├── lib/
│   │   ├── offline-db.ts                  # NEW
│   │   └── sync-processor.ts              # NEW
│   ├── composables/
│   │   ├── useOfflineQueue.ts             # NEW
│   │   └── useOnlineStatus.ts             # NEW
│   ├── components/pwa/
│   │   ├── PwaInstallBanner.vue           # NEW
│   │   └── OfflineIndicator.vue           # NEW
│   ├── pages/
│   │   ├── add.vue                        # EXTEND — offline branch
│   │   └── settings/sync.vue              # NEW
│   ├── stores/
│   │   ├── dashboard.ts                   # EXTEND — merge pending
│   │   └── auth.ts                        # EXTEND — sign-out queue prompt
│   └── layouts/default.vue                # EXTEND — indicator, banner
├── README.md                                # EXTEND — offline behavior section
└── phases/phase-3-pwa.md                  # Acceptance reference
```

**Structure Decision**: Web monorepo (unchanged). Client-heavy Phase 3; minimal server delta.

## Implementation Phases

Aligned with [spec.md](./spec.md), clarifications (2026-05-17), and `phases/phase-3-pwa.md` order.

### Phase A — Manifest, icons, install UX (US1, P1)

- [ ] Add icons under `frontend/public/icons/` (192, 512, maskable-512, apple-touch 180)
- [ ] Complete `nuxt.config.ts` `pwa.manifest` (`start_url: '/'`, `orientation: portrait-primary`)
- [ ] `PwaInstallBanner.vue` — `beforeinstallprompt`, visit count ≥2, 7-day dismiss
- [ ] iOS “Add to Home Screen” instructions when not standalone
- [ ] Verify Lighthouse installable

### Phase B — Workbox app shell (US6, P2)

- [ ] Configure `pwa.workbox` runtime routes (static CacheFirst/SWR, HTML NetworkFirst, API GET NetworkFirst, writes NetworkOnly)
- [ ] Ensure `/add` and layout cached after first visit
- [ ] Offline fallback: dashboard message when no cache; cached snapshot when available (clarification B)

### Phase C — IndexedDB queue + composables (US2, P1)

- [ ] Add `idb` to `frontend/package.json`
- [ ] `offline-db.ts` — stores per [data-model.md](./data-model.md)
- [ ] `useOfflineQueue.ts` — enqueue, list, counts, clear, failed list
- [ ] `useOnlineStatus.ts` — `onLine` + `GET /api/health` probe

### Phase D — Quick Add offline path + dashboard merge (US2, US3, P1)

- [ ] `add.vue`: if `isOnlineForSync` → existing POST; else `enqueueEntry` + toast “Saved offline — will sync”
- [ ] Merge pending into `dashboard` store / today list with distinct card style (clarification A)
- [ ] `OfflineIndicator.vue` in `default.vue` — offline / syncing(n) / link to sync issues

### Phase E — Sync processor + auto triggers (US4, P1)

- [ ] `sync-processor.ts` — FIFO, statuses, backoff max 5, 4xx → failed
- [ ] POST with header `Idempotency-Key: localId`
- [ ] Triggers: `online`, 60s visible interval, Background Sync `sync-entries`
- [ ] On 201: remove IDB row, `dashboard.refresh()`
- [ ] On 401: redirect login, keep queue

### Phase F — Backend idempotency (US4, P1)

- [ ] Migration `idempotency_keys`
- [ ] `middleware/idempotency.ts` + wire `POST /` on time-entries
- [ ] CORS `allowHeaders: ['Content-Type', 'Idempotency-Key']`
- [ ] Test: duplicate POST same key → one row

### Phase G — Sync issues page + sign-out (US5, P2)

- [ ] `pages/settings/sync.vue` — failed list, edit/retry, delete
- [ ] Settings/profile badge → `/settings/sync`
- [ ] `auth.logout()` — prompt if queue non-empty; clear queue on sign-out without sync (clarification C)

### Phase H — Docs and acceptance

- [ ] README “Offline behavior and limitations” (iOS background sync)
- [ ] Run [quickstart.md](./quickstart.md)
- [ ] `phases/phase-3-pwa.md` acceptance checklist
- [ ] Phase 1–2 online regression (SC-008)
- [ ] Merge `contracts/openapi-phase-3.yaml` into 001 openapi when convenient

### Phase I — Stretch (not blocking)

- [ ] Offline reflection queue (`pending_reflections` store)

## Complexity Tracking

> Not applicable — no constitution violations.

## Generated Artifacts

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/README.md](./contracts/README.md), [contracts/openapi-phase-3.yaml](./contracts/openapi-phase-3.yaml) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Next Command

Run **`/speckit-tasks`** to generate `tasks.md`, then **`/speckit-implement`** to execute.
