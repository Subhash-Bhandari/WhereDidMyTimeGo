# Contracts: 003-ux-insight-enhancements

## HTTP API baseline

MVP OpenAPI remains authoritative for unchanged routes:

- [`specs/001-core-web-mvp/contracts/openapi.yaml`](../001-core-web-mvp/contracts/openapi.yaml)

Phase 2 paths and schemas are **merged** into:

- [`specs/001-core-web-mvp/contracts/openapi.yaml`](../001-core-web-mvp/contracts/openapi.yaml) (v0.2.0)

The delta file [`openapi-phase-2.yaml`](./openapi-phase-2.yaml) remains as the Phase 2 authoring reference.

Implementations MUST update shared Zod schemas in `packages/shared` and keep OpenAPI in sync when routes ship.

## New endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/parse-entry` | Session | Parse free text → title, duration, categoryId?, confidence |
| `GET` | `/api/templates` | Session | List user entry templates |
| `POST` | `/api/templates` | Session | Create template |
| `DELETE` | `/api/templates/:id` | Session | Delete template (404 if not owned) |
| `GET` | `/api/analytics/insights` | Session | `timeLeaks`, `bestHours`, `correlations` (see query semantics below) |
| `GET` | `/api/reflections/streak` | Session | `currentStreak`, `longestStreak`, `lastReflectionDate` |

## Query semantics: `GET /api/analytics/insights`

| Parameter | Required | Description |
|-----------|----------|-------------|
| `timezone` | Yes | IANA timezone string |
| `from` | Yes* | Local date `YYYY-MM-DD` (inclusive start) |
| `to` | Yes* | Local date `YYYY-MM-DD` (inclusive end) |
| `categoryId` | No | Filter best-hours (and optional future correlation category) |

\*For presets, frontend sends computed `from`/`to` for the preset window.

**Insight range rules** (clarification 2026-05-17):

| Insight | Date basis |
|---------|------------|
| `timeLeaks` | Always **current calendar week** vs **prior calendar week** (Mon–Sun, `timezone`) — **ignores** `from`/`to` |
| `bestHours` | Uses `from`/`to` (UTC bounds derived from local dates) |
| `correlations` | Uses `from`/`to`; productivity score only |

## Changed behavior (existing)

| Method | Path | Change |
|--------|------|--------|
| `GET` | `/api/analytics/summary` | Unchanged contract; analytics **page** should prefer `/insights` for cards when date picker is active |

## Registration side effect

`POST /api/auth/register` — after user + default categories, insert `category_keywords` seed rows (no new public endpoint).

## UI routes (unchanged paths, enhanced behavior)

| Route | Enhancements |
|-------|----------------|
| `/add` | Live parse preview, templates chips, keyboard shortcuts, confirm toggle |
| `/analytics` | Date range picker, insight cards, range-aware charts |
| `/` | Streak badge |
| `/reflection` | 30-day calendar dots, streak detail |

## Shared package contracts

```text
packages/shared/src/
├── parseEntry.ts          # parseQuickEntry + confidence + Zod
├── schemas/templates.ts   # template CRUD
├── schemas/analytics.ts   # insights response (extend)
└── schemas/reflection.ts  # streak response
```

## Frontend composables

| Composable | Contract |
|------------|----------|
| `useKeyboardShortcuts(bindings, options?)` | Registers shortcuts; `options.ignoreInputs` default true |
| `useAnalyticsRange()` | `{ preset, from, to, setPreset, setCustom }` + localStorage persist |
