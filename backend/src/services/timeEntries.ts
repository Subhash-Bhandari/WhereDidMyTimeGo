import { and, eq, gte, lte, desc } from 'drizzle-orm'
import { db, timeEntries } from '@wheredidmytimego/db'
import type { TimeEntryCreateInput, TimeEntryUpdateInput } from '@wheredidmytimego/shared'
import { localTodayRange } from '../lib/dates'

function toRow(input: TimeEntryCreateInput, userId: number) {
  return {
    userId,
    categoryId: input.categoryId,
    title: input.title,
    startedAt: new Date(input.startedAt),
    endedAt: new Date(input.endedAt),
    durationMinutes: input.durationMinutes
  }
}

export async function createTimeEntry(userId: number, input: TimeEntryCreateInput) {
  const [row] = await db.insert(timeEntries).values(toRow(input, userId)).returning()
  return row
}

export async function updateTimeEntry(
  userId: number,
  entryId: number,
  input: TimeEntryUpdateInput
) {
  const [row] = await db
    .update(timeEntries)
    .set(toRow(input, userId))
    .where(and(eq(timeEntries.id, entryId), eq(timeEntries.userId, userId)))
    .returning()
  return row
}

export async function deleteTimeEntry(userId: number, entryId: number) {
  const [row] = await db
    .delete(timeEntries)
    .where(and(eq(timeEntries.id, entryId), eq(timeEntries.userId, userId)))
    .returning()
  return row
}

export async function getTimeEntry(userId: number, entryId: number) {
  const [row] = await db
    .select()
    .from(timeEntries)
    .where(and(eq(timeEntries.id, entryId), eq(timeEntries.userId, userId)))
    .limit(1)
  return row
}

export async function listToday(userId: number, timezone: string) {
  const { start, end } = localTodayRange(timezone)
  return db
    .select()
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, userId),
        gte(timeEntries.startedAt, start),
        lte(timeEntries.startedAt, end)
      )
    )
    .orderBy(desc(timeEntries.startedAt))
}
