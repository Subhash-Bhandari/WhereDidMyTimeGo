# Quickstart: 002-phase-1-completion

## Prerequisites

Complete [001-core-web-mvp quickstart](../001-core-web-mvp/quickstart.md) first (install, `.env`, migrations, `npm run dev`).

## Branch (optional)

```bash
git checkout -b 002-phase-1-completion
```

## Run

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |

## Verify this feature (manual)

### Dashboard (US1)

1. Sign in and log time in **two different categories** today.
2. Open **Dashboard** — confirm **category donut** shows both slices with correct colors.
3. Toggle **Today / This week** on the donut — totals match entries for that period.
4. Save a **reflection** with productivity 8/10.
5. Return to **Dashboard** — summary shows **Productivity: 8/10** (or placeholder + link before save).

### Categories (US2)

1. Open **Settings** (or **Categories**) from header navigation.
2. Create category **Side project** with color + icon → appears in Quick Add dropdown.
3. Log time under it → appears in analytics category table.
4. Edit the category name → label updates in lists.
5. Delete the category → entry remains, shows as uncategorized.

### Polish (US3)

1. Hard-refresh dashboard — **skeleton** placeholders appear briefly (not only "Loading…").
2. Save reflection — **success toast** (or clear inline confirmation).
3. Disconnect network, save category — **error feedback**, no false success.
4. New account with no entries — **empty states** with CTA to log time on dashboard.

### Privacy (regression)

1. Account A creates category id `N`.
2. Account B `PATCH`/`DELETE` `/api/categories/N` → **404** or **403**, not success.

**Implementation note (2026-05-16)**: Backend `getCategoryForUser` scopes by `userId`; foreign id returns 404 via `notFound` in `backend/src/routes/categories.ts`.

## Key paths

| Area | Path |
|------|------|
| Spec | `specs/002-phase-1-completion/spec.md` |
| Plan | `specs/002-phase-1-completion/plan.md` |
| API (unchanged) | `specs/001-core-web-mvp/contracts/openapi.yaml` |
| Phase checklist | `phases/phase-1-core-web-app.md` |

## Implementation order

1. Phase A — Dashboard donut + productivity  
2. Phase B — Settings + category CRUD UI  
3. Phase C — Toast, skeletons, empty states  
4. Phase D — README + full Phase 1 manual checklist  
