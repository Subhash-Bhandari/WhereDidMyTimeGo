import { z } from 'zod'

export const parseConfidenceSchema = z.enum(['high', 'medium', 'low'])

export const parseEntryRequestSchema = z.object({
  text: z.string().min(1).max(500)
})

export const parseEntryResultSchema = z.object({
  title: z.string(),
  durationMinutes: z.number().int().positive().nullable(),
  categoryId: z.number().int().nullable(),
  confidence: parseConfidenceSchema
})

export type ParseEntryRequest = z.infer<typeof parseEntryRequestSchema>
export type ParseEntryResult = z.infer<typeof parseEntryResultSchema>
