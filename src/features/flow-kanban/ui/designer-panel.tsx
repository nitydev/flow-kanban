import { Plus, Route, SendHorizontal } from 'lucide-react'
import { useState } from 'react'

import type { FlowKanbanState } from '@/entities/flow/types'
import { addDaysIso } from '@/shared/lib/date'

type DesignerPanelProps = {
  state: FlowKanbanState
  onAddProcess: (name: string) => void
  onAddTemplate: (processId: string, title: string, dueDate: string) => void
  onConnect: (fromProcessId: string, toProcessId: string) => void
}

export function DesignerPanel({ state, onAddProcess, onAddTemplate, onConnect }: DesignerPanelProps) {
  const [processName, setProcessName] = useState('')
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateProcessId, setTemplateProcessId] = useState(state.processes[0]?.id ?? '')
  const [dueDate, setDueDate] = useState(addDaysIso(3))
  const [fromProcessId, setFromProcessId] = useState(state.processes[0]?.id ?? '')
  const [toProcessId, setToProcessId] = useState(state.processes[1]?.id ?? state.processes[0]?.id ?? '')

  return (
    <aside className="space-y-4">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus className="size-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">工程追加</h3>
        </div>
        <div className="flex gap-2">
          <input
            value={processName}
            onChange={(event) => setProcessName(event.target.value)}
            placeholder="例: リリース"
            className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
          <button
            type="button"
            onClick={() => {
              if (processName.trim()) {
                onAddProcess(processName.trim())
                setProcessName('')
              }
            }}
            className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white"
          >
            追加
          </button>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <SendHorizontal className="size-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">接続追加</h3>
        </div>
        <div className="grid gap-2">
          <ProcessSelect processes={state.processes} value={fromProcessId} onChange={setFromProcessId} />
          <ProcessSelect processes={state.processes} value={toProcessId} onChange={setToProcessId} />
          <button
            type="button"
            onClick={() => onConnect(fromProcessId, toProcessId)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
          >
            接続する
          </button>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Route className="size-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">タスク定義追加</h3>
        </div>
        <div className="grid gap-2">
          <ProcessSelect processes={state.processes} value={templateProcessId} onChange={setTemplateProcessId} />
          <input
            value={templateTitle}
            onChange={(event) => setTemplateTitle(event.target.value)}
            placeholder="例: 動作確認を行う"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
          <input
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
          <button
            type="button"
            onClick={() => {
              if (templateProcessId && templateTitle.trim()) {
                onAddTemplate(templateProcessId, templateTitle.trim(), dueDate)
                setTemplateTitle('')
              }
            }}
            className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white"
          >
            定義を追加
          </button>
        </div>
      </section>
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
      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
    >
      {processes.map((process) => (
        <option key={process.id} value={process.id}>
          {process.name}
        </option>
      ))}
    </select>
  )
}
