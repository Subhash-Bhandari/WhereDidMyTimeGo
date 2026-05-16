import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db, timeEntries } from '@wheredidmytimego/db'
import type { AnalyticsSummary } from '@wheredidmytimego/shared'
import { localTodayRange, localWeekRange, localYesterdayRange } from '../../lib/dates'
import { computeTimeLeaks } from './timeLeaks'
import { computeBestHours } from './bestHours'

async function sumMinutes(
  userId: number,
  start: Date,
  end: Date
): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)::int`
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        gte(timeEntries.startedAt, start),
        lte(timeEntries.startedAt, end)
      )
    )
  return Number(row?.total ?? 0)
}

export async function getAnalyticsSummary(
  userId: number,
  timezone: string,
  options?: { includeInsights?: boolean }
): Promise<AnalyticsSummary> {
  const today = localTodayRange(timezone)
  const yesterday = localYesterdayRange(timezone)
  const thisWeek = localWeekRange(timezone, 0)
  const lastWeek = localWeekRange(timezone, -1)

  const [todayMinutes, yesterdayMinutes, weekMinutes, lastWeekMinutes] = await Promise.all([
    sumMinutes(userId, today.start, today.end),
    sumMinutes(userId, yesterday.start, yesterday.end),
    sumMinutes(userId, thisWeek.start, thisWeek.end),
    sumMinutes(userId, lastWeek.start, lastWeek.end)
  ])

  const includeInsights = options?.includeInsights ?? false

  return {
    todayMinutes,
    yesterdayMinutes,
    weekMinutes,
    lastWeekMinutes,
    timeLeaks: includeInsights ? await computeTimeLeaks(userId, timezone) : [],
    bestHours: includeInsights ? await computeBestHours(userId, timezone) : []
  }
}
