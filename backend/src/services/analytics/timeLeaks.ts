import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db, timeEntries, categories } from '@wheredidmytimego/db'
import { localWeekRange } from '../../lib/dates'

async function totalsByCategory(
  userId: number,
  range: { start: Date; end: Date }
) {
  return db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)::int`
    })
    .from(timeEntries)
    .innerJoin(categories, eq(timeEntries.categoryId, categories.id))
    .where(
      and(
        eq(timeEntries.userId, userId),
        gte(timeEntries.startedAt, range.start),
        lte(timeEntries.startedAt, range.end)
      )
    )
    .groupBy(categories.id, categories.name)
}

export async function computeTimeLeaks(userId: number, timezone: string) {
  const thisWeek = localWeekRange(timezone, 0)
  const lastWeek = localWeekRange(timezone, -1)

  const [currentRows, previousRows] = await Promise.all([
    totalsByCategory(userId, thisWeek),
    totalsByCategory(userId, lastWeek)
  ])

  const previousMap = new Map(
    previousRows.map((r) => [r.categoryId, Number(r.totalMinutes)])
  )

  return currentRows
    .map((r) => {
      const current = Number(r.totalMinutes)
      const previous = previousMap.get(r.categoryId) ?? 0
      const growthPercent =
        previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100
      return {
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        currentWeekMinutes: current,
        previousWeekMinutes: previous,
        growthPercent
      }
    })
    .filter((r) => r.currentWeekMinutes >= 60 && r.growthPercent > 20)
}
