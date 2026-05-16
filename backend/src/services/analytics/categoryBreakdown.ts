import { and, eq, gte, lte, sql, isNull } from 'drizzle-orm'
import { db, timeEntries, categories } from '@wheredidmytimego/db'

export async function getCategoryBreakdown(
  userId: number,
  from: Date,
  to: Date
) {
  const rows = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      color: categories.color,
      totalMinutes: sql<number>`sum(${timeEntries.durationMinutes})::int`
    })
    .from(timeEntries)
    .leftJoin(categories, eq(timeEntries.categoryId, categories.id))
    .where(
      and(
        eq(timeEntries.userId, userId),
        gte(timeEntries.startedAt, from),
        lte(timeEntries.startedAt, to)
      )
    )
    .groupBy(categories.id, categories.name, categories.color)

  const withUncategorized = await db
    .select({
      totalMinutes: sql<number>`sum(${timeEntries.durationMinutes})::int`
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        isNull(timeEntries.categoryId),
        gte(timeEntries.startedAt, from),
        lte(timeEntries.startedAt, to)
      )
    )

  const items = rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName ?? 'Uncategorized',
    color: r.color ?? '#94a3b8',
    totalMinutes: Number(r.totalMinutes)
  }))

  const uncatTotal = Number(withUncategorized[0]?.totalMinutes ?? 0)
  if (uncatTotal > 0) {
    items.push({
      categoryId: null,
      categoryName: 'Uncategorized',
      color: '#94a3b8',
      totalMinutes: uncatTotal
    })
  }

  const grandTotal = items.reduce((s, i) => s + i.totalMinutes, 0)
  return items.map((i) => ({
    ...i,
    percent: grandTotal === 0 ? 0 : Math.round((i.totalMinutes / grandTotal) * 1000) / 10
  }))
}
