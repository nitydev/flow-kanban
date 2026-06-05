import type { FlowKanbanState, ProcessRuntimeStatus } from '@/entities/flow/types'

type ProcessListProps = {
  state: FlowKanbanState
  getProcessStatus: (processId: string) => ProcessRuntimeStatus
  getTemplates: (processId: string) => FlowKanbanState['taskTemplates']
}

const statusLabel: Record<ProcessRuntimeStatus, string> = {
  completed: '完了',
  not_started: '未開始',
  running: '開始済み',
}

export function ProcessList({ state, getProcessStatus, getTemplates }: ProcessListProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="m-0 mb-3 text-left text-base font-semibold text-slate-950">工程とタスク定義</h2>
      <div className="space-y-3">
        {state.processes.map((process) => {
          const status = getProcessStatus(process.id)
          const templates = getTemplates(process.id)

          return (
            <article key={process.id} className="rounded-md border border-slate-200 p-3 text-left">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{process.name}</h3>
                  <p className="text-xs text-slate-500">{process.description || '説明なし'}</p>
                </div>
                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {statusLabel[status]}
                </span>
              </div>
              <ol className="space-y-1">
                {templates.map((template) => (
                  <li key={template.id} className="flex items-center justify-between gap-3 text-xs text-slate-600">
                    <span>
                      {template.orderIndex}. {template.title}
                    </span>
                    <time className="shrink-0 text-slate-400">{template.dueDate}</time>
                  </li>
                ))}
              </ol>
            </article>
          )
        })}
      </div>
    </section>
  )
}
