import { AlertCircle, CheckCircle2, Play } from 'lucide-react'

import type { FlowKanbanState } from '@/entities/flow/types'

type ProjectSummaryProps = {
  state: FlowKanbanState
  notices: string[]
  startErrors: string[]
  onStart: () => void
}

export function ProjectSummary({ state, notices, startErrors, onStart }: ProjectSummaryProps) {
  const completedProcesses = state.processes.filter((process) => process.completedAt).length
  const doneTasks = state.tasks.filter((task) => task.status === 'done').length

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-left">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
              {state.project.status}
            </span>
            <span className="text-xs text-slate-400">Asia/Tokyo date rules</span>
          </div>
          <h1 className="m-0 text-2xl font-semibold text-slate-950">{state.project.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{state.project.description}</p>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={state.project.status !== 'draft'}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Play className="size-4" />
          プロジェクト開始
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <Metric label="工程" value={`${completedProcesses}/${state.processes.length}`} />
        <Metric label="タスク" value={`${doneTasks}/${state.tasks.length}`} />
        <Metric label="接続" value={String(state.edges.length)} />
        <Metric label="定義" value={String(state.taskTemplates.length)} />
      </div>

      <div className="mt-4 grid gap-2">
        {notices.map((notice) => (
          <div key={notice} className="flex items-center gap-2 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800">
            <CheckCircle2 className="size-4" />
            {notice}
          </div>
        ))}
        {startErrors.map((error) => (
          <div key={error} className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertCircle className="size-4" />
            {error}
          </div>
        ))}
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-950">{value}</div>
    </div>
  )
}
