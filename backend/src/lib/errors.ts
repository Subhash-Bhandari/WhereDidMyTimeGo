import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export type ApiErrorBody = {
  error: string
  details?: unknown
}

export function jsonError(
  c: Context,
  status: ContentfulStatusCode,
  error: string,
  details?: unknown
) {
  const body: ApiErrorBody = { error }
  if (details !== undefined) body.details = details
  return c.json(body, status)
}

export function badRequest(c: Context, error: string, details?: unknown) {
  return jsonError(c, 400, error, details)
}

export function unauthorized(c: Context, error = 'Not authenticated') {
  return jsonError(c, 401, error)
}

export function forbidden(c: Context, error = 'Forbidden') {
  return jsonError(c, 403, error)
}

export function notFound(c: Context, error = 'Not found') {
  return jsonError(c, 404, error)
}

export function conflict(c: Context, error: string) {
  return jsonError(c, 409, error)
}
