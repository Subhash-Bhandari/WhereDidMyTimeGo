import { and, eq } from 'drizzle-orm'
import { db, entryTemplates } from '@wheredidmytimego/db'
import type { EntryTemplateCreate } from '@wheredidmytimego/shared'

export async function listTemplates(userId: number) {
  return db
    .select({
      id: entryTemplates.id,
      label: entryTemplates.label,
      title: entryTemplates.title,
      categoryId: entryTemplates.categoryId,
      durationMinutes: entryTemplates.durationMinutes
    })
    .from(entryTemplates)
    .where(eq(entryTemplates.userId, userId))
    .orderBy(entryTemplates.id)
}

export async function createTemplate(userId: number, input: EntryTemplateCreate) {
  const [row] = await db
    .insert(entryTemplates)
    .values({
      userId,
      label: input.label,
      title: input.title,
      categoryId: input.categoryId ?? null,
      durationMinutes: input.durationMinutes
    })
    .returning({
      id: entryTemplates.id,
      label: entryTemplates.label,
      title: entryTemplates.title,
      categoryId: entryTemplates.categoryId,
      durationMinutes: entryTemplates.durationMinutes
    })
  return row
}

export async function deleteTemplate(userId: number, templateId: number) {
  const result = await db
    .delete(entryTemplates)
    .where(and(eq(entryTemplates.id, templateId), eq(entryTemplates.userId, userId)))
    .returning({ id: entryTemplates.id })
  return result.length > 0
}
