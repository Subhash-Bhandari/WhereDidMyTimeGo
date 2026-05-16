# Phase 1 — Core Web App (Manual Time Tracking MVP)

## Summary

Build a **complete manual time-tracking MVP**: authenticated user can log time, view today/weekly stats, browse analytics, and submit a daily reflection. Delivered as a **responsive, highly interactive, visually polished** web app in the existing monorepo (`frontend` + `backend` + `packages/db`).

**Duration target:** ~4 focused dev days (see Implementation order).

---

## Prerequisites

- Monorepo runs: `npm run dev` (frontend `http://localhost:3000`, backend `http://localhost:3001`)
- PostgreSQL running; root `.env` has valid `DATABASE_URL`
- Migrations applied: `npm run db:generate && npm run db:migrate`
- Read `CONSTITUTION.md` — especially UTC time rules and monorepo boundaries

### Already implemented (do not redo unless broken)

| Area | Status |
|------|--------|
| Drizzle tables | `users`, `categories`, `time_entries`, `daily_reflections` in `packages/db/src/schema.ts` |
| `GET /api/health` | Done |
| `POST /api/time-entries` | Done (requires `userId` in body — replace with auth in this phase) |
| Placeholder pages | `/`, `/add`, `/analytics`, `/reflection` |

---

## Product goal

A single user can answer daily:

1. **Where did my time go today?** → Dashboard
2. **Log something quickly** → Quick Add
3. **What patterns do I see?** → Analytics
4. **How did I feel / how productive was I?** → Reflection

Manual entry only. No browser tracking, no background workers.

---

## User stories

| ID | As a user, I want to… | So that… |
|----|------------------------|----------|
| P1-US01 | Sign up / log in | My data is private |
| P1-US02 | Create categories (name, color, icon) | I can group time entries |
| P1-US03 | Log a time entry with title, category, duration | I capture what I did |
| P1-US04 | See today's entries and total minutes | I know today's usage |
| P1-US05 | See a weekly bar/line chart | I see trends |
| P1-US06 | See category breakdown (pie/donut) | I see distribution |
| P1-US07 | View basic analytics (weekly compare, top category) | I spot leaks |
| P1-US08 | Submit one reflection per calendar day | I track mood vs productivity |
| P1-US09 | Use the app comfortably on mobile | I log on the go |
| P1-US10 | Use an app that looks modern and feels responsive | I enjoy opening it every day |

---

## Architecture (Phase 1)

### Request flow

```
Browser (Nuxt frontend)
  → /api/* (dev proxy) or NUXT_PUBLIC_API_BASE_URL
  → Hono backend (backend/src)
  → Drizzle (packages/db)
  → PostgreSQL
```

### Frontend structure (create/extend)

```
frontend/
├── pages/
│   ├── index.vue              # Dashboard
│   ├── add.vue                # Quick Add
│   ├── analytics.vue
│   ├── reflection.vue
│   └── login.vue              # Auth (if not using external provider)
├── layouts/
│   └── default.vue            # Nav: desktop top / mobile bottom tabs
├── components/
│   ├── ui/                    # shadcn-vue primitives
│   ├── dashboard/             # TodaySummary, WeeklyChart, CategoryChart
│   ├── entries/               # EntryList, EntryForm
│   └── reflection/            # ReflectionForm
├── composables/
│   ├── useApi.ts              # $fetch wrapper + auth header
│   └── useAuth.ts             # session helpers
└── stores/
    ├── auth.ts                # Pinia
    ├── categories.ts
    └── dashboard.ts
```

### Backend structure (create/extend)

```
backend/src/
├── index.ts                   # App entry, CORS, route mount
├── middleware/
│   └── auth.ts                # Resolve user from session/JWT
├── routes/
│   ├── health.ts
│   ├── auth.ts
│   ├── categories.ts
│   ├── time-entries.ts
│   ├── reflections.ts
│   └── analytics.ts
├── services/                  # Business logic (thin routes)
│   ├── timeEntries.ts
│   ├── analytics.ts
│   └── reflections.ts
└── lib/
    └── errors.ts              # Standard error responses
```

### Shared package (extend)

```
packages/shared/src/
├── index.ts
├── schemas/                   # Zod schemas used by backend (+ optional frontend)
│   ├── time-entry.ts
│   ├── category.ts
│   └── reflection.ts
└── types/
    └── api.ts                 # Response types
```

---

## Database

### Existing schema (reference)

Located in `packages/db/src/schema.ts`. All `timestamp` columns use timezone (`timestamptz` semantics).

### Schema additions (Phase 1)

1. **`daily_reflections` — unique per user per day**

```sql
-- Enforce one reflection per user per calendar day (UTC date or user TZ — document choice)
UNIQUE (user_id, reflection_date)
```

Add column:

- `reflection_date` — `date` not null (the calendar day this reflection is for)

2. **Indexes** (add via migration)

| Table | Index | Purpose |
|-------|--------|---------|
| `time_entries` | `(user_id, started_at DESC)` | Dashboard + analytics range queries |
| `time_entries` | `(user_id, category_id)` | Category breakdown |
| `daily_reflections` | `(user_id, reflection_date)` | Upsert today's reflection |

3. **Optional: `user_settings`**

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | FK | PK |
| `timezone` | varchar | IANA, e.g. `Asia/Kolkata` — default UTC until set |

Defer if time-constrained; otherwise set on first login.

### Seed data (dev)

On first login or migration seed script, create default categories for user:

| name | color | icon |
|------|-------|------|
| Coding | `#3b82f6` | `code` |
| Learning | `#8b5cf6` | `book-open` |
| Entertainment | `#ef4444` | `youtube` |
| Health | `#22c55e` | `heart` |
| Other | `#64748b` | `circle` |

---

## Authentication (MVP)

Choose **one** approach and implement fully:

### Option A — Recommended for speed: session cookie + email/password

- `POST /api/auth/register` — email, password, name
- `POST /api/auth/login` — returns session (httpOnly cookie) or JWT in httpOnly cookie
- `POST /api/auth/logout`
- `GET /api/auth/me` — current user
- Hash passwords with bcrypt (or argon2)
- Middleware: `authMiddleware` attaches `userId` to context; routes use `c.get('userId')`

### Option B — Deferred provider: mock auth for local dev only

- Hardcode dev user ID **only** behind `NODE_ENV=development` flag
- Must be replaced before any deployment

**Requirement:** Remove `userId` from public request bodies for create endpoints; derive from auth context.

---

## API specification

Base URL: `http://localhost:3001` (prod: env-configured).  
All authenticated routes return `401` if not logged in.  
Error shape:

```json
{ "error": "Human readable message", "details": {} }
```

### Health

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/health` | No | `{ status: "ok", service: "..." }` |

### Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/register` | `{ email, password, name }` | `201` + user (no password) |
| POST | `/api/auth/login` | `{ email, password }` | `200` + sets session |
| POST | `/api/auth/logout` | — | `204` |
| GET | `/api/auth/me` | — | `{ id, email, name }` |

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List current user's categories |
| POST | `/api/categories` | Create `{ name, color, icon }` |
| PATCH | `/api/categories/:id` | Update |
| DELETE | `/api/categories/:id` | Delete (entries keep `category_id` null or block if entries exist — document choice: **set null** on entries) |

### Time entries

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/time-entries` | Query: `?from=ISO&to=ISO` (UTC), optional `categoryId` |
| GET | `/api/time-entries/today` | Entries where `started_at` falls in user's **local calendar today** |
| POST | `/api/time-entries` | Create entry |
| PATCH | `/api/time-entries/:id` | Update |
| DELETE | `/api/time-entries/:id` | Delete |

**POST body (Zod):**

```ts
{
  title: string          // min 1
  categoryId: number | null
  startedAt: string      // ISO 8601 UTC
  endedAt: string        // ISO 8601 UTC, must be > startedAt
  durationMinutes: number // positive int; must match ended-started within tolerance (±1 min)
}
```

Server validates: `durationMinutes ≈ (endedAt - startedAt) / 60000`.

**GET list response:** `{ entries: TimeEntry[], totalMinutes: number }`

### Analytics (read-only aggregates)

| Method | Path | Query | Returns |
|--------|------|-------|---------|
| GET | `/api/analytics/weekly` | `?weekStart=YYYY-MM-DD` (local week start) | Daily totals for 7 days |
| GET | `/api/analytics/categories` | `?from&to` | `{ categoryId, name, color, minutes, percent }[]` |
| GET | `/api/analytics/summary` | — | Today minutes, week minutes, vs last week % change |

**Weekly response example:**

```json
{
  "days": [
    { "date": "2026-05-12", "totalMinutes": 120 },
    { "date": "2026-05-13", "totalMinutes": 90 }
  ],
  "weekTotalMinutes": 600
}
```

### Reflections

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reflections/today` | Get today's reflection or `null` |
| PUT | `/api/reflections/today` | Upsert for today |

**PUT body:**

```ts
{
  mood: string              // enum: great | good | okay | low | bad
  productivityScore: number // 1-10
  notes?: string
  sleepHours?: number       // 0-24 optional
}
```

---

## UI and visual design (required)

The MVP must look and feel like a **finished product**, not a developer prototype. `/specify` implementations must treat UI as a first-class deliverable.

### Visual direction

- **Aesthetic:** Clean, modern, calm — productivity app that feels trustworthy and light (slate/neutral base + category accent colors).
- **Components:** shadcn-vue primitives (Button, Card, Input, Select, Dialog, Toast, Skeleton, Badge, Tabs).
- **Typography:** Clear hierarchy — page titles, section labels, data numbers large and scannable (e.g. today total as hero metric).
- **Spacing:** Generous whitespace; consistent padding scale (4/8/16/24); card-based layouts on dashboard and analytics.

### Interactivity (required on every page)

| Pattern | Requirement |
|---------|-------------|
| Buttons & chips | Hover, active, and focus-visible states; disabled state when loading |
| Forms | Inline validation feedback; focus ring; loading spinner on submit |
| Lists & cards | Subtle hover lift or border highlight on entry rows |
| Charts | Tooltips on hover; smooth enter animation (ECharts animation enabled) |
| Navigation | Active tab/route indicator; smooth route transitions where Nuxt allows |
| Feedback | Success/error toasts after mutations; skeleton loaders while fetching |
| Empty states | Illustrated or icon + friendly copy + primary CTA — never blank white screens |

### Motion and polish

- Use `tailwindcss-animate` / CSS transitions (150–300ms) for modals, toasts, and dropdowns.
- Avoid jarring layout shift — reserve space for charts and summary cards while loading.
- Dark mode: optional for Phase 1; if skipped, ensure light theme is fully polished.

### Mobile-first interaction

- Bottom tab bar on mobile with icons + labels; thumb-friendly primary actions.
- Quick Add: large tap targets on duration chips; sticky submit button on small screens.
- Pull visual weight to **one primary action per screen** (e.g. "Log time" on `/add`).

### Quality bar (reject if missing)

- [ ] Consistent color system (category colors flow into charts and chips).
- [ ] No unstyled default HTML form controls.
- [ ] Dashboard looks "alive" with real chart styling, not empty boxes.
- [ ] A stakeholder could demo this UI without apologizing for how it looks.

---

## Frontend pages (detailed)

### Global layout (`layouts/default.vue`)

- **Desktop:** top nav — Dashboard | Add | Analytics | Reflection | Profile/Logout
- **Mobile:** fixed **bottom tab bar** (same 4 routes + optional profile)
- Show logged-in user name; redirect to `/login` if unauthenticated (middleware)

### 1. Dashboard (`/`)

**Sections:**

1. **Today summary card**
   - Total minutes today (formatted: `2h 15m`)
   - Entry count
   - vs yesterday % (from `/api/analytics/summary`)

2. **Weekly chart** (vue-echarts bar chart)
   - 7 bars, Mon–Sun or last 7 days
   - Data from `/api/analytics/weekly`

3. **Category distribution** (donut/pie)
   - Today or this week toggle
   - Data from `/api/analytics/categories`

4. **Productivity score placeholder**
   - Show latest reflection `productivityScore` or "—" if none
   - Link to `/reflection`

5. **Today's entries list**
   - Compact list: title, category chip, duration
   - Tap to edit (optional Phase 1: delete only)

**Empty state:** "No time logged today" + CTA button → `/add`

### 2. Quick Add (`/add`)

**Primary UX:** speed over completeness.

**Fields:**

- Title (autofocus, required)
- Category (select, default last used or first category)
- Duration mode:
  - **Quick duration:** chips `15m`, `30m`, `45m`, `1h`, `2h`, `Custom`
  - OR start/end time pickers (advanced collapsible)
- Optional: "Started at" defaults to `now - duration` in local time, stored as UTC

**Quick text input (Phase 1 basic):**

- Single text field: `DSA 2h` → parse on blur/submit using backend or shared `parseQuickEntry` util
- Parser extracts title + minutes; user confirms before save

**Actions:**

- Primary: **Log time** (keyboard: `Cmd/Ctrl + Enter`)
- Secondary: Log and add another

**On success:** toast + optional navigate to dashboard

### 3. Analytics (`/analytics`)

**Sections:**

1. Date range: This week | Last week (Phase 1 — no custom range yet)
2. Weekly trend chart (reuse component, different range)
3. Category comparison table: category, hours, % of total
4. **Time leak card (basic):**
   - Compare top category minutes this week vs last week
   - If increase > 20%: show "You spent X% more time on {category} this week"

5. **Best hours (basic):**
   - Group entries by hour of `started_at` (local)
   - Show top 2 hours by total minutes

### 4. Reflection (`/reflection`)

**One form per calendar day (local):**

- Mood: 5 emoji or labeled buttons
- Productivity: slider 1–10
- Sleep hours: optional number input
- Notes: textarea

**Load existing** via `GET /api/reflections/today`; save via `PUT`.

**After save:** show confirmation + streak placeholder (Phase 2 implements streak logic; show "Day logged" only in Phase 1)

### 5. Login (`/login`)

- Email + password
- Link to register
- Redirect to `/` after success

---

## State management (Pinia)

### `stores/auth.ts`

- `user`, `isAuthenticated`
- `login()`, `logout()`, `fetchMe()` on app init

### `stores/categories.ts`

- `categories[]`, `fetchCategories()`, `createCategory()`

### `stores/dashboard.ts`

- Cache today's summary + weekly chart data
- `refresh()` invalidates on new entry

---

## composable: `useApi.ts`

```ts
// Pseudocode contract
const api = (path, options) => $fetch(`/api${path}`, {
  baseURL: useRuntimeConfig().public.apiBaseUrl, // or relative /api in dev
  credentials: 'include',
  ...options
})
```

---

## Implementation order (suggested)

### Day 1 — Foundation

- [ ] Auth routes + middleware + login page
- [ ] `useApi` + auth store + route middleware
- [ ] Categories CRUD API + seed on register
- [ ] DB migration: indexes + `reflection_date`

### Day 2 — Time entries

- [ ] Time entries CRUD API (auth-scoped)
- [ ] Quick Add page + form + basic parser
- [ ] Today's list on dashboard

### Day 3 — Dashboard + analytics

- [ ] Analytics API endpoints
- [ ] ECharts weekly + category charts
- [ ] Dashboard summary cards
- [ ] Analytics page (basic leak + best hours)

### Day 4 — Reflection + polish

- [ ] Reflection upsert API + page
- [ ] Mobile bottom nav + touch targets
- [ ] Empty states, loading skeletons, error toasts
- [ ] **UI polish pass:** spacing, typography, chart theming, hover/focus states, cohesive cards (see **UI and visual design**)
- [ ] Manual test checklist (below)

---

## Acceptance criteria

- [ ] New user can register, log in, log out
- [ ] User can create a time entry in under 10 seconds (quick chips path)
- [ ] Dashboard shows correct today total (verified against DB)
- [ ] Weekly chart updates after new entry
- [ ] Analytics page shows category breakdown for current week
- [ ] Reflection saves once per day; second save updates same row
- [ ] User A cannot read User B's entries (test with two accounts)
- [ ] All times display in local timezone; DB stores UTC
- [ ] Works on 375px viewport without horizontal scroll
- [ ] UI is interactive and visually polished (not placeholder/wireframe quality)
- [ ] Charts, cards, and forms use shadcn-vue + consistent theme; hover/loading/empty states implemented

---

## Non-goals (Phase 1)

- Natural language category inference (Phase 2)
- Offline mode / PWA install flow (Phase 3)
- Capacitor / app stores (Phase 4)
- Automatic time tracking (browser/apps)
- Go microservices
- Email verification / password reset (can add later)
- Social features, teams, sharing

---

## Testing checklist (manual)

1. Register → receive default categories
2. Log `Coding 1h` via quick add → appears on dashboard
3. Change entry duration → totals update
4. Submit reflection → productivity shows on dashboard
5. Log out → protected routes redirect to login
6. API returns 401 without session cookie

---

## Deliverables

- All API routes above implemented in `backend/`
- All pages functional in `frontend/`
- Migrations in `packages/db/migrations/`
- Zod schemas in `packages/shared` (or `backend` if shared not wired yet)
- Updated README section listing Phase 1 endpoints (optional)
