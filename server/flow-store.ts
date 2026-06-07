import { initialFlowState } from '../src/entities/flow/fixtures'
import type { FlowKanbanState, TaskStatus } from '../src/entities/flow/types'
import {
  createEdge,
  createProcess,
  createTaskTemplate,
  deleteEdge,
  deleteProcess,
  deleteTaskTemplate,
  moveProcess,
  moveTaskTemplate,
  startProject,
  updateProcess,
  updateTaskTemplate,
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
  updateProcess: (processId: string, name: string, description: string) =>
    runMutation((current) => updateProcess(current, processId, name, description)),
  moveProcess: (processId: string, position: { x: number; y: number }) =>
    runMutation((current) => moveProcess(current, processId, position)),
  deleteProcess: (processId: string) => runMutation((current) => deleteProcess(current, processId)),
  addEdge: (fromProcessId: string, toProcessId: string) =>
    runMutation((current) => createEdge(current, fromProcessId, toProcessId)),
  deleteEdge: (edgeId: string) => runMutation((current) => deleteEdge(current, edgeId)),
  addTaskTemplate: (processId: string, title: string, dueDate: string) =>
    runMutation((current) => createTaskTemplate(current, processId, title, dueDate)),
  updateTaskTemplate: (templateId: string, title: string, dueDate: string) =>
    runMutation((current) => updateTaskTemplate(current, templateId, title, dueDate)),
  deleteTaskTemplate: (templateId: string) =>
    runMutation((current) => deleteTaskTemplate(current, templateId)),
  moveTaskTemplate: (templateId: string, direction: 'up' | 'down') =>
    runMutation((current) => moveTaskTemplate(current, templateId, direction)),
}
