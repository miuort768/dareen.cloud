import {
  Award,
  ClipboardCheck,
  GraduationCap,
  Lock,
  Play,
  RotateCcw,
  Star,
  Zap,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { QuizSet } from '../../../data/languageQuizzes'
import { firstUnansweredIndex, isLevelUnlocked, type QuizLanguageProgress } from './quizEngine'

export interface QuizLevelMapProps {
  quizzes: QuizSet[]
  progress: QuizLanguageProgress
  onPlay: (quizId: string) => void
}

const levelTileClass = (index: number): string => {
  switch (index % 4) {
    case 1:
      return 'bg-info text-on-info'
    case 2:
      return 'bg-success text-on-success'
    case 3:
      return 'bg-warning text-on-warning'
    default:
      return 'bg-primary text-on-primary'
  }
}

export const QuizLevelMap = ({ quizzes, progress, onPlay }: QuizLevelMapProps) => {
  return (
    <ol className="space-y-2.5">
      {quizzes.map((quiz, i) => {
        const unlocked = isLevelUnlocked(i, quizzes, progress)
        const stat = progress.levels[quiz.id]
        const run = progress.runs[quiz.id]
        const runIndex = run ? firstUnansweredIndex(run, quiz.questions.length) : 0
        const hasRun = runIndex > 0 && runIndex < quiz.questions.length
        const isPlacement = i === 0
        const tile = levelTileClass(i)
        const stars = stat?.bestStars ?? 0
        const label = hasRun ? 'متابعة' : stat?.completed ? 'إعادة' : 'العب'

        return (
          <li key={quiz.id} className="relative">
            {i > 0 && (
              <span className="absolute -top-2.5 start-6 h-2.5 w-px bg-border" aria-hidden="true" />
            )}
            <div
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-elevation-1 transition-colors sm:p-4',
                !unlocked && 'opacity-80',
              )}
            >
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                  unlocked ? tile : 'bg-surface text-dim',
                )}
              >
                {unlocked ? (
                  isPlacement ? (
                    <ClipboardCheck size={18} />
                  ) : (
                    <GraduationCap size={18} />
                  )
                ) : (
                  <Lock size={16} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-main">{quiz.title}</span>
                <p className="mt-0.5 truncate text-micro font-bold text-muted">
                  {quiz.description}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-0.5"
                    aria-label={`النجوم ${stars} من 3`}
                  >
                    {[0, 1, 2].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={cn(s < stars ? 'fill-warning text-warning' : 'text-dim')}
                      />
                    ))}
                  </span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-bold tabular-nums text-muted">
                    {quiz.questions.length} سؤالًا
                  </span>
                  {stat && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-bold tabular-nums text-success-strong">
                      <Award size={10} />
                      {stat.bestCorrect}/{stat.bestTotal}
                    </span>
                  )}
                  {stat && stat.xp > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[9px] font-bold tabular-nums text-warning-strong">
                      <Zap size={10} />
                      {stat.xp}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onPlay(quiz.id)}
                title={unlocked ? undefined : 'يُتاح بعد اجتياز المستوى السابق'}
                className={cn(
                  'inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-black outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
                  unlocked
                    ? 'cursor-pointer bg-primary text-on-primary shadow-elevation-1 hover:bg-primary-hover active:scale-[0.97]'
                    : 'cursor-not-allowed bg-surface text-dim',
                )}
              >
                {!unlocked ? (
                  <Lock size={13} />
                ) : hasRun ? (
                  <Play size={13} />
                ) : stat?.completed ? (
                  <RotateCcw size={13} />
                ) : (
                  <Play size={13} />
                )}
                {unlocked ? label : 'مقفل'}
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
