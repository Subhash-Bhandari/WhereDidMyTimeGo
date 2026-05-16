import { and, eq } from 'drizzle-orm'
import { db, dailyReflections } from '@wheredidmytimego/db'
import type { ReflectionInput } from '@wheredidmytimego/shared'
import { localTodayRange } from '../lib/dates'

export async function getReflectionForToday(userId: number, timezone: string) {
  const { dateStr } = localTodayRange(timezone)
  const [row] = await db
    .select()
    .from(dailyReflections)
    .where(
      and(eq(dailyReflections.userId, userId), eq(dailyReflections.reflectionDate, dateStr))
    )
    .limit(1)
  return row ?? null
}

export async function upsertReflectionToday(
  userId: number,
  timezone: string,
  input: ReflectionInput
) {
  const { dateStr } = localTodayRange(timezone)
  const existing = await getReflectionForToday(userId, timezone)

  if (existing) {
    const [row] = await db
      .update(dailyReflections)
      .set({
        mood: input.mood,
        productivityScore: input.productivityScore,
        notes: input.notes ?? null,
        sleepHours: input.sleepHours ?? null,
        updatedAt: new Date()
      })
      .where(eq(dailyReflections.id, existing.id))
      .returning()
    return row
  }

  const [row] = await db
    .insert(dailyReflections)
    .values({
      userId,
      reflectionDate: dateStr,
      mood: input.mood,
      productivityScore: input.productivityScore,
      notes: input.notes ?? null,
      sleepHours: input.sleepHours ?? null
    })
    .returning()
  return row
}
