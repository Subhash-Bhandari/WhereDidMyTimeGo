import { Hono } from 'hono'
import { parseEntryRequestSchema } from '@wheredidmytimego/shared'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { parseJson } from '../lib/validate'
import { parseEntryForUser } from '../services/parseEntryService'

export const parseEntryRoutes = new Hono<{ Variables: AuthVariables }>()

parseEntryRoutes.use('*', requireAuth)

parseEntryRoutes.post('/', async (c) => {
  const body = await parseJson(c, parseEntryRequestSchema)
  if (body instanceof Response) return body
  const result = await parseEntryForUser(c.get('userId'), body.text)
  return c.json(result)
})
