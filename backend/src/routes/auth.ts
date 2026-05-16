import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { loginSchema, registerSchema } from '@wheredidmytimego/shared'
import { parseJson } from '../lib/validate'
import { badRequest, unauthorized } from '../lib/errors'
import { destroySession, getUserBySession, loginUser, registerUser } from '../services/auth'
import { requireAuth, SESSION_COOKIE, type AuthVariables } from '../middleware/auth'

const isProd = process.env.NODE_ENV === 'production'

function setSessionCookie(c: Parameters<typeof setCookie>[0], sessionId: string, expiresAt: Date) {
  setCookie(c, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt
  })
}

export const authRoutes = new Hono<{ Variables: AuthVariables }>()

authRoutes.post('/register', async (c) => {
  const body = await parseJson(c, registerSchema)
  if (body instanceof Response) return body

  const result = await registerUser(body)
  if ('error' in result) {
    if (result.error === 'EMAIL_EXISTS') {
      return badRequest(c, 'Email already registered')
    }
    return badRequest(c, 'Registration failed')
  }

  setSessionCookie(c, result.session.id, result.session.expiresAt)
  return c.json({ id: result.user.id, email: result.user.email, name: result.user.name }, 201)
})

authRoutes.post('/login', async (c) => {
  const body = await parseJson(c, loginSchema)
  if (body instanceof Response) return body

  const result = await loginUser(body)
  if ('error' in result) {
    return unauthorized(c, 'Invalid email or password')
  }

  setSessionCookie(c, result.session.id, result.session.expiresAt)
  return c.json({ id: result.user.id, email: result.user.email, name: result.user.name })
})

authRoutes.post('/logout', async (c) => {
  const sessionId = getCookie(c, SESSION_COOKIE)
  if (sessionId) {
    await destroySession(sessionId)
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.body(null, 204)
})

authRoutes.get('/me', requireAuth, async (c) => {
  return c.json(c.get('user'))
})
