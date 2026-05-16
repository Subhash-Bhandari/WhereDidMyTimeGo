import { Hono } from 'hono'
import { z } from 'zod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezonePlugin from 'dayjs/plugin/timezone.js'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { parseQuery } from '../lib/validate'
import { getAnalyticsSummary } from '../services/analytics/summary'
import { getWeeklyTotals } from '../services/analytics/weekly'
import { getCategoryBreakdown } from '../services/analytics/categoryBreakdown'
import { localWeekRange } from '../lib/dates'
import { normalizeIanaTimezone } from '../lib/timezone'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

const timezoneQuery = z.object({
  timezone: z.string().min(1).transform(normalizeIanaTimezone),
  weekStart: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  includeInsights: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true')
})

export const analyticsRoutes = new Hono<{ Variables: AuthVariables }>()

analyticsRoutes.use('*', requireAuth)

analyticsRoutes.get('/summary', async (c) => {
  const query = parseQuery(c, timezoneQuery)
  if (query instanceof Response) return query
  const summary = await getAnalyticsSummary(c.get('userId'), query.timezone, {
    includeInsights: query.includeInsights ?? true
  })
  return c.json(summary)
})

analyticsRoutes.get('/weekly', async (c) => {
  const query = parseQuery(c, timezoneQuery)
  if (query instanceof Response) return query
  const days = await getWeeklyTotals(c.get('userId'), query.timezone, query.weekStart)
  return c.json({ days })
})

analyticsRoutes.get('/categories', async (c) => {
  const query = parseQuery(c, timezoneQuery)
  if (query instanceof Response) return query

  let from: Date
  let to: Date
  if (query.from && query.to) {
    from = dayjs.tz(query.from, query.timezone).startOf('day').toDate()
    to = dayjs.tz(query.to, query.timezone).endOf('day').toDate()
  } else {
    const week = localWeekRange(query.timezone, 0)
    from = week.start
    to = week.end
  }

  const items = await getCategoryBreakdown(c.get('userId'), from, to)
  return c.json({ items })
})
