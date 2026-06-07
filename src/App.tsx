import { AppProviders } from '@/app/providers'
import { FlowKanbanPage } from '@/features/flow-kanban/ui/flow-kanban-page'

export default function App() {
  return (
    <AppProviders>
      <FlowKanbanPage />
    </AppProviders>
  )
}
