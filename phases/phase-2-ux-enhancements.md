# Phase 2 — UX and Insight Enhancements

## Summary

Make daily logging **faster than Phase 1** and analytics **feel intelligent** — without AI, offline sync, or native apps. Focus on keyboard UX, rule-based natural language parsing, richer charts, reflection streaks, and actionable insight copy.

**Depends on:** Phase 1 complete (auth, CRUD, dashboard, analytics baseline, reflection upsert).

---

## Prerequisites

- Phase 1 acceptance criteria all passing
- `parseQuickEntry` exists in `backend/src/utils/` (extend, do not replace blindly)
- ECharts mounted on dashboard/analytics
- At least 7 days of test data recommended for validating insights (seed script or manual)

---

## Product goal

User thinks: *"This app understands how I work"* — logging is effortless; insights are specific and weekly-relevant.

---

## User stories

| ID | As a user, I want to… | So that… |
|----|------------------------|----------|
| P2-US01 | Type "worked on donation app 2h" and have title/duration/category suggested | I log in one step |
| P2-US02 | Use keyboard shortcuts on Quick Add | I never touch the mouse |
| P2-US03 | Save entry templates ("Deep work", "DSA practice") | Repetitive logs are one tap |
| P2-US04 | See "time leak" warnings when a category spikes | I fix bad habits |
| P2-US05 | See my best focus hours per category | I schedule better |
| P2-US06 | See mood vs coding time correlation | I connect wellbeing to output |
| P2-US07 | Maintain a reflection streak | I build a daily habit |
| P2-US08 | Filter analytics by custom date range | I analyze any period |

---

## Feature specifications

### 1. Natural language logging (rule-based)

**Location:** `backend/src/utils/parseQuickEntry.ts` + `packages/shared` for shared types; frontend preview before submit.

**Input examples and expected parse:**

| Input | title | durationMinutes | category (suggested) |
|-------|-------|-----------------|----------------------|
| `DSA 2h` | DSA | 120 | Learning (keyword map) |
| `youtube 45m` | youtube | 45 | Entertainment |
| `Worked on food donation app for 2 hours` | food donation app | 120 | Coding |
| `gym 1.5h` | gym | 90 | Health |

**Parser pipeline (order matters):**

1. Normalize whitespace, lowercase for matching only (preserve display title casing where possible)
2. Extract duration via regex: `(\d+(?:\.\d+)?)\s*(h|hr|hours?|m|min|minutes?)`
3. Remove duration fragment from string → remainder is title
4. Title cleanup: strip leading "worked on", "spent on", trailing "for"
5. Category inference: keyword → categoryId map per user (see below)

**Keyword map (per user, stored DB or config):**

Table `category_keywords` (new migration):

| column | type |
|--------|------|
| id | serial PK |
| user_id | FK |
| category_id | FK |
| keyword | varchar (lowercase, unique per user) |

Default seeds on register: `code,coding,dev` → Coding; `youtube,netflix` → Entertainment; etc.

**API:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/parse-entry` | `{ text: string }` → `{ title, durationMinutes, categoryId, confidence }` |

`confidence`: `high` if duration + category matched; `medium` if duration only; `low` if title only.

**Frontend (`/add`):**

- Live preview card below input: "Log **2h** as **Coding** — *food donation app*"
- User can override category/duration before submit
- Toggle: "Always ask before save" (localStorage)

**Non-goal:** LLM / OpenAI parsing (future phase).

---

### 2. Keyboard shortcuts

**Global (when not in text input):**

| Key | Action |
|-----|--------|
| `a` | Go to `/add` |
| `d` | Go to dashboard `/` |
| `?` | Open shortcuts help modal |

**Quick Add page:**

| Key | Action |
|-----|--------|
| `/` or `f` | Focus title/input |
| `1-5` | Select category by index |
| `Cmd/Ctrl + Enter` | Submit |
| `Cmd/Ctrl + Shift + Enter` | Submit + new |
| `Esc` | Clear form |

Implement via Vue composable `useKeyboardShortcuts.ts` with cleanup on unmount.

---

### 3. Entry templates

**DB:** `entry_templates`

| column | type |
|--------|------|
| id | serial |
| user_id | FK |
| label | varchar |
| title | varchar |
| category_id | FK nullable |
| duration_minutes | int |

**API:**

- `GET /api/templates`
- `POST /api/templates`
- `DELETE /api/templates/:id`

**UI:** Horizontal scroll chips on `/add`; click fills form; long-press to delete template.

---

### 4. Enhanced analytics

#### 4.1 Time leak detection

**Logic (backend `services/analytics/timeLeaks.ts`):**

For each category with ≥30 min this week:

```
change = (thisWeekMinutes - lastWeekMinutes) / max(lastWeekMinutes, 1)
if change >= 0.2 and thisWeekMinutes >= 60:
  emit leak { category, changePercent, thisWeekMinutes, lastWeekMinutes }
```

Sort by `changePercent` desc; return top 3.

**UI card copy template:**

> You spent **{changePercent}%** more time on **{category}** this week ({thisWeek} vs {lastWeek} last week).

#### 4.2 Best focus hours

**Query:** Group `time_entries` by `EXTRACT(HOUR FROM started_at AT TIME ZONE user_tz)` for selected range; optional filter `categoryId`.

Return top 3 hour blocks: `{ hour: 21, endHour: 22, totalMinutes, categoryName? }`

**UI copy:**

> Your most productive **{category}** hours are **{hour}:00–{endHour}:00**.

#### 4.3 Satisfaction correlation

**Logic:**

- Join `daily_reflections` with daily sum of `time_entries.duration_minutes` per category
- For category `Coding`: compute avg `productivity_score` on days with `coding_minutes >= 120` vs `< 120`
- If difference ≥ 1.5 points and sample ≥ 5 days:

**Copy:**

> Days with **>2h coding** had higher mood scores (+{delta} avg productivity).

**API:**

| Method | Path | Query |
|--------|------|-------|
| GET | `/api/analytics/insights` | `?from&to` |

Response:

```json
{
  "timeLeaks": [...],
  "bestHours": [...],
  "correlations": [...]
}
```

#### 4.4 Date range picker

- Presets: Today, This week, Last week, Last 30 days, Custom
- Custom: start/end date (local) → convert to UTC for API
- Persist last selection in localStorage
- All analytics charts refetch on range change

---

### 5. Reflection streaks

**Definition:** consecutive **local calendar days** with a reflection row.

**Backend:**

- `GET /api/reflections/streak` → `{ currentStreak, longestStreak, lastReflectionDate }`
- Compute in SQL or service: walk back from today until gap

**UI:**

- Dashboard badge: flame icon + `{n} day streak`
- Reflection page: calendar dots (last 30 days, filled = has reflection)

**Optional:** gentle nudge banner if no reflection today after 8pm local (frontend only, no push yet).

---

### 6. Product polish

Phase 2 raises the bar from "good MVP" to **best-looking, highly interactive** daily driver.

| Area | Requirement |
|------|-------------|
| Visual quality | Refined typography scale, card shadows, rounded corners, consistent iconography (lucide-vue-next) |
| Micro-interactions | Chip select animations, parse preview fade-in, streak flame pulse on increment |
| Empty states | Illustration/icon + one-line tip + CTA per page |
| Loading | Skeleton components for charts and lists (shadcn skeleton) |
| Errors | Toast via shared composable; retry button on failed fetch |
| Mobile nav | Bottom bar icons (lucide); active state; safe-area padding |
| Onboarding | First-login 3-step tooltip tour (localStorage `onboarding_done`) |
| Charts | Consistent color palette from category colors; accessible contrast; animated transitions on data change |
| Insight cards | Distinct visual treatment (accent border or gradient) so insights feel "smart" not generic |

---

## Frontend components to add

```
frontend/components/
├── add/
│   ├── QuickParseInput.vue
│   ├── TemplateChips.vue
│   └── ParsePreview.vue
├── analytics/
│   ├── DateRangePicker.vue
│   ├── InsightCard.vue
│   ├── TimeLeakCard.vue
│   └── BestHoursCard.vue
├── reflection/
│   └── StreakBadge.vue
└── common/
    ├── KeyboardShortcutsModal.vue
    └── ToastProvider.vue
```

---

## Backend files to add

```
backend/src/
├── routes/parse-entry.ts
├── routes/templates.ts
├── routes/analytics-insights.ts
├── services/analytics/
│   ├── timeLeaks.ts
│   ├── bestHours.ts
│   └── correlations.ts
└── utils/parseQuickEntry.ts  # extended
```

**Migrations:** `category_keywords`, `entry_templates`

---

## Implementation order

1. Extend parser + `POST /api/parse-entry` + Quick Add preview
2. Templates CRUD + chips UI
3. Keyboard shortcuts + help modal
4. Analytics insights service + API + cards
5. Date range picker wired to all charts
6. Streak API + dashboard/reflection UI
7. Polish pass (skeletons, empty states, onboarding)

---

## Acceptance criteria

- [ ] `food donation app 2h` parses to sensible title + 120 min + suggested Coding
- [ ] User can override parse before save
- [ ] Templates create and apply in one click
- [ ] `Cmd+Enter` submits from Quick Add without mouse
- [ ] Time leak card appears when test data shows >20% category increase
- [ ] Best hours card shows plausible hour range from seeded entries
- [ ] Custom date range updates all analytics charts
- [ ] Streak increments on consecutive reflection days; resets after missed day
- [ ] No regression on Phase 1 auth and CRUD flows
- [ ] UI feels more interactive and polished than Phase 1 (animations, insight cards, parse preview)

---

## Non-goals (Phase 2)

- Offline queue / service worker caching (Phase 3)
- Push notifications (Phase 4)
- AI/LLM parsing
- Automatic app/tab tracking
- Multi-user teams
- Export CSV (optional nice-to-have — defer)

---

## Deliverables

- Extended parser + parse API
- Templates feature end-to-end
- `/api/analytics/insights` with three insight types
- Date range filtering across analytics
- Streak display + reflection calendar
- Keyboard shortcuts modal documented in app
