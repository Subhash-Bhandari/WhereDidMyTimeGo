# Feature Specification: UX and Insight Enhancements (Phase 2)

**Feature Branch**: `003-ux-insight-enhancements`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: Phase 2 — UX and Insight Enhancements from `phases/phase-2-ux-enhancements.md`: faster daily logging, rule-based natural language parsing, keyboard-first flows, entry templates, richer analytics insights, reflection streaks, custom date ranges, and elevated visual polish—without AI, offline sync, native apps, or automatic tracking.

## Clarifications

### Session 2026-05-17

- Q: When the user selects Today, Last 30 days, or a custom analytics range, how should time-leak insights behave relative to other insights? → A: Time leaks always compare current calendar week vs prior calendar week (Mon–Sun, local); best-hours and correlation insights use the selected date range.
- Q: Which reflection metric should drive the mood–activity correlation insight card? → A: Productivity score (1–10) only.
- Q: In Phase 2, can users manage (add/edit/delete) category keyword mappings beyond defaults? → A: Defaults only at registration; no keyword management UI in Phase 2.
- Q: After missing one or more local days without a reflection, what should current streak show? → A: Current streak = 0 immediately; longest streak unchanged.
- Q: Should the 8 PM reflection nudge be in Phase 2 scope? → A: Nice-to-have — implement after P1/P2 core items if time remains; not required for Phase 2 completion.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Log time in one step with natural language (Priority: P1)

As a signed-in user, I type a short phrase such as "worked on donation app 2h" on Quick Add and see suggested title, duration, and category before saving, so that logging feels as fast as writing a note.

**Why this priority**: One-step logging is the core Phase 2 promise; it directly reduces friction on the most frequent action.

**Independent Test**: Enter several sample phrases on Quick Add; confirm preview shows sensible title, minutes, and category; save one entry and verify it appears on the dashboard with correct values.

**Acceptance Scenarios**:

1. **Given** a phrase containing a duration (e.g. "2h", "45m", "1.5 hours"), **When** the user types or pastes it into Quick Add, **Then** a live preview shows extracted duration, cleaned title, and a suggested category before submit.
2. **Given** a parsed suggestion the user disagrees with, **When** they change category or duration in the form, **Then** the saved entry uses their overrides, not the suggestion alone.
3. **Given** input such as "food donation app 2h", **When** parsed, **Then** title resembles the activity (e.g. "food donation app"), duration is 120 minutes, and category suggestion aligns with activity keywords (e.g. coding-related work).
4. **Given** a preference to confirm every log, **When** the user enables "always ask before save", **Then** each save requires explicit confirmation even when parsing is confident.
5. **Given** text with no recognizable duration, **When** parsed, **Then** the preview still offers a title (and optional category) and clearly indicates lower confidence so the user completes missing fields.

---

### User Story 2 - Reuse entry templates (Priority: P2)

As a signed-in user, I save and tap templates such as "Deep work" or "DSA practice" on Quick Add, so that repetitive logs take one action.

**Why this priority**: Templates compound speed gains after natural language parsing for habitual activities.

**Independent Test**: Create two templates with preset title, category, and duration; apply each with one tap; confirm form fields populate correctly and entries save.

**Acceptance Scenarios**:

1. **Given** Quick Add, **When** the user saves a new template with label, title, optional category, and duration, **Then** it appears as a selectable chip or button on Quick Add.
2. **Given** an existing template, **When** the user taps it, **Then** the logging form fills with the template values ready to submit or tweak.
3. **Given** a template the user no longer needs, **When** they delete it (e.g. long-press or explicit delete control), **Then** it disappears from Quick Add and is not offered again.
4. **Given** multiple templates, **When** the user views Quick Add on a narrow screen, **Then** templates remain reachable without breaking layout (e.g. horizontal scroll of chips).

---

### User Story 3 - Log and navigate without the mouse (Priority: P2)

As a signed-in user, I use keyboard shortcuts on Quick Add and across the app, so that power users can log and move between screens without reaching for the pointer.

**Why this priority**: Keyboard-first interaction is a stated product principle and differentiator from Phase 1 form-heavy flows.

**Independent Test**: From Quick Add, focus input, select category by number key, submit with modifier+Enter, and open shortcuts help—all without mouse.

**Acceptance Scenarios**:

1. **Given** Quick Add with focus outside text fields, **When** the user presses the focus shortcut (e.g. `/` or `f`), **Then** the main logging input receives focus.
2. **Given** visible category list in display order, **When** the user presses digit keys 1–5, **Then** the corresponding category is selected.
3. **Given** a valid Quick Add form, **When** the user presses the primary submit shortcut (modifier+Enter), **Then** the entry saves successfully.
4. **Given** a valid Quick Add form, **When** the user uses submit-and-new shortcut (modifier+Shift+Enter), **Then** the entry saves and the form clears for another log.
5. **Given** any primary screen when not typing in a text field, **When** the user presses `a` or `d`, **Then** they navigate to Quick Add or dashboard respectively.
6. **Given** any screen, **When** the user presses `?`, **Then** a shortcuts help reference opens listing available keys.
7. **Given** Quick Add with partial input, **When** the user presses Escape, **Then** the form clears without saving.

---

### User Story 4 - See actionable weekly insights (Priority: P2)

As a signed-in user, I open analytics and see plain-language cards for time leaks, best focus hours, and productivity–activity patterns, so that the app feels intelligent and guides behavior change.

**Why this priority**: Insight copy turns raw charts into weekly-relevant guidance—the second half of the Phase 2 product goal.

**Independent Test**: Seed or log a week of varied category time and reflections; open analytics for a range that triggers rules; verify up to three insight cards with accurate, readable copy.

**Acceptance Scenarios**:

1. **Given** a category with at least 60 minutes in the current calendar week (Monday–Sunday, local time) and at least 20% more time than the prior week (with at least 30 minutes in the current week considered), **When** the user views insights (regardless of analytics date range preset), **Then** a time-leak card names the category and states the week-over-week increase in plain language.
2. **Given** enough logged time in the **selected analytics date range**, **When** the user views best-hours insight (optionally for one category), **Then** a card states the top one to three hour blocks when they logged the most time in that range (e.g. "21:00–22:00").
3. **Given** at least five days with reflections in the **selected analytics date range** and coding (or chosen category) time split above/below a threshold (e.g. 2 hours), **When** average **productivity scores (1–10)** differ by at least 1.5 points between high-activity and low-activity days, **Then** a correlation card explains the pattern in plain language (mood is not used for this insight).
4. **Given** multiple qualifying time leaks, **When** insights load, **Then** at most the top three leaks by percent change are shown, sorted by largest increase first.
5. **Given** insufficient data for a rule, **When** insights load, **Then** that insight type is omitted or shows an appropriate empty explanation—not an error state.

---

### User Story 5 - Analyze any date range (Priority: P2)

As a signed-in user, I choose presets or a custom start/end date for analytics, so that I can review any period, not only fixed defaults.

**Why this priority**: Custom ranges make insights and charts relevant to the user's question ("last month", "vacation week").

**Independent Test**: Switch between "This week", "Last 30 days", and a custom range; confirm charts and insight cards all reflect the same selected period.

**Acceptance Scenarios**:

1. **Given** analytics, **When** the user selects a preset (Today, This week, Last week, Last 30 days), **Then** all charts and insight cards refresh for that local-date range.
2. **Given** analytics, **When** the user picks custom start and end dates (local calendar days), **Then** all analytics views use that inclusive range consistently.
3. **Given** a selected range, **When** the user leaves and returns to analytics later, **Then** the last selected range is restored (per-device preference).
4. **Given** a custom range spanning no entries, **When** charts load, **Then** empty states appear instead of errors.

---

### User Story 6 - Build a reflection habit with streaks (Priority: P3)

As a signed-in user, I see my current reflection streak on the dashboard and a recent history on the reflection screen, so that I am motivated to reflect daily.

**Why this priority**: Streaks support habit formation; lower priority than logging speed and analytics insights but central to "understands how I work."

**Independent Test**: Save reflections on consecutive local calendar days and skip one day; verify streak count, longest streak, and calendar indicators update correctly.

**Acceptance Scenarios**:

1. **Given** reflections on consecutive local calendar days including today, **When** the user opens the dashboard, **Then** a streak badge shows the current consecutive-day count.
2. **Given** a gap of one or more local days without a reflection, **When** the user opens the dashboard, **Then** the current streak shows **0**; longest streak still reflects their all-time best run.
3. **Given** historical reflections, **When** the user opens the reflection screen, **Then** the last 30 local days show which days have a reflection (e.g. filled vs empty markers).
4. **Given** the user's longest-ever streak, **When** they view streak details, **Then** longest streak is visible alongside current streak.
5. **Given** no reflection saved today and local time after 8:00 PM, **When** the evening nudge is implemented (nice-to-have) and the user visits the app, **Then** a gentle, dismissible in-app reminder encourages today's reflection—without push notifications. *(Not required for Phase 2 completion.)*

---

### User Story 7 - Experience a polished, interactive app (Priority: P3)

As a signed-in user, I interact with refined visuals, loading skeletons, helpful empty states, and clear feedback, so that the product feels like a daily driver rather than an MVP.

**Why this priority**: Phase 2 raises the quality bar; polish supports retention but depends on core flows from P1–P2 stories.

**Independent Test**: Visit dashboard, Quick Add, analytics, and reflection on mobile width; observe skeletons while loading, toasts on save/error, empty states with CTAs, and distinct styling on insight cards.

**Acceptance Scenarios**:

1. **Given** data loading on dashboard or analytics, **When** the user waits, **Then** skeleton placeholders approximate final layout.
2. **Given** a successful or failed save, **When** the action completes, **Then** non-blocking success or error feedback appears; failed loads offer retry where applicable.
3. **Given** a primary screen with no data, **When** the user opens it, **Then** an empty state includes a short tip and a clear next action.
4. **Given** insight cards on analytics, **When** displayed, **Then** they use distinct visual treatment so they read as guidance, not generic widgets.
5. **Given** first login on a device, **When** onboarding has not been completed, **Then** a short guided tour (e.g. three steps) introduces key actions; completing or dismissing it does not show again on that device.
6. **Given** mobile navigation, **When** the user moves between primary sections, **Then** bottom navigation shows clear active state and respects safe areas on notched devices.

---

### Edge Cases

- Parse input with multiple duration fragments—system uses a consistent rule (e.g. first or last match) and does not crash; user can correct in the form.
- Parse input with only duration and no title—user must supply or accept a minimal title before save.
- Keyword maps to no category—preview shows title and duration with no category or "uncategorized" until user picks one.
- New user with no custom keywords—registration defaults apply for common words (coding, entertainment, health); user overrides category on save when suggestion is wrong.
- Template with deleted category—applying template leaves category empty or prompts user to pick a replacement.
- Time leak when last week had zero minutes in a category—percent change uses a safe denominator so extreme spikes do not produce nonsense copy.
- Best-hours tie across hours—system breaks ties deterministically (e.g. latest hour first) and still shows at most three blocks.
- Correlation with fewer than five qualifying days—correlation insight is hidden.
- Streak at timezone boundary—consecutive days use the user's local calendar date, not server midnight UTC alone.
- User missed yesterday but reflected today—current streak is 1 (new run), not a continuation of the prior run; longest streak updates only if the new run exceeds it.
- Shortcuts while focus is in a text field—global navigation keys do not fire; Quick Add-specific shortcuts behave as documented in help.
- Custom date range with end before start—user sees validation and cannot apply range.
- User selects Today or Last 30 days on analytics—charts and best-hours/correlation insights use that range; time-leak cards still reflect current vs prior calendar week (label or subtitle should make the week basis clear).
- Phase 1 flows (auth, CRUD, dashboard baseline)—all continue to work; Phase 2 does not remove existing capabilities.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Quick Add MUST accept free-text input and show a live preview of suggested title, duration in minutes, and category before submit.
- **FR-002**: Parsing MUST be rule-based (patterns for durations, title cleanup, keyword-to-category mapping)—not AI or large-language-model based.
- **FR-003**: Users MUST be able to override any parsed field before saving a time entry.
- **FR-004**: The system MUST apply per-user keyword → category mappings seeded at registration for common terms; Phase 2 does **not** include a UI to add, edit, or delete keywords (users override category on Quick Add when needed).
- **FR-005**: Parse confidence MUST be indicated to the user (e.g. high when duration and category match, medium when duration only, low when title-only).
- **FR-006**: Users MUST be able to persist a device preference to always confirm before save after parsing.
- **FR-007**: Users MUST be able to create, list, apply, and delete personal entry templates (label, title, optional category, duration).
- **FR-008**: Quick Add MUST display templates as one-tap actions that populate the logging form.
- **FR-009**: Keyboard shortcuts MUST be documented in an in-app help modal accessible via `?`.
- **FR-010**: Quick Add MUST support focus, category selection by index, submit, submit-and-new, and clear via documented keys without requiring pointer input.
- **FR-011**: Global shortcuts MUST navigate to Quick Add and dashboard when the user is not typing in a text field.
- **FR-012**: Analytics MUST surface up to three time-leak insights when a category has ≥30 minutes in the **current calendar week**, ≥60 minutes in the **current calendar week**, and ≥20% increase versus the **prior calendar week** (Monday–Sunday, local time)—**independent of the analytics date range picker**.
- **FR-013**: Analytics MUST surface up to three best focus hour blocks for the **selected analytics date range**, optionally scoped to one category.
- **FR-014**: Analytics MUST surface productivity–activity correlation copy for the **selected analytics date range** when sample size and productivity-score delta thresholds are met (see Assumptions); mood is not used for this insight.
- **FR-015**: Analytics MUST support date presets: Today, This week, Last week, Last 30 days, and Custom (local start/end dates).
- **FR-016**: All analytics charts and insight cards for a view MUST use the same selected date range.
- **FR-017**: The system MUST remember the user's last analytics date range per device.
- **FR-018**: The system MUST compute and display current reflection streak, longest streak, and last reflection date for the signed-in user.
- **FR-019**: Reflection streak MUST count consecutive local calendar days with at least one reflection record; **current streak resets to 0** after any missed local day; **longest streak** is the historical maximum and does not decrease when the current streak breaks.
- **FR-020**: The reflection screen MUST show which of the last 30 local days have a reflection.
- **FR-021**: Primary screens MUST use skeleton loading, toast-style success/error feedback, and guided empty states.
- **FR-022**: Insight cards MUST be visually distinct from standard chart cards.
- **FR-023**: First-time users on a device MAY receive a short onboarding tour stored as completed in device preferences.
- **FR-024**: All features MUST remain scoped to the signed-in user's data.
- **FR-025**: Phase 2 MUST NOT introduce offline sync, push notifications, AI parsing, automatic app/tab tracking, multi-user teams, or CSV export.

### Key Entities

- **Parse suggestion**: Ephemeral interpretation of free-text input (title, duration, suggested category, confidence level)—not persisted until the user saves an entry.
- **Category keyword**: Per-user association between a lowercase keyword and a category; seeded at registration only in Phase 2 (no in-app keyword editor).
- **Entry template**: User-owned reusable preset (label, title, optional category, duration) for Quick Add.
- **Time leak insight**: Derived comparison of category minutes between current and previous calendar week (always week-based, not tied to the analytics date range picker).
- **Best hours insight**: Derived hour-of-day blocks with highest logged minutes in a selected range.
- **Correlation insight**: Derived comparison of **productivity scores (1–10)** on days above vs below an activity-time threshold in the selected range.
- **Reflection streak**: Derived counts of consecutive local days with reflections, plus historical longest streak.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 90% of canonical parse examples (e.g. "DSA 2h", "youtube 45m", "Worked on food donation app for 2 hours", "gym 1.5h") produce correct duration and recognizable title without manual typing of minutes.
- **SC-002**: A trained user can log a parsed entry end-to-end using only keyboard shortcuts in under 15 seconds after the phrase is typed.
- **SC-003**: A user can create a template and log from it in under 30 seconds with at most two taps after opening Quick Add.
- **SC-004**: When test data satisfies leak rules, 100% of review sessions show at least one time-leak card with accurate category name and direction of change.
- **SC-005**: When test data spans multiple hours, best-hours cards show hour ranges that match manual aggregation for the selected period.
- **SC-006**: Changing analytics date range updates all visible charts and insight cards within one interaction cycle (no stale mixed ranges).
- **SC-007**: Reflection streak increments on consecutive local days and resets after a missed local day in 100% of scripted date-sequence tests.
- **SC-008**: Zero regression on Phase 1 acceptance checks for auth, time entry CRUD, dashboard baseline, and reflection upsert.
- **SC-009**: In moderated comparison, at least 80% of participants rate Phase 2 UI as "more polished" or "more interactive" than Phase 1 on dashboard, Quick Add, and analytics.
- **SC-010**: All primary flows remain usable on a 375px-wide viewport without horizontal scroll.

## Assumptions

- **Baseline**: Phase 1 (including Phase 1 completion) is complete: auth, time entry CRUD, dashboard, analytics baseline, reflection upsert, category management, and chart visualizations exist.
- **Week boundaries**: "This week" and "Last week" use Monday–Sunday in the user's local timezone, consistent with Phase 1.
- **Time leak thresholds**: Current week ≥60 minutes, current week ≥30 minutes to qualify category, week-over-week increase ≥20% versus prior week—aligned with project product rules. Time leaks always use calendar weeks; best-hours and correlation use the picker’s selected range.
- **Correlation rule**: Compare average **productivity score (1–10)** on days with ≥120 minutes in a focus category (default: coding-related) versus days below that threshold; require ≥5 qualifying days and ≥1.5 point average difference to show insight. Daily mood (great | good | okay | low | bad) is not used for correlation.
- **Parsing scope**: English-oriented duration tokens (h, hr, hour(s), m, min, minute(s)); title cleanup strips phrases like "worked on" and trailing "for".
- **Keyword defaults**: On registration, seed common mappings (e.g. coding/dev → coding category, streaming keywords → entertainment). Keyword management UI is out of scope for Phase 2; users correct mispredictions via category override on Quick Add.
- **Evening reflection nudge (nice-to-have)**: If implemented after core P1/P2 work, in-app only (no push), after 8:00 PM local when no reflection today, dismissible per day—**not required** for Phase 2 sign-off.
- **Onboarding**: Three-step first-run tour; completion stored per device in preferences.
- **Privacy**: Same single-user data isolation as Phase 1; no shared templates or keywords across accounts.
- **Data for validation**: Teams validating insights should have at least seven days of varied test entries and reflections.

## Dependencies

- **Feature 001-core-web-mvp** and **002-phase-1-completion**: Auth, entities, timezone rules, dashboard, categories, analytics baseline, reflections.
- **Phase document**: `phases/phase-2-ux-enhancements.md` for detailed acceptance examples and non-goals.
- **Constitution**: UX principles (keyboard-first, insights required, mobile-first, polished UI).

## Out of Scope

- Offline queue, service worker caching, installable PWA (Phase 3).
- Push notifications (Phase 4).
- AI or LLM-based parsing.
- Automatic application or browser tab tracking.
- Multi-user teams or shared workspaces.
- CSV or data export (defer).
- Native app store builds.
