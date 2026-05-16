# Research: 001-core-web-mvp

**Date**: 2026-05-15  
**Status**: Complete — no open NEEDS CLARIFICATION items

## R1: Authentication for Nuxt + Hono monorepo

**Decision**: Email/password with **bcrypt** password hashing and **httpOnly session cookie** (opaque session ID stored server-side or signed session payload in cookie).

**Rationale**:
- Matches spec assumptions and clarified password rule (min 8 chars).
- Works with Nuxt `credentials: 'include'` and existing CORS setup (`CORS_ORIGIN`).
- Simpler than OAuth for solo MVP; no third-party dependency.

**Alternatives considered**:
- JWT in localStorage — rejected (XSS exposure, constitution favors secure sessions).
- Mock dev-only auth — rejected post-clarification (real auth required for FR-003/SC-004).

**Implementation note**: Use `@hono/node-server` + custom auth middleware; store `sessions` table (`id`, `user_id`, `expires_at`) or use `hono/jwt` with httpOnly cookie — prefer **sessions table** for easy revocation on logout.

---

## R2: Week boundaries and analytics date math

**Decision**: Calendar weeks **Monday 00:00 – Sunday 23:59:59.999** in **browser-reported IANA timezone** (from `Intl.DateTimeFormat().resolvedOptions().timeZone`), passed to API as `timezone` query param on analytics routes until `user_settings` exists.

**Rationale**:
- Locked in clarification session 2026-05-15.
- Server computes week ranges in user's TZ using a library (e.g. `dayjs` + `timezone` plugin on backend).

**Alternatives considered**:
- UTC week boundaries — rejected (misaligns with user "today").
- Rolling 7 days — rejected by clarification.

---

## R3: Time leak insight threshold

**Decision**: Show insight when category has **≥60 minutes** current calendar week AND **>20% increase** vs previous calendar week (same Mon–Sun boundaries).

**Rationale**: Clarification session; prevents noisy alerts on small totals.

---

## R4: shadcn-vue + Nuxt 3 integration

**Decision**: Initialize shadcn-vue in `frontend/` per `components.json`; add primitives incrementally (Button, Card, Input, Select, Toast, Skeleton, Badge, Dialog).

**Rationale**: Constitution mandates shadcn-vue; `components.json` already exists at frontend root.

**Alternatives considered**:
- Raw Tailwind only — rejected (FR-020 polish bar).

---

## R5: Session auth transport from frontend

**Decision**: Single `useApi()` composable wrapping `$fetch` with `credentials: 'include'`; dev uses Nuxt `nitro.devProxy` `/api` → `localhost:3001`.

**Rationale**: README already documents proxy; avoids CORS cookie issues in dev.

---

## R6: Field length limits (deferred detail)

**Decision**:
| Field | Max length |
|-------|------------|
| title | 500 chars |
| notes | 2000 chars |
| category name | 80 chars |
| display name | 120 chars |

**Rationale**: Edge case in spec; reasonable defaults for Postgres `text`/`varchar` without UX burden.

---

## R7: Testing strategy (MVP)

**Decision**: Manual acceptance checklist (spec + phase doc) for Phase 1; optional follow-up: Vitest for `parseQuickEntry` util, Hono route tests with test DB — **not blocking** MVP ship.

**Rationale**: Constitution favors incremental delivery; solo-dev timeline ~4 days.

---

## R8: Password storage

**Decision**: `bcrypt` cost factor **12**; never return password hash in API responses.

**Rationale**: Industry standard; `bcrypt` widely used with Hono/Node.
