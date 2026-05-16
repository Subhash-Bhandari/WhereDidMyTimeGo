import type { Context } from 'hono'
import type { z } from 'zod'
import { badRequest } from './errors'

export async function parseJson<T extends z.ZodType>(
  c: Context,
  schema: T
): Promise<z.infer<T> | Response> {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return badRequest(c, 'Invalid JSON body')
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return badRequest(c, 'Validation failed', parsed.error.flatten())
  }
  return parsed.data
}

export function parseQuery<T extends z.ZodType>(
  c: Context,
  schema: T
): z.infer<T> | Response {
  const query = Object.fromEntries(
    Object.entries(c.req.query()).map(([k, v]) => [k, v === '' ? undefined : v])
  )
  const parsed = schema.safeParse(query)
  if (!parsed.success) {
    return badRequest(c, 'Invalid query parameters', parsed.error.flatten())
  }
  return parsed.data
}
