import {
  ArrowLeft,
  ArrowRight,
  Check,
  GitBranch,
  LayoutDashboard,
  Layers3,
  Play,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type TutorialPage = 'board' | 'cards' | 'flow' | 'overview'

type TutorialStep = {
  description: string
  eyebrow: string
  icon: LucideIcon
  page: TutorialPage
  points: string[]
  title: string
}

const steps: TutorialStep[] = [
  {
    page: 'overview',
    icon: LayoutDashboard,
    eyebrow: 'Welcome',
    title: 'Flow Kanbanへようこそ',
    description: '工程の設計からタスク実行までを、流れに沿って管理するワークスペースです。',
    points: ['最初は空の設計図から始まります', '左のメニューで目的別ページへ移動できます'],
  },
  {
    page: 'flow',
    icon: GitBranch,
    eyebrow: 'Step 1',
    title: 'まず工程の流れを描きます',
    description: '工程を追加してキャンバスへ配置し、接続点をドラッグして矢印でつなぎます。',
    points: ['工程カード本体をドラッグして配置', '右の青い点から次工程の左の点へ接続'],
  },
  {
    page: 'cards',
    icon: Layers3,
    eyebrow: 'Step 2',
    title: '各工程のカードを定義します',
    description: '工程で実行する作業をカードとして追加し、実行される順番を整えます。',
    points: ['期限付きのカードを追加', '上下ボタンで工程内の順番を変更'],
  },
  {
    page: 'overview',
    icon: Play,
    eyebrow: 'Step 3',
    title: '準備できたらプロジェクトを開始',
    description: '概要ページに開始できない理由が表示されます。すべて解消したら開始できます。',
    points: ['孤立工程やカード未設定を確認', '開始後は最初のカードが自動生成'],
  },
  {
    page: 'board',
    icon: Workflow,
    eyebrow: 'Step 4',
    title: '実行ボードで作業を進めます',
    description: 'カードをドラッグして進捗を更新します。完了すると次のカードが自動生成されます。',
    points: ['未着手から進行中、完了へ移動', '工程の分岐・合流も自動で制御'],
  },
]

type OnboardingTutorialProps = {
  onNavigate: (page: TutorialPage) => void
  onOpenChange: (open: boolean) => void
  onSkip: () => void
  open: boolean
  stepIndex: number
  setStepIndex: (step: number) => void
}

export function OnboardingTutorial({
  onNavigate,
  onOpenChange,
  onSkip,
  open,
  stepIndex,
  setStepIndex,
}: OnboardingTutorialProps) {
  const step = steps[stepIndex]!
  const Icon = step.icon
  const isLast = stepIndex === steps.length - 1

  function goToStep(nextIndex: number) {
    setStepIndex(nextIndex)
    onNavigate(steps[nextIndex]!.page)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="overflow-hidden border-0 bg-transparent p-0 shadow-2xl sm:max-w-2xl">
        <div className="grid min-h-[480px] bg-white md:grid-cols-[220px_1fr] dark:bg-slate-950">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-sky-500 p-6 text-white">
            <div className="absolute -bottom-16 -right-16 size-48 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Sparkles className="size-4" />
                はじめてガイド
              </div>
              <div className="mt-10 grid size-14 place-items-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20">
                <Icon className="size-7" />
              </div>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">{step.eyebrow}</p>
              <p className="mt-2 text-lg font-bold leading-7">{step.title}</p>
              <div className="mt-auto flex gap-1.5 pt-8">
                {steps.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    aria-label={`ステップ${index + 1}へ移動`}
                    onClick={() => goToStep(index)}
                    className={cn('h-1.5 rounded-full transition-all', index === stepIndex ? 'w-8 bg-white' : 'w-3 bg-white/30 hover:bg-white/55')}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white">{step.title}</DialogTitle>
              <DialogDescription className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{step.description}</DialogDescription>
              <div className="mt-6 space-y-3">
                {step.points.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                      <Check className="size-3" />
                    </span>
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col-reverse gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={onSkip} className="px-2 py-2 text-xs font-bold text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200">
                チュートリアルをスキップ
              </button>
              <div className="flex gap-2">
                {stepIndex > 0 && (
                  <button type="button" onClick={() => goToStep(stepIndex - 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900">
                    <ArrowLeft className="size-3.5" />
                    戻る
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => isLast ? onSkip() : goToStep(stepIndex + 1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
                >
                  {isLast ? 'はじめる' : '次へ'}
                  {isLast ? <Check className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
