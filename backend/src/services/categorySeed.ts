import { db, categories } from '@wheredidmytimego/db'

const DEFAULT_CATEGORIES = [
  { name: 'Coding', color: '#3b82f6', icon: 'code' },
  { name: 'Learning', color: '#8b5cf6', icon: 'book-open' },
  { name: 'Entertainment', color: '#f59e0b', icon: 'tv' },
  { name: 'Health', color: '#22c55e', icon: 'heart-pulse' },
  { name: 'Other', color: '#64748b', icon: 'more-horizontal' }
] as const

export async function seedDefaultCategories(userId: number) {
  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((c) => ({
      userId,
      name: c.name,
      color: c.color,
      icon: c.icon
    }))
  )
}
