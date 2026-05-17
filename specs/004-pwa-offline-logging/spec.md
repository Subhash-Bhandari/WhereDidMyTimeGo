# Feature Specification: Installable PWA with Offline Time Logging (Phase 3)

**Feature Branch**: `004-pwa-offline-logging`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: Phase 3 — PWA from `phases/phase-3-pwa.md`: convert the web app into an installable progressive web application with offline time logging and automatic sync when connectivity returns—no data loss, clear offline/sync status, same product codebase as Phases 1–2.

## Clarifications

### Session 2026-05-17

- Q: For Phase 3 minimum, what offline dashboard behavior is required—message-only, best-effort cache, or required cache? → A: **Best-effort cache** — if dashboard data was cached from a prior online visit, show that snapshot offline; otherwise show a clear offline message directing users to Quick Add (no live fetch required).
- Q: Where should pending (not-yet-synced) offline entries appear before sync completes? → A: **Dashboard + list** — pending entries appear on dashboard and entry list immediately with distinct styling until synced or removed.
- Q: How should the app determine it is online enough to sync? → A: **Browser + verify** — use `navigator.onLine` and connectivity events as the first signal; when true, confirm API reachability with a lightweight same-origin check before starting sync; remain queued if the check fails.
- Q: Where should the sync issues UI live—dedicated page, modal, or both? → A: **Dedicated page** — route such as `/settings/sync`, linked from settings/profile failed-count badge.
- Q: What happens to the unsynced queue on explicit sign-out? → A: **Prompt then clear** — if the queue is non-empty, warn and offer sync now or discard; on sign-out without successful sync, clear all pending/failed queue entries on the device (session expiry without sign-out still preserves queue until re-auth).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install the app on my device (Priority: P1)

As a signed-in user, I install Where Did My Time Go to my phone or desktop home screen and open it without browser chrome, so that logging feels like a native daily app.

**Why this priority**: Installability is the foundation of the Phase 3 product goal; offline logging matters most when the app is opened from the home screen in the field.

**Independent Test**: On a supported browser, complete install (or follow documented iOS steps); launch from home screen; confirm standalone presentation and recognizable app name/icon.

**Acceptance Scenarios**:

1. **Given** a supported browser and a secure (HTTPS) deployment, **When** the user installs the app, **Then** the home screen shows the product name and icon consistent with brand (full name "Where Did My Time Go", short label "TimeGo").
2. **Given** an installed app, **When** the user opens it from the home screen, **Then** it launches in standalone mode without browser address bar chrome.
3. **Given** a user on a second or later visit who has not dismissed install guidance recently, **When** the browser supports install prompts, **Then** a dismissible in-app banner offers installation; dismissing it does not reappear for seven days on that device.
4. **Given** a user on iOS Safari (no native install prompt), **When** they have not installed, **Then** clear in-app instructions explain how to use "Add to Home Screen."
5. **Given** install guidance was dismissed within the cooldown window, **When** the user returns, **Then** the install banner stays hidden until the cooldown expires.

---

### User Story 2 - Log time while offline (Priority: P1)

As a signed-in user, I create a time entry on Quick Add when I have no network, so that travel or poor connectivity never blocks my habit.

**Why this priority**: Offline create is the core value proposition—users must trust they can log anywhere.

**Independent Test**: Disable network; log via Quick Add; confirm immediate feedback, pending visual state, and entry retained locally until sync.

**Acceptance Scenarios**:

1. **Given** the device is offline, **When** the user submits a valid Quick Add entry, **Then** the app saves it locally immediately and shows non-blocking confirmation that it will sync when online (not a fake "saved to server" message).
2. **Given** a locally saved pending entry, **When** the user views the dashboard or entry list, **Then** the entry appears immediately alongside server-backed entries with visually distinct styling (e.g. dashed border, sync icon, pending badge)—not only after sync or failure.
3. **Given** the device is online, **When** the user submits Quick Add, **Then** the existing direct-save flow applies without unnecessary queuing.
4. **Given** offline mode, **When** the user opens the primary logging screen (`/add` or equivalent Quick Add route), **Then** the full create flow remains usable.
5. **Given** timestamps for an offline entry, **When** queued, **Then** start/end times reflect the user's intended log times captured at queue time (presented in local time in the UI).

---

### User Story 3 - See offline and sync status at all times (Priority: P1)

As a signed-in user, I always know whether I am offline, syncing, or have sync problems, so that I trust the app with my data.

**Why this priority**: Transparency prevents duplicate logging and support anxiety when connectivity is intermittent.

**Independent Test**: Toggle offline/online in test environment; observe global indicator, syncing message with count, and failed-item badge.

**Acceptance Scenarios**:

1. **Given** the device loses connectivity, **When** the user is in the app, **Then** a persistent, styled indicator shows they are offline and changes will sync when connected (not a browser alert).
2. **Given** one or more pending entries and connectivity restored, **When** sync runs, **Then** the indicator shows syncing progress including how many entries are in flight.
3. **Given** entries that failed sync due to validation or permanent errors, **When** the user is anywhere in the app, **Then** a visible badge or link on settings/profile shows the failed count and navigates to the sync issues page.
4. **Given** connectivity returns, **When** sync completes successfully, **Then** pending indicators clear and the dashboard reflects server-backed entries within 30 seconds under normal conditions.

---

### User Story 4 - Automatic sync when back online (Priority: P1)

As a signed-in user, I do not manually retry uploads when my connection returns, so that offline logs appear on my dashboard without extra steps.

**Why this priority**: Automatic sync closes the offline loop; manual-only retry would erode trust.

**Independent Test**: Queue entries offline; restore network; verify entries appear on dashboard once with correct data and no duplicates.

**Acceptance Scenarios**:

1. **Given** pending entries and restored connectivity, **When** the browser reports online and a lightweight API reachability check succeeds, **Then** the app attempts sync automatically without user action.
2. **Given** a pending entry and successful server acceptance, **When** sync completes, **Then** the local pending copy is removed and the dashboard updates to show the server-backed entry.
3. **Given** the same pending entry is submitted twice due to retries or background sync, **When** the server receives duplicates, **Then** only one time entry row exists (duplicate submission protection keyed by the client's stable local identifier).
4. **Given** transient server or network errors, **When** sync fails temporarily, **Then** the system retries with backoff up to a maximum of five attempts per entry before marking failed.
5. **Given** a validation error from the server (client fault), **When** sync is attempted, **Then** the entry is marked failed and not endlessly retried.

---

### User Story 5 - Resolve sync issues (Priority: P2)

As a signed-in user, I review failed offline entries, understand why they failed, and fix or remove them, so that I am never stuck with silent data loss.

**Why this priority**: Failed queue handling is required for trust when server rules reject a payload or auth lapses.

**Independent Test**: Force a 4xx validation failure after offline save; open sync issues UI; edit or delete local copy.

**Acceptance Scenarios**:

1. **Given** one or more failed queue items, **When** the user opens the sync issues page (e.g. `/settings/sync` from settings or the failed-count badge), **Then** each item shows a human-readable error summary.
2. **Given** a failed item the user can correct, **When** they choose edit and retry, **Then** they can adjust fields and re-attempt sync.
3. **Given** a failed item they no longer want, **When** they delete the local copy, **Then** it is removed from the queue and no longer counted in pending/failed badges.
4. **Given** session expired while entries were queued, **When** the user signs in again, **Then** queued entries remain and sync resumes after authentication.
5. **Given** a non-empty queue and the user chooses sign-out, **When** they confirm sign-out, **Then** they are warned with options to sync now or discard local copies; if they sign out without syncing, all pending/failed queue entries are cleared from the device.

---

### User Story 6 - Open a usable app shell offline (Priority: P2)

As a signed-in user who already visited the app online, I open the installed app with no network and still reach Quick Add quickly, so that offline logging is practical in the field.

**Why this priority**: Cached shell makes install + offline credible; without it, users see a blank browser error.

**Independent Test**: Visit app online once; go offline; relaunch; reach Quick Add and see offline messaging on dashboard if live data unavailable.

**Acceptance Scenarios**:

1. **Given** a prior successful visit while online, **When** the user opens the app offline, **Then** core layout and Quick Add route load without requiring a live network fetch for the app frame.
2. **Given** offline with no prior cached dashboard data, **When** the user opens home/dashboard, **Then** they see a helpful offline message directing them to log via Quick Add rather than a broken screen.
3. **Given** offline after at least one successful online dashboard load, **When** the user opens home/dashboard, **Then** they see the last cached dashboard snapshot (stale but readable) and offline status—not a live fetch or empty error.
4. **Given** offline, **When** the user attempts read-heavy views (e.g. analytics), **Then** the app shows last cached data if available, or a clear offline-only message—not misleading live data.

---

### Edge Cases

- User changes device clock while offline—queued timestamps may cluster oddly; acceptable for this phase; server does not rewrite client-supplied times for offline-origin entries.
- Auth cookie expires while queue holds entries—redirect to sign-in; queue preserved until re-auth, then sync resumes (distinct from explicit sign-out).
- Explicit sign-out with non-empty queue—user warned; may sync or discard; queue cleared on device if sign-out completes without sync (protects shared devices).
- Duplicate sync from online event plus periodic check—duplicate submission protection ensures one server row per local identifier.
- Browser reports online but API unreachable (captive portal, server down)—reachability check fails; entries stay queued; global indicator remains offline or degraded until check passes.
- Server returns 5xx or network timeout—increment retry count with exponential backoff; after max retries, mark failed.
- Server returns 4xx validation—instant failed state; user must fix via sync issues UI.
- User dismisses install banner—seven-day per-device cooldown before showing again.
- iOS Safari background sync limitations—best-effort sync when app is foregrounded; limitations documented for users (see Assumptions).
- Service worker or app version update—users receive updated shell without losing queued entries.
- Invalid entry queued offline (e.g. missing required field)—surfaces as failed after sync attempt with clear error, not silent drop.
- Phase 1–2 flows while online—no regression to auth, CRUD, dashboard, analytics, reflection, or Quick Add when connected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST be installable on major Chromium browsers (desktop and Android) with manifest metadata: full name, short name, description, theme/background colors, standalone display, portrait-primary orientation, and start URL at app root.
- **FR-002**: The application MUST ship home-screen icons at standard sizes including 192×192, 512×512, maskable 512×512, and Apple touch 180×180, using a clock/timer mark consistent with product brand.
- **FR-003**: The system MUST offer dismissible install guidance on supported browsers after meaningful engagement (e.g. second visit), with seven-day dismiss cooldown stored per device.
- **FR-004**: The system MUST show manual "Add to Home Screen" instructions on platforms without install prompts (iOS).
- **FR-005**: After first online visit, the app shell (layout and primary logging route) MUST be available offline so users can open and log without a network round-trip for the frame.
- **FR-006**: When offline, the dashboard MUST show the last cached snapshot if one exists from a prior online visit; otherwise it MUST show a clear offline message with a path to Quick Add. Analytics and other read-heavy views MAY use last cached data when available, or an offline-only message—never imply live data. Write operations MUST NOT report server success when offline—only local queue success.
- **FR-007**: Quick Add MUST enqueue time-entry creates locally when offline with a stable client-generated identifier, payload matching online create semantics, queue timestamp, status, retry count, and optional last error.
- **FR-008**: Quick Add MUST use direct server create when online, preserving Phase 1–2 behavior.
- **FR-009**: The system MUST show a global offline indicator whenever the device is offline; syncing state with count when uploads run; and a failed-count badge when sync issues exist.
- **FR-010**: Pending and syncing entries MUST appear on the dashboard and entry list as soon as queued, merged with server-backed entries, with visually distinct styling (styled, interactive—not browser alerts) until synced or removed.
- **FR-011**: The system MUST treat `navigator.onLine` and browser connectivity events as the first online signal; when online, it MUST confirm API reachability with a lightweight same-origin check before starting sync. It MUST automatically attempt sync when both signals pass, on a periodic interval while the app is visible (e.g. every 60 seconds), and via background sync when the platform supports it.
- **FR-012**: On successful server acceptance of a queued entry, the system MUST remove it from the local queue and refresh dashboard data.
- **FR-013**: The server MUST accept a duplicate-submission key (client local identifier) on time-entry create and return the same successful result if the key was already processed within a 24-hour window—preventing duplicate rows from retries.
- **FR-014**: On client validation errors (4xx), the system MUST mark the queue item failed without further automatic retry.
- **FR-015**: On transient errors (5xx/network), the system MUST retry with exponential backoff up to five attempts per item, then mark failed.
- **FR-016**: Users MUST have a dedicated sync issues page (e.g. `/settings/sync`) listing failed items with error text and actions to edit/retry or delete the local copy; reachable from settings and from the global failed-count badge.
- **FR-017**: Queued entries MUST survive app restarts and browser closes until synced or user-deleted.
- **FR-018**: Phase 3 minimum offline write scope is **time entry create only**; offline reflection save is out of scope (stretch for a later increment).
- **FR-019**: Phase 3 MUST NOT introduce push notifications, full offline analytics computation, biometric app lock, or conflict resolution for edited entries (deferred).
- **FR-020**: Phase 1–2 capabilities MUST remain functional when online with zero regression on existing acceptance checks.
- **FR-021**: Production deployment MUST use HTTPS (secure context); localhost exempt for development.
- **FR-022**: Product documentation MUST include a short "Offline behavior and limitations" section for users (especially iOS background sync constraints).
- **FR-023**: On explicit sign-out, if the queue is non-empty, the system MUST prompt the user to sync now or discard local copies; completing sign-out without a successful sync MUST clear all pending and failed queue entries on the device. Session expiry without sign-out MUST NOT clear the queue (entries sync after re-auth per existing rules).

### Key Entities

- **Queued time entry**: A not-yet-synced log created on device—stable local identifier, entry payload (title, times, category, etc.), queued-at timestamp, status (pending | syncing | failed), retry count, optional last error message.
- **Sync metadata**: Per-device record of last successful sync time for user feedback.
- **Duplicate-submission record**: Server-side record associating a client's local identifier with the already-created entry response, expiring after 24 hours—ensures idempotent create.
- **Install preference**: Per-device flag and timestamp for dismissed install banner (cooldown).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing on Chromium desktop or Android, 100% of install attempts succeed and launched app runs in standalone mode.
- **SC-002**: In scripted offline tests, 100% of valid Quick Add submissions while offline appear in pending UI within one interaction and survive app restart.
- **SC-003**: When connectivity is restored after queuing entries, 95% of test runs show dashboard updates with server-backed entries within 30 seconds without manual retry.
- **SC-004**: In duplicate-sync test scenarios (retry + background sync), zero duplicate time-entry rows are created for the same local identifier.
- **SC-005**: Users can identify offline, syncing, and failed states in under 3 seconds without leaving the current screen (global indicator always visible when applicable).
- **SC-006**: Standard installable-app audit checks (installability + registered offline capability) pass for the production build.
- **SC-007**: Offline and sync UI meets the same visual quality bar as Phase 2—styled components, no native browser alert dialogs for routine status.
- **SC-008**: Zero regression on Phase 1–2 acceptance checks when tested online.
- **SC-009**: Invalid offline payloads surface in sync issues with readable errors in 100% of scripted 4xx cases—never silent loss.

## Assumptions

- **Baseline**: Phases 1 and 2 are complete—auth, time entry CRUD, Quick Add (including natural language and templates), dashboard, analytics, reflection, and polished UI patterns exist.
- **Dependencies**: Phase 1 entry-create API and auth; Phase 2 Quick Add UX strongly recommended for offline path parity.
- **Secure context**: PWAs require HTTPS in production; local development may use localhost.
- **Auth with offline queue**: Session cookies work for same-origin API access when online; expired session redirects to login but preserves queue until re-auth. Explicit sign-out with a non-empty queue prompts sync-or-discard and clears the device queue if sign-out completes without sync.
- **Online detection**: `navigator.onLine` plus a lightweight same-origin reachability check before sync; failed check keeps queue pending and offline/degraded UI.
- **Time handling**: Store and transmit entry times in UTC; display in user's local timezone; server honors client-supplied start/end for offline-originated creates without overwriting from server clock.
- **Device clock skew**: If the user changes device time, queued entries may group oddly—acceptable for Phase 3 MVP.
- **iOS limitations**: Background Sync API is limited on iOS Safari—sync is best-effort when the app is open or foregrounded; document this for users.
- **Read caching**: Dashboard uses best-effort cache (last online snapshot when available, else offline message). Analytics and other reads follow the same best-effort pattern; minimum sign-off still requires full offline create on Quick Add.
- **Retry policy**: Maximum five retries per queued entry with exponential backoff; 4xx = immediate failed state.
- **Duplicate protection window**: Server remembers duplicate-submission keys for 24 hours per user.
- **Install banner**: Shown after second visit if install prompt available; seven-day dismiss cooldown in device storage.
- **Stretch (not required for Phase 3 sign-off)**: Offline reflection queue in a separate pending store.

## Dependencies

- **Feature 001-core-web-mvp** and **002-phase-1-completion**: Auth, time entry API, entities, timezone rules.
- **Feature 003-ux-insight-enhancements**: Quick Add and polish (recommended).
- **Phase document**: `phases/phase-3-pwa.md` for detailed acceptance examples and implementation ordering.
- **Constitution**: Mobile-first, polished UI, incremental shippable phases.

## Out of Scope

- Push notifications (Phase 4).
- Full offline analytics computation or chart derivation without network.
- Biometric or PIN app lock.
- Reliable background sync on iOS Safari beyond best-effort foreground sync.
- Conflict resolution when the same entry is edited on multiple devices (last-write-wins deferred).
- Offline reflection create/update (stretch only).
- Native app store builds (Phase 4 Capacitor).
- CSV export, multi-user teams, AI parsing, automatic tracking.
