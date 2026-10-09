import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { QuizSet } from '../../../data/languageQuizzes'
import { ProgressBar } from '../../../shared/components/ui/ProgressBar'
import {
  buildShuffledQuiz,
  computeRunStats,
  firstUnansweredIndex,
  QUIZ_ROUND_SIZE,
  roundCount,
} from './quizEngine'

export interface QuizGameProps {
  quiz: QuizSet
  languageId: string
  languageName: string
  seed: number
  initialAnswers?: number[]
  onProgress: (answers: number[]) => void
  onComplete: (result: { correct: number; total: number; xp: number }) => void
  onExit: () => void
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و']
const LATIN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const ADVANCE_DELAY = 1150
const CORRECT_ADVANCE_DELAY = 350

const makeAnswers = (total: number, initial?: number[]): number[] => {
  const base = Array.from({ length: total }, () => -1)
  if (!initial) return base
  for (let i = 0; i < Math.min(total, initial.length); i++) {
    const value = initial[i]
    if (typeof value === 'number' && value >= 0) base[i] = value
  }
  return base
}

export const QuizGame = ({
  quiz,
  languageId,
  languageName,
  seed,
  initialAnswers,
  onProgress,
  onComplete,
  onExit,
}: QuizGameProps) => {
  const total = quiz.questions.length
  const reduced = useReducedMotion()
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  const foreign = languageId !== 'arabic'
  const letters = foreign ? LATIN_LETTERS : ARABIC_LETTERS
  const gameQuiz = useMemo(() => buildShuffledQuiz(quiz, seed), [quiz, seed])
  const questions = gameQuiz.questions

  const [answers, setAnswers] = useState<number[]>(() => makeAnswers(total, initialAnswers))
  const [qIndex, setQIndex] = useState(() => {
    const idx = firstUnansweredIndex(makeAnswers(total, initialAnswers), total)
    return idx >= total ? 0 : idx
  })
  const [checkpoint, setCheckpoint] = useState<number | null>(null)
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)
  const [dir, setDir] = useState(1)

  const completeRef = useRef(onComplete)
  completeRef.current = onComplete
  const progressRef = useRef(onProgress)
  progressRef.current = onProgress

  useEffect(() => {
    progressRef.current(answers)
  }, [answers])

  const stats = useMemo(() => computeRunStats(questions, answers), [questions, answers])

  const viewIndex = reviewIndex ?? qIndex
  const current = questions[viewIndex]
  const selected = answers[viewIndex] ?? -1
  const answered = selected >= 0
  const isReview = reviewIndex !== null
  const roundsTotal = roundCount(total)
  const currentRound = Math.min(roundsTotal, Math.floor(viewIndex / QUIZ_ROUND_SIZE) + 1)
  const progressPercent = total > 0 ? Math.round((stats.answered / total) * 100) : 0
  const isCorrect = !!current && selected === current.correctIndex

  useEffect(() => {
    if (isReview || !answered || checkpoint !== null) return
    const isLast = qIndex >= total - 1
    const atCheckpoint = !isLast && (qIndex + 1) % QUIZ_ROUND_SIZE === 0
    const delay = reduced ? 200 : isCorrect ? CORRECT_ADVANCE_DELAY : ADVANCE_DELAY
    const timer = window.setTimeout(() => {
      if (isLast) {
        const finalStats = computeRunStats(questions, answers)
        completeRef.current({ correct: finalStats.correct, total, xp: finalStats.xp })
      } else if (atCheckpoint) {
        setCheckpoint(qIndex + 1)
      } else {
        setDir(1)
        setQIndex((prev) => prev + 1)
      }
    }, delay)
    return () => window.clearTimeout(timer)
  }, [answered, qIndex, checkpoint, isReview, answers, total, questions, reduced, isCorrect])

  const select = (i: number) => {
    if (answered || isReview || checkpoint !== null) return
    setAnswers((prev) => {
      if (prev[qIndex] !== -1) return prev
      const next = [...prev]
      next[qIndex] = i
      return next
    })
  }

  const advanceNow = () => {
    if (!answered || isReview) return
    if (qIndex >= total - 1) {
      const finalStats = computeRunStats(questions, answers)
      completeRef.current({ correct: finalStats.correct, total, xp: finalStats.xp })
    } else if ((qIndex + 1) % QUIZ_ROUND_SIZE === 0) {
      setCheckpoint(qIndex + 1)
    } else {
      setDir(1)
      setQIndex((prev) => prev + 1)
    }
  }

  const continueRound = () => {
    const target = checkpoint
    setCheckpoint(null)
    if (target !== null) {
      setDir(1)
      setQIndex(target)
    }
  }

  const goBack = () => {
    const from = reviewIndex ?? qIndex
    if (from <= 0) return
    setDir(-1)
    setReviewIndex(from - 1)
  }

  const goForwardReview = () => {
    const from = reviewIndex ?? qIndex
    const next = from + 1
    if (next >= qIndex) {
      setReviewIndex(null)
    } else {
      setDir(1)
      setReviewIndex(next)
    }
  }

  const slide = (direction: number) => (rtl ? -direction * 56 : direction * 56)

  const variants = {
    enter: (direction: number) => ({ x: slide(direction), opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({ x: -slide(direction), opacity: 0, scale: 0.98 }),
  }

  const transition = { duration: reduced ? 0.001 : 0.32, ease: 'easeOut' as const }

  if (checkpoint !== null) {
    const end = checkpoint
    const start = Math.max(0, end - QUIZ_ROUND_SIZE)
    let roundCorrect = 0
    for (let i = start; i < end; i++) {
      const answer = answers[i]
      const question = questions[i]
      if (
        typeof answer === 'number' &&
        answer >= 0 &&
        question &&
        answer === question.correctIndex
      ) {
        roundCorrect += 1
      }
    }
    const roundTotal = end - start
    const roundPercent = roundTotal > 0 ? Math.round((roundCorrect / roundTotal) * 100) : 0

    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1">
        <div className="relative border-b border-divider bg-primary-soft p-5 text-center sm:p-7">
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 16 }}
            className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-elevation-2"
          >
            <Award size={28} />
          </motion.span>
          <p className="text-lg font-black text-main">
            أكملت المرحلة {Math.ceil(checkpoint / QUIZ_ROUND_SIZE)} من {roundsTotal}
          </p>
          <p className="mt-1 text-xs font-bold text-muted">
            أصبتَ {roundCorrect} من {roundTotal} في هذه المرحلة · {roundPercent}٪
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-black tabular-nums text-warning-strong">
              <Zap size={13} />
              {stats.xp} نقطة
            </span>
            {stats.streak > 1 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-error-soft px-3 py-1 text-xs font-black tabular-nums text-error">
                <Flame size={13} />
                تتابع {stats.streak}
              </span>
            )}
          </div>
          <ProgressBar value={progressPercent} variant="primary" size="md" className="w-full" />
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={continueRound}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              متابعة المرحلة التالية
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-black text-main outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X size={14} />
              حفظ والخروج
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1">
      <div className="flex items-center gap-2 border-b border-divider bg-primary p-3 text-on-primary sm:p-4">
        <button
          type="button"
          onClick={onExit}
          aria-label="رجوع إلى قائمة المستويات"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ArrowRight size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-on-primary">{quiz.title}</p>
          <p className="truncate text-[10px] font-bold text-white/75">{languageName}</p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold tabular-nums text-on-primary sm:inline-flex">
          المرحلة {currentRound}/{roundsTotal}
        </span>
        {stats.streak > 1 && (
          <motion.span
            key={stats.streak}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black tabular-nums text-on-primary"
          >
            <Flame size={12} className="fill-warning text-warning" />
            {stats.streak}
          </motion.span>
        )}
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black tabular-nums text-on-primary">
          <Zap size={12} className="fill-warning text-warning" />
          {stats.xp}
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold tabular-nums text-primary">
            سؤال {viewIndex + 1} من {total}
          </span>
          <div className="min-w-0 flex-1">
            <ProgressBar value={progressPercent} variant="primary" size="sm" />
          </div>
        </div>

        {isReview && (
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[10px] font-bold text-muted">
            <ChevronRight size={12} />
            مراجعة إجابة سابقة
          </p>
        )}

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={viewIndex}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            <div dir={foreign ? 'ltr' : undefined} className="flex flex-col gap-3.5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary font-dash text-lg font-black tabular-nums text-on-primary shadow-elevation-2">
                  {viewIndex + 1}
                </span>
                <p className="min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 py-3.5 text-start text-sm font-bold leading-relaxed text-main shadow-elevation-1 md:text-base">
                  {current.prompt}
                </p>
              </div>

              <div className="grid gap-2.5" role="listbox" aria-label={quiz.title}>
                {current.options.map((option, i) => {
                  const isCorrect = current.correctIndex === i
                  const isSelected = selected === i
                  const isWrongSelected = answered && isSelected && !isCorrect
                  const stateClass = !answered
                    ? 'cursor-pointer border-border bg-card text-main shadow-elevation-1 hover:border-primary hover:bg-hover hover:shadow-elevation-2'
                    : isCorrect
                      ? 'border-success bg-success text-on-success shadow-elevation-2'
                      : isWrongSelected
                        ? 'border-error bg-error text-on-error shadow-elevation-2'
                        : 'border-border bg-card text-muted opacity-60'
                  return (
                    <motion.button
                      key={i}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={answered || isReview}
                      onClick={() => select(i)}
                      animate={
                        isWrongSelected && !reduced ? { x: [0, -6, 6, -5, 5, 0] } : undefined
                      }
                      transition={{ duration: 0.35 }}
                      className={cn(
                        'flex min-h-12 items-center gap-3 whitespace-normal rounded-2xl border px-4 py-3 text-start text-sm font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99]',
                        stateClass,
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black',
                          answered
                            ? 'bg-white/20'
                            : 'bg-surface text-muted ring-1 ring-inset ring-border',
                        )}
                      >
                        {letters[i] ?? i + 1}
                      </span>
                      <span className="min-w-0 flex-1">{option}</span>
                      {answered && isCorrect && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                          <Check size={13} />
                        </span>
                      )}
                      {isWrongSelected && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25">
                          <X size={13} />
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div role="status" aria-live="polite" className="mt-3 min-h-10">
              {answered && (
                <p
                  className={cn(
                    'flex items-start gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold',
                    selected === current.correctIndex
                      ? 'bg-success text-on-success shadow-elevation-1'
                      : 'bg-error text-on-error shadow-elevation-1',
                  )}
                >
                  {selected === current.correctIndex ? (
                    <>
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                      إجابة صحيحة! أحسنت
                    </>
                  ) : (
                    <>
                      <XCircle size={15} className="mt-0.5 shrink-0" />
                      إجابة خاطئة — الإجابة الصحيحة ملونة بالأخضر
                    </>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={goBack}
            disabled={viewIndex <= 0}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-black text-main shadow-elevation-1 outline-none transition-all hover:bg-surface hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={15} />
            السابق
          </button>
          <div className="flex-1" />
          {isReview ? (
            <button
              type="button"
              onClick={goForwardReview}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs font-black text-on-primary shadow-elevation-2 outline-none transition-all hover:bg-primary-hover hover:shadow-elevation-3 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              {reviewIndex !== null && reviewIndex + 1 < qIndex ? 'التالي' : 'العودة للسؤال الحالي'}
              <ChevronLeft size={15} />
            </button>
          ) : !answered ? (
            <span className="inline-flex min-h-12 items-center gap-1.5 rounded-full bg-surface px-4 text-[10px] font-bold text-muted">
              <Zap size={12} className="shrink-0 text-primary" />
              اختر إجابة للمتابعة…
            </span>
          ) : (
            <button
              type="button"
              onClick={advanceNow}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs font-black text-on-primary shadow-elevation-2 outline-none transition-all hover:bg-primary-hover hover:shadow-elevation-3 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              {qIndex >= total - 1 ? 'عرض النتيجة' : 'التالي الآن'}
              <ArrowLeft size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
