import { AlertCircle, ArrowRight, CheckCircle2, GitCommitHorizontal, Layers3, Moon, Play, Sun, Workflow } from 'lucide-react'

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
    <section className="surface overflow-hidden">
      <div className="relative overflow-hidden border-b border-slate-200/70 px-5 py-6 sm:px-7 dark:border-slate-800">
        <div className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-gradient-to-br from-violet-400/20 to-sky-400/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                <span className="status-dot bg-violet-500" />
                {state.project.status}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Workspace / Flow design</span>
            </div>
            <h1 className="m-0 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl dark:text-white">{state.project.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{state.project.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`${theme === 'dark' ? 'ライト' : 'ダーク'}モードに切り替える`}
              title={`${theme === 'dark' ? 'ライト' : 'ダーク'}モードに切り替える`}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onStart}
              disabled={state.project.status !== 'draft'}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none dark:disabled:from-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-400"
            >
              <Play className="size-4" />
              プロジェクト開始
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-slate-200/70 sm:grid-cols-4 dark:bg-slate-800">
        <Metric icon={<Workflow className="size-4" />} label="工程" value={`${completedProcesses}/${state.processes.length}`} />
        <Metric icon={<CheckCircle2 className="size-4" />} label="タスク" value={`${doneTasks}/${state.tasks.length}`} />
        <Metric icon={<GitCommitHorizontal className="size-4" />} label="接続" value={String(state.edges.length)} />
        <Metric icon={<Layers3 className="size-4" />} label="カード定義" value={String(state.taskTemplates.length)} />
      </div>

      <div className="grid gap-2 p-4 sm:px-6">
        {notices.map((notice) => (
          <div key={notice} className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 className="size-4" />
            {notice}
          </div>
        ))}
        {startErrors.map((error) => (
          <div key={error} className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle className="size-4" />
            {error}
          </div>
        ))}
      </div>
    </section>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/85 px-5 py-4 text-left dark:bg-slate-900/80">
      <div className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{icon}</div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</div>
        <div className="mt-0.5 text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">{value}</div>
      </div>
    </div>
  )
}
