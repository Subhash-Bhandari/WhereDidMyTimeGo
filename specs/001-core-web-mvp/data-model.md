# Data Model: 001-core-web-mvp

**ORM**: Drizzle (`packages/db/src/schema.ts`)  
**Database**: PostgreSQL  
**Time storage**: `timestamptz` columns — UTC in DB; local display via client/server TZ

## Entity relationship overview

```text
users 1───* categories
  │
  ├───* time_entries ──?── categories (nullable FK, ON DELETE SET NULL)
  │
  ├───* daily_reflections
  │
  └───* sessions (new)
```

## Tables

### `users` (extend existing)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PK | |
| email | varchar(255) | UNIQUE, NOT NULL | Login identifier |
| name | varchar(120) | NOT NULL | Display name |
| password_hash | varchar(255) | NOT NULL | **NEW** — bcrypt |
| created_at | timestamptz | NOT NULL, default now() | |

**Migration**: Add `password_hash`; backfill not needed (no production users).

---

### `sessions` (new)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | varchar(64) | PK | Random opaque token |
| user_id | integer | FK → users.id, CASCADE | |
| expires_at | timestamptz | NOT NULL | e.g. 30-day rolling |
| created_at | timestamptz | NOT NULL, default now() | |

**Index**: `(user_id)`, `(expires_at)` for cleanup job (optional cron later).

---

### `categories` (existing)

| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PK |
| user_id | integer | FK → users, CASCADE |
| name | varchar(80) | NOT NULL |
| color | varchar(24) | NOT NULL — hex e.g. `#3b82f6` |
| icon | varchar(40) | NOT NULL — lucide icon name |

**Seed on register** (per user): Coding, Learning, Entertainment, Health, Other (colors/icons per phase doc).

---

### `time_entries` (existing)

| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PK |
| user_id | integer | FK → users, CASCADE |
| category_id | integer | FK → categories, SET NULL |
| title | text | NOT NULL, max 500 chars (app validation) |
| started_at | timestamptz | NOT NULL |
| ended_at | timestamptz | NOT NULL, > started_at |
| duration_minutes | integer | NOT NULL, positive |
| created_at | timestamptz | NOT NULL, default now() |

**Validation rules**:
- `duration_minutes` within ±1 of `(ended_at - started_at)` in minutes.
- "Today" filter: `started_at` falls in user's local calendar day (API receives `timezone`).

**Indexes** (new):
- `(user_id, started_at DESC)`
- `(user_id, category_id)`

---

### `daily_reflections` (extend existing)

| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PK |
| user_id | integer | FK → users, CASCADE |
| reflection_date | date | NOT NULL | **NEW** — local calendar day |
| mood | varchar(32) | NOT NULL | Enum: `great`, `good`, `okay`, `low`, `bad` |
| productivity_score | integer | NOT NULL | 1–10 |
| notes | text | nullable, max 2000 chars |
| sleep_hours | integer | nullable | 0–24 |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() | **NEW** |

**Unique**: `(user_id, reflection_date)` — one reflection per local day.

**Index**: `(user_id, reflection_date)`

---

## Derived data (not persisted)

| Aggregate | Source | Notes |
|-----------|--------|-------|
| Today total minutes | Sum `duration_minutes` where `started_at` in local today | |
| Weekly daily totals | Group by local date Mon–Sun | 7 rows |
| Category breakdown | Sum by `category_id` in range | Include uncategorized bucket |
| Time leak | Compare category totals week vs week | ≥60 min + >20% |
| Best hours | Group by `EXTRACT(HOUR FROM started_at AT TIME ZONE tz)` | Top 2 |

## State transitions

### Time entry
- **Create** → visible on dashboard/analytics immediately
- **Update** → recalculate aggregates (no cached aggregates table in MVP)
- **Delete** → removed from totals

### Category
- **Delete** → `time_entries.category_id` SET NULL (DB FK)

### Reflection
- **Upsert** by `(user_id, reflection_date)` → insert or update same row

### Session
- **Login** → create session row + Set-Cookie
- **Logout** → delete session row + clear cookie

## Migration checklist

1. `users.password_hash` NOT NULL (after auth rollout)
2. `sessions` table
3. `daily_reflections.reflection_date`, `updated_at`, UNIQUE `(user_id, reflection_date)`
4. Indexes on `time_entries`, `daily_reflections`
