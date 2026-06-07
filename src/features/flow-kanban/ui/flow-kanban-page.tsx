import '@xyflow/react/dist/style.css'

import {
  Activity,
  ArrowRight,
  GitBranch,
  LayoutDashboard,
  Layers3,
  LifeBuoy,
  FlaskConical,
  Moon,
  PanelLeft,
  Sparkles,
  Sun,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { useTheme } from '@/app/theme-context'
import { cn } from '@/lib/utils'

import { DesignerPanel } from './designer-panel'
import { EventLog } from './event-log'
import { KanbanBoard } from './kanban-board'
import { OnboardingTutorial, type TutorialPage } from './onboarding-tutorial'
import { ProcessFlow } from './process-flow'
import { ProcessList } from './process-list'
import { ProjectSummary } from './project-summary'
import { useFlowKanban } from '../model/use-flow-kanban'

type PageId = 'activity' | 'board' | 'cards' | 'flow' | 'overview'
const TUTORIAL_STORAGE_KEY = 'flow-kanban-v1.3-tutorial-completed'

const pages: Array<{ id: PageId; label: string; description: string; icon: LucideIcon }> = [
  { id: 'overview', label: '概要', description: '状態と開始条件', icon: LayoutDashboard },
  { id: 'flow', label: 'フロー設計', description: '工程と接続を編集', icon: GitBranch },
  { id: 'cards', label: 'カード定義', description: 'カードと工程順を管理', icon: Layers3 },
  { id: 'board', label: '実行ボード', description: 'タスクを進行', icon: Workflow },
  { id: 'activity', label: 'イベント', description: '操作履歴を確認', icon: Activity },
]

export function FlowKanbanPage() {
  const { actions, notices, startErrors, state } = useFlowKanban()
  const { theme, toggleTheme } = useTheme()
  const [page, setPage] = useState<PageId>(getPageFromHash)
  const [navOpen, setNavOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(() => window.localStorage.getItem(TUTORIAL_STORAGE_KEY) !== 'true')
  const [tutorialStep, setTutorialStep] = useState(0)

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash())
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('popstate', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handleHashChange)
    }
  }, [])

  function navigate(nextPage: PageId) {
    window.history.pushState(null, '', `#${nextPage}`)
    setPage(nextPage)
    setNavOpen(false)
  }

  function finishTutorial() {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
    setTutorialOpen(false)
  }

  function openTutorial() {
    setTutorialStep(0)
    setTutorialOpen(true)
    navigate('overview')
  }

  const sharedProcessListProps = {
    state,
    getProcessStatus: actions.getProcessStatus,
    getTemplates: actions.getTemplates,
    onDeleteProcess: actions.removeProcess,
    onDeleteTemplate: actions.removeTemplate,
    onMoveTemplate: actions.reorderTemplate,
    onUpdateProcess: actions.editProcess,
    onUpdateTemplate: actions.editTemplate,
  }

  return (
    <main className="min-h-screen text-slate-950 transition-colors dark:text-slate-50">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl transition-transform lg:translate-x-0 lg:shadow-none dark:border-slate-800 dark:bg-slate-950/95',
        navOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="mb-7 flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 text-white shadow-lg shadow-violet-500/20">
              <GitBranch className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">Flow Kanban</span>
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">V0.3</span>
              </div>
              <p className="text-[11px] text-slate-400">Workflow workspace</p>
            </div>
          </div>
          <button type="button" onClick={() => setNavOpen(false)} className="rounded-lg p-2 text-slate-400 lg:hidden">
            <X className="size-4" />
          </button>
        </div>

        <nav className="space-y-1.5">
          {pages.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                  page === item.id
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-violet-600'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white',
                )}
              >
                <div className={cn('grid size-9 place-items-center rounded-xl', page === item.id ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800')}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className={cn('mt-0.5 text-[10px]', page === item.id ? 'text-white/55' : 'text-slate-400')}>{item.description}</div>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3 dark:border-violet-900/50 dark:bg-violet-950/30">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
              <Sparkles className="size-3.5" />
              Workspace
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-700 dark:text-slate-200">{state.project.name}</p>
          </div>
          <button type="button" onClick={openTutorial} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900">
            <LifeBuoy className="size-4" />
            はじめてガイド
          </button>
          <button type="button" onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {theme === 'dark' ? 'ライトモード' : 'ダークモード'}
          </button>
        </div>
      </aside>

      {navOpen && <button type="button" aria-label="ナビゲーションを閉じる" onClick={() => setNavOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden" />}

      <div className="lg:pl-72">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-5 lg:px-8 lg:py-8">
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
            <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <FlaskConical className="size-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold">このアプリは現在開発中のV0.3プレビュー版です</p>
              <p className="mt-1 text-[11px] leading-5 text-amber-700 dark:text-amber-300">
                機能や画面は予告なく変更されます。入力した設計データはブラウザを閉じると失われる場合があります。
              </p>
            </div>
          </div>
          <PageTopBar page={page} onOpenNav={() => setNavOpen(true)} />

          {page === 'overview' && (
            <div className="space-y-6">
              <ProjectSummary state={state} notices={notices} startErrors={startErrors} onStart={actions.start} />
              <div className="grid gap-4 md:grid-cols-3">
                <PageShortcut icon={GitBranch} title="フローを設計" description="工程を作成し、接続関係を描きます。" onClick={() => navigate('flow')} />
                <PageShortcut icon={Layers3} title="カードを定義" description="工程ごとのカードと順序を管理します。" onClick={() => navigate('cards')} />
                <PageShortcut icon={Workflow} title="実行を管理" description="生成されたタスクをカンバンで進めます。" onClick={() => navigate('board')} />
              </div>
              <EventLog events={state.events.slice(0, 5)} />
            </div>
          )}

          {page === 'flow' && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="surface overflow-hidden">
                <SectionHeader icon={GitBranch} title="フローデザイナー" description="工程を配置し、接続点から矢印を引いて処理の流れを設計します。" />
                <ProcessFlow state={state} getProcessStatus={actions.getProcessStatus} onConnect={actions.connectProcesses} onMoveProcess={actions.positionProcess} />
              </section>
              <div className="space-y-6">
                <DesignerPanel mode="flow" state={state} onAddProcess={actions.addProcess} onAddTemplate={actions.addTemplate} onConnect={actions.connectProcesses} onDisconnect={actions.disconnectProcesses} />
                <ProcessList {...sharedProcessListProps} showTemplates={false} />
              </div>
            </div>
          )}

          {page === 'cards' && (
            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <DesignerPanel mode="cards" state={state} onAddProcess={actions.addProcess} onAddTemplate={actions.addTemplate} onConnect={actions.connectProcesses} onDisconnect={actions.disconnectProcesses} />
              <ProcessList {...sharedProcessListProps} />
            </div>
          )}

          {page === 'board' && (
            <section className="surface p-5">
              <SectionHeader icon={Workflow} title="実行ボード" description="カードを移動してタスクを進行します。完了すると次のカードが自動生成されます。" />
              <KanbanBoard state={state} onMoveTask={actions.moveTask} />
            </section>
          )}

          {page === 'activity' && <EventLog events={state.events} expanded />}
        </div>
      </div>

      <OnboardingTutorial
        open={tutorialOpen}
        stepIndex={tutorialStep}
        setStepIndex={setTutorialStep}
        onOpenChange={(open) => {
          if (!open) finishTutorial()
          else setTutorialOpen(true)
        }}
        onSkip={finishTutorial}
        onNavigate={(tutorialPage: TutorialPage) => navigate(tutorialPage)}
      />
    </main>
  )
}

function getPageFromHash(): PageId {
  const hash = window.location.hash.replace('#', '')
  return pages.some((page) => page.id === hash) ? hash as PageId : 'overview'
}

function PageTopBar({ page, onOpenNav }: { page: PageId; onOpenNav: () => void }) {
  const current = pages.find((item) => item.id === page)!
  return (
    <header className="mb-7 flex items-start gap-3">
      <button type="button" onClick={onOpenNav} className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <PanelLeft className="size-4" />
      </button>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500">Flow Kanban / {current.label}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white">{current.label}</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{current.description}</p>
      </div>
    </header>
  )
}

function SectionHeader({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-slate-800">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"><Icon className="size-4" /></div>
      <div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p></div>
    </div>
  )
}

function PageShortcut({ icon: Icon, title, description, onClick }: { icon: LucideIcon; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="surface group flex items-center gap-4 p-5 text-left transition hover:-translate-y-1">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600 transition group-hover:bg-violet-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300"><Icon className="size-5" /></div>
      <div className="min-w-0 flex-1"><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p></div>
      <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500" />
    </button>
  )
}
