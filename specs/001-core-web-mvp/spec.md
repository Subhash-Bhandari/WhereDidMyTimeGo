# Feature Specification: Core Web App — Manual Time Tracking MVP

**Feature Branch**: `001-core-web-mvp`

**Created**: 2026-05-15

**Status**: Clarified

**Input**: Phase 1 from `phases/phase-1-core-web-app.md` — Build a complete manual time-tracking MVP where authenticated users log time, view today/weekly stats, browse analytics, and submit daily reflections. Responsive, highly interactive, visually polished web experience. Manual entry only.

## Clarifications

### Session 2026-05-15

- Q: How are "this week" and "last week" defined for dashboard and analytics? → A: Calendar week Monday–Sunday in the user's local timezone (current Mon–Sun = this week; previous Mon–Sun = last week).
- Q: What minimum time qualifies a category for a "time leak" insight (>20% week-over-week)? → A: At least 60 minutes logged to that category in the current calendar week.
- Q: Can users edit existing time entries in Phase 1? → A: Yes — full edit of title, category, duration, and start/end times (not delete-only).
- Q: How is daily reflection "mood" captured? → A: Required fixed 5-level scale: great, good, okay, low, bad (labels and/or emoji).
- Q: What are the password rules at registration? → A: Minimum 8 characters (no additional complexity requirements).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure account and private data (Priority: P1)

As a new user, I create an account and sign in so that only I can see and manage my time data.

**Why this priority**: Without authentication and data isolation, the product cannot be used safely for personal tracking.

**Independent Test**: Register a new account, sign out, sign in again, and confirm protected areas are inaccessible when signed out.

**Acceptance Scenarios**:

1. **Given** a visitor on the sign-up screen, **When** they submit valid email, password (at least 8 characters), and display name, **Then** an account is created and they are signed in.
2. **Given** a visitor on the sign-up screen, **When** they submit a password shorter than 8 characters, **Then** the system shows a clear validation message and does not create the account.
3. **Given** a registered user, **When** they sign in with correct credentials, **Then** they reach the main dashboard.
4. **Given** a signed-in user, **When** they sign out, **Then** they cannot access dashboard, logging, analytics, or reflection until they sign in again.
5. **Given** two separate accounts with data, **When** user A is signed in, **Then** user A never sees user B's entries, categories, or reflections.

---

### User Story 2 - Fast manual time logging (Priority: P1)

As a signed-in user, I log what I did, for how long, and under which category, so that I capture my day without friction.

**Why this priority**: Logging is the core action; everything else depends on reliable time entries.

**Independent Test**: Sign in, log a 1-hour activity with title and category using quick duration controls, and confirm it appears via `GET /api/time-entries/today` with correct duration. Edit/delete on the dashboard today list is covered by User Story 3.

**Acceptance Scenarios**:

1. **Given** a signed-in user on Quick Add, **When** they enter a title, pick a category (from `GET /api/categories`), select a duration shortcut (e.g. 1 hour), and submit, **Then** a new time entry is saved.
2. **Given** a signed-in user, **When** they type a shorthand like "DSA 2h" and confirm the parsed title and duration, **Then** the entry saves with those values.
3. **Given** a signed-in user, **When** they submit without a title, **Then** the system shows a clear validation message and does not save.
4. **Given** the Quick Add page optional test list, **When** the user edits or deletes an entry in isolation, **Then** the API reflects the change (dashboard integration is US3).

---

### User Story 3 - Dashboard: where did my time go today? (Priority: P1)

As a signed-in user, I open the home dashboard and immediately see how I spent today and the past week, so that I understand my time at a glance.

**Why this priority**: Answers the primary product question: "Where did my time go today?"

**Independent Test**: After logging multiple entries across categories, open dashboard and verify today total, weekly chart, category breakdown, and entry list match logged data.

**Acceptance Scenarios**:

1. **Given** entries logged today totaling 90 minutes, **When** the user opens the dashboard, **Then** today's total displays as a human-readable duration (e.g. 1h 30m) and entry count is correct.
2. **Given** entries across the current calendar week (Monday–Sunday, local time), **When** the user views the weekly chart, **Then** each day Mon–Sun shows the correct total duration for that day.
3. **Given** entries in multiple categories today or this week, **When** the user views category distribution, **Then** proportions reflect logged time per category with category colors.
4. **Given** no entries today, **When** the user opens the dashboard, **Then** they see a helpful empty state with a clear action to log time.
5. **Given** an existing entry on the dashboard today list, **When** the user edits any field (title, category, duration, start/end) or deletes it, **Then** dashboard totals and charts update accordingly (FR-008).
6. **Given** a reflection with productivity score today, **When** the user views the dashboard, **Then** the latest productivity score is shown or a neutral placeholder if none exists.

---

### User Story 4 - Analytics: spot patterns and leaks (Priority: P2)

As a signed-in user, I review analytics for this week versus last week, so that I notice where time increased and which hours I use most.

**Why this priority**: Delivers insight beyond raw totals; motivates continued use.

**Independent Test**: With data in two consecutive weeks, open analytics and verify weekly comparison, category table, basic "time leak" message when a category grew >20%, and top focus hours.

**Acceptance Scenarios**:

1. **Given** logged time this calendar week (Mon–Sun) and last calendar week, **When** the user selects "This week" or "Last week", **Then** charts and tables update for that Monday–Sunday period in local time.
2. **Given** category totals for both weeks, **When** one category has at least 60 minutes in the current week and grew more than 20% versus last week, **Then** the user sees an insight card naming the category and percent change.
3. **Given** entries with start times, **When** the user views best-hours insight, **Then** the top one or two hours by total logged minutes are shown in local time.

---

### User Story 5 - Daily reflection (Priority: P2)

As a signed-in user, I record mood, productivity, optional sleep, and notes once per calendar day, so that I connect how I feel with how I spent time.

**Why this priority**: Reflection differentiates the product from a simple timer; supports habit and self-awareness.

**Independent Test**: Submit a reflection, reload the page, confirm values persist; submit again same day and confirm update (not duplicate).

**Acceptance Scenarios**:

1. **Given** a signed-in user with no reflection today, **When** they select one mood (great, good, okay, low, or bad), set productivity (1–10), optional sleep hours and notes, and save, **Then** the reflection is stored for today's calendar date.
2. **Given** a reflection already saved today, **When** the user changes values and saves again, **Then** the same day's reflection updates without creating a second record.
3. **Given** a saved reflection today, **When** the user opens the dashboard, **Then** productivity score from that reflection is reflected where applicable.

---

### User Story 6 - Categories and mobile-friendly experience (Priority: P2)

As a signed-in user, I organize entries with personal categories and use the app on my phone, so that logging fits my life context.

**Why this priority**: Categories structure analytics; mobile-first use is a core product constraint.

**Independent Test**: Create a custom category, log an entry under it, use bottom navigation on a narrow viewport (375px), complete a log without horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** a new account, **When** the user first signs in, **Then** sensible default categories exist (e.g. Coding, Learning, Entertainment, Health, Other).
2. **Given** a signed-in user, **When** they create a category with name, color, and icon, **Then** it appears in Quick Add and analytics.
3. **Given** a mobile viewport, **When** the user navigates the app, **Then** primary routes are reachable via bottom tab bar with thumb-friendly tap targets.
4. **Given** any interactive control, **When** the user hovers, focuses, or taps, **Then** visual feedback confirms the interaction (not static wireframe-quality UI).

---

### Edge Cases

- User logs an entry spanning midnight local time — duration and "today" attribution follow the entry's start time in the user's local calendar day.
- User changes device timezone — display uses current local timezone; historical entries remain stored consistently (canonical UTC storage, local display).
- User deletes a category that has entries — entries remain but show as uncategorized (category reference cleared).
- User submits reflection at 11:59 PM and again at 12:01 AM — two separate calendar days, two separate reflection records.
- Session expires while filling a form — user sees a clear sign-in prompt; unsaved form data is not falsely reported as saved.
- Very long title or notes — system enforces reasonable length limits with user-visible validation.
- First visit with zero data — every main screen has an empty state with guidance, not blank layouts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email, password (minimum 8 characters), and display name, rejecting shorter passwords with a clear validation message.
- **FR-002**: System MUST allow users to sign in and sign out securely.
- **FR-003**: System MUST ensure each user can only access their own categories, time entries, and reflections.
- **FR-004**: System MUST provide default categories for new users to start logging immediately.
- **FR-005**: Users MUST be able to create, view, update, and delete their own categories (name, color, icon).
- **FR-006**: Users MUST be able to create time entries with title, optional category, duration, and start/end times.
- **FR-007**: System MUST validate that entry duration is consistent with start and end times (within a one-minute tolerance).
- **FR-008**: Users MUST be able to view, fully update (title, category, duration, start/end times), and delete their own time entries.
- **FR-009**: System MUST show today's entries and total logged minutes on the dashboard.
- **FR-010**: System MUST show a weekly visualization of total minutes per day for the current calendar week (Monday through Sunday, user's local timezone).
- **FR-011**: System MUST show category distribution for today or the current calendar week (Mon–Sun, local time) on the dashboard.
- **FR-012**: System MUST show a comparison of today's totals versus yesterday and current calendar week totals versus the prior calendar week (Mon–Sun, local time) where applicable.
- **FR-013**: Users MUST be able to log time via quick duration shortcuts (e.g. 15m, 30m, 1h, 2h) without typing exact times.
- **FR-014**: Users MUST be able to enter shorthand text (e.g. "DSA 2h") and confirm parsed title and duration before saving.
- **FR-015**: Analytics MUST support viewing "this week" (current Mon–Sun, local time) and "last week" (previous Mon–Sun, local time) with weekly trend and per-category totals.
- **FR-016**: Analytics MUST surface a "time leak" insight when a category has at least 60 minutes in the current calendar week AND its time increased more than 20% compared to the previous calendar week.
- **FR-017**: Analytics MUST surface top one or two hours of day by logged minutes (in user's local time).
- **FR-018**: Users MUST be able to submit one reflection per local calendar day including required mood (one of: great, good, okay, low, bad), productivity score (1–10), optional sleep hours, and optional notes.
- **FR-019**: System MUST update the same day's reflection on subsequent saves rather than creating duplicates.
- **FR-020**: System MUST present a polished, interactive interface: loading states, success/error feedback, empty states, and consistent visual hierarchy on all primary screens.
- **FR-021**: System MUST be fully usable on viewports down to 375px width without horizontal scrolling on primary flows.
- **FR-022**: System MUST use manual time entry only; automatic tracking of apps, tabs, or device activity is out of scope.

### Key Entities

- **User**: Account owner; email, display name; owns all personal data.
- **Category**: User-defined label for grouping time (name, color, icon); optional on entries.
- **Time Entry**: A logged block of activity (title, category, start time, end time, duration in minutes); belongs to one user.
- **Daily Reflection**: One record per user per calendar day (mood: great | good | okay | low | bad; productivity score 1–10; optional sleep hours; optional notes).
- **Analytics aggregates**: Derived views (daily totals, weekly totals, category percentages, period comparisons, focus hours) — not stored as separate user-edited entities in MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can register, log their first time entry, and see it on the dashboard in under 3 minutes without assistance.
- **SC-002**: A returning user can log a typical entry (title + category + quick duration) in under 10 seconds after reaching Quick Add.
- **SC-003**: 100% of dashboard today totals match the sum of that user's entries for the local calendar day in acceptance testing.
- **SC-004**: Zero cross-account data visibility in multi-user acceptance tests (privacy requirement).
- **SC-005**: At least 90% of primary tasks (log time, view dashboard, save reflection) complete successfully on first attempt in moderated usability tests (no silent failures).
- **SC-006**: All primary screens remain usable at 375px viewport width without horizontal scroll.
- **SC-007**: Stakeholders can demo the product without describing the UI as "unfinished" or "placeholder" (qualitative review against polish requirements in FR-020).

## Assumptions

- **Authentication**: Email and password with secure password storage and session-based sign-in (industry-standard web app pattern). Passwords require at least 8 characters at registration; no symbol/number rules in MVP.
- **Users**: Individual personal tracking; no teams, sharing, or admin roles in this phase.
- **Time zones**: Entries stored in a canonical UTC form; all dates and "today" boundaries shown in the user's local timezone (default browser timezone until user settings exist).
- **Week boundaries**: "This week" and "last week" mean calendar weeks Monday–Sunday in the user's local timezone, not rolling 7-day windows.
- **Reflection day boundary**: One reflection per local calendar day for the signed-in user.
- **Category deletion**: Deleting a category does not delete entries; entries become uncategorized.
- **Connectivity**: Online use required for MVP; offline logging and installable app are future phases.
- **Scope boundaries**: No email verification, password reset, social login, automatic activity tracking, export, or AI parsing in this phase (see `phases/phase-1-core-web-app.md` non-goals).
- **Implementation reference**: Technical architecture, API contracts, and UI component guidance live in `phases/phase-1-core-web-app.md` and `CONSTITUTION.md` for the planning phase — this spec defines product behavior only.

## Dependencies

- Existing project scaffold (monorepo with frontend, backend, and shared database package) per repository README.
- PostgreSQL database available for persistence.
- Phase document `phases/phase-1-core-web-app.md` as the detailed implementation companion for `/speckit-plan`.
