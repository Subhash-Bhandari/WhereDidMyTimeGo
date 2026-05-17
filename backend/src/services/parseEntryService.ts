import { eq } from 'drizzle-orm'
import { db, categoryKeywords } from '@wheredidmytimego/db'
import { parseQuickEntry } from '@wheredidmytimego/shared'
import type { ParseEntryResult } from '@wheredidmytimego/shared'

export async function parseEntryForUser(
  userId: number,
  text: string
): Promise<ParseEntryResult> {
  const rows = await db
    .select({
      keyword: categoryKeywords.keyword,
      categoryId: categoryKeywords.categoryId
    })
    .from(categoryKeywords)
    .where(eq(categoryKeywords.userId, userId))

  const parsed = parseQuickEntry(
    text,
    rows.map((r) => ({ keyword: r.keyword, categoryId: r.categoryId }))
  )

  if (!parsed) {
    return {
      title: text.trim(),
      durationMinutes: null,
      categoryId: null,
      confidence: 'low'
    }
  }

  return {
    title: parsed.title,
    durationMinutes: parsed.durationMinutes,
    categoryId: parsed.categoryId,
    confidence: parsed.confidence
  }
}
