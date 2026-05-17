import type { AnalyticsInsights } from '@wheredidmytimego/shared'
import { computeTimeLeaks } from './timeLeaks'
import { computeBestHours } from './bestHours'
import { computeCorrelations } from './correlations'

export async function getAnalyticsInsights(
  userId: number,
  timezone: string,
  range: { start: Date; end: Date },
  categoryId?: number
): Promise<AnalyticsInsights> {
  const [timeLeaks, bestHours, correlations] = await Promise.all([
    computeTimeLeaks(userId, timezone),
    computeBestHours(userId, timezone, range, categoryId),
    computeCorrelations(userId, timezone, range)
  ])

  return { timeLeaks, bestHours, correlations }
}
