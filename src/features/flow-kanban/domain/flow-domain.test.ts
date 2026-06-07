import { describe, expect, it } from 'vitest'

import type { FlowKanbanState } from '@/entities/flow/types'
import {
  completeTask,
  deleteProcess,
  deleteTaskTemplate,
  moveProcess,
  moveTaskTemplate,
  startProject,
  updateTaskStatus,
} from './flow-domain'

function freshState(): FlowKanbanState {
  return {
    project: { id: 'project', name: 'test', description: '', status: 'draft' },
    processes: [
      { id: 'process_requirements', name: '要件', description: '', position: { x: 0, y: 0 }, completedAt: null },
      { id: 'process_design', name: '設計', description: '', position: { x: 0, y: 0 }, completedAt: null },
      { id: 'process_frontend', name: 'FE', description: '', position: { x: 0, y: 0 }, completedAt: null },
      { id: 'process_backend', name: 'BE', description: '', position: { x: 0, y: 0 }, completedAt: null },
      { id: 'process_test', name: 'テスト', description: '', position: { x: 0, y: 0 }, completedAt: null },
    ],
    edges: [
      { id: 'e1', fromProcessId: 'process_requirements', toProcessId: 'process_design' },
      { id: 'e2', fromProcessId: 'process_design', toProcessId: 'process_frontend' },
      { id: 'e3', fromProcessId: 'process_design', toProcessId: 'process_backend' },
      { id: 'e4', fromProcessId: 'process_frontend', toProcessId: 'process_test' },
      { id: 'e5', fromProcessId: 'process_backend', toProcessId: 'process_test' },
    ],
    taskTemplates: [
      ['template_req_1', 'process_requirements', 1],
      ['template_req_2', 'process_requirements', 2],
      ['template_design_1', 'process_design', 1],
      ['template_design_2', 'process_design', 2],
      ['template_fe_1', 'process_frontend', 1],
      ['template_fe_2', 'process_frontend', 2],
      ['template_be_1', 'process_backend', 1],
      ['template_be_2', 'process_backend', 2],
      ['template_test_1', 'process_test', 1],
    ].map(([id, processId, orderIndex]) => ({
      id: String(id),
      processId: String(processId),
      title: String(id),
      description: '',
      dueDate: '2026-06-30',
      orderIndex: Number(orderIndex),
    })),
    tasks: [],
    events: [],
  }
}

function taskByTemplate(state: FlowKanbanState, templateId: string) {
  const task = state.tasks.find((item) => item.taskTemplateId === templateId)

  if (!task) {
    throw new Error(`Task for template ${templateId} was not found.`)
  }

  return task
}

describe('flow domain', () => {
  it('starts a project by creating only the first task of each start process', () => {
    const result = startProject(freshState())

    expect(result.state.project.status).toBe('active')
    expect(result.state.tasks).toHaveLength(1)
    expect(result.state.tasks[0]?.taskTemplateId).toBe('template_req_1')
  })

  it('creates the next task in the same process before completing the process', () => {
    const started = startProject(freshState()).state
    const firstTask = taskByTemplate(started, 'template_req_1')
    const result = completeTask(started, firstTask.id)

    expect(result.state.tasks.map((task) => task.taskTemplateId)).toContain('template_req_2')
    expect(result.state.processes.find((process) => process.id === 'process_requirements')?.completedAt).toBeNull()
  })

  it('starts downstream processes after the source process is completed', () => {
    let state = startProject(freshState()).state
    state = completeTask(state, taskByTemplate(state, 'template_req_1').id).state
    state = completeTask(state, taskByTemplate(state, 'template_req_2').id).state

    expect(state.processes.find((process) => process.id === 'process_requirements')?.completedAt).toBeTruthy()
    expect(state.tasks.map((task) => task.taskTemplateId)).toContain('template_design_1')
  })

  it('waits to start a join process until all prerequisite processes are completed', () => {
    let state = startProject(freshState()).state

    for (const templateId of ['template_req_1', 'template_req_2', 'template_design_1', 'template_design_2']) {
      state = completeTask(state, taskByTemplate(state, templateId).id).state
    }

    expect(state.tasks.map((task) => task.taskTemplateId)).toContain('template_fe_1')
    expect(state.tasks.map((task) => task.taskTemplateId)).toContain('template_be_1')

    for (const templateId of ['template_fe_1', 'template_fe_2']) {
      state = completeTask(state, taskByTemplate(state, templateId).id).state
    }

    expect(state.processes.find((process) => process.id === 'process_frontend')?.completedAt).toBeTruthy()
    expect(state.tasks.map((task) => task.taskTemplateId)).not.toContain('template_test_1')

    for (const templateId of ['template_be_1', 'template_be_2']) {
      state = completeTask(state, taskByTemplate(state, templateId).id).state
    }

    expect(state.tasks.map((task) => task.taskTemplateId)).toContain('template_test_1')
  })

  it('does not allow a completed task to return to an unfinished status', () => {
    const started = startProject(freshState()).state
    const completed = completeTask(started, taskByTemplate(started, 'template_req_1').id).state
    const completedTask = taskByTemplate(completed, 'template_req_1')
    const result = updateTaskStatus(completed, completedTask.id, 'todo')

    expect(result.state.tasks.find((task) => task.id === completedTask.id)?.status).toBe('done')
    expect(result.messages).toContain('完了済みタスクは未完了に戻せません。')
  })

  it('deletes a process together with its card definitions and connections', () => {
    const result = deleteProcess(freshState(), 'process_frontend')

    expect(result.state.processes.some((process) => process.id === 'process_frontend')).toBe(false)
    expect(result.state.taskTemplates.some((template) => template.processId === 'process_frontend')).toBe(false)
    expect(result.state.edges.some((edge) => edge.fromProcessId === 'process_frontend' || edge.toProcessId === 'process_frontend')).toBe(false)
  })

  it('reorders and renumbers card definitions after moving and deleting', () => {
    let state = moveTaskTemplate(freshState(), 'template_req_2', 'up').state
    expect(state.taskTemplates.find((template) => template.id === 'template_req_2')?.orderIndex).toBe(1)

    state = deleteTaskTemplate(state, 'template_req_2').state
    expect(state.taskTemplates.find((template) => template.id === 'template_req_1')?.orderIndex).toBe(1)
  })

  it('protects card definitions after their process has started', () => {
    const started = startProject(freshState()).state
    const result = deleteTaskTemplate(started, 'template_req_1')

    expect(result.state.taskTemplates.some((template) => template.id === 'template_req_1')).toBe(true)
    expect(result.messages).toContain('開始済み工程の設計は変更できません。')
  })

  it('stores a dragged process position without changing its runtime state', () => {
    const started = startProject(freshState()).state
    const result = moveProcess(started, 'process_requirements', { x: 240, y: 180 })

    expect(result.state.processes.find((process) => process.id === 'process_requirements')?.position).toEqual({
      x: 240,
      y: 180,
    })
    expect(result.state.tasks).toEqual(started.tasks)
  })
})
