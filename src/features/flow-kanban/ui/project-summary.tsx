import { AlertCircle, CheckCircle2, Moon, Play, Sun } from 'lucide-react'

import { useTheme } from '@/app/theme-context'
import type { FlowKanbanState } from '@/entities/flow/types'

type ProjectSummaryProps = {
  state: FlowKanbanState
  notices: string[]
  startErrors: string[]
  onStart: () => void
}

export function ProjectSummary({ state, notices, startErrors, onStart }: ProjectSummaryProps) {
  const { theme, toggleTheme } = useTheme()
  const completedProcesses = state.processes.filter((process) => process.completedAt).length
  const doneTasks = state.tasks.filter((task) => task.status === 'done').length

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-left">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {state.project.status}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Asia/Tokyo date rules</span>
          </div>
          <h1 className="m-0 text-2xl font-semibold text-slate-950 dark:text-slate-50">{state.project.name}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{state.project.description}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`${theme === 'dark' ? 'ライト' : 'ダーク'}モードに切り替える`}
            title={`${theme === 'dark' ? 'ライト' : 'ダーク'}モードに切り替える`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={state.project.status !== 'draft'}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-sky-600 dark:hover:bg-sky-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            <Play className="size-4" />
            プロジェクト開始
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <Metric label="工程" value={`${completedProcesses}/${state.processes.length}`} />
        <Metric label="タスク" value={`${doneTasks}/${state.tasks.length}`} />
        <Metric label="接続" value={String(state.edges.length)} />
        <Metric label="定義" value={String(state.taskTemplates.length)} />
      </div>

      <div className="mt-4 grid gap-2">
        {notices.map((notice) => (
          <div key={notice} className="flex items-center gap-2 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950 dark:text-sky-200">
            <CheckCircle2 className="size-4" />
            {notice}
          </div>
        ))}
        {startErrors.map((error) => (
          <div key={error} className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
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
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left dark:border-slate-700 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-lg font-semibold text-slate-950 dark:text-slate-50">{value}</div>
    </div>
  )
}
