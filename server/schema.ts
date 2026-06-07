import { z } from 'zod'

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done'])

export const createProcessBodySchema = z.object({
  name: z.string().min(1),
})

export const updateProcessBodySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
})

export const moveProcessBodySchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
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

export const updateTaskTemplateBodySchema = z.object({
  title: z.string().min(1),
  dueDate: z.iso.date(),
})

export const moveTaskTemplateBodySchema = z.object({
  direction: z.enum(['up', 'down']),
})

export const updateTaskBodySchema = z.object({
  status: taskStatusSchema.optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.iso.date().optional(),
})
