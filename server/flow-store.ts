import { initialFlowState } from '../src/entities/flow/fixtures'
import type { FlowKanbanState, TaskStatus } from '../src/entities/flow/types'
import {
  createEdge,
  createProcess,
  createTaskTemplate,
  startProject,
  updateTaskStatus,
} from '../src/features/flow-kanban/domain/flow-domain'

export type MutationResult = {
  state: FlowKanbanState
  messages: string[]
}

let state: FlowKanbanState = structuredClone(initialFlowState)

export function getFlowState() {
  return state
}

export function replaceFlowState(nextState: FlowKanbanState) {
  state = nextState
  return state
}

export function resetFlowState() {
  state = structuredClone(initialFlowState)
  return state
}

export function runMutation(mutation: (current: FlowKanbanState) => MutationResult) {
  const result = mutation(state)
  state = result.state
  return result
}

export const flowMutations = {
  startProject: () => runMutation(startProject),
  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    runMutation((current) => updateTaskStatus(current, taskId, status)),
  addProcess: (name: string) => runMutation((current) => createProcess(current, name)),
  addEdge: (fromProcessId: string, toProcessId: string) =>
    runMutation((current) => createEdge(current, fromProcessId, toProcessId)),
  addTaskTemplate: (processId: string, title: string, dueDate: string) =>
    runMutation((current) => createTaskTemplate(current, processId, title, dueDate)),
}
