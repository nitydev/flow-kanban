import { describe, expect, it } from 'vitest'

import { initialFlowState } from '@/entities/flow/fixtures'
import type { FlowKanbanState } from '@/entities/flow/types'
import { completeTask, startProject, updateTaskStatus } from './flow-domain'

function freshState(): FlowKanbanState {
  return structuredClone(initialFlowState)
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
})
