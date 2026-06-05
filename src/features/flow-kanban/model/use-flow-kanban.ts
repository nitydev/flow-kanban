import { useMemo, useState } from 'react'

import { initialFlowState } from '@/entities/flow/fixtures'
import type { FlowKanbanState, TaskStatus } from '@/entities/flow/types'
import {
  createEdge,
  createProcess,
  createTaskTemplate,
  getProcessRuntimeStatus,
  getSortedTemplates,
  startProject,
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

  function addTemplate(processId: string, title: string, dueDate = addDaysIso(3)) {
    commit((current) => createTaskTemplate(current, processId, title, dueDate))
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
      getProcessStatus,
      getTemplates,
      moveTask,
      start,
    },
  }
}
