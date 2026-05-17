import { Hono } from 'hono'
import { z } from 'zod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezonePlugin from 'dayjs/plugin/timezone.js'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { parseQuery } from '../lib/validate'
import { normalizeIanaTimezone } from '../lib/timezone'
import { getAnalyticsInsights } from '../services/analytics/insights'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

const insightsQuery = z.object({
  timezone: z.string().min(1).transform(normalizeIanaTimezone),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryId: z.coerce.number().int().optional()
})

export const analyticsInsightsRoutes = new Hono<{ Variables: AuthVariables }>()

analyticsInsightsRoutes.use('*', requireAuth)

analyticsInsightsRoutes.get('/', async (c) => {
  const query = parseQuery(c, insightsQuery)
  if (query instanceof Response) return query

  const start = dayjs.tz(query.from, query.timezone).startOf('day')
  const end = dayjs.tz(query.to, query.timezone).endOf('day')
  if (end.isBefore(start)) {
    return c.json({ error: 'Invalid date range' }, 400)
  }

  const insights = await getAnalyticsInsights(
    c.get('userId'),
    query.timezone,
    { start: start.toDate(), end: end.toDate() },
    query.categoryId
  )
  return c.json(insights)
})
