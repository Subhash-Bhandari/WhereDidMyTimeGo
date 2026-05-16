import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db, timeEntries } from '@wheredidmytimego/db'
import { localWeekRange } from '../../lib/dates'

export async function computeBestHours(userId: number, timezone: string) {
  const week = localWeekRange(timezone, 0)

  // Explicit table-qualified column — see weekly.ts (Drizzle SELECT/GROUP BY mismatch).
  const localHour = sql<number>`extract(hour from timezone(${timezone}::text, "time_entries"."started_at"))::int`

  const rows = await db
    .select({
      hour: localHour,
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
    .groupBy(sql`1`)
    .orderBy(sql`sum(${timeEntries.durationMinutes}) desc`)
    .limit(2)

  return rows.map((r) => ({
    hour: Number(r.hour),
    totalMinutes: Number(r.totalMinutes)
  }))
}
