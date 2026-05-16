# Contracts: 002-phase-1-completion

## HTTP API

**No changes** to the public HTTP contract for this feature.

Use the authoritative OpenAPI document from the MVP feature:

- [`specs/001-core-web-mvp/contracts/openapi.yaml`](../001-core-web-mvp/contracts/openapi.yaml)

### Endpoints consumed by new UI

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/analytics/categories?timezone&from&to` | Dashboard donut + period toggle |
| `GET` | `/api/reflections/today?timezone` | Dashboard productivity score |
| `GET` | `/api/categories` | Settings list, Quick Add picker |
| `POST` | `/api/categories` | Create category |
| `PATCH` | `/api/categories/{id}` | Update category |
| `DELETE` | `/api/categories/{id}` | Delete category (entries → uncategorized) |

All routes require session cookie auth (same as 001).

## UI routes (new)

| Route | Auth | Description |
|-------|------|-------------|
| `/settings` | Yes | Category list + create/edit form |

Existing routes gain polish only: `/`, `/add`, `/analytics`, `/reflection`.

## Store contract (frontend)

```text
categories.createCategory({ name, color, icon }) → Category
categories.updateCategory(id, partial) → Category
categories.deleteCategory(id) → void
dashboard.refresh() → loads summary, weekly, categoryBreakdown, todayEntries, productivityScore
```

## Component contract (frontend)

| Component | Props / events |
|-----------|----------------|
| `CategoryDonut` | `items: { categoryName, color, totalMinutes, percent }[]`, `loading?: boolean`; optional `period` + `@update:period` |
| `CategoryForm` | `category?` (edit), `@submit`, `@cancel` |
| `CategoryList` | `categories`, `@edit`, `@delete` |
