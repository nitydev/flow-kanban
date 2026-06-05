import type { FlowEvent } from '@/entities/flow/types'

export function EventLog({ events }: { events: FlowEvent[] }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="m-0 mb-3 text-left text-base font-semibold text-slate-950">WebSocketイベント想定ログ</h2>
      <div className="max-h-64 space-y-2 overflow-auto">
        {events.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400">
            まだイベントはありません
          </p>
        ) : (
          events.map((event) => (
            <article key={event.id} className="rounded-md bg-slate-50 px-3 py-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-700">{event.type}</span>
                <time className="text-xs text-slate-400">
                  {new Date(event.occurredAt).toLocaleTimeString('ja-JP')}
                </time>
              </div>
              <p className="mt-1 text-sm text-slate-600">{event.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
