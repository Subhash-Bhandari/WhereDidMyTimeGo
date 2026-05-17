import { Hono } from 'hono'
import { entryTemplateCreateSchema } from '@wheredidmytimego/shared'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { parseJson } from '../lib/validate'
import { notFound } from '../lib/errors'
import { createTemplate, deleteTemplate, listTemplates } from '../services/templates'

export const templateRoutes = new Hono<{ Variables: AuthVariables }>()

templateRoutes.use('*', requireAuth)

templateRoutes.get('/', async (c) => {
  const items = await listTemplates(c.get('userId'))
  return c.json({ items })
})

templateRoutes.post('/', async (c) => {
  const body = await parseJson(c, entryTemplateCreateSchema)
  if (body instanceof Response) return body
  const row = await createTemplate(c.get('userId'), body)
  return c.json(row, 201)
})

templateRoutes.delete('/:id', async (c) => {
  const templateId = Number(c.req.param('id'))
  if (!Number.isFinite(templateId)) {
    return notFound(c, 'Invalid template id')
  }
  const ok = await deleteTemplate(c.get('userId'), templateId)
  if (!ok) return notFound(c, 'Template not found')
  return c.body(null, 204)
})
