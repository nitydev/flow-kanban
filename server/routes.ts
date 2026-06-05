import type { FastifyInstance } from 'fastify'

import { getFlowState, flowMutations, resetFlowState } from './flow-store'
import { broadcastProjectEvent } from './realtime'
import {
  createEdgeBodySchema,
  createProcessBodySchema,
  createTaskTemplateBodySchema,
  updateTaskBodySchema,
} from './schema'

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true }))

  app.get('/projects', async () => [getFlowState().project])

  app.get('/projects/:projectId', async () => getFlowState())

  app.post('/projects/:projectId/start', async (_request, reply) => {
    const result = flowMutations.startProject()
    emitLatestEvent()
    return reply.send(result)
  })

  app.get('/projects/:projectId/processes', async () => getFlowState().processes)

  app.post('/projects/:projectId/processes', async (request, reply) => {
    const body = createProcessBodySchema.parse(request.body)
    const result = flowMutations.addProcess(body.name)
    emitLatestEvent()
    return reply.code(201).send(result)
  })

  app.post('/projects/:projectId/process-edges', async (request, reply) => {
    const body = createEdgeBodySchema.parse(request.body)
    const result = flowMutations.addEdge(body.fromProcessId, body.toProcessId)
    emitLatestEvent()
    return reply.code(201).send(result)
  })

  app.post('/projects/:projectId/task-templates', async (request, reply) => {
    const body = createTaskTemplateBodySchema.parse(request.body)
    const result = flowMutations.addTaskTemplate(body.processId, body.title, body.dueDate)
    emitLatestEvent()
    return reply.code(201).send(result)
  })

  app.get('/projects/:projectId/tasks', async () => getFlowState().tasks)

  app.put('/tasks/:taskId', async (request, reply) => {
    const { taskId } = request.params as { taskId: string }
    const body = updateTaskBodySchema.parse(request.body)

    if (!body.status) {
      return reply.code(400).send({ message: 'status is required in this MVP endpoint.' })
    }

    const result = flowMutations.updateTaskStatus(taskId, body.status)
    emitLatestEvent()
    return reply.send(result)
  })

  app.post('/tasks/:taskId/complete', async (request, reply) => {
    const { taskId } = request.params as { taskId: string }
    const result = flowMutations.updateTaskStatus(taskId, 'done')
    emitLatestEvent()
    return reply.send(result)
  })

  app.post('/dev/reset', async () => ({ state: resetFlowState() }))
}

function emitLatestEvent() {
  const state = getFlowState()
  const latestEvent = state.events[0]

  if (!latestEvent) {
    return
  }

  broadcastProjectEvent(state.project.id, {
    ...latestEvent,
    projectId: state.project.id,
  })
}
