# Quickstart: 003-ux-insight-enhancements

## Prerequisites

- Complete [001-core-web-mvp quickstart](../001-core-web-mvp/quickstart.md) (install, `.env`, migrations, `npm run dev`).
- Phase 1 completion features available (dashboard, categories, polish).

## Branch (recommended)

```bash
git checkout -b 003-ux-insight-enhancements
```

## Database

After implementing schema changes:

```bash
npm run db:generate
npm run db:migrate
```

Backfill keywords for existing dev users: re-register a test account, or run once in SQL:

```sql
-- Example only: re-run app register flow preferred. New users get keywords automatically on signup.
```

## Run

```bash
npm run dev
```

## API smoke script (optional)

With the backend running on port 3001:

```bash
./scripts/verify-phase2-api.sh
```

Covers parse-entry, templates, insights, streak, and cross-user template delete (404).

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |

## Seed data for insights (recommended)

Log **7+ days** of varied entries across categories and save reflections on most days. Include:

- **Coding** ≥2h on at least 5 days with productivity scores 7–9.
- **Entertainment** spike this week vs last week (≥60 min this week, >20% growth).
- Entries at different hours (e.g. 9:00, 14:00, 21:00) for best-hours cards.

## Verify this feature (manual)

### Natural language parse (US1)

1. Open **Quick Add**, type `food donation app 2h` — preview shows ~120 min, title, suggested **Coding**.
2. Override category to **Learning**, save — entry uses Learning.
3. Try `youtube 45m`, `DSA 2h`, `Worked on food donation app for 2 hours` — durations correct (SC-001 set).
4. Enable **Always confirm before save** — extra confirm step appears.

### Templates (US2)

1. Fill form → **Save as template** (e.g. label `Deep work`).
2. Chip appears; tap → form prefilled; submit in one flow.
3. Delete template (long-press or delete control) — chip removed.

### Keyboard shortcuts (US3)

1. Press `?` — help modal lists keys.
2. On Quick Add: `/` focuses input; `1`–`5` selects category; `Ctrl/Cmd+Enter` saves.
3. From dashboard (not in input): `a` → Quick Add, `d` → dashboard.

### Analytics insights (US4–US5)

1. Open **Analytics**, set **Last 30 days** — charts update.
2. **Time leak** cards still describe **this week vs last week** (subtitle explains week basis).
3. **Best hours** card reflects selected range.
4. With seeded data, **productivity correlation** card appears (coding ≥2h vs <2h days).
5. Change preset — all charts and range-based insights refresh in one cycle.

### Reflection streak (US6)

1. Save reflections on 3 consecutive local days — dashboard shows **3 day streak**.
2. Skip a day — current streak **0**; longest streak unchanged.
3. Reflection page — last 30 days dots filled/empty correctly.

### Polish (US7)

1. Hard-refresh analytics — skeletons visible.
2. Insight cards visually distinct from chart cards.
3. First visit — onboarding tour (3 steps); dismiss → not shown again.

### Privacy (regression)

1. Account A creates template id `N`.
2. Account B `DELETE /api/templates/N` → **404**.
3. Account B `POST /api/parse-entry` — never sees A's keywords.

### Phase 1 regression

- Auth, time entry CRUD, reflection upsert, category settings still work (SC-008).

## Key paths

| Area | Path |
|------|------|
| Spec | `specs/003-ux-insight-enhancements/spec.md` |
| Plan | `specs/003-ux-insight-enhancements/plan.md` |
| Phase detail | `phases/phase-2-ux-enhancements.md` |
| Shared parser | `packages/shared/src/parseEntry.ts` (planned) |
| Migrations | `packages/db/src/schema.ts` |

## Optional (nice-to-have)

- Evening reflection nudge after 8 PM local if no reflection today — not required for sign-off.
