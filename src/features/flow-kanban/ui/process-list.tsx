import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import type { FlowKanbanState, ProcessRuntimeStatus, TaskTemplate } from '@/entities/flow/types'

type ProcessListProps = {
  showTemplates?: boolean
  state: FlowKanbanState
  getProcessStatus: (processId: string) => ProcessRuntimeStatus
  getTemplates: (processId: string) => FlowKanbanState['taskTemplates']
  onDeleteProcess: (processId: string) => void
  onDeleteTemplate: (templateId: string) => void
  onMoveTemplate: (templateId: string, direction: 'up' | 'down') => void
  onUpdateProcess: (processId: string, name: string, description: string) => void
  onUpdateTemplate: (templateId: string, title: string, dueDate: string) => void
}

const statusLabel: Record<ProcessRuntimeStatus, string> = {
  completed: '完了',
  not_started: '未開始',
  running: '開始済み',
}

export function ProcessList({
  showTemplates = true,
  state,
  getProcessStatus,
  getTemplates,
  onDeleteProcess,
  onDeleteTemplate,
  onMoveTemplate,
  onUpdateProcess,
  onUpdateTemplate,
}: ProcessListProps) {
  return (
    <section className="surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Structure</p>
          <h2 className="mt-1 text-left text-sm font-bold tracking-tight text-slate-950 dark:text-slate-50">
            {showTemplates ? 'カード定義と工程順' : '工程一覧'}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {state.processes.length} 工程
        </span>
      </div>
      <div className="space-y-3">
        {state.processes.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs leading-5 text-slate-500 dark:border-slate-700">
            工程を追加すると、ここでカードの順番を管理できます。
          </p>
        )}
        {state.processes.map((process) => {
          const status = getProcessStatus(process.id)
          const templates = getTemplates(process.id)

          return (
            <article key={process.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/45 p-3.5 text-left transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-slate-700 dark:hover:bg-slate-800/40">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">{process.name}</h3>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">{process.description || '説明なし'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                    {statusLabel[status]}
                  </span>
                  <ProcessEditButton process={process} disabled={status !== 'not_started'} onUpdate={onUpdateProcess} />
                  <IconButton label="工程を削除" disabled={status !== 'not_started'} onClick={() => window.confirm(`${process.name} と配下のカード定義・接続を削除しますか？`) && onDeleteProcess(process.id)}>
                    <Trash2 className="size-3.5" />
                  </IconButton>
                </div>
              </div>
              {showTemplates && <ol className="mt-3 space-y-1">
                {templates.map((template, index) => (
                  <li key={template.id} className="group flex items-center justify-between gap-2 rounded-xl bg-white/70 px-2 py-1.5 text-xs text-slate-600 shadow-sm transition hover:bg-white dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800">
                    <span className="min-w-0 truncate">
                      <span className="mr-1.5 text-[10px] font-bold text-violet-500">{String(template.orderIndex).padStart(2, '0')}</span>
                      {template.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <time className="mr-1 hidden text-[10px] text-slate-400 group-hover:inline dark:text-slate-500">{template.dueDate}</time>
                      <IconButton label="上へ移動" disabled={status !== 'not_started' || index === 0} onClick={() => onMoveTemplate(template.id, 'up')}>
                        <ArrowUp className="size-3.5" />
                      </IconButton>
                      <IconButton label="下へ移動" disabled={status !== 'not_started' || index === templates.length - 1} onClick={() => onMoveTemplate(template.id, 'down')}>
                        <ArrowDown className="size-3.5" />
                      </IconButton>
                      <TemplateEditButton template={template} disabled={status !== 'not_started'} onUpdate={onUpdateTemplate} />
                      <IconButton label="カード定義を削除" disabled={status !== 'not_started'} onClick={() => window.confirm(`${template.title} を削除しますか？`) && onDeleteTemplate(template.id)}>
                        <Trash2 className="size-3.5" />
                      </IconButton>
                    </div>
                  </li>
                ))}
              </ol>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function IconButton({ children, disabled, label, onClick }: { children: React.ReactNode; disabled?: boolean; label: string; onClick: () => void }) {
  return <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-20 dark:hover:bg-slate-700 dark:hover:text-white">{children}</button>
}

function ProcessEditButton({ process, disabled, onUpdate }: { process: FlowKanbanState['processes'][number]; disabled: boolean; onUpdate: ProcessListProps['onUpdateProcess'] }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(process.name)
  const [description, setDescription] = useState(process.description)
  if (!editing) return <IconButton label="工程を編集" disabled={disabled} onClick={() => setEditing(true)}><Pencil className="size-3.5" /></IconButton>
  return (
    <div className="absolute right-4 z-10 mt-28 grid w-72 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <input value={name} onChange={(event) => setName(event.target.value)} className="field" />
      <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="説明" className="field" />
      <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(false)}>取消</button><button type="button" onClick={() => { if (name.trim()) onUpdate(process.id, name.trim(), description); setEditing(false) }} className="font-medium text-sky-600">保存</button></div>
    </div>
  )
}

function TemplateEditButton({ template, disabled, onUpdate }: { template: TaskTemplate; disabled: boolean; onUpdate: ProcessListProps['onUpdateTemplate'] }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(template.title)
  const [dueDate, setDueDate] = useState(template.dueDate)
  if (!editing) return <IconButton label="カード定義を編集" disabled={disabled} onClick={() => setEditing(true)}><Pencil className="size-3.5" /></IconButton>
  return (
    <div className="absolute right-4 z-10 mt-28 grid w-72 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <input value={title} onChange={(event) => setTitle(event.target.value)} className="field" />
      <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="field" />
      <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(false)}>取消</button><button type="button" onClick={() => { if (title.trim()) onUpdate(template.id, title.trim(), dueDate); setEditing(false) }} className="font-medium text-sky-600">保存</button></div>
    </div>
  )
}
