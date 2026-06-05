import type { FastifyInstance } from 'fastify'
import websocket from '@fastify/websocket'

const projectSockets = new Map<string, Set<{ send: (payload: string) => void; readyState: number }>>()

export async function registerRealtime(app: FastifyInstance) {
  await app.register(websocket)

  app.get('/ws/projects/:projectId', { websocket: true }, (socket, request) => {
    const { projectId } = request.params as { projectId: string }
    const clients = projectSockets.get(projectId) ?? new Set()
    clients.add(socket)
    projectSockets.set(projectId, clients)

    socket.send(
      JSON.stringify({
        type: 'connected',
        projectId,
        occurredAt: new Date().toISOString(),
      }),
    )

    socket.on('close', () => {
      clients.delete(socket)
      if (clients.size === 0) {
        projectSockets.delete(projectId)
      }
    })
  })
}

export function broadcastProjectEvent(projectId: string, payload: unknown) {
  const clients = projectSockets.get(projectId)

  if (!clients) {
    return
  }

  const message = JSON.stringify(payload)

  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
}
