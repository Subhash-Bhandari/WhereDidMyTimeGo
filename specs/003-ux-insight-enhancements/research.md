# Research: 003-ux-insight-enhancements

**Date**: 2026-05-17  
**Status**: Complete — no open NEEDS CLARIFICATION items

## R1: Parser source of truth

**Decision**: Implement extended `parseQuickEntry` in **`packages/shared`** (pure function + Zod types for API response). Backend `POST /api/parse-entry` loads user keywords from DB and calls shared parser; frontend uses same shared package for live preview (debounced) and optional server confirm.

**Rationale**:
- Constitution: shared types when both apps need them.
- Category inference requires per-user keyword rows — cannot stay client-only.
- Replaces duplicated `frontend/utils` and `backend/src/utils` copies.

**Alternatives considered**:
- Backend-only parse — rejected (worse UX latency for every keystroke).
- Duplicate parser in frontend/backend — rejected (drift risk).

---

## R2: Duration extraction and title cleanup

**Decision**: Pipeline per phase doc: normalize whitespace → extract **first** duration match via `(\d+(?:\.\d+)?)\s*(h|hr|hours?|m|min|minutes?)` anywhere in string → strip fragment → cleanup title (`worked on`, `spent on`, trailing `for`) → keyword match (longest keyword wins on tie).

**Rationale**:
- Spec edge case allows consistent rule; first match handles `"2h DSA"` and trailing `"… 2 hours"`.
- Supports natural sentences like `"Worked on food donation app for 2 hours"`.

**Alternatives considered**:
- Last match — rejected (ambiguous for `"1h break 2h coding"`).
- Anchor-only `title duration` regex — rejected (fails sentence-style input).

---

## R3: Analytics insights API shape

**Decision**: Add **`GET /api/analytics/insights?timezone&from&to&categoryId?`** returning `{ timeLeaks, bestHours, correlations }`. Keep **`GET /api/analytics/summary`** for dashboard headline numbers (today/week totals); summary may still include lightweight leaks for dashboard widgets or delegate to insights — **prefer insights route on analytics page** to avoid mixed date semantics.

**Rationale**:
- Clarification: time leaks always calendar week; best-hours/correlation use `from`/`to`.
- Phase doc specifies dedicated insights route; decouples date picker from summary defaults.

**Alternatives considered**:
- Extend summary query only — rejected (confusing when picker is Last 30 days but leaks are weekly).
- Single mega analytics endpoint — rejected (breaks existing dashboard consumers).

---

## R4: Time leak thresholds

**Decision**: Align `computeTimeLeaks` with spec: include categories with **≥30 min** current week in candidate set, emit only if **≥60 min** current week **and** **≥20%** growth vs prior week; return **top 3** by `growthPercent` desc. Safe denominator when previous week is 0 (cap display growth in copy, e.g. treat as 100% only when current ≥60).

**Rationale**:
- Existing service filters only `>= 60` — missing 30 min qualification step from FR-012.
- Matches workspace rules and clarification session.

---

## R5: Best hours and correlation

**Decision**:
- **Best hours**: Query `time_entries` grouped by local hour in `[from, to]`; optional `categoryId` filter; return up to **3** blocks `{ hour, endHour, totalMinutes, categoryName? }`; tie-break **latest hour first**.
- **Correlation**: For default **Coding** category (name match on seeded category), split days in range by daily coding minutes ≥120 vs <120; compare avg `productivity_score` from `daily_reflections`; emit card if ≥5 days with reflections in range and delta ≥1.5.

**Rationale**:
- Clarification: productivity only, not mood.
- Phase doc SQL patterns; coding default matches seed category name.

**Alternatives considered**:
- User-selected correlation category in Phase 2 — deferred (optional query param later).

---

## R6: Category keywords

**Decision**: New table `category_keywords`; seed in `seedCategoryKeywords(userId)` called from `registerUser` after `seedDefaultCategories`, mapping lowercase keywords to category ids by **category name** (e.g. `code,coding,dev` → Coding). **No management UI** in Phase 2 (clarification).

**Rationale**:
- FR-004; predictable defaults for new users.
- Overrides at Quick Add save time.

---

## R7: Entry templates

**Decision**: Table `entry_templates`; REST `GET/POST/DELETE /api/templates`; Zod schemas in `packages/shared`. Frontend horizontal `TemplateChips` on `/add`; create template from filled form (“Save as template”).

**Rationale**:
- Phase doc CRUD scope; simple delete (no PATCH in phase doc).

---

## R8: Keyboard shortcuts

**Decision**: `composables/useKeyboardShortcuts.ts` — register on `mount`, `onUnmounted` cleanup; ignore when `event.target` is input/textarea/contenteditable; global listeners on `default` layout for `a`/`d`/`?`; Quick Add page registers `/`, `f`, `1-5`, `Escape`, modifier+Enter variants.

**Rationale**:
- Constitution keyboard-first; phase doc composable name.
- Prevents breaking typing in shorthand field.

---

## R9: Reflection streak

**Decision**: `GET /api/reflections/streak?timezone` computes in service: fetch distinct `reflection_date` for user, walk backward from today (local) for `currentStreak`; scan all dates for `longestStreak`; return `lastReflectionDate`.

**Rationale**:
- No new table; derived from `daily_reflections`.
- Clarification: current resets to 0 after gap.

---

## R10: Date range picker

**Decision**: `DateRangePicker.vue` presets + custom range; persist `analytics_date_range` in `localStorage` (JSON: `{ preset, from?, to? }`); convert local dates to UTC bounds for API using existing `normalizeIanaTimezone` + dayjs pattern from analytics routes.

**Rationale**:
- FR-015–017; reuse analytics category route date parsing.

---

## R11: Polish and nice-to-have

**Decision**: Phase F bundles skeletons, insight card styling, onboarding tour (`onboarding_done` localStorage), empty states. **Evening nudge** and **8 PM banner** only if core phases complete (clarification: nice-to-have).

**Rationale**:
- Avoid blocking ship on nudge.

---

## R12: Testing strategy

**Decision**: Manual acceptance via [quickstart.md](./quickstart.md); add **Vitest** unit tests for `packages/shared` parser (canonical examples from spec) as recommended, not blocking. Two-account privacy regression for new routes.

**Rationale**:
- Matches 001/002 approach; parser is pure and cheap to test.

**Alternatives considered**:
- Full E2E Playwright — deferred (solo-dev scope).
