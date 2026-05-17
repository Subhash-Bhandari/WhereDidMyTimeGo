import { z } from 'zod'

export const timeLeakSchema = z.object({
  categoryId: z.number().int(),
  categoryName: z.string(),
  currentWeekMinutes: z.number().int().min(60),
  previousWeekMinutes: z.number().int(),
  growthPercent: z.number()
})

export const bestHourSchema = z.object({
  hour: z.number().int().min(0).max(23),
  totalMinutes: z.number().int().min(0)
})

export const bestHourInsightSchema = z.object({
  hour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(0).max(24),
  totalMinutes: z.number().int().min(0),
  categoryName: z.string().nullable().optional()
})

export const correlationInsightSchema = z.object({
  categoryName: z.string(),
  highMinutesThreshold: z.number().int(),
  avgProductivityHigh: z.number(),
  avgProductivityLow: z.number(),
  delta: z.number(),
  sampleDays: z.number().int()
})

export const analyticsInsightsSchema = z.object({
  timeLeaks: z.array(timeLeakSchema).max(3),
  bestHours: z.array(bestHourInsightSchema).max(3),
  correlations: z.array(correlationInsightSchema)
})

export const analyticsSummarySchema = z.object({
  todayMinutes: z.number().int().min(0),
  yesterdayMinutes: z.number().int().min(0),
  weekMinutes: z.number().int().min(0),
  lastWeekMinutes: z.number().int().min(0),
  timeLeaks: z.array(timeLeakSchema),
  bestHours: z.array(bestHourSchema).max(2)
})

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>
export type AnalyticsInsights = z.infer<typeof analyticsInsightsSchema>
export type CorrelationInsight = z.infer<typeof correlationInsightSchema>
export type BestHourInsight = z.infer<typeof bestHourInsightSchema>
