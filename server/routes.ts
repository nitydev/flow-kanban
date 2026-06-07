import type { FastifyInstance } from 'fastify'

import { getFlowState, flowMutations, resetFlowState } from './flow-store'
import { broadcastProjectEvent } from './realtime'
import {
  createEdgeBodySchema,
  createProcessBodySchema,
  createTaskTemplateBodySchema,
  moveTaskTemplateBodySchema,
  moveProcessBodySchema,
  updateTaskBodySchema,
  updateProcessBodySchema,
  updateTaskTemplateBodySchema,
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

  app.put('/processes/:processId', async (request, reply) => {
    const { processId } = request.params as { processId: string }
    const body = updateProcessBodySchema.parse(request.body)
    const result = flowMutations.updateProcess(processId, body.name, body.description)
    emitLatestEvent()
    return reply.send(result)
  })

  app.patch('/processes/:processId/position', async (request, reply) => {
    const { processId } = request.params as { processId: string }
    const body = moveProcessBodySchema.parse(request.body)
    return reply.send(flowMutations.moveProcess(processId, body))
  })

  app.delete('/processes/:processId', async (request, reply) => {
    const { processId } = request.params as { processId: string }
    const result = flowMutations.deleteProcess(processId)
    emitLatestEvent()
    return reply.send(result)
  })

  app.post('/projects/:projectId/process-edges', async (request, reply) => {
    const body = createEdgeBodySchema.parse(request.body)
    const result = flowMutations.addEdge(body.fromProcessId, body.toProcessId)
    emitLatestEvent()
    return reply.code(201).send(result)
  })

  app.delete('/process-edges/:edgeId', async (request, reply) => {
    const { edgeId } = request.params as { edgeId: string }
    const result = flowMutations.deleteEdge(edgeId)
    emitLatestEvent()
    return reply.send(result)
  })

  app.post('/projects/:projectId/task-templates', async (request, reply) => {
    const body = createTaskTemplateBodySchema.parse(request.body)
    const result = flowMutations.addTaskTemplate(body.processId, body.title, body.dueDate)
    emitLatestEvent()
    return reply.code(201).send(result)
  })

  app.put('/task-templates/:templateId', async (request, reply) => {
    const { templateId } = request.params as { templateId: string }
    const body = updateTaskTemplateBodySchema.parse(request.body)
    const result = flowMutations.updateTaskTemplate(templateId, body.title, body.dueDate)
    emitLatestEvent()
    return reply.send(result)
  })

  app.delete('/task-templates/:templateId', async (request, reply) => {
    const { templateId } = request.params as { templateId: string }
    const result = flowMutations.deleteTaskTemplate(templateId)
    emitLatestEvent()
    return reply.send(result)
  })

  app.post('/task-templates/:templateId/move', async (request, reply) => {
    const { templateId } = request.params as { templateId: string }
    const body = moveTaskTemplateBodySchema.parse(request.body)
    const result = flowMutations.moveTaskTemplate(templateId, body.direction)
    emitLatestEvent()
    return reply.send(result)
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
