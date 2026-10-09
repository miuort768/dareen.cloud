import {
  Award,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Play,
  RotateCcw,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { QuizSet } from '../../../data/languageQuizzes'
import { firstUnansweredIndex, type QuizLanguageProgress } from './quizEngine'

export interface QuizLevelMapProps {
  quizzes: QuizSet[]
  progress: QuizLanguageProgress
  onPlay: (quizId: string) => void
}

const STAGE_ICONS = [ClipboardCheck, BookOpen, GraduationCap, Trophy] as const

const LEVEL_TONES = [
  {
    tile: 'bg-primary text-on-primary',
    accent: 'border-s-primary',
    chip: 'bg-primary-soft text-primary',
  },
  {
    tile: 'bg-info text-on-info',
    accent: 'border-s-info',
    chip: 'bg-info-soft text-info-dark',
  },
  {
    tile: 'bg-success text-on-success',
    accent: 'border-s-success',
    chip: 'bg-success-soft text-success-strong',
  },
  {
    tile: 'bg-warning text-on-warning',
    accent: 'border-s-warning',
    chip: 'bg-warning-soft text-warning-strong',
  },
] as const

export const QuizLevelMap = ({ quizzes, progress, onPlay }: QuizLevelMapProps) => {
  return (
    <ol className="space-y-2.5">
      {quizzes.map((quiz, i) => {
        const stat = progress.levels[quiz.id]
        const run = progress.runs[quiz.id]
        const runIndex = run ? firstUnansweredIndex(run.answers, quiz.questions.length) : 0
        const hasRun = runIndex > 0 && runIndex < quiz.questions.length
        const isPlacement = i === 0
        const tone = LEVEL_TONES[i % LEVEL_TONES.length] ?? LEVEL_TONES[0]
        const StageIcon = STAGE_ICONS[i % STAGE_ICONS.length] ?? ClipboardCheck
        const stars = stat?.bestStars ?? 0
        const percent =
          stat && stat.bestTotal > 0
            ? Math.min(100, Math.round((stat.bestCorrect / stat.bestTotal) * 100))
            : 0
        const stageLabel = isPlacement ? 'تحديد المستوى' : `المرحلة ${i}`
        const label = hasRun ? 'متابعة' : stat?.completed ? 'إعادة' : 'العب'

        return (
          <li key={quiz.id} className="relative">
            {i > 0 && (
              <span className="absolute -top-2.5 start-6 h-2.5 w-px bg-border" aria-hidden="true" />
            )}
            <div
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-elevation-1 transition-all hover:shadow-elevation-2 sm:p-4',
                tone.accent,
              )}
            >
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl shadow-elevation-2 ring-1 ring-white/20',
                    tone.tile,
                  )}
                >
                  <StageIcon size={26} />
                </span>
                <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-black', tone.chip)}>
                  {stageLabel}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-main">{quiz.title}</span>
                <p className="mt-0.5 truncate text-micro font-bold text-muted">
                  {quiz.description}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-0.5"
                    aria-label={`النجوم ${stars} من 3`}
                  >
                    {[0, 1, 2].map((s) => (
                      <Star
                        key={s}
                        size={13}
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
                onClick={() => onPlay(quiz.id)}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
              >
                {hasRun || !stat?.completed ? <Play size={13} /> : <RotateCcw size={13} />}
                {label}
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
