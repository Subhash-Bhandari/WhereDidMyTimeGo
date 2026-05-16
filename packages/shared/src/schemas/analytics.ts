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

export const analyticsSummarySchema = z.object({
  todayMinutes: z.number().int().min(0),
  yesterdayMinutes: z.number().int().min(0),
  weekMinutes: z.number().int().min(0),
  lastWeekMinutes: z.number().int().min(0),
  timeLeaks: z.array(timeLeakSchema),
  bestHours: z.array(bestHourSchema).max(2)
})

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>
