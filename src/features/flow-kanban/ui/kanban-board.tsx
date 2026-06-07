import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react'

import type { FlowKanbanState, Task, TaskStatus } from '@/entities/flow/types'
import { getCardTone } from '@/shared/lib/date'
import { cn } from '@/lib/utils'

const columns: Array<{ id: TaskStatus; label: string }> = [
  { id: 'todo', label: '未着手' },
  { id: 'in_progress', label: '進行中' },
  { id: 'done', label: '完了' },
]

type KanbanBoardProps = {
  state: FlowKanbanState
  onMoveTask: (taskId: string, status: TaskStatus) => void
}

export function KanbanBoard({ state, onMoveTask }: KanbanBoardProps) {
  function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id)
    const status = event.over?.id as TaskStatus | undefined

    if (status) {
      onMoveTask(taskId, status)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            state={state}
            tasks={state.tasks.filter((task) => task.status === column.id)}
          />
        ))}
      </div>
    </DndContext>
  )
}

type KanbanColumnProps = {
  id: TaskStatus
  label: string
  state: FlowKanbanState
  tasks: Task[]
}

function KanbanColumn({ id, label, state, tasks }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'min-h-80 rounded-2xl border border-slate-200/80 bg-slate-100/55 p-3.5 transition-all dark:border-slate-800 dark:bg-slate-950/45',
        isOver && 'border-violet-400 bg-violet-50/80 ring-4 ring-violet-500/10 dark:border-violet-500 dark:bg-violet-950/30',
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">{label}</h3>
        <span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} state={state} task={task} />
        ))}
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 px-3 py-10 text-center text-xs font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
            タスクなし
          </div>
        ) : null}
      </div>
    </section>
  )
}

function TaskCard({ state, task }: { state: FlowKanbanState; task: Task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    disabled: task.status === 'done',
  })
  const process = state.processes.find((item) => item.id === task.processId)
  const tone = getCardTone(task.status, task.dueDate)
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab rounded-2xl border bg-white p-4 text-left shadow-[0_10px_30px_-22px_rgba(15,23,42,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-20px_rgba(15,23,42,0.45)] active:cursor-grabbing dark:bg-slate-800',
        task.status === 'done' && 'cursor-default opacity-75',
        tone === 'complete' && 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950',
        tone === 'overdue' && 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950',
        tone === 'dueToday' && 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
        tone === 'soon' && 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950',
        tone === 'normal' && 'border-slate-200 dark:border-slate-700',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-50">{task.title}</h4>
        {tone === 'complete' ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        ) : tone === 'overdue' || tone === 'dueToday' ? (
          <AlertTriangle className="size-4 shrink-0 text-amber-600" />
        ) : (
          <CalendarClock className="size-4 shrink-0 text-slate-400 dark:text-slate-500" />
        )}
      </div>
      <p className="mb-3 text-xs leading-5 text-slate-600 dark:text-slate-300">{task.description}</p>
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{process?.name ?? '工程なし'}</span>
        <time>{task.dueDate}</time>
      </div>
    </article>
  )
}
