import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jsonError } from './lib/errors'
import { healthRoutes } from './routes/health'
import { authRoutes } from './routes/auth'
import { categoryRoutes } from './routes/categories'
import { timeEntryRoutes } from './routes/time-entries'
import { analyticsRoutes } from './routes/analytics'
import { reflectionRoutes } from './routes/reflections'
import { parseEntryRoutes } from './routes/parse-entry'
import { templateRoutes } from './routes/templates'
import { analyticsInsightsRoutes } from './routes/analytics-insights'
import type { AuthVariables } from './middleware/auth'

const app = new Hono<{ Variables: AuthVariables }>()

app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true
  })
)

app.onError((err, c) => {
  console.error(err)
  const message = err instanceof Error ? err.message : String(err)
  const details =
    process.env.NODE_ENV === 'production' ? undefined : { detail: message }
  return jsonError(c, 500, 'Internal server error', details)
})

app.route('/api', healthRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/categories', categoryRoutes)
app.route('/api/time-entries', timeEntryRoutes)
app.route('/api/analytics', analyticsRoutes)
app.route('/api/reflections', reflectionRoutes)
app.route('/api/parse-entry', parseEntryRoutes)
app.route('/api/templates', templateRoutes)
app.route('/api/analytics/insights', analyticsInsightsRoutes)

const port = Number(process.env.PORT || 3001)

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running at http://localhost:${port}`)
})
