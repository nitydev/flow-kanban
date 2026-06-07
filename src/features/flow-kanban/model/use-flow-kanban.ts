import { useMemo, useState } from 'react'

import { initialFlowState } from '@/entities/flow/fixtures'
import type { FlowKanbanState, TaskStatus } from '@/entities/flow/types'
import {
  createEdge,
  createProcess,
  createTaskTemplate,
  deleteEdge,
  deleteProcess,
  deleteTaskTemplate,
  getProcessRuntimeStatus,
  getSortedTemplates,
  moveProcess,
  moveTaskTemplate,
  startProject,
  updateProcess,
  updateTaskTemplate,
  updateTaskStatus,
  validateProjectStart,
} from '../domain/flow-domain'
import { addDaysIso } from '@/shared/lib/date'

type Mutation = (state: FlowKanbanState) => {
  state: FlowKanbanState
  messages: string[]
}

export function useFlowKanban() {
  const [state, setState] = useState(initialFlowState)
  const [notices, setNotices] = useState<string[]>(['README仕様に基づくローカルMVPです。'])

  const startErrors = useMemo(() => validateProjectStart(state), [state])

  function commit(mutation: Mutation) {
    setState((current) => {
      const result = mutation(current)
      setNotices(result.messages)
      return result.state
    })
  }

  function start() {
    commit(startProject)
  }

  function moveTask(taskId: string, status: TaskStatus) {
    commit((current) => updateTaskStatus(current, taskId, status))
  }

  function addProcess(name: string) {
    commit((current) => createProcess(current, name))
  }

  function connectProcesses(fromProcessId: string, toProcessId: string) {
    commit((current) => createEdge(current, fromProcessId, toProcessId))
  }

  function editProcess(processId: string, name: string, description: string) {
    commit((current) => updateProcess(current, processId, name, description))
  }

  function positionProcess(processId: string, position: { x: number; y: number }) {
    setState((current) => moveProcess(current, processId, position).state)
  }

  function removeProcess(processId: string) {
    commit((current) => deleteProcess(current, processId))
  }

  function disconnectProcesses(edgeId: string) {
    commit((current) => deleteEdge(current, edgeId))
  }

  function addTemplate(processId: string, title: string, dueDate = addDaysIso(3)) {
    commit((current) => createTaskTemplate(current, processId, title, dueDate))
  }

  function editTemplate(templateId: string, title: string, dueDate: string) {
    commit((current) => updateTaskTemplate(current, templateId, title, dueDate))
  }

  function removeTemplate(templateId: string) {
    commit((current) => deleteTaskTemplate(current, templateId))
  }

  function reorderTemplate(templateId: string, direction: 'up' | 'down') {
    commit((current) => moveTaskTemplate(current, templateId, direction))
  }

  function getProcessStatus(processId: string) {
    return getProcessRuntimeStatus(state, processId)
  }

  function getTemplates(processId: string) {
    return getSortedTemplates(state, processId)
  }

  return {
    state,
    notices,
    startErrors,
    actions: {
      addProcess,
      addTemplate,
      connectProcesses,
      disconnectProcesses,
      editProcess,
      editTemplate,
      getProcessStatus,
      getTemplates,
      moveTask,
      positionProcess,
      removeProcess,
      removeTemplate,
      reorderTemplate,
      start,
    },
  }
}
