# Research: 002-phase-1-completion

**Date**: 2026-05-16  
**Status**: Complete — no open NEEDS CLARIFICATION items

## R1: Category donut on dashboard

**Decision**: Reuse **vue-echarts** pie/donut chart in a **client-only** component (`CategoryDonut.client.vue`), same pattern as `WeeklyChart.client.vue`, fed by existing `GET /api/analytics/categories` with `from`/`to` date strings in user's IANA timezone.

**Rationale**:
- `dashboard` store already fetches category breakdown for default week range.
- 001 plan specified donut on dashboard; ECharts already a dependency.
- Client-only avoids SSR `document` errors.

**Alternatives considered**:
- CSS-only donut — rejected (harder to match category colors/percent labels).
- Embed breakdown only in analytics page — rejected (FR-001 / spec US1).

---

## R2: Productivity on dashboard

**Decision**: Extend `dashboard.refresh()` to parallel-fetch `GET /api/reflections/today?timezone=` and map `productivityScore` (nullable) into store state; `TodaySummaryCard` already accepts optional prop.

**Rationale**:
- Backend route exists; no new API.
- Single refresh cycle keeps summary + reflection in sync after navigation from `/reflection`.

**Alternatives considered**:
- Pinia reflection store — rejected as extra scope; dashboard store sufficient.
- Embed mood on dashboard — out of spec (productivity only).

---

## R3: Category management UI

**Decision**: New page **`/settings`** with `CategoryForm` + `CategoryList`; extend Pinia `categories` store with POST/PATCH/DELETE. **Preset icon list** (~12 lucide names aligned with seeds) and **preset color palette** (~8 hex swatches).

**Rationale**:
- REST CRUD already in `backend/src/routes/categories.ts`.
- Spec allows settings without fifth bottom-tab; header link satisfies US4.

**Alternatives considered**:
- Section on `/add` — rejected (clutters quick log flow).
- Custom icon upload — rejected per spec assumptions.

---

## R4: Toast and skeleton polish

**Decision**: Add shadcn-vue **Toast** (global provider in `app.vue` or layout) and **Skeleton** primitives; `useToast()` for mutations; skeleton layouts mirroring card grid on dashboard/analytics.

**Rationale**:
- Constitution FR-020; 001 tasks T003/T084 called these out but were not completed.
- Non-blocking toasts pair with existing `useApi` 401 redirect behavior.

**Alternatives considered**:
- Inline-only messages — rejected (spec FR-008 asks non-blocking success feedback).
- Nuxt UI / other library — rejected (constitution: shadcn-vue).

---

## R5: Today vs this week for category breakdown

**Decision**: Local toggle on dashboard sets `from`/`to` to either **today's local date** (start/end of day) or **current ISO week** Mon–Sun via existing `dayjs` + timezone composable (same math as analytics page).

**Rationale**: Spec US1 acceptance scenario 2; reuses proven date logic from `analytics.vue`.

**Alternatives considered**:
- Server-side `period=today|week` query param — rejected (unnecessary API change; `from`/`to` already supported).

---

## R6: Backend / schema changes

**Decision**: **None** for this feature.

**Rationale**: All entities and routes exist from 001; gaps are frontend wiring and UX only.

**Verification**: Confirm `DELETE /api/categories/:id` sets `category_id` null on entries (existing ON DELETE SET NULL).
