import { Hono } from 'hono'
import {
  categoryCreateSchema,
  categoryUpdateSchema
} from '@wheredidmytimego/shared'
import { requireAuth, type AuthVariables } from '../middleware/auth'
import { parseJson } from '../lib/validate'
import { notFound } from '../lib/errors'
import {
  createCategory,
  deleteCategory,
  getCategoryForUser,
  listForUser,
  updateCategory
} from '../services/categories'

export const categoryRoutes = new Hono<{ Variables: AuthVariables }>()

categoryRoutes.use('*', requireAuth)

categoryRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const rows = await listForUser(userId)
  return c.json(rows)
})

categoryRoutes.post('/', async (c) => {
  const body = await parseJson(c, categoryCreateSchema)
  if (body instanceof Response) return body
  const row = await createCategory(c.get('userId'), body)
  return c.json(row, 201)
})

categoryRoutes.patch('/:id', async (c) => {
  const categoryId = Number(c.req.param('id'))
  if (!Number.isFinite(categoryId)) {
    return notFound(c, 'Invalid category id')
  }

  const existing = await getCategoryForUser(c.get('userId'), categoryId)
  if (!existing) {
    return notFound(c, 'Category not found')
  }

  const body = await parseJson(c, categoryUpdateSchema)
  if (body instanceof Response) return body

  const row = await updateCategory(c.get('userId'), categoryId, body)
  return c.json(row)
})

categoryRoutes.delete('/:id', async (c) => {
  const categoryId = Number(c.req.param('id'))
  if (!Number.isFinite(categoryId)) {
    return notFound(c, 'Invalid category id')
  }

  const row = await deleteCategory(c.get('userId'), categoryId)
  if (!row) {
    return notFound(c, 'Category not found')
  }
  return c.body(null, 204)
})
