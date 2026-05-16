# WhereDidMyTimeGo Constitution

This document defines the non-negotiable technical and product principles for this project.

## 1) Product Direction

- Build a personal time-tracking product that is fast to log, easy to reflect on, and useful for behavior change.
- Optimize for solo-developer execution and fast learning loops.
- Deliver value early with manual tracking; postpone heavy automation.

## 2) Core Architecture Commitments

- Monorepo with separate `frontend/` (Nuxt 3) and `backend/` (Hono API).
- UI: Tailwind CSS + shadcn-vue component system.
- State: Pinia for shared client state.
- Database: PostgreSQL in `packages/db` (Drizzle ORM, SQL-first).
- Validation: Zod at API boundaries.
- Shared types live in `packages/shared` when used by both apps.

## 3) API and Backend Rules

- All HTTP APIs live in `backend/` (not inside Nuxt `server/`).
- DB schema, migrations, and client live in `packages/db`.
- Keep route handlers thin: parse input, call domain logic, return typed response.
- Move complex analytics pipelines to dedicated services later (Go optional, not initial).

## 4) Data and Time Handling

- Store timestamps in UTC in database columns.
- Convert to user-local time only at presentation boundaries.
- Treat analytics as first-class product capability; schema and indexes must support trend queries.

## 5) UX Principles

- Mobile-first from day one.
- **Interactive, best-looking UI:** Prioritize a polished, modern interface — not wireframe-quality placeholders. Use shadcn-vue, Tailwind, subtle motion, and clear visual hierarchy so the app feels premium and fun to use daily.
- Fast logging over perfect forms (keyboard-first, shortcuts, natural language parsing).
- Reflection and insights are required features, not optional add-ons.
- Every major screen must stay usable on narrow mobile widths without horizontal scroll.

## 6) Platform Evolution Path

See `phases/README.md` for full specs.

- Phase 1: Core web MVP (Nuxt frontend + Hono backend).
- Phase 2: UX and insight enhancements (NLP parsing, streaks, charts).
- Phase 3: PWA via `@vite-pwa/nuxt` (installable, offline logging, sync).
- Phase 4: Capacitor wrappers for Android and iOS (native integrations).

## 7) Quality and Delivery Standards

- Prefer incremental shipping: each phase must end in a testable slice.
- Keep code modular and file boundaries clear.
- Avoid over-engineering early. If unsure, choose the simplest path that preserves future migration options.

## 8) Deferred Decisions

- Golang microservices are explicitly deferred until there is clear pressure from analytics/background workloads.
- Automatic tracking (browser/app instrumentation) is deferred due to privacy and implementation complexity.
