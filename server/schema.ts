import { z } from 'zod'

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done'])

export const createProcessBodySchema = z.object({
  name: z.string().min(1),
})

export const createEdgeBodySchema = z.object({
  fromProcessId: z.string().min(1),
  toProcessId: z.string().min(1),
})

export const createTaskTemplateBodySchema = z.object({
  processId: z.string().min(1),
  title: z.string().min(1),
  dueDate: z.iso.date(),
})

export const updateTaskBodySchema = z.object({
  status: taskStatusSchema.optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.iso.date().optional(),
})
