import '@xyflow/react/dist/style.css'

import { DesignerPanel } from './designer-panel'
import { EventLog } from './event-log'
import { KanbanBoard } from './kanban-board'
import { ProcessFlow } from './process-flow'
import { ProcessList } from './process-list'
import { ProjectSummary } from './project-summary'
import { useFlowKanban } from '../model/use-flow-kanban'

export function FlowKanbanPage() {
  const { actions, notices, startErrors, state } = useFlowKanban()

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-4 lg:px-6">
        <ProjectSummary state={state} notices={notices} startErrors={startErrors} onStart={actions.start} />

        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <section className="rounded-md border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-left">
                  <h2 className="m-0 text-base font-semibold text-slate-950">工程フロー</h2>
                  <p className="text-sm text-slate-500">分岐・合流を持つDAGとして管理します。</p>
                </div>
              </div>
              <ProcessFlow state={state} getProcessStatus={actions.getProcessStatus} />
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-4">
              <div className="mb-3 text-left">
                <h2 className="m-0 text-base font-semibold text-slate-950">カンバン</h2>
                <p className="text-sm text-slate-500">
                  完了列へ移動すると、次タスクまたは後続工程の最初のタスクを自動生成します。
                </p>
              </div>
              <KanbanBoard state={state} onMoveTask={actions.moveTask} />
            </section>
          </div>

          <div className="space-y-4">
            <DesignerPanel
              state={state}
              onAddProcess={actions.addProcess}
              onAddTemplate={actions.addTemplate}
              onConnect={actions.connectProcesses}
            />
            <ProcessList
              state={state}
              getProcessStatus={actions.getProcessStatus}
              getTemplates={actions.getTemplates}
            />
            <EventLog events={state.events} />
          </div>
        </div>
      </div>
    </main>
  )
}
