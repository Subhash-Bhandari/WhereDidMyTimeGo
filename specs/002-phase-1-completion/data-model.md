# Data Model: 002-phase-1-completion

**Status**: No schema changes — extends [001-core-web-mvp data model](../001-core-web-mvp/data-model.md)

## Summary

This feature consumes existing tables only. All persistence rules, indexes, and validation from **001** remain authoritative.

## Entities used (read/write)

| Entity | Operations in this feature | Notes |
|--------|---------------------------|-------|
| **Category** | Create, read, update, delete via UI | `name` ≤80, `color` ≤24, `icon` ≤40 (Zod in `packages/shared`) |
| **Time Entry** | Read (aggregates) | Unchanged; entries become uncategorized when category deleted |
| **Daily Reflection** | Read (today's productivity) | One row per `(user_id, reflection_date)` |
| **Analytics aggregates** | Read | Category breakdown via existing analytics service |

## Client-side state (Pinia)

| Store | New/updated fields | Purpose |
|-------|-------------------|---------|
| `dashboard` | `productivityScore: number \| null` | Today's reflection score for summary card |
| `dashboard` | `categoryPeriod: 'today' \| 'week'` | Drives `from`/`to` for breakdown fetch |
| `categories` | `createCategory`, `updateCategory`, `deleteCategory` | Settings page mutations |

## Validation (UI mirrors shared Zod)

| Field | Rule | Source |
|-------|------|--------|
| Category name | Required, max 80 chars | `categoryCreateSchema` |
| Category color | Required hex/preset | `categoryCreateSchema` |
| Category icon | Required preset string | `categoryCreateSchema` |
| Entry title / notes | Unchanged | 001 schemas |

## Migration

**None.** Run existing migrations from 001 only:

```bash
npm run db:generate   # only if schema edited elsewhere
npm run db:migrate
```
