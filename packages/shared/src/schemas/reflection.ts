import { z } from 'zod'

export const moodEnum = z.enum(['great', 'good', 'okay', 'low', 'bad'])

export const reflectionSchema = z.object({
  mood: moodEnum,
  productivityScore: z.number().int().min(1).max(10),
  notes: z.string().max(2000).nullable().optional(),
  sleepHours: z.number().int().min(0).max(24).nullable().optional()
})

export type ReflectionInput = z.infer<typeof reflectionSchema>
