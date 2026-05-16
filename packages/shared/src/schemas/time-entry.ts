import { z } from 'zod'

const durationToleranceMinutes = 1

export const timeEntryCreateSchema = z
  .object({
    title: z.string().min(1).max(500),
    categoryId: z.number().int().positive().nullable(),
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime(),
    durationMinutes: z.number().int().positive()
  })
  .refine(
    (data) => {
      const start = new Date(data.startedAt).getTime()
      const end = new Date(data.endedAt).getTime()
      if (end <= start) return false
      const computed = Math.round((end - start) / 60_000)
      return Math.abs(computed - data.durationMinutes) <= durationToleranceMinutes
    },
    { message: 'Duration must match start and end times (±1 minute)' }
  )

export const timeEntryUpdateSchema = timeEntryCreateSchema

export type TimeEntryCreateInput = z.infer<typeof timeEntryCreateSchema>
export type TimeEntryUpdateInput = z.infer<typeof timeEntryUpdateSchema>
