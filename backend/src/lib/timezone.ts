/**
 * Browser/Intl may return legacy IANA names; PostgreSQL + dayjs handle
 * standard names more reliably.
 */
const IANA_ALIASES: Record<string, string> = {
  'asia/calcutta': 'Asia/Kolkata'
}

export function normalizeIanaTimezone(tz: string): string {
  const trimmed = tz.trim()
  const key = trimmed.toLowerCase()
  return IANA_ALIASES[key] ?? trimmed
}
