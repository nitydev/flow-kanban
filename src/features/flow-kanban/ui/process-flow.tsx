import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react'
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import { useMemo } from 'react'

import type { FlowKanbanState, ProcessRuntimeStatus } from '@/entities/flow/types'

type ProcessFlowProps = {
  state: FlowKanbanState
  getProcessStatus: (processId: string) => ProcessRuntimeStatus
}

export function ProcessFlow({ state, getProcessStatus }: ProcessFlowProps) {
  const nodes = useMemo<Node[]>(
    () =>
      state.processes.map((process) => {
        const status = getProcessStatus(process.id)

        return {
          id: process.id,
          position: process.position,
          data: {
            label: (
              <div className="min-w-45 space-y-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left shadow-sm">
                <div className="flex items-center gap-2">
                  {status === 'completed' ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : status === 'running' ? (
                    <PlayCircle className="size-4 text-sky-600" />
                  ) : (
                    <Circle className="size-4 text-slate-400" />
                  )}
                  <span className="text-sm font-semibold text-slate-900">{process.name}</span>
                </div>
                <p className="line-clamp-2 text-xs text-slate-500">{process.description || '説明なし'}</p>
              </div>
            ),
          },
          type: 'default',
          draggable: false,
        }
      }),
    [getProcessStatus, state.processes],
  )

  const edges = useMemo<Edge[]>(
    () =>
      state.edges.map((edge) => ({
        id: edge.id,
        source: edge.fromProcessId,
        target: edge.toProcessId,
        animated: true,
        type: 'smoothstep',
      })),
    [state.edges],
  )

  return (
    <div className="h-[360px] overflow-hidden rounded-md border border-slate-200 bg-slate-50">
      <ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.4} proOptions={{ hideAttribution: true }}>
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
