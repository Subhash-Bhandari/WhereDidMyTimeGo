# Phase 3 — PWA (Installable + Offline Logging)

## Summary

Convert the web app into an **installable Progressive Web App** with **offline time logging** and **background sync** when connectivity returns — same Nuxt codebase, no fork.

**Depends on:** Phase 1 (entry create API, auth). Phase 2 quick-add UX strongly recommended.

---

## Prerequisites

- Phase 1 complete; HTTPS in production (PWAs require secure context except localhost)
- `@vite-pwa/nuxt` already in `frontend/package.json` — fully configure in this phase
- Auth session strategy documented: cookies must work with service worker fetch (same-origin `/api` proxy preferred)

---

## Product goal

User installs app to home screen, logs time on a flight or poor network, and data appears on dashboard after sync — **no data loss**, clear offline status.

---

## User stories

| ID | As a user, I want to… | So that… |
|----|------------------------|----------|
| P3-US01 | Install the app on my phone/desktop | It feels native |
| P3-US02 | Log time while offline | I'm not blocked by network |
| P3-US03 | See offline/sync status clearly | I trust the app |
| P3-US04 | Have offline entries sync automatically | I don't manually retry |
| P3-US05 | Open the app from home screen without browser chrome | It's app-like |

---

## PWA configuration

### Manifest (`nuxt.config.ts` → `pwa.manifest`)

| Field | Value |
|-------|-------|
| `name` | Where Did My Time Go |
| `short_name` | TimeGo |
| `description` | Track, reflect, and improve how you spend your time |
| `theme_color` | `#0f172a` |
| `background_color` | `#ffffff` |
| `display` | `standalone` |
| `start_url` | `/` |
| `orientation` | `portrait-primary` |

### Icons (generate all required sizes)

Place under `frontend/public/icons/`:

- `pwa-192x192.png`
- `pwa-512x512.png`
- `maskable-512x512.png`
- Apple touch icon `180x180`

Use a simple clock/timer mark consistent with brand.

### Service worker strategy (`@vite-pwa/nuxt`)

| Asset type | Strategy | Notes |
|------------|----------|-------|
| Nuxt static assets (JS/CSS) | `StaleWhileRevalidate` or `CacheFirst` | App shell loads offline after first visit |
| Pages (HTML) | `NetworkFirst` with timeout | Fresh when online; cached fallback |
| API `GET` (read) | `NetworkFirst` | Short cache for dashboard reads optional |
| API `POST/PATCH` (write) | **NetworkOnly** when online; queue when offline | Never fake success |

**Do not cache authenticated POST responses.**

### Install prompt UX

- Component `PwaInstallBanner.vue`: show after 2nd visit if `beforeinstallprompt` fired
- Dismiss stores `pwa_install_dismissed` in localStorage (7-day cooldown)
- iOS: show manual "Add to Home Screen" instructions (no `beforeinstallprompt`)

---

## Offline architecture

### Overview

```
┌─────────────────────────────────────────┐
│  UI (Quick Add)                          │
│       ↓                                  │
│  offlineQueue (IndexedDB)                │
│       ↓ (online / Background Sync)       │
│  syncProcessor → POST /api/time-entries  │
│       ↓                                  │
│  Server assigns real ID → update local   │
└─────────────────────────────────────────┘
```

### IndexedDB schema (`frontend/lib/offline-db.ts`)

Database: `wheredidmytimego-offline`

Store: `pending_entries`

| Field | Type | Notes |
|-------|------|-------|
| `localId` | string (uuid) | Client-generated |
| `payload` | object | Same shape as POST body (no userId — auth cookie) |
| `createdAt` | ISO string | When queued (UTC) |
| `status` | `pending` \| `syncing` \| `failed` | |
| `retryCount` | number | Max 5 |
| `lastError` | string? | |

Store: `meta`

| Key | Value |
|-----|-------|
| `lastSyncAt` | ISO |

Use `idb` package (add to frontend) for ergonomic IndexedDB.

### Composable: `useOfflineQueue.ts`

```ts
// Contract
enqueueEntry(payload): Promise<localId>
getPendingCount(): Ref<number>
syncAll(): Promise<{ synced, failed }>
isOnline(): Ref<boolean>  // navigator.onLine + optional ping
```

**On `submit` in Quick Add:**

1. If online → direct API call (existing flow)
2. If offline → `enqueueEntry` + optimistic UI toast "Saved offline — will sync"
3. Add pending item to local Pinia list with `localId` badge

### Sync processor (`frontend/lib/sync-processor.ts`)

Triggered when:

- `window` `online` event
- Periodic check every 60s while app visible
- Background Sync API if available (`registration.sync.register('sync-entries')`)

**Per pending entry:**

1. Set status `syncing`
2. `POST /api/time-entries` with stored payload
3. On `201`: remove from IndexedDB; emit event to refresh dashboard
4. On `4xx`: mark `failed`, do not retry (validation error — user must fix)
5. On `5xx` / network: increment `retryCount`, exponential backoff, max 5

### Conflict policy

| Scenario | Rule |
|----------|------|
| Server rejects payload | Mark failed; show in "Sync issues" UI |
| Duplicate sync | Idempotent: include `Idempotency-Key: localId` header; backend stores keys 24h |
| Clock skew | Server `started_at`/`ended_at` from client payload as-is (UTC); server does not rewrite |
| Auth expired while offline | Queue holds; on sync 401 → redirect login, keep queue until re-auth |

**Backend addition (Phase 3):**

- Middleware or header check: `Idempotency-Key` → if seen, return original `201` response

Table `idempotency_keys` (optional): `key`, `user_id`, `response_body`, `expires_at`

---

## UTC and time rules (offline)

- Queue stores ISO UTC timestamps computed **at queue time** on device
- Display local time in UI via Day.js
- Document: if user changes device clock, entries may cluster oddly — acceptable for MVP
- Do not use `Date.now()` on server to override client times for offline entries

---

## UI requirements

### Global offline indicator

- Fixed banner or status dot: **Offline — changes will sync when connected**
- When syncing: **Syncing {n} entries…**
- When failed items: badge on Profile or Settings → "Sync issues (2)"

### Sync issues page (`/settings/sync` or modal)

List failed queue items with error message; actions: Edit & retry, Delete local copy

### Offline-capable pages (minimum)

| Page | Offline behavior |
|------|------------------|
| `/add` | Full — queue writes |
| `/` | Read cached dashboard if implemented; else "Offline — open Add to log" |
| `/analytics` | Read-only from last cached data optional; or offline message |
| `/reflection` | Queue reflection PUT in separate store `pending_reflections` (stretch) |

**Phase 3 minimum:** offline **time entry create** only; reflection offline is stretch goal.

### App shell

- Cache layout + `/add` route for instant offline open
- Fallback page `offline.html` or Nuxt error page with link to `/add`

### UI when offline

- Offline banner and sync states must match app visual quality — styled badges, not browser `alert()`.
- Pending/syncing entries: distinct card style (e.g. dashed border, sync icon) so queue state feels intentional and interactive.

---

## Files to create/modify

```
frontend/
├── nuxt.config.ts           # full pwa config, workbox rules
├── public/icons/...
├── lib/offline-db.ts
├── lib/sync-processor.ts
├── composables/useOfflineQueue.ts
├── composables/useOnlineStatus.ts
├── components/pwa/PwaInstallBanner.vue
├── components/pwa/OfflineIndicator.vue
└── pages/settings/sync.vue    # optional

backend/
├── middleware/idempotency.ts
└── (migration) idempotency_keys table
```

---

## Testing checklist

1. Install PWA on Chrome Android or desktop → launches standalone
2. DevTools → Offline → log entry → appears in pending UI
3. Go online → entry syncs → appears on dashboard with server ID
4. Duplicate sync does not create duplicate rows (idempotency key)
5. Invalid entry while offline → marked failed after sync attempt
6. Service worker updates without breaking cache (version bump strategy)

---

## Implementation order

1. Manifest + icons + install banner
2. Workbox strategies for static shell
3. IndexedDB queue + `useOfflineQueue`
4. Offline indicator + Quick Add offline path
5. Sync processor + online listeners
6. Idempotency header backend support
7. Failed sync UI + manual retry
8. (Stretch) Offline reflection queue

---

## Acceptance criteria

- [ ] App installable on Chrome/Edge (desktop) and Add to Home Screen flow documented for iOS
- [ ] User can create time entry while offline; sees pending state
- [ ] On reconnect, entry syncs to server and dashboard updates within 30s
- [ ] No duplicate entries from double sync
- [ ] Offline/online state visible at all times
- [ ] Lighthouse PWA audit: installable + service worker registered
- [ ] Offline/sync UI is styled and interactive (matches overall app quality)

---

## Non-goals (Phase 3)

- Native push notifications (Phase 4)
- Full offline analytics computation
- Biometric lock
- Background sync on iOS Safari (limited — best-effort; document limitations)
- Conflict resolution for **edited** entries (last-write-wins defer to Phase 4)

---

## Deliverables

- Production-ready PWA manifest and icons
- Configured `@vite-pwa/nuxt` workbox rules
- IndexedDB offline queue + sync processor
- Idempotent entry creation on backend
- Offline indicator + install UX
- Short doc in README: "Offline behavior and limitations"
