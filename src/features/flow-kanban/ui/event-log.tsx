import type { FlowEvent } from '@/entities/flow/types'

export function EventLog({ events, expanded = false }: { events: FlowEvent[]; expanded?: boolean }) {
  return (
    <section className="surface p-4">
      <h2 className="m-0 mb-3 text-left text-sm font-bold tracking-tight text-slate-950 dark:text-slate-50">イベントログ</h2>
      <div className={expanded ? 'space-y-2' : 'max-h-64 space-y-2 overflow-auto'}>
        {events.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
            まだイベントはありません
          </p>
        ) : (
          events.map((event) => (
            <article key={event.id} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-left dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{event.type}</span>
                <time className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(event.occurredAt).toLocaleTimeString('ja-JP')}
                </time>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{event.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
