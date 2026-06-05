export type ProjectStatus = 'draft' | 'active' | 'completed'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type Project = {
  id: string
  name: string
  description: string
  status: ProjectStatus
}

export type ProcessNode = {
  id: string
  name: string
  description: string
  position: {
    x: number
    y: number
  }
  completedAt: string | null
}

export type ProcessEdge = {
  id: string
  fromProcessId: string
  toProcessId: string
}

export type TaskTemplate = {
  id: string
  processId: string
  title: string
  description: string
  dueDate: string
  orderIndex: number
}

export type Task = {
  id: string
  projectId: string
  processId: string
  taskTemplateId: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string
  completedAt: string | null
  isTitleOverridden: boolean
  isDescriptionOverridden: boolean
}

export type FlowKanbanState = {
  project: Project
  processes: ProcessNode[]
  edges: ProcessEdge[]
  taskTemplates: TaskTemplate[]
  tasks: Task[]
  events: FlowEvent[]
}

export type FlowEvent = {
  id: string
  type:
    | 'project.started'
    | 'project.completed'
    | 'project.reopened'
    | 'process.created'
    | 'process.connected'
    | 'task.created'
    | 'task.updated'
    | 'task.completed'
    | 'tasks.auto_created'
  message: string
  occurredAt: string
}

export type CardTone = 'complete' | 'overdue' | 'dueToday' | 'soon' | 'normal'

export type ProcessRuntimeStatus = 'not_started' | 'running' | 'completed'
