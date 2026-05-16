export type ParsedQuickEntry = {
  title: string
  durationMinutes: number
}

const DURATION_PATTERN = /^(.+?)\s+(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)$/i

export function parseQuickEntry(input: string): ParsedQuickEntry | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const match = trimmed.match(DURATION_PATTERN)
  if (!match) return null

  const title = match[1].trim()
  const amount = parseFloat(match[2])
  const unit = match[3].toLowerCase()

  if (!title || !Number.isFinite(amount) || amount <= 0) return null

  let durationMinutes: number
  if (unit.startsWith('h')) {
    durationMinutes = Math.round(amount * 60)
  } else {
    durationMinutes = Math.round(amount)
  }

  if (durationMinutes <= 0) return null

  return { title, durationMinutes }
}
