# Data Model: 004-pwa-offline-logging

**Status**: Delta on [001-core-web-mvp data model](../001-core-web-mvp/data-model.md) + [003 data model](../003-ux-insight-enhancements/data-model.md)  
**Baseline schema**: `packages/db/src/schema.ts`

## Summary

Phase 3 adds **one server table** (`idempotency_keys`) and **client-only** IndexedDB stores for the offline queue. No changes to `time_entries` columns.

## New table (server)

### idempotency_keys

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `user_id` | integer | FK → `users.id`, ON DELETE CASCADE, NOT NULL |
| `key` | varchar(64) | NOT NULL — client `localId` (UUID) |
| `response_body` | jsonb | NOT NULL — serialized 201 `TimeEntry` response |
| `expires_at` | timestamptz | NOT NULL |
| `created_at` | timestamptz | NOT NULL, default now() |

**Indexes**:
- Unique `(user_id, key)`
- Index `(expires_at)` for periodic cleanup (optional cron or lazy delete on read)

**Validation**:
- `key`: UUID string format (36 chars) or max 64 alphanumeric
- `response_body`: must match `TimeEntry` JSON shape from create handler

**Lifecycle**:
- Insert on first successful `POST /api/time-entries` with `Idempotency-Key`
- Replay same body on duplicate key before `expires_at`
- Rows ignored after expiry (treat as new create)
- TTL: **24 hours** from first success (per spec)

## Client-only persistence (IndexedDB)

Database name: **`wheredidmytimego-offline`**

### Store: `pending_entries`

| Field | Type | Notes |
|-------|------|-------|
| `localId` | string (UUID) | PK in store |
| `payload` | object | `TimeEntryCreateInput` JSON |
| `createdAt` | string (ISO UTC) | Queue time |
| `status` | enum | `pending` \| `syncing` \| `failed` |
| `retryCount` | number | 0–5 |
| `lastError` | string? | Human-readable after failure |

**State transitions**:

```text
pending → syncing → (removed on 201)
pending → syncing → pending (5xx/network, retryCount++)
pending → failed (4xx or retryCount > 5)
failed → syncing (user retry from /settings/sync)
* → (deleted) on user delete or sign-out clear
```

### Store: `meta`

| Key | Value |
|-----|-------|
| `lastSyncAt` | ISO string |
| `visitCount` | number (optional — install banner) |

## Ephemeral / merged view (not persisted server-side)

| Type | Fields |
|------|--------|
| **DashboardEntry** | Server `TimeEntry` **or** pending row: `id` number \| `localId` string, `pending: boolean`, `status?`, display fields from payload |
| **OnlineStatus** | `browserOnline: boolean`, `apiReachable: boolean`, computed `isOnlineForSync` |

## Existing tables (unchanged schema, extended behavior)

| Entity | Phase 3 usage |
|--------|----------------|
| **time_entries** | Create accepts client `startedAt`/`endedAt` without server clock override for offline sync |
| **users** | FK for idempotency keys |

## Device preferences (localStorage)

| Key | Purpose |
|-----|---------|
| `pwa_install_dismissed` | ISO timestamp — hide install banner 7 days |
| `pwa_visit_count` | Integer — show install banner after ≥2 visits |

## Cleanup jobs (optional, Phase 3)

- Delete `idempotency_keys` where `expires_at < now()` — can run on app startup in backend or migration note only
