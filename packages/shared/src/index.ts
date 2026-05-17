export * from './schemas/auth'
export * from './schemas/category'
export * from './schemas/time-entry'
export * from './schemas/reflection'
export * from './schemas/analytics'
export * from './schemas/parseEntry'
export * from './schemas/templates'
export * from './parseEntry'

export type TimeEntryInput = {
  title: string
  categoryId: number | null
  startedAt: string
  endedAt: string
  durationMinutes: number
}
