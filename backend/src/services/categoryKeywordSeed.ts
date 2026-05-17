import { eq } from 'drizzle-orm'
import { db, categories, categoryKeywords } from '@wheredidmytimego/db'

const SEEDS: { categoryName: string; keywords: string[] }[] = [
  { categoryName: 'Coding', keywords: ['code', 'coding', 'dev', 'programming'] },
  { categoryName: 'Learning', keywords: ['dsa', 'study', 'learning', 'course'] },
  { categoryName: 'Entertainment', keywords: ['youtube', 'netflix', 'game', 'games'] },
  { categoryName: 'Health', keywords: ['gym', 'workout', 'run', 'health'] }
]

export async function seedCategoryKeywords(userId: number) {
  const userCategories = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId))

  const byName = new Map(userCategories.map((c) => [c.name, c.id]))
  const rows: { userId: number; categoryId: number; keyword: string }[] = []

  for (const seed of SEEDS) {
    const categoryId = byName.get(seed.categoryName)
    if (!categoryId) continue
    for (const keyword of seed.keywords) {
      rows.push({ userId, categoryId, keyword: keyword.toLowerCase() })
    }
  }

  if (rows.length > 0) {
    await db.insert(categoryKeywords).values(rows).onConflictDoNothing()
  }
}
