import { eq, and } from 'drizzle-orm'
import { db, categories, timeEntries } from '@wheredidmytimego/db'
import type { CategoryCreateInput, CategoryUpdateInput } from '@wheredidmytimego/shared'

export async function listForUser(userId: number) {
  return db.select().from(categories).where(eq(categories.userId, userId))
}

export async function createCategory(userId: number, input: CategoryCreateInput) {
  const [row] = await db
    .insert(categories)
    .values({ userId, ...input })
    .returning()
  return row
}

export async function updateCategory(
  userId: number,
  categoryId: number,
  input: CategoryUpdateInput
) {
  const [row] = await db
    .update(categories)
    .set(input)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning()
  return row
}

export async function deleteCategory(userId: number, categoryId: number) {
  await db
    .update(timeEntries)
    .set({ categoryId: null })
    .where(and(eq(timeEntries.categoryId, categoryId), eq(timeEntries.userId, userId)))

  const [row] = await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning()
  return row
}

export async function getCategoryForUser(userId: number, categoryId: number) {
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1)
  return row
}
