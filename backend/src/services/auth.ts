import { randomBytes } from 'node:crypto'
import bcrypt from 'bcrypt'
import { eq, and, gt } from 'drizzle-orm'
import { db, users, sessions } from '@wheredidmytimego/db'
import type { LoginInput, RegisterInput } from '@wheredidmytimego/shared'
import { seedDefaultCategories } from './categorySeed'
import { seedCategoryKeywords } from './categoryKeywordSeed'

const SESSION_DAYS = 30
const BCRYPT_ROUNDS = 10

function newSessionId() {
  return randomBytes(32).toString('hex')
}

function sessionExpiry() {
  const d = new Date()
  d.setDate(d.getDate() + SESSION_DAYS)
  return d
}

export async function registerUser(input: RegisterInput) {
  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1)
  if (existing.length > 0) {
    return { error: 'EMAIL_EXISTS' as const }
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name
    })

  await seedDefaultCategories(user.id)
  await seedCategoryKeywords(user.id)
  const session = await createSession(user.id)
  return { user, session }
}

export async function loginUser(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)
  if (!user) {
    return { error: 'INVALID_CREDENTIALS' as const }
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) {
    return { error: 'INVALID_CREDENTIALS' as const }
  }

  const session = await createSession(user.id)
  return {
    user: { id: user.id, email: user.email, name: user.name },
    session
  }
}

async function createSession(userId: number) {
  const id = newSessionId()
  const expiresAt = sessionExpiry()
  await db.insert(sessions).values({ id, userId, expiresAt })
  return { id, expiresAt }
}

export async function destroySession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function getUserBySession(sessionId: string) {
  const now = new Date()
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1)
  return row
}
