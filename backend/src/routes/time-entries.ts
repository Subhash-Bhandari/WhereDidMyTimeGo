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

timeEntryRoutes.post('/', async (c) => {
  const body = await parseJson(c, timeEntryCreateSchema)
  if (body instanceof Response) return body
  const row = await createTimeEntry(c.get('userId'), body)
  return c.json(row, 201)
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
