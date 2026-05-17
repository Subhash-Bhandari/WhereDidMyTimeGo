import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezonePlugin from 'dayjs/plugin/timezone.js'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db, timeEntries, dailyReflections, categories } from '@wheredidmytimego/db'
import type { CorrelationInsight } from '@wheredidmytimego/shared'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

const DEFAULT_CATEGORY_NAME = 'Coding'
const HIGH_MINUTES_THRESHOLD = 120
const MIN_SAMPLE_DAYS = 5
const MIN_DELTA = 1.5

export async function computeCorrelations(
  userId: number,
  timezone: string,
  range: { start: Date; end: Date },
  focusCategoryName = DEFAULT_CATEGORY_NAME
): Promise<CorrelationInsight[]> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, focusCategoryName)))
    .limit(1)

  if (!category) return []

  const dayExpr = sql<string>`date(timezone(${timezone}::text, ${timeEntries.startedAt}))`

  const codingByDay = await db
    .select({
      day: dayExpr,
      minutes: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)::int`
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        eq(timeEntries.categoryId, category.id),
        gte(timeEntries.startedAt, range.start),
        lte(timeEntries.startedAt, range.end)
      )
    )
    .groupBy(sql`1`)

  const fromDate = dayjs(range.start).tz(timezone).format('YYYY-MM-DD')
  const toDate = dayjs(range.end).tz(timezone).format('YYYY-MM-DD')

  const reflections = await db
    .select({
      reflectionDate: dailyReflections.reflectionDate,
      productivityScore: dailyReflections.productivityScore
    })
    .from(dailyReflections)
    .where(
      and(
        eq(dailyReflections.userId, userId),
        gte(dailyReflections.reflectionDate, fromDate),
        lte(dailyReflections.reflectionDate, toDate)
      )
    )

  const minutesMap = new Map(codingByDay.map((r) => [String(r.day), Number(r.minutes)]))
  const highScores: number[] = []
  const lowScores: number[] = []

  for (const ref of reflections) {
    const day = String(ref.reflectionDate)
    const minutes = minutesMap.get(day) ?? 0
    if (minutes >= HIGH_MINUTES_THRESHOLD) highScores.push(ref.productivityScore)
    else lowScores.push(ref.productivityScore)
  }

  const sampleDays = highScores.length + lowScores.length
  if (sampleDays < MIN_SAMPLE_DAYS || highScores.length === 0 || lowScores.length === 0) {
    return []
  }

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const avgHigh = avg(highScores)
  const avgLow = avg(lowScores)
  const delta = avgHigh - avgLow

  if (delta < MIN_DELTA) return []

  return [
    {
      categoryName: category.name,
      highMinutesThreshold: HIGH_MINUTES_THRESHOLD,
      avgProductivityHigh: Math.round(avgHigh * 10) / 10,
      avgProductivityLow: Math.round(avgLow * 10) / 10,
      delta: Math.round(delta * 10) / 10,
      sampleDays
    }
  ]
}
