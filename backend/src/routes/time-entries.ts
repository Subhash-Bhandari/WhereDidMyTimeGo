import { Hono } from 'hono'
import { z } from 'zod'
import { timeEntryCreateSchema, timeEntryUpdateSchema } from '@wheredidmytimego/shared'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { parseJson, parseQuery } from '../lib/validate'
import { notFound } from '../lib/errors'
import {
  createTimeEntry,
  deleteTimeEntry,
  getTimeEntry,
  listToday,
  updateTimeEntry
} from '../services/timeEntries'
import { normalizeIanaTimezone } from '../lib/timezone'
import { findIdempotentResponse, storeIdempotentResponse } from '../services/idempotency'

const timezoneQuery = z.object({
  timezone: z.string().min(1).transform(normalizeIanaTimezone)
})

export const timeEntryRoutes = new Hono<{ Variables: AuthVariables }>()

timeEntryRoutes.use('*', requireAuth)

timeEntryRoutes.get('/today', async (c) => {
  const query = parseQuery(c, timezoneQuery)
  if (query instanceof Response) return query
  const rows = await listToday(c.get('userId'), query.timezone)
  return c.json(rows)
})

function serializeTimeEntryRow(row: Awaited<ReturnType<typeof createTimeEntry>>) {
  return {
    ...row,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt.toISOString(),
    createdAt: row.createdAt.toISOString()
  }
}

timeEntryRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const idempotencyKey = c.req.header('Idempotency-Key')?.trim()

  if (idempotencyKey) {
    const replay = await findIdempotentResponse(userId, idempotencyKey)
    if (replay) {
      return c.json(replay, 201)
    }
  }

  const body = await parseJson(c, timeEntryCreateSchema)
  if (body instanceof Response) return body
  const row = await createTimeEntry(userId, body)
  const payload = serializeTimeEntryRow(row)

  if (idempotencyKey) {
    await storeIdempotentResponse(userId, idempotencyKey, payload)
  }

  return c.json(payload, 201)
})

timeEntryRoutes.patch('/:id', async (c) => {
  const entryId = Number(c.req.param('id'))
  if (!Number.isFinite(entryId)) {
    return notFound(c, 'Invalid entry id')
  }

  const existing = await getTimeEntry(c.get('userId'), entryId)
  if (!existing) {
    return notFound(c, 'Time entry not found')
  }

  const body = await parseJson(c, timeEntryUpdateSchema)
  if (body instanceof Response) return body

  const row = await updateTimeEntry(c.get('userId'), entryId, body)
  return c.json(row)
})

timeEntryRoutes.delete('/:id', async (c) => {
  const entryId = Number(c.req.param('id'))
  if (!Number.isFinite(entryId)) {
    return notFound(c, 'Invalid entry id')
  }

  const row = await deleteTimeEntry(c.get('userId'), entryId)
  if (!row) {
    return notFound(c, 'Time entry not found')
  }
  return c.body(null, 204)
})
