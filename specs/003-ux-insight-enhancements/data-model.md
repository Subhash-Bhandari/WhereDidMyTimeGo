# Data Model: 003-ux-insight-enhancements

**Status**: Delta on [001-core-web-mvp data model](../001-core-web-mvp/data-model.md)  
**Baseline schema**: `packages/db/src/schema.ts`

## Summary

Phase 2 adds **two tables** (`category_keywords`, `entry_templates`) and **derived** insight/streak views (no persistence). All other entities unchanged.

## New tables

### category_keywords

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `user_id` | integer | FK → `users.id`, ON DELETE CASCADE, NOT NULL |
| `category_id` | integer | FK → `categories.id`, ON DELETE CASCADE, NOT NULL |
| `keyword` | varchar(64) | NOT NULL, lowercase application-level |

**Indexes**:
- Unique `(user_id, keyword)`
- Index `(user_id, category_id)` for bulk seed lookups

**Validation**:
- `keyword`: 1–64 chars, `[a-z0-9_-]+` after normalize (strip, lowercase)
- One keyword maps to exactly one category per user

**Lifecycle**: Rows created at registration seed; no user CRUD in Phase 2. Deleting a category cascades keyword rows.

### entry_templates

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `user_id` | integer | FK → `users.id`, ON DELETE CASCADE, NOT NULL |
| `label` | varchar(80) | NOT NULL (chip display) |
| `title` | text | NOT NULL |
| `category_id` | integer | FK → `categories.id`, ON DELETE SET NULL, nullable |
| `duration_minutes` | integer | NOT NULL, > 0 |

**Indexes**:
- Index `(user_id)` for list query

**Validation** (Zod):
- `label` max 80; `title` max 500 (align with time entry title)
- `duration_minutes` 1–1440 (24h cap, same spirit as entries)

**Lifecycle**: User CRUD via `/api/templates`. If `category_id` deleted, template keeps row with `category_id` null (apply shows empty category).

## Seed data (registration)

After `seedDefaultCategories(userId)`:

| Keywords (comma-separated seeds) | Target category name |
|----------------------------------|----------------------|
| code, coding, dev, programming | Coding |
| dsa, study, learning, course | Learning |
| youtube, netflix, game, games | Entertainment |
| gym, workout, run, health | Health |

Implementation maps by **resolved category id** after insert.

## Existing tables (extended usage)

| Entity | Phase 2 usage |
|--------|----------------|
| **time_entries** | Best-hours aggregation by local hour; correlation daily sums by category |
| **daily_reflections** | Streak dates; correlation uses `productivity_score` only |
| **categories** | Keyword FK; template FK; correlation default "Coding" |

## Ephemeral / API-only types (not persisted)

| Type | Fields |
|------|--------|
| **ParseSuggestion** | `title`, `durationMinutes`, `categoryId?`, `confidence`: `high` \| `medium` \| `low` |
| **TimeLeakInsight** | `categoryId`, `categoryName`, `currentWeekMinutes`, `previousWeekMinutes`, `changePercent` |
| **BestHourInsight** | `hour`, `endHour`, `totalMinutes`, `categoryName?` |
| **CorrelationInsight** | `categoryName`, `highMinutesThreshold`, `avgProductivityHigh`, `avgProductivityLow`, `delta`, `sampleDays` |
| **ReflectionStreak** | `currentStreak`, `longestStreak`, `lastReflectionDate` (ISO date \| null) |

## Client-side preferences (localStorage)

| Key | Shape | Purpose |
|-----|-------|---------|
| `quick_add_confirm_always` | boolean | FR-006 always confirm before save |
| `analytics_date_range` | `{ preset, from?, to? }` | FR-017 last range |
| `onboarding_done` | boolean | FR-023 tour completed |
| `reflection_nudge_dismissed_date` | ISO date (optional) | Nice-to-have evening nudge |

## Migration

```bash
# After editing packages/db/src/schema.ts
npm run db:generate
npm run db:migrate
```

Provide a one-time seed script or SQL for **existing users** to backfill `category_keywords` (optional dev script in `packages/db` or documented manual step in quickstart).

## Privacy

All new tables include `user_id` and are queried with session `userId` — same isolation as 001.
