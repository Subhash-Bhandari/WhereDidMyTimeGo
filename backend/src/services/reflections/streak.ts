import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezonePlugin from 'dayjs/plugin/timezone.js'
import { eq } from 'drizzle-orm'
import { db, dailyReflections } from '@wheredidmytimego/db'
import type { ReflectionStreak } from '@wheredidmytimego/shared'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

function computeLongestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  let longest = 1
  let run = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = dayjs(sortedDates[i - 1])
    const cur = dayjs(sortedDates[i])
    if (cur.diff(prev, 'day') === 1) {
      run++
      longest = Math.max(longest, run)
    } else if (cur.diff(prev, 'day') > 1) {
      run = 1
    }
  }
  return longest
}

function computeCurrentStreak(sortedDates: string[], today: string): number {
  if (sortedDates.length === 0) return 0
  const set = new Set(sortedDates)
  if (!set.has(today)) return 0

  let streak = 0
  let d = dayjs(today)
  while (set.has(d.format('YYYY-MM-DD'))) {
    streak++
    d = d.subtract(1, 'day')
  }
  return streak
}

export async function getReflectionStreak(
  userId: number,
  timezone: string
): Promise<ReflectionStreak> {
  const rows = await db
    .select({ reflectionDate: dailyReflections.reflectionDate })
    .from(dailyReflections)
    .where(eq(dailyReflections.userId, userId))
    .orderBy(dailyReflections.reflectionDate)

  const dates = [...new Set(rows.map((r) => String(r.reflectionDate)))].sort()
  const today = dayjs().tz(timezone).format('YYYY-MM-DD')
  const lastReflectionDate = dates.length > 0 ? dates[dates.length - 1]! : null
  const cutoff = dayjs().tz(timezone).subtract(29, 'day').format('YYYY-MM-DD')
  const reflectionDatesLast30 = dates.filter((d) => d >= cutoff)

  return {
    currentStreak: computeCurrentStreak(dates, today),
    longestStreak: computeLongestStreak(dates),
    lastReflectionDate,
    reflectionDatesLast30
  }
}
