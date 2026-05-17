export type ParseConfidence = 'high' | 'medium' | 'low'

export type CategoryKeyword = {
  keyword: string
  categoryId: number
}

export type ParsedQuickEntry = {
  title: string
  durationMinutes: number | null
  categoryId: number | null
  confidence: ParseConfidence
}

const DURATION_PATTERN =
  /(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)\b/gi

function parseDurationMinutes(amount: number, unit: string): number | null {
  if (!Number.isFinite(amount) || amount <= 0) return null
  return unit.toLowerCase().startsWith('h') ? Math.round(amount * 60) : Math.round(amount)
}

function cleanupTitle(raw: string): string {
  let t = raw.trim()
  t = t.replace(/^worked on\s+/i, '')
  t = t.replace(/^spent on\s+/i, '')
  t = t.replace(/\s+for\s*$/i, '')
  return t.trim()
}

function inferCategoryId(text: string, keywords: CategoryKeyword[]): number | null {
  const lower = text.toLowerCase()
  let best: { categoryId: number; len: number } | null = null
  for (const { keyword, categoryId } of keywords) {
    const k = keyword.toLowerCase()
    if (!k) continue
    if (lower.includes(k) && (!best || k.length > best.len)) {
      best = { categoryId, len: k.length }
    }
  }
  return best?.categoryId ?? null
}

/** Rule-based quick entry parser (no AI). Uses first duration match in the string. */
export function parseQuickEntry(
  input: string,
  keywords: CategoryKeyword[] = []
): ParsedQuickEntry | null {
  const normalized = input.trim().replace(/\s+/g, ' ')
  if (!normalized) return null

  const durationRe = new RegExp(DURATION_PATTERN.source, 'gi')
  const match = durationRe.exec(normalized)

  let durationMinutes: number | null = null
  let remainder = normalized

  if (match) {
    durationMinutes = parseDurationMinutes(parseFloat(match[1]), match[2])
    remainder =
      normalized.slice(0, match.index) + normalized.slice(match.index + match[0].length)
    remainder = remainder.trim().replace(/\s+/g, ' ')
  }

  const title = cleanupTitle(remainder)

  if (!title && durationMinutes == null) return null

  const categoryId = title ? inferCategoryId(title, keywords) : inferCategoryId(normalized, keywords)

  let confidence: ParseConfidence
  if (durationMinutes != null && categoryId != null) confidence = 'high'
  else if (durationMinutes != null) confidence = 'medium'
  else confidence = 'low'

  return {
    title: title || normalized,
    durationMinutes,
    categoryId,
    confidence
  }
}
