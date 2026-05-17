# Quickstart: 004-pwa-offline-logging

## Prerequisites

- Complete [001-core-web-mvp quickstart](../001-core-web-mvp/quickstart.md) (install, `.env`, migrations, `npm run dev`).
- Phases 1–2 available (Quick Add, dashboard, auth).

## Branch (recommended)

```bash
git checkout -b 004-pwa-offline-logging
```

## Database

After implementing `idempotency_keys`:

```bash
npm run db:generate
npm run db:migrate
```

## Dependencies

```bash
# From repo root after adding idb to frontend/package.json
npm install
```

## Run

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| Health probe | http://localhost:3001/api/health |

Use **HTTPS** or **localhost** for PWA install testing. Production requires HTTPS.

## Verify this feature (manual)

### Install (US1)

1. Open http://localhost:3000 in Chrome (desktop or Android).
2. Log in; visit twice if needed for install banner.
3. Install app → open from home screen → standalone mode, correct name/icon.

### Offline log (US2)

1. DevTools → **Network** → **Offline**.
2. Go to **Quick Add** (`/add`); log an entry.
3. Confirm toast mentions offline sync; entry appears on dashboard with pending styling.
4. Reload page offline → entry still present.

### Sync (US4)

1. Go **Online**.
2. Within ~30s, entry syncs; pending styling removed; server `id` assigned.
3. Repeat with two entries queued; confirm no duplicate rows in DB/dashboard.

### Reachability (clarification)

1. Set network **Online** but stop backend (`Ctrl+C` on API).
2. Confirm app stays in offline/degraded mode and does not falsely report synced.

### Sync issues (US5)

1. Queue invalid payload offline (e.g. break validation if possible) or mock 400.
2. Open **Settings → Sync issues** (`/settings/sync`).
3. Edit/retry or delete local copy.

### Sign-out queue (clarification)

1. Queue entry offline; choose **Sign out**.
2. Confirm prompt (sync / discard); after sign-out without sync, queue cleared.

### Idempotency (US4)

1. With DevTools, replay same `POST /api/time-entries` with same `Idempotency-Key` header twice.
2. Expect single DB row and identical 201 body.

### Lighthouse

1. Chrome DevTools → **Lighthouse** → Progressive Web App.
2. Confirm installable + service worker registered.

### Regression (online)

- Auth, CRUD, Quick Add NLP/templates, analytics, reflection — all work with network on.

## iOS note

Document and manually verify: Add to Home Screen instructions; sync best-effort when app is foregrounded (no reliable Background Sync).

## Phase reference

See `phases/phase-3-pwa.md` for full acceptance checklist and implementation order.
