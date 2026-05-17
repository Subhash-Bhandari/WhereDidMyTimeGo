import { z } from 'zod'

export const entryTemplateSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  title: z.string(),
  categoryId: z.number().int().nullable(),
  durationMinutes: z.number().int().positive()
})

export const entryTemplateCreateSchema = z.object({
  label: z.string().min(1).max(80),
  title: z.string().min(1).max(500),
  categoryId: z.number().int().nullable().optional(),
  durationMinutes: z.number().int().min(1).max(1440)
})

export type EntryTemplate = z.infer<typeof entryTemplateSchema>
export type EntryTemplateCreate = z.infer<typeof entryTemplateCreateSchema>
