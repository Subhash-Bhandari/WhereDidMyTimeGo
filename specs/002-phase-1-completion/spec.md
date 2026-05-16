# Feature Specification: Phase 1 Completion — Dashboard, Categories & Polish

**Feature Branch**: `002-phase-1-completion`

**Created**: 2026-05-16

**Status**: Draft

**Input**: User description: "complete the remaining phase 1 features"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete dashboard at a glance (Priority: P1)

As a signed-in user, I open the home dashboard and see how my time splits across categories and how productive I felt today, so that I answer "where did my time go?" without visiting other screens.

**Why this priority**: The original Phase 1 spec (001) defines the dashboard as the primary product surface; category distribution and today's reflection score are explicit acceptance criteria still missing from the shipped experience.

**Independent Test**: Log time in at least two categories today, save a reflection with a productivity score, open the dashboard, and verify the category breakdown chart and productivity display match logged data.

**Acceptance Scenarios**:

1. **Given** entries in multiple categories for today or the current calendar week (Monday–Sunday, local time), **When** the user opens the dashboard, **Then** a category distribution visualization shows each category's share of time with distinct colors matching category labels.
2. **Given** a toggle or default for "today" versus "this week" on category distribution, **When** the user switches the period, **Then** proportions update to match entries in that period only.
3. **Given** a reflection saved for today with a productivity score, **When** the user opens the dashboard, **Then** today's productivity score is visible on the summary area.
4. **Given** no reflection saved today, **When** the user opens the dashboard, **Then** the productivity area shows a neutral placeholder (e.g. "Not logged yet") with an optional link to the reflection screen—not a blank or broken layout.
5. **Given** the user saves or updates a reflection, **When** they return to the dashboard, **Then** the productivity display updates without requiring a full app restart.

---

### User Story 2 - Manage personal categories (Priority: P1)

As a signed-in user, I create and edit my own categories (name, color, icon), so that time logging and analytics reflect how I organize my life.

**Why this priority**: Category management is required in the original Phase 1 spec (FR-005); the backend already supports it, but users cannot reach it from the app today.

**Independent Test**: Create a custom category from settings, log an entry under it on Quick Add, and confirm it appears in analytics category breakdown.

**Acceptance Scenarios**:

1. **Given** a signed-in user on the category management screen, **When** they create a category with name, color, and icon and save, **Then** the category appears in the list and is selectable when logging time.
2. **Given** an existing custom category, **When** the user edits name, color, or icon and saves, **Then** Quick Add and analytics show the updated label and color.
3. **Given** a category the user owns, **When** they delete it, **Then** it is removed from pickers and existing entries remain visible as uncategorized (not deleted).
4. **Given** default categories from registration, **When** the user views the list, **Then** defaults are shown and can be edited or deleted like custom categories unless product policy reserves system defaults (see Assumptions).
5. **Given** invalid input (empty name, name too long), **When** the user attempts to save, **Then** a clear validation message appears and nothing is saved.

---

### User Story 3 - Polished feedback on every primary screen (Priority: P2)

As a signed-in user, I see clear loading, success, error, and empty states on dashboard, Quick Add, analytics, and reflection, so that the app feels finished and trustworthy.

**Why this priority**: FR-020 in the original spec requires polish beyond "Loading…" text; this closes the gap between functional MVP and demo-ready Phase 1.

**Independent Test**: Throttle network or use an empty account; visit each primary route and confirm skeleton or placeholder loading, empty CTAs, and visible success/error after save actions.

**Acceptance Scenarios**:

1. **Given** data is loading for dashboard or analytics, **When** the user views those screens, **Then** skeleton placeholders approximate the final layout (not a single line of text).
2. **Given** a successful save (time entry, reflection, category), **When** the action completes, **Then** the user receives brief, non-blocking success feedback (toast or inline confirmation).
3. **Given** a failed save (network or validation), **When** the action fails, **Then** the user sees a clear error message and can retry without believing data was saved.
4. **Given** no data for a primary view (no entries today, no analytics for period, no categories beyond defaults), **When** the user opens that view, **Then** an empty state explains what to do next with a direct action (e.g. "Log time").
5. **Given** interactive controls on forms and navigation, **When** the user hovers, focuses, or taps, **Then** visual states distinguish default, hover, focus, disabled, and loading.

---

### User Story 4 - Reach category settings easily (Priority: P3)

As a signed-in user, I find category management from the main navigation, so that I do not hunt for a hidden screen.

**Why this priority**: Lower than core dashboard and forms; improves discoverability once management UI exists.

**Independent Test**: From dashboard on mobile (375px), open settings/categories in two taps or fewer from visible navigation.

**Acceptance Scenarios**:

1. **Given** a signed-in user on any primary screen, **When** they use app navigation, **Then** a path to category management is labeled clearly (e.g. "Categories" or "Settings").
2. **Given** mobile bottom navigation, **When** the user needs categories, **Then** they can reach management without horizontal scrolling or desktop-only menus.

---

### Edge Cases

- User has entries only in uncategorized — category chart shows a single "Uncategorized" slice or an empty-state message, not a broken chart.
- User deletes the last custom category — defaults from registration remain available.
- User saves reflection then immediately opens dashboard — productivity appears within one refresh cycle.
- Category name at maximum allowed length — displays without breaking layout on mobile.
- Session expires during category save — user is prompted to sign in; category is not falsely shown as saved.
- Analytics period has zero logged time — category table and charts show empty states, not errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Dashboard MUST display category time distribution for today and/or the current calendar week (Monday–Sunday, user's local timezone), using category colors from the user's category list.
- **FR-002**: Dashboard MUST display today's productivity score from the user's reflection for the current local calendar day, or a neutral placeholder when none exists.
- **FR-003**: Users MUST be able to create, update, and delete their own categories (name, color, icon) through a dedicated in-app management screen.
- **FR-004**: Category management MUST validate required fields and maximum lengths with user-visible messages before save.
- **FR-005**: Deleting a category MUST NOT delete time entries; affected entries MUST appear as uncategorized.
- **FR-006**: New and updated categories MUST appear in Quick Add and in analytics breakdowns without requiring re-registration.
- **FR-007**: Primary screens (dashboard, Quick Add, analytics, reflection) MUST show skeleton-style loading indicators while fetching data.
- **FR-008**: Successful mutations (log time, save reflection, save category) MUST provide non-blocking success feedback.
- **FR-009**: Failed mutations MUST show explicit error feedback; the system MUST NOT imply success when a save failed.
- **FR-010**: Primary screens with no relevant data MUST show guided empty states with a clear next action.
- **FR-011**: Interactive controls MUST provide distinct hover, focus-visible, and disabled states consistent across primary flows.
- **FR-012**: Navigation MUST expose category management from the main app chrome (header and/or mobile navigation).
- **FR-013**: This feature MUST NOT introduce automatic time tracking, offline mode, teams, or password reset (unchanged Phase 1 non-goals).
- **FR-014**: All behavior MUST remain scoped to the signed-in user's data (no cross-account visibility).

### Key Entities

- **Category**: User-owned label (name, color, icon); used by time entries and analytics views.
- **Time Entry**: Unchanged from Phase 1; may reference a category or none after category deletion.
- **Daily Reflection**: Unchanged from Phase 1; supplies productivity score for dashboard display.
- **Dashboard aggregates**: Category percentages and summary metrics derived from entries and reflections (read-only views).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of dashboard category slices match manual sums of entry minutes for the selected period (today or current week).
- **SC-002**: After saving a reflection, 100% of test users see the correct productivity score on the dashboard within one navigation or refresh.
- **SC-003**: A new user can create a custom category and log time under it in under 2 minutes without leaving the app.
- **SC-004**: All four primary routes (dashboard, Quick Add, analytics, reflection) pass empty-state and loading-state review on a 375px-wide viewport with no horizontal scroll.
- **SC-005**: Zero cross-account category or entry visibility in two-account privacy checks (inherits SC-004 from Phase 1).
- **SC-006**: Stakeholder demo checklist items 3–4 from Phase 1 manual testing (productivity on dashboard, category management) pass without workarounds.
- **SC-007**: At least 90% of save actions in moderated testing show visible success or error feedback within 2 seconds of completion.

## Assumptions

- **Baseline**: Core Phase 1 capabilities from `specs/001-core-web-mvp` are implemented (auth, time logging, analytics API, reflection API, mobile bottom navigation).
- **Backend**: Category create/update/delete APIs and analytics category breakdown already exist; this feature is primarily closing frontend and UX gaps.
- **Week boundaries**: "This week" means Monday–Sunday in the user's local timezone, consistent with 001.
- **Default categories**: Seeded categories on registration may be edited or deleted unless product owners later reserve them; default is full user control.
- **Category icons**: Chosen from a fixed preset list or simple text/icon picker—no custom image upload in this scope.
- **Settings placement**: A dedicated `/settings` or `/categories` page is acceptable; does not require a fifth bottom-tab item if reachable from header/menu.
- **Documentation**: Updating developer-facing API documentation in the repository README is part of implementation planning, not a separate user-facing requirement in this spec.
- **Privacy regression**: Re-running two-account isolation tests is required before marking Phase 1 complete but is an engineering acceptance activity, not a new user feature.

## Dependencies

- **Feature 001-core-web-mvp**: Product requirements, entities, timezone rules, and non-goals.
- **Phase document**: `phases/phase-1-core-web-app.md` acceptance checklist and manual test list.
- **Existing data**: Users, categories, time entries, and daily reflections already persisted for signed-in users.

## Out of Scope

- Natural language parsing improvements, offline/PWA, mobile app store builds, email verification, password reset, export, AI features (Phase 2+).
- Optional Quick Add "today's list" for isolated CRUD testing (engineering convenience only).
- Extracting every UI block into separate component files when inline implementation already meets acceptance criteria.
- Changing analytics algorithms (time leak thresholds, best-hours logic) beyond wiring existing insights to the UI.
