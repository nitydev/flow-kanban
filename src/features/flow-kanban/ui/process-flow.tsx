import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import { useMemo } from 'react'

import type { FlowKanbanState, ProcessRuntimeStatus } from '@/entities/flow/types'

type ProcessFlowNode = Node<{
  description: string
  name: string
  status: ProcessRuntimeStatus
}>

type ProcessFlowProps = {
  state: FlowKanbanState
  getProcessStatus: (processId: string) => ProcessRuntimeStatus
  onConnect: (fromProcessId: string, toProcessId: string) => void
  onMoveProcess: (processId: string, position: { x: number; y: number }) => void
}

const nodeTypes = {
  process: ProcessNodeCard,
}

export function ProcessFlow({ state, getProcessStatus, onConnect, onMoveProcess }: ProcessFlowProps) {
  const nodes = useMemo<ProcessFlowNode[]>(
    () =>
      state.processes.map((process) => {
        const status = getProcessStatus(process.id)

        return {
          id: process.id,
          position: process.position,
          data: {
            description: process.description,
            name: process.name,
            status,
          },
          type: 'process',
          draggable: true,
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
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      })),
    [state.edges],
  )
  const nodeRevision = state.processes
    .map((process) =>
      [process.id, process.name, process.description, process.completedAt, getProcessStatus(process.id)].join(':'),
    )
    .join('|')

  function handleConnect(connection: Connection) {
    if (connection.source && connection.target) {
      onConnect(connection.source, connection.target)
    }
  }

  return (
    <div className="h-[520px] overflow-hidden bg-slate-50/60 dark:bg-slate-950/50">
      <ReactFlow
        key={nodeRevision}
        defaultNodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={handleConnect}
        onNodeDragStop={(_event, node) => onMoveProcess(node.id, node.position)}
        fitView
        minZoom={0.4}
        nodesConnectable
        nodesDraggable
        connectionLineStyle={{ stroke: '#0284c7', strokeWidth: 2 }}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

function ProcessNodeCard({ data }: NodeProps<ProcessFlowNode>) {
  return (
    <div className="group min-w-52 cursor-grab space-y-2.5 rounded-2xl border border-white/90 bg-white/95 px-4 py-3 text-left shadow-[0_16px_40px_-24px_rgba(15,23,42,0.5)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-24px_rgba(79,70,229,0.35)] active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800/95 dark:ring-slate-700">
      <Handle type="target" position={Position.Left} title="ここへ接続" />
      <div className="flex items-center gap-2">
        {data.status === 'completed' ? (
          <CheckCircle2 className="size-4 text-emerald-600" />
        ) : data.status === 'running' ? (
          <PlayCircle className="size-4 text-sky-600" />
        ) : (
          <Circle className="size-4 text-slate-400 dark:text-slate-500" />
        )}
        <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">{data.name}</span>
      </div>
      <p className="line-clamp-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{data.description || '説明なし'}</p>
      <Handle type="source" position={Position.Right} title="ここから接続" />
    </div>
  )
}
