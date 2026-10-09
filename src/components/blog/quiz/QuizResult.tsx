import { motion } from 'framer-motion'
import { Award, CheckCircle2, ChevronLeft, RotateCcw, Star, X, Zap } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { CountUp } from '../../../shared/components/CountUp'
import { CelebrationBurst } from './CelebrationBurst'
import { calcPercent, calcStars, resultMessage, suggestedLevelIndex } from './quizEngine'

export interface QuizResultProps {
  title: string
  correct: number
  total: number
  xp: number
  levelTitles?: string[]
  canNext?: boolean
  onNext?: () => void
  onRestart: () => void
  onExit: () => void
  onStartLevel?: (index: number) => void
}

const RING_RADIUS = 56
const RING_SIZE = 132
const RING_CENTER = RING_SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export const QuizResult = ({
  title,
  correct,
  total,
  xp,
  levelTitles,
  canNext,
  onNext,
  onRestart,
  onExit,
  onStartLevel,
}: QuizResultProps) => {
  const pct = calcPercent(correct, total)
  const stars = calcStars(correct, total)
  const tone =
    stars >= 3
      ? 'text-success'
      : stars === 2
        ? 'text-primary'
        : stars === 1
          ? 'text-warning'
          : 'text-error'
  const suggested = suggestedLevelIndex(correct, total)
  const showLevels = !!levelTitles && levelTitles.length > 0

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1">
      <div className="flex items-center gap-2 border-b border-divider bg-primary p-3 text-on-primary sm:p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Award size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-on-primary">{title}</p>
          <p className="truncate text-[10px] font-bold text-white/75">النتيجة النهائية</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          aria-label="إغلاق النتيجة"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-error text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <X size={15} />
        </button>
      </div>

      <div className="relative flex flex-col items-center gap-3 px-5 py-6 text-center sm:py-7">
        {stars >= 2 && <CelebrationBurst />}

        <div className="relative">
          <svg width={RING_SIZE} height={RING_SIZE} className="text-surface">
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={10}
            />
          </svg>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className={cn('absolute inset-0', tone)}
            style={{ transform: 'rotate(-90deg)' }}
          >
            <motion.circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - pct / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-black tabular-nums text-main">
              <CountUp value={pct} format={(n) => `${n}٪`} />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5" aria-label={`النجوم ${stars} من 3`}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 260, damping: 16 }}
            >
              <Star
                className={cn('h-8 w-8', i < stars ? 'fill-warning text-warning' : 'text-dim')}
              />
            </motion.span>
          ))}
        </div>

        <div>
          <p className="text-sm font-black text-main">{resultMessage(correct, total)}</p>
          <p className="mt-1 text-xs font-bold text-muted">
            أجبتَ إجابة صحيحة على {correct} من {total} أسئلة
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-black tabular-nums text-warning-strong">
          <Zap size={13} />
          {xp} نقطة مكتسبة
        </span>

        {showLevels && (
          <div className="mt-1 w-full">
            <p className="mb-2 text-center text-[10px] font-extrabold text-muted">
              المستوى المقترح لك
            </p>
            <div className="grid grid-cols-3 gap-2">
              {levelTitles?.map((levelTitle, idx) => (
                <span
                  key={levelTitle}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-xl px-2 text-[10px] font-extrabold',
                    idx === suggested
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface text-muted ring-1 ring-border',
                  )}
                >
                  {levelTitle}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-1 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {canNext && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-success px-5 text-xs font-black text-on-success shadow-elevation-1 outline-none transition-all hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              <CheckCircle2 size={15} />
              المستوى التالي
            </button>
          )}
          {showLevels && onStartLevel && (
            <button
              type="button"
              onClick={() => onStartLevel(suggested)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              ابدأ {levelTitles?.[suggested] ?? 'المستوى'}
              <ChevronLeft size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-black text-main outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
          >
            <RotateCcw size={14} />
            إعادة المحاولة
          </button>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-black text-main outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X size={14} />
            اختيار اختبار آخر
          </button>
        </div>
      </div>
    </div>
  )
}
