# Contracts: 004-pwa-offline-logging

## HTTP API baseline

Unchanged routes remain in:

- [`specs/001-core-web-mvp/contracts/openapi.yaml`](../001-core-web-mvp/contracts/openapi.yaml)
- Phase 2 delta reference: [`specs/003-ux-insight-enhancements/contracts/openapi-phase-2.yaml`](../003-ux-insight-enhancements/contracts/openapi-phase-2.yaml)

Phase 3 changes are documented in:

- [`openapi-phase-3.yaml`](./openapi-phase-3.yaml)

Implementations MUST update shared Zod where applicable and keep OpenAPI in sync when routes ship.

## Changed endpoints

| Method | Path | Change |
|--------|------|--------|
| `POST` | `/api/time-entries` | Optional header `Idempotency-Key` (client `localId`); replay 201 body within 24h per user |
| `GET` | `/api/health` | **Unchanged** — used by frontend reachability probe (no auth) |

## CORS

Production backend MUST allow header:

- `Idempotency-Key`

## Client contracts (not HTTP)

| Module | Contract |
|--------|----------|
| `frontend/lib/offline-db.ts` | IndexedDB schema per [data-model.md](../data-model.md) |
| `frontend/composables/useOfflineQueue.ts` | `enqueueEntry`, `getPendingCount`, `syncAll`, `clearQueue`, `listFailed` |
| `frontend/composables/useOnlineStatus.ts` | `browserOnline`, `apiReachable`, `isOnlineForSync` |
| `frontend/lib/sync-processor.ts` | Process queue FIFO; backoff; emit `sync-complete` |

## UI routes

| Route | Phase 3 behavior |
|-------|------------------|
| `/add` | Offline enqueue + online direct POST |
| `/` | Merged entries; cached dashboard when offline |
| `/settings/sync` | Failed queue list, edit/retry, delete |
| Global layout | `OfflineIndicator`, optional `PwaInstallBanner` |

## Workbox (build-time)

See [research.md](../research.md) R1 — configured in `nuxt.config.ts` `pwa.workbox`, not OpenAPI.
