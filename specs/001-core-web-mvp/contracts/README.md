# API Contracts — 001-core-web-mvp

- **OpenAPI**: [openapi.yaml](./openapi.yaml)
- **Base URL (dev)**: `http://localhost:3001`
- **Auth**: httpOnly cookie `session_id` after login/register
- **Errors**: `{ "error": string, "details"?: object }`

Frontend dev proxy: Nuxt forwards `/api/*` → backend (see `frontend/nuxt.config.ts`).
