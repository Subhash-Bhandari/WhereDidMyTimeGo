import { z } from 'zod'

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().min(1).max(24),
  icon: z.string().min(1).max(40)
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
