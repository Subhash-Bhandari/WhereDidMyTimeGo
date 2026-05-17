import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db, timeEntries, categories } from '@wheredidmytimego/db'

export async function computeBestHours(
  userId: number,
  timezone: string,
  range: { start: Date; end: Date },
  categoryId?: number
) {
  const localHour = sql<number>`extract(hour from timezone(${timezone}::text, ${timeEntries.startedAt}))::int`

  const conditions = [
    eq(timeEntries.userId, userId),
    gte(timeEntries.startedAt, range.start),
    lte(timeEntries.startedAt, range.end)
  ]
  if (categoryId != null) {
    conditions.push(eq(timeEntries.categoryId, categoryId))
  }

  const rows = await db
    .select({
      hour: localHour,
      totalMinutes: sql<number>`sum(${timeEntries.durationMinutes})::int`,
      categoryName: sql<string | null>`max(${categories.name})`
    })
    .from(timeEntries)
    .leftJoin(categories, eq(timeEntries.categoryId, categories.id))
    .where(and(...conditions))
    .groupBy(sql`1`)
    .orderBy(sql`sum(${timeEntries.durationMinutes}) desc`, sql`1 desc`)
    .limit(3)

  return rows.map((r) => {
    const hour = Number(r.hour)
    return {
      hour,
      endHour: hour + 1,
      totalMinutes: Number(r.totalMinutes),
      categoryName: r.categoryName ?? undefined
    }
  })
}

/** Legacy summary helper — current calendar week. */
export async function computeBestHoursForWeek(userId: number, timezone: string) {
  const { localWeekRange } = await import('../../lib/dates')
  const week = localWeekRange(timezone, 0)
  const rows = await computeBestHours(userId, timezone, week)
  return rows.map(({ hour, totalMinutes }) => ({ hour, totalMinutes }))
}
