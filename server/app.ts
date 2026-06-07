import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import Fastify from 'fastify'

import { registerRealtime } from './realtime'
import { registerRoutes } from './routes'

export async function buildServer() {
  const app = Fastify({
    logger: true,
  })

  await app.register(cors, {
    origin: true,
  })
  await app.register(sensible)
  await registerRealtime(app)
  await registerRoutes(app)

  return app
}
