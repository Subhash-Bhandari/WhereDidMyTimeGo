import { z } from 'zod'

export const moodEnum = z.enum(['great', 'good', 'okay', 'low', 'bad'])

export const reflectionSchema = z.object({
  mood: moodEnum,
  productivityScore: z.number().int().min(1).max(10),
  notes: z.string().max(2000).nullable().optional(),
  sleepHours: z.number().int().min(0).max(24).nullable().optional()
})

export const reflectionStreakSchema = z.object({
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  lastReflectionDate: z.string().nullable(),
  reflectionDatesLast30: z.array(z.string())
})

export type ReflectionInput = z.infer<typeof reflectionSchema>
export type ReflectionStreak = z.infer<typeof reflectionStreakSchema>
