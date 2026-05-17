# Research: 004-pwa-offline-logging

**Date**: 2026-05-17  
**Status**: Complete — no open NEEDS CLARIFICATION items

## R1: PWA module and workbox strategies

**Decision**: Fully configure existing **`@vite-pwa/nuxt`** in `frontend/nuxt.config.ts` with manifest (icons, `start_url`, `orientation: portrait-primary`), `registerType: 'autoUpdate'`, and explicit **workbox** runtime caching:

| Pattern | Strategy |
|---------|----------|
| Nuxt static assets (`/_nuxt/*`, fonts, icons) | `CacheFirst` or `StaleWhileRevalidate` |
| HTML / navigations | `NetworkFirst` with short network timeout → cached fallback |
| `GET /api/*` (authenticated reads) | `NetworkFirst` — enables dashboard snapshot offline after online visit |
| `POST`/`PATCH`/`DELETE /api/*` | **NetworkOnly** — never cache writes; offline path uses IndexedDB queue |

**Rationale**: Phase doc and spec FR-005/006; prevents fake write success. Same-origin `/api` proxy (Nuxt `routeRules` + Vite proxy) keeps cookies on sync fetches.

**Alternatives considered**:
- Custom service worker without vite-pwa — rejected (module already in repo; constitution Phase 3 names it).
- Cache POST responses — rejected (security + duplicate risk).

---

## R2: Offline queue storage (client)

**Decision**: **IndexedDB** via `idb` package; database `wheredidmytimego-offline`, stores `pending_entries` and `meta`. Pinia holds merged view (server rows + pending) for dashboard.

**Rationale**: Spec FR-007/017; survives restarts; structured queries for sync issues page.

**Alternatives considered**:
- localStorage JSON — rejected (size, no indexing).
- Pinia-only — rejected (lost on clear site data patterns; weaker durability narrative).

---

## R3: Online detection and sync triggers

**Decision**: Composable **`useOnlineStatus`**: `navigator.onLine` + `online`/`offline` events; when `onLine`, **`GET /api/health`** (unauthenticated, existing route) as reachability probe before `syncAll()`. Triggers: `online` event, **60s interval** while `document.visibilityState === 'visible'`, **Background Sync** tag `sync-entries` when `registration.sync` available.

**Rationale**: Clarification session (browser + verify); health endpoint already exists; avoids syncing into captive portal.

**Alternatives considered**:
- `onLine` only — rejected (false positives).
- HEAD on time-entries — rejected (auth noise; health is lighter).

---

## R4: Idempotent time-entry create

**Decision**: Client sends header **`Idempotency-Key: <localId>`** (UUID) on queued `POST /api/time-entries`. Backend middleware on create route: lookup **`idempotency_keys`** table by `(user_id, key)`; if hit and unexpired, return stored **201 body**; else create entry, persist key + JSON response, `expires_at = now + 24h`.

**Rationale**: Spec FR-013/SC-004; phase doc conflict policy.

**Alternatives considered**:
- Client-only dedupe — rejected (retries + background sync still duplicate).
- Redis — rejected (PostgreSQL sufficient for solo scale).

---

## R5: Dashboard merge and offline read

**Decision**: **`useDashboardStore`** (or composable) merges `todayEntries` from API with **pending** rows from `useOfflineQueue`; pending use negative or string `id` (`local:${uuid}`) for Vue keys. Workbox-cached `GET /api/time-entries/today` + summary endpoints supply **best-effort** offline dashboard per clarification.

**Rationale**: FR-006/010; user sees pending immediately on dashboard.

**Alternatives considered**:
- Separate “pending only” panel — rejected (clarification: show on main list).

---

## R6: Sign-out vs session expiry

**Decision**: **Session expiry (401 on sync)**: keep queue, redirect login, resume sync. **Explicit sign-out**: if queue non-empty, modal with sync-now / discard; on sign-out without sync, **`clearQueue()`** then `POST /api/auth/logout`.

**Rationale**: Clarification Q5; shared-device privacy.

---

## R7: Install UX

**Decision**: `PwaInstallBanner.vue` — listen `beforeinstallprompt`, show from **visit count ≥ 2**, respect `localStorage` `pwa_install_dismissed` + 7-day cooldown. iOS: static instructions component when Safari detected and not standalone.

**Rationale**: FR-003/004; phase doc.

---

## R8: Sync issues and retry

**Decision**: Page **`/settings/sync`** lists `status === 'failed'` from IndexedDB; edit opens Quick Add pre-filled or inline form reusing `timeEntryCreateSchema` shape; retry calls sync processor for that `localId`; delete removes IDB row + Pinia merge.

**Rationale**: Clarification Q4; FR-016.

---

## R9: CORS and headers

**Decision**: Extend backend CORS `allowHeaders` to include **`Idempotency-Key`**.

**Rationale**: Browser preflight on cross-origin prod; dev uses proxy (no preflight) but prod may set `NUXT_PUBLIC_API_BASE_URL`.

---

## R10: Stretch deferral

**Decision**: **Offline reflection queue** (`pending_reflections` store) not in Phase 3 sign-off.

**Rationale**: Spec FR-018 out of scope.
