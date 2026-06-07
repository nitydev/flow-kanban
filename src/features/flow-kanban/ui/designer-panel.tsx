import { ArrowRight, Plus, Route, SendHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'

import type { FlowKanbanState } from '@/entities/flow/types'
import { addDaysIso } from '@/shared/lib/date'

type DesignerPanelProps = {
  mode?: 'all' | 'cards' | 'flow'
  state: FlowKanbanState
  onAddProcess: (name: string) => void
  onAddTemplate: (processId: string, title: string, dueDate: string) => void
  onConnect: (fromProcessId: string, toProcessId: string) => void
  onDisconnect: (edgeId: string) => void
}

export function DesignerPanel({ mode = 'all', state, onAddProcess, onAddTemplate, onConnect, onDisconnect }: DesignerPanelProps) {
  const [processName, setProcessName] = useState('')
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateProcessId, setTemplateProcessId] = useState(state.processes[0]?.id ?? '')
  const [dueDate, setDueDate] = useState(addDaysIso(3))
  const [fromProcessId, setFromProcessId] = useState(state.processes[0]?.id ?? '')
  const [toProcessId, setToProcessId] = useState(state.processes[1]?.id ?? state.processes[0]?.id ?? '')

  const firstProcessId = state.processes[0]?.id ?? ''
  const selectedTemplateProcessId = state.processes.some((process) => process.id === templateProcessId)
    ? templateProcessId
    : firstProcessId
  const selectedFromProcessId = state.processes.some((process) => process.id === fromProcessId)
    ? fromProcessId
    : firstProcessId
  const selectedToProcessId = state.processes.some((process) => process.id === toProcessId)
    ? toProcessId
    : state.processes[1]?.id ?? firstProcessId

  return (
    <aside className="surface overflow-hidden">
      <div className="border-b border-slate-200/70 px-5 py-4 dark:border-slate-800">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">Build your flow</p>
        <h2 className="mt-1 text-base font-bold tracking-tight text-slate-950 dark:text-white">
          {mode === 'cards' ? 'カード作成' : 'フロー設計ツール'}
        </h2>
      </div>
      {mode !== 'cards' && <section className="border-b border-slate-200/70 p-5 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"><Plus className="size-3.5" /></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">工程を追加</h3>
        </div>
        <div className="flex gap-2">
          <input
            value={processName}
            onChange={(event) => setProcessName(event.target.value)}
            placeholder="例: リリース"
            className="field min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (processName.trim()) {
                onAddProcess(processName.trim())
                setProcessName('')
              }
            }}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>}

      {mode !== 'cards' && <section className={mode === 'flow' ? 'p-5' : 'border-b border-slate-200/70 p-5 dark:border-slate-800'}>
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"><SendHorizontal className="size-3.5" /></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">工程を接続</h3>
        </div>
        <div className="grid gap-2">
          <ProcessSelect processes={state.processes} value={selectedFromProcessId} onChange={setFromProcessId} />
          <ProcessSelect processes={state.processes} value={selectedToProcessId} onChange={setToProcessId} />
          <button
            type="button"
            onClick={() => onConnect(selectedFromProcessId, selectedToProcessId)}
            disabled={!selectedFromProcessId || !selectedToProcessId}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            接続する
          </button>
          {state.edges.map((edge) => {
            const from = state.processes.find((process) => process.id === edge.fromProcessId)
            const to = state.processes.find((process) => process.id === edge.toProcessId)
            return (
              <div key={edge.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                <span className="truncate">{from?.name} <span className="mx-1 text-sky-500">→</span> {to?.name}</span>
                <button type="button" onClick={() => window.confirm('この接続を削除しますか？') && onDisconnect(edge.id)} aria-label="接続を削除" className="rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </section>}

      {mode !== 'flow' && <section className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><Route className="size-3.5" /></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">カードを追加</h3>
        </div>
        <div className="grid gap-2">
          <ProcessSelect processes={state.processes} value={selectedTemplateProcessId} onChange={setTemplateProcessId} />
          <input
            value={templateTitle}
            onChange={(event) => setTemplateTitle(event.target.value)}
            placeholder="例: 動作確認を行う"
            className="field"
          />
          <input
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            className="field"
          />
          <button
            type="button"
            onClick={() => {
              if (selectedTemplateProcessId && templateTitle.trim()) {
                onAddTemplate(selectedTemplateProcessId, templateTitle.trim(), dueDate)
                setTemplateTitle('')
              }
            }}
            className="rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            定義を追加
          </button>
        </div>
      </section>}
    </aside>
  )
}

function ProcessSelect({
  processes,
  value,
  onChange,
}: {
  processes: FlowKanbanState['processes']
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="field"
    >
      {processes.map((process) => (
        <option key={process.id} value={process.id}>
          {process.name}
        </option>
      ))}
    </select>
  )
}
