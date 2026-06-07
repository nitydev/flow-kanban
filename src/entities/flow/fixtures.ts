import type { FlowKanbanState } from './types'
export const initialFlowState: FlowKanbanState = {
  project: {
    id: 'project_001',
    name: '新しい設計図',
    description: '工程とカードを追加して、自分のフローを設計します。',
    status: 'draft',
  },
  processes: [],
  edges: [],
  taskTemplates: [],
  tasks: [],
  events: [],
}
