import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { eq, and, gt } from 'drizzle-orm'
import { db, sessions, users } from '@wheredidmytimego/db'
import { unauthorized } from '../lib/errors'

export type AuthUser = {
  id: number
  email: string
  name: string
}

export type AuthVariables = {
  userId: number
  user: AuthUser
}

const SESSION_COOKIE = 'session_id'

export async function requireAuth(c: Context, next: Next) {
  const sessionId = getCookie(c, SESSION_COOKIE)
  if (!sessionId) {
    return unauthorized(c)
  }

  const now = new Date()
  const [row] = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1)

  if (!row) {
    return unauthorized(c)
  }

  c.set('userId', row.userId)
  c.set('user', { id: row.userId, email: row.email, name: row.name })
  await next()
}

export { SESSION_COOKIE }
