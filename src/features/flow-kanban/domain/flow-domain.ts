import type {
  FlowEvent,
  FlowKanbanState,
  ProcessNode,
  Task,
  TaskStatus,
  TaskTemplate,
  ProcessRuntimeStatus,
} from '@/entities/flow/types'
import { createId } from '@/shared/lib/id'
import { nowIso } from '@/shared/lib/date'

type DomainResult = {
  state: FlowKanbanState
  messages: string[]
}

export function getIncomingProcessIds(state: FlowKanbanState, processId: string) {
  return state.edges
    .filter((edge) => edge.toProcessId === processId)
    .map((edge) => edge.fromProcessId)
}

export function getOutgoingProcessIds(state: FlowKanbanState, processId: string) {
  return state.edges
    .filter((edge) => edge.fromProcessId === processId)
    .map((edge) => edge.toProcessId)
}

export function getProcessRuntimeStatus(
  state: FlowKanbanState,
  processId: string,
): ProcessRuntimeStatus {
  const process = state.processes.find((item) => item.id === processId)

  if (process?.completedAt) {
    return 'completed'
  }

  return state.tasks.some((task) => task.processId === processId) ? 'running' : 'not_started'
}

export function validateProjectStart(state: FlowKanbanState) {
  const errors: string[] = []

  if (state.processes.length === 0) {
    errors.push('工程が1件以上必要です。')
  }

  for (const process of state.processes) {
    const templates = getSortedTemplates(state, process.id)

    if (templates.length === 0) {
      errors.push(`${process.name} にタスク定義がありません。`)
    }

    if (templates.some((template) => template.dueDate.length === 0)) {
      errors.push(`${process.name} に期限未設定のタスク定義があります。`)
    }
  }

  if (hasDuplicateEdges(state)) {
    errors.push('重複接続があります。')
  }

  if (state.edges.some((edge) => edge.fromProcessId === edge.toProcessId)) {
    errors.push('自分自身への接続があります。')
  }

  if (hasCycle(state)) {
    errors.push('工程フローに循環があります。')
  }

  if (state.processes.length > 1 && hasIsolatedProcesses(state)) {
    errors.push('孤立工程があります。')
  }

  return errors
}

export function startProject(state: FlowKanbanState): DomainResult {
  const errors = validateProjectStart(state)

  if (errors.length > 0) {
    return { state, messages: errors }
  }

  const started = state.processes
    .filter((process) => getIncomingProcessIds(state, process.id).length === 0)
    .flatMap((process) => createFirstTaskIfMissing(state, process.id))

  const nextState = {
    ...state,
    project: { ...state.project, status: 'active' as const },
    tasks: [...state.tasks, ...started],
    events: [
      createEvent('project.started', 'プロジェクトを開始しました。'),
      createEvent('tasks.auto_created', `${started.length}件のタスクを自動生成しました。`),
      ...state.events,
    ],
  }

  return { state: nextState, messages: ['プロジェクトを開始しました。'] }
}

export function updateTaskStatus(
  state: FlowKanbanState,
  taskId: string,
  status: TaskStatus,
): DomainResult {
  const task = state.tasks.find((item) => item.id === taskId)

  if (!task) {
    return { state, messages: ['対象タスクが見つかりません。'] }
  }

  if (task.status === 'done' && status !== 'done') {
    return { state, messages: ['完了済みタスクは未完了に戻せません。'] }
  }

  if (status === 'done') {
    return completeTask(state, taskId)
  }

  const tasks = state.tasks.map((item) => (item.id === taskId ? { ...item, status } : item))

  return {
    state: {
      ...state,
      tasks,
      events: [createEvent('task.updated', `${task.title} を更新しました。`), ...state.events],
    },
    messages: [`${task.title} を更新しました。`],
  }
}

export function completeTask(state: FlowKanbanState, taskId: string): DomainResult {
  const task = state.tasks.find((item) => item.id === taskId)

  if (!task) {
    return { state, messages: ['対象タスクが見つかりません。'] }
  }

  if (task.status === 'done') {
    return { state, messages: ['このタスクはすでに完了しています。'] }
  }

  const completedTask: Task = {
    ...task,
    status: 'done',
    completedAt: nowIso(),
  }

  let workingState: FlowKanbanState = {
    ...state,
    tasks: state.tasks.map((item) => (item.id === taskId ? completedTask : item)),
    events: [createEvent('task.completed', `${task.title} を完了しました。`), ...state.events],
  }

  const nextTemplate = getNextTemplate(workingState, completedTask)
  const generatedTasks: Task[] = []
  const messages = [`${task.title} を完了しました。`]

  if (nextTemplate) {
    generatedTasks.push(createTaskFromTemplate(workingState, nextTemplate))
  } else {
    workingState = markProcessCompleted(workingState, task.processId)

    const followProcessIds = getOutgoingProcessIds(workingState, task.processId)
    for (const processId of followProcessIds) {
      if (canStartProcess(workingState, processId)) {
        generatedTasks.push(...createFirstTaskIfMissing(workingState, processId))
      }
    }
  }

  if (generatedTasks.length > 0) {
    workingState = {
      ...workingState,
      tasks: [...workingState.tasks, ...generatedTasks],
      events: [
        createEvent('tasks.auto_created', `${generatedTasks.length}件のタスクを自動生成しました。`),
        ...workingState.events,
      ],
    }
    messages.push(`${generatedTasks.length}件のタスクを自動生成しました。`)
  }

  if (isProjectCompleted(workingState)) {
    workingState = {
      ...workingState,
      project: { ...workingState.project, status: 'completed' },
      events: [createEvent('project.completed', 'プロジェクトが完了しました。'), ...workingState.events],
    }
    messages.push('プロジェクトが完了しました。')
  }

  return { state: workingState, messages }
}

export function createProcess(state: FlowKanbanState, name: string): DomainResult {
  const process: ProcessNode = {
    id: createId('process'),
    name,
    description: '',
    position: {
      x: 120 + state.processes.length * 90,
      y: 120 + state.processes.length * 35,
    },
    completedAt: null,
  }

  return {
    state: {
      ...state,
      project: state.project.status === 'completed' ? { ...state.project, status: 'active' } : state.project,
      processes: [...state.processes, process],
      events: [createEvent('process.created', `${name} を追加しました。`), ...state.events],
    },
    messages: [`${name} を追加しました。`],
  }
}

export function updateProcess(
  state: FlowKanbanState,
  processId: string,
  name: string,
  description: string,
): DomainResult {
  const process = state.processes.find((item) => item.id === processId)
  if (!process) return { state, messages: ['対象工程が見つかりません。'] }
  if (!canEditProcessDesign(state, processId)) return designLocked(state)

  return {
    state: {
      ...state,
      processes: state.processes.map((item) =>
        item.id === processId ? { ...item, name, description } : item,
      ),
      events: [createEvent('process.updated', `${name} を更新しました。`), ...state.events],
    },
    messages: [`${name} を更新しました。`],
  }
}

export function moveProcess(
  state: FlowKanbanState,
  processId: string,
  position: ProcessNode['position'],
): DomainResult {
  if (!state.processes.some((process) => process.id === processId)) {
    return { state, messages: ['対象工程が見つかりません。'] }
  }

  return {
    state: {
      ...state,
      processes: state.processes.map((process) =>
        process.id === processId ? { ...process, position } : process,
      ),
    },
    messages: [],
  }
}

export function deleteProcess(state: FlowKanbanState, processId: string): DomainResult {
  const process = state.processes.find((item) => item.id === processId)
  if (!process) return { state, messages: ['対象工程が見つかりません。'] }
  if (!canEditProcessDesign(state, processId)) return designLocked(state)

  return {
    state: {
      ...state,
      processes: state.processes.filter((item) => item.id !== processId),
      edges: state.edges.filter(
        (edge) => edge.fromProcessId !== processId && edge.toProcessId !== processId,
      ),
      taskTemplates: state.taskTemplates.filter((template) => template.processId !== processId),
      events: [createEvent('process.deleted', `${process.name} を削除しました。`), ...state.events],
    },
    messages: [`${process.name} を削除しました。`],
  }
}

export function createEdge(
  state: FlowKanbanState,
  fromProcessId: string,
  toProcessId: string,
): DomainResult {
  const edge = {
    id: createId('edge'),
    fromProcessId,
    toProcessId,
  }
  const candidate = {
    ...state,
    edges: [...state.edges, edge],
  }
  const source = state.processes.find((process) => process.id === fromProcessId)
  const target = state.processes.find((process) => process.id === toProcessId)

  if (!source || !target) {
    return { state, messages: ['接続する工程が見つかりません。'] }
  }

  if (fromProcessId === toProcessId) {
    return { state, messages: ['自分自身への接続は作成できません。'] }
  }

  if (hasDuplicateEdges(candidate)) {
    return { state, messages: ['同じ接続がすでに存在します。'] }
  }

  if (getProcessRuntimeStatus(state, toProcessId) !== 'not_started') {
    return { state, messages: ['開始済み工程への前提接続は追加できません。'] }
  }

  if (hasCycle(candidate)) {
    return { state, messages: ['循環する工程フローは作成できません。'] }
  }

  return {
    state: {
      ...candidate,
      events: [
        createEvent('process.connected', `${source?.name ?? '工程'} から ${target?.name ?? '工程'} へ接続しました。`),
        ...state.events,
      ],
    },
    messages: ['工程を接続しました。'],
  }
}

export function deleteEdge(state: FlowKanbanState, edgeId: string): DomainResult {
  const edge = state.edges.find((item) => item.id === edgeId)
  if (!edge) return { state, messages: ['対象接続が見つかりません。'] }
  if (!canEditProcessDesign(state, edge.toProcessId)) return designLocked(state)

  return {
    state: {
      ...state,
      edges: state.edges.filter((item) => item.id !== edgeId),
      events: [createEvent('process.disconnected', '工程の接続を削除しました。'), ...state.events],
    },
    messages: ['工程の接続を削除しました。'],
  }
}

export function createTaskTemplate(
  state: FlowKanbanState,
  processId: string,
  title: string,
  dueDate: string,
): DomainResult {
  if (!state.processes.some((process) => process.id === processId)) {
    return { state, messages: ['対象工程が見つかりません。'] }
  }
  if (!canEditProcessDesign(state, processId)) return designLocked(state)

  const orderIndex = getSortedTemplates(state, processId).length + 1
  const template: TaskTemplate = {
    id: createId('template'),
    processId,
    title,
    description: '',
    dueDate,
    orderIndex,
  }

  return {
    state: {
      ...state,
      taskTemplates: [...state.taskTemplates, template],
      events: [createEvent('task.created', `${title} の定義を追加しました。`), ...state.events],
    },
    messages: [`${title} の定義を追加しました。`],
  }
}

export function updateTaskTemplate(
  state: FlowKanbanState,
  templateId: string,
  title: string,
  dueDate: string,
): DomainResult {
  const template = state.taskTemplates.find((item) => item.id === templateId)
  if (!template) return { state, messages: ['対象カード定義が見つかりません。'] }
  if (!canEditProcessDesign(state, template.processId)) return designLocked(state)

  return {
    state: {
      ...state,
      taskTemplates: state.taskTemplates.map((item) =>
        item.id === templateId ? { ...item, title, dueDate } : item,
      ),
      events: [createEvent('task.updated', `${title} の定義を更新しました。`), ...state.events],
    },
    messages: [`${title} の定義を更新しました。`],
  }
}

export function deleteTaskTemplate(state: FlowKanbanState, templateId: string): DomainResult {
  const template = state.taskTemplates.find((item) => item.id === templateId)
  if (!template) return { state, messages: ['対象カード定義が見つかりません。'] }
  if (!canEditProcessDesign(state, template.processId)) return designLocked(state)

  const remaining = normalizeTemplateOrder(
    state.taskTemplates.filter((item) => item.id !== templateId),
    template.processId,
  )
  return {
    state: {
      ...state,
      taskTemplates: remaining,
      events: [createEvent('task.deleted', `${template.title} の定義を削除しました。`), ...state.events],
    },
    messages: [`${template.title} の定義を削除しました。`],
  }
}

export function moveTaskTemplate(
  state: FlowKanbanState,
  templateId: string,
  direction: 'up' | 'down',
): DomainResult {
  const template = state.taskTemplates.find((item) => item.id === templateId)
  if (!template) return { state, messages: ['対象カード定義が見つかりません。'] }
  if (!canEditProcessDesign(state, template.processId)) return designLocked(state)

  const sorted = getSortedTemplates(state, template.processId)
  const currentIndex = sorted.findIndex((item) => item.id === templateId)
  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (nextIndex < 0 || nextIndex >= sorted.length) {
    return { state, messages: ['これ以上移動できません。'] }
  }

  const currentTemplate = sorted[currentIndex]!
  sorted[currentIndex] = sorted[nextIndex]!
  sorted[nextIndex] = currentTemplate
  const reorderedIds = new Map(sorted.map((item, index) => [item.id, index + 1]))

  return {
    state: {
      ...state,
      taskTemplates: state.taskTemplates.map((item) =>
        item.processId === template.processId
          ? { ...item, orderIndex: reorderedIds.get(item.id)! }
          : item,
      ),
      events: [createEvent('task.reordered', `${template.title} の工程順を変更しました。`), ...state.events],
    },
    messages: [`${template.title} の工程順を変更しました。`],
  }
}

export function getSortedTemplates(state: FlowKanbanState, processId: string) {
  return state.taskTemplates
    .filter((template) => template.processId === processId)
    .sort((a, b) => a.orderIndex - b.orderIndex)
}

function canStartProcess(state: FlowKanbanState, processId: string) {
  if (state.tasks.some((task) => task.processId === processId)) {
    return false
  }

  const incomingIds = getIncomingProcessIds(state, processId)

  return incomingIds.every((incomingId) => {
    const process = state.processes.find((item) => item.id === incomingId)
    return Boolean(process?.completedAt)
  })
}

function canEditProcessDesign(state: FlowKanbanState, processId: string) {
  return getProcessRuntimeStatus(state, processId) === 'not_started'
}

function designLocked(state: FlowKanbanState): DomainResult {
  return { state, messages: ['開始済み工程の設計は変更できません。'] }
}

function normalizeTemplateOrder(taskTemplates: TaskTemplate[], processId: string) {
  const orderById = new Map(
    taskTemplates
      .filter((template) => template.processId === processId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((template, index) => [template.id, index + 1]),
  )
  return taskTemplates.map((template) =>
    template.processId === processId
      ? { ...template, orderIndex: orderById.get(template.id)! }
      : template,
  )
}

function createFirstTaskIfMissing(state: FlowKanbanState, processId: string) {
  const firstTemplate = getSortedTemplates(state, processId)[0]

  if (!firstTemplate) {
    return []
  }

  const exists = state.tasks.some(
    (task) => task.processId === processId && task.taskTemplateId === firstTemplate.id,
  )

  return exists ? [] : [createTaskFromTemplate(state, firstTemplate)]
}

function createTaskFromTemplate(state: FlowKanbanState, template: TaskTemplate): Task {
  return {
    id: createId('task'),
    projectId: state.project.id,
    processId: template.processId,
    taskTemplateId: template.id,
    title: template.title,
    description: template.description,
    status: 'todo',
    dueDate: template.dueDate,
    completedAt: null,
    isTitleOverridden: false,
    isDescriptionOverridden: false,
  }
}

function getNextTemplate(state: FlowKanbanState, task: Task) {
  const currentTemplate = state.taskTemplates.find((template) => template.id === task.taskTemplateId)

  if (!currentTemplate) {
    return undefined
  }

  return getSortedTemplates(state, task.processId).find(
    (template) => template.orderIndex === currentTemplate.orderIndex + 1,
  )
}

function markProcessCompleted(state: FlowKanbanState, processId: string): FlowKanbanState {
  const process = state.processes.find((item) => item.id === processId)

  if (process?.completedAt) {
    return state
  }

  return {
    ...state,
    processes: state.processes.map((item) =>
      item.id === processId ? { ...item, completedAt: nowIso() } : item,
    ),
  }
}

function isProjectCompleted(state: FlowKanbanState) {
  if (state.project.status !== 'active') {
    return false
  }

  const terminalProcesses = state.processes.filter(
    (process) => getOutgoingProcessIds(state, process.id).length === 0,
  )

  return terminalProcesses.length > 0 && terminalProcesses.every((process) => process.completedAt)
}

function hasDuplicateEdges(state: FlowKanbanState) {
  const keys = new Set<string>()

  for (const edge of state.edges) {
    const key = `${edge.fromProcessId}:${edge.toProcessId}`
    if (keys.has(key)) {
      return true
    }
    keys.add(key)
  }

  return false
}

function hasIsolatedProcesses(state: FlowKanbanState) {
  return state.processes.some(
    (process) =>
      getIncomingProcessIds(state, process.id).length === 0 &&
      getOutgoingProcessIds(state, process.id).length === 0,
  )
}

function hasCycle(state: FlowKanbanState) {
  const visited = new Set<string>()
  const visiting = new Set<string>()

  function visit(processId: string): boolean {
    if (visiting.has(processId)) {
      return true
    }

    if (visited.has(processId)) {
      return false
    }

    visiting.add(processId)

    for (const nextId of getOutgoingProcessIds(state, processId)) {
      if (visit(nextId)) {
        return true
      }
    }

    visiting.delete(processId)
    visited.add(processId)
    return false
  }

  return state.processes.some((process) => visit(process.id))
}

function createEvent(type: FlowEvent['type'], message: string): FlowEvent {
  return {
    id: createId('event'),
    type,
    message,
    occurredAt: nowIso(),
  }
}
