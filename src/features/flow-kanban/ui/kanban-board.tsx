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
      <div className="grid gap-3 lg:grid-cols-3">
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
        'min-h-80 rounded-md border border-slate-200 bg-slate-100/70 p-3 transition-colors dark:border-slate-700 dark:bg-slate-950/70',
        isOver && 'border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950',
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</h3>
        <span className="rounded bg-white px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} state={state} task={task} />
        ))}
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white/60 px-3 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500">
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
        'cursor-grab rounded-md border bg-white p-3 text-left shadow-sm transition-shadow active:cursor-grabbing dark:bg-slate-800',
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
