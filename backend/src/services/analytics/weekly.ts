import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezonePlugin from 'dayjs/plugin/timezone.js'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db, timeEntries } from '@wheredidmytimego/db'
import { localWeekRange } from '../../lib/dates'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

/**
 * PostgreSQL: use timezone(zone, timestamptz) — robust with bound params.
 * (Some PG builds reject legacy IANA names in AT TIME ZONE; normalize at route.)
 */
export async function getWeeklyTotals(
  userId: number,
  timezone: string,
  weekStart?: string
) {
  const week =
    weekStart != null
      ? {
          start: dayjs.tz(weekStart, timezone).startOf('day').toDate(),
          end: dayjs.tz(weekStart, timezone).add(6, 'day').endOf('day').toDate()
        }
      : localWeekRange(timezone, 0)

  if (!dayjs(week.start).isValid() || !dayjs(week.end).isValid()) {
    throw new Error(`Invalid timezone or week range for: ${timezone}`)
  }

  // Explicit "time_entries"."started_at" — Drizzle interpolates ${timeEntries.startedAt}
  // differently in SELECT vs GROUP BY (bare vs qualified), which breaks GROUP BY matching.
  const localDay = sql<string>`to_char(timezone(${timezone}::text, "time_entries"."started_at"), 'YYYY-MM-DD')`

  const rows = await db
    .select({
      date: localDay,
      totalMinutes: sql<number>`sum(${timeEntries.durationMinutes})::int`
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        gte(timeEntries.startedAt, week.start),
        lte(timeEntries.startedAt, week.end)
      )
    )
    // GROUP BY 1: same expression must not be duplicated with a second Param ($1 vs $5),
    // or PostgreSQL treats SELECT vs GROUP BY as different (SQLSTATE 42803).
    .groupBy(sql`1`)

  const byDate = new Map(rows.map((r) => [r.date, Number(r.totalMinutes)]))
  const days: { date: string; totalMinutes: number }[] = []
  let cursor = dayjs(week.start).tz(timezone)
  const end = dayjs(week.end).tz(timezone)

  let guard = 0
  while (
    (cursor.isBefore(end) || cursor.isSame(end, 'day')) &&
    cursor.isValid() &&
    guard < 14
  ) {
    const dateStr = cursor.format('YYYY-MM-DD')
    days.push({ date: dateStr, totalMinutes: byDate.get(dateStr) ?? 0 })
    cursor = cursor.add(1, 'day')
    guard++
  }

  return days
}
