import { Hono } from 'hono'
import { z } from 'zod'
import { reflectionSchema } from '@wheredidmytimego/shared'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { parseJson, parseQuery } from '../lib/validate'
import { getReflectionForToday, upsertReflectionToday } from '../services/reflections'
import { getReflectionStreak } from '../services/reflections/streak'
import { normalizeIanaTimezone } from '../lib/timezone'

const timezoneQuery = z.object({
  timezone: z.string().min(1).transform(normalizeIanaTimezone)
})

export const reflectionRoutes = new Hono<{ Variables: AuthVariables }>()

reflectionRoutes.use('*', requireAuth)

reflectionRoutes.get('/today', async (c) => {
  const query = parseQuery(c, timezoneQuery)
  if (query instanceof Response) return query
  const row = await getReflectionForToday(c.get('userId'), query.timezone)
  return c.json(row)
})

reflectionRoutes.get('/streak', async (c) => {
  const query = parseQuery(c, timezoneQuery)
  if (query instanceof Response) return query
  const streak = await getReflectionStreak(c.get('userId'), query.timezone)
  return c.json(streak)
})

reflectionRoutes.put('/today', async (c) => {
  const query = parseQuery(c, timezoneQuery)
  if (query instanceof Response) return query

  const body = await parseJson(c, reflectionSchema)
  if (body instanceof Response) return body

  const row = await upsertReflectionToday(c.get('userId'), query.timezone, body)
  return c.json(row)
})
