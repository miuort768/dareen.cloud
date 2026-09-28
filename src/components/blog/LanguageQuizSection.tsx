import { useState } from 'react'
import {
  Award,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Layers,
  RotateCcw,
  X,
} from 'lucide-react'
import { ProgressBar } from '../../shared/components/ui/ProgressBar'
import { cn } from '../../lib/utils'
import { languageQuizzes, type QuizLanguageId, type QuizSet } from '../../data/languageQuizzes'
import { languages } from './LibraryConfig'

export interface LanguageQuizSectionProps {
  languageId: string
}

interface QuizResult {
  correct: number
  total: number
}

const LEVEL_TILES = [
  'bg-primary-soft text-primary',
  'bg-info-soft text-info-strong',
  'bg-success-soft text-success-strong',
  'bg-warning-soft text-warning-strong',
]

const resultMessage = (correct: number, total: number) => {
  const pct = Math.round((correct / total) * 100)
  if (correct === total) return 'ممتاز! إجاباتك كلها صحيحة'
  if (pct >= 80) return 'ممتاز! أداء قوي'
  if (pct >= 50) return 'جيد، واصل التدريب'
  return 'ابدأ من الأساسيات وأعد المحاولة'
}

const suggestedLevelIndex = (correct: number, total: number) => {
  const pct = Math.round((correct / total) * 100)
  if (pct >= 80) return 2
  if (pct >= 50) return 1
  return 0
}

export const LanguageQuizSection = ({ languageId }: LanguageQuizSectionProps) => {
  const quizData = languageQuizzes[languageId as QuizLanguageId]
  const language = languages.find((l) => l.id === languageId)

  const [openId, setOpenId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, QuizResult>>({})

  if (!quizData || !language) return null

  const quizzes: QuizSet[] = [quizData.placement, ...quizData.levels]
  const totalQuestions = quizzes.reduce((sum, qz) => sum + qz.questions.length, 0)
  const completedCount = Object.keys(results).length

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id))
  const handleComplete = (quizId: string, correct: number, total: number) =>
    setResults((prev) => ({ ...prev, [quizId]: { correct, total } }))
  const startLevel = (levelId: string) => setOpenId(levelId)

  return (
    <div className="mb-6">
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary-deep p-4 shadow-elevation-1 sm:p-5 lg:rounded-none">
        <div
          className="pointer-events-none absolute -end-16 -top-20 h-44 w-44 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-on-primary ring-1 ring-white/20">
            <BookOpen size={22} />
          </span>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-extrabold text-white/70">
              تعلّم بالأسئلة · اختر من متعدد
            </p>
            <h3 className="text-lg font-black leading-tight text-on-primary sm:text-xl">
              {language.name}
            </h3>
            <p className="mt-0.5 text-xs font-bold text-white/80">{language.sub}</p>
          </div>
        </div>
        <div className="relative mt-3.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold text-on-primary ring-1 ring-white/20">
            <Layers size={11} />
            {quizzes.length} اختبارات
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold text-on-primary ring-1 ring-white/20">
            <ClipboardCheck size={11} />
            {totalQuestions} سؤالًا
          </span>
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning px-2.5 py-1 text-[9px] font-bold text-on-warning">
              <Award size={11} />
              {completedCount}/{quizzes.length} مكتملة
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {quizzes.map((quiz, i) => {
          const isOpen = openId === quiz.id
          const result = results[quiz.id]
          const isPlacement = i === 0
          return (
            <div
              key={quiz.id}
              className={cn(
                'rounded-2xl border border-border bg-card lg:rounded-none',
                isOpen && 'shadow-elevation-1',
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`quiz-panel-${quiz.id}`}
                onClick={() => toggle(quiz.id)}
                className="flex w-full cursor-pointer items-center gap-3 p-3 text-start outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus sm:p-4"
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    LEVEL_TILES[i % LEVEL_TILES.length],
                  )}
                >
                  {isPlacement ? <ClipboardCheck size={17} /> : <GraduationCap size={17} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-main">{quiz.title}</span>
                  <span className="mt-0.5 block truncate text-micro font-bold text-muted">
                    {quiz.description}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-bold tabular-nums text-muted">
                    {quiz.questions.length} أسئلة
                  </span>
                  {result && (
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-bold tabular-nums text-success-strong">
                      {result.correct}/{result.total}
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={cn(
                      'text-muted transition-transform duration-normal',
                      isOpen && 'rotate-180',
                    )}
                  />
                </span>
              </button>

              {isOpen && (
                <div id={`quiz-panel-${quiz.id}`} className="border-t border-divider p-3 sm:p-4">
                  <InlineQuizPlayer
                    key={quiz.id}
                    quiz={quiz}
                    levelTitles={isPlacement ? quizData.levels.map((l) => l.title) : []}
                    onComplete={(correct, total) => handleComplete(quiz.id, correct, total)}
                    onStartLevel={
                      isPlacement ? (idx) => startLevel(quizData.levels[idx].id) : undefined
                    }
                    onClose={() => toggle(quiz.id)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------ Inline MCQ player ------------------------------ */

interface InlineQuizPlayerProps {
  quiz: QuizSet
  levelTitles: string[]
  onComplete: (correct: number, total: number) => void
  onStartLevel?: (levelIndex: number) => void
  onClose: () => void
}

const InlineQuizPlayer = ({
  quiz,
  levelTitles,
  onComplete,
  onStartLevel,
  onClose,
}: InlineQuizPlayerProps) => {
  const total = quiz.questions.length
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null))
  const [qIndex, setQIndex] = useState(0)
  const [done, setDone] = useState(false)

  const current = quiz.questions[qIndex]
  const selected = answers[qIndex]
  const answered = typeof selected === 'number'
  const answeredCount = answers.filter((a) => a !== null).length
  const percent = Math.round((answeredCount / total) * 100)
  const correctCount = answers.filter((a, idx) => a === quiz.questions[idx]?.correctIndex).length

  const select = (i: number) => {
    if (answered || done) return
    setAnswers((prev) => {
      const next = [...prev]
      next[qIndex] = i
      return next
    })
  }

  const goNext = () => {
    if (!answered) return
    if (qIndex < total - 1) {
      setQIndex((p) => p + 1)
    } else {
      setDone(true)
      onComplete(correctCount, total)
    }
  }

  const goPrev = () => {
    if (qIndex > 0 && !done) setQIndex((p) => p - 1)
  }

  const reset = () => {
    setAnswers(Array(total).fill(null))
    setQIndex(0)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((correctCount / total) * 100)
    const suggested = suggestedLevelIndex(correctCount, total)
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-black text-main">{quiz.title} · النتيجة</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق الاختبار"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-error text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-5 py-6 text-center sm:py-7">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
            <span className="text-3xl font-black tabular-nums text-primary">{pct}٪</span>
          </span>
          <div>
            <p className="text-sm font-black text-main">{resultMessage(correctCount, total)}</p>
            <p className="mt-1 text-xs font-bold text-muted">
              أجبتَ إجابة صحيحة على {correctCount} من {total} أسئلة
            </p>
          </div>

          {levelTitles.length > 0 && (
            <div className="mt-1 w-full">
              <p className="mb-2 text-center text-[10px] font-extrabold text-muted">
                المستوى المقترح لك
              </p>
              <div className="grid grid-cols-3 gap-2">
                {levelTitles.map((title, idx) => (
                  <span
                    key={title}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-xl px-2 text-[10px] font-extrabold',
                      idx === suggested
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface text-muted ring-1 ring-border',
                    )}
                  >
                    {title}
                  </span>
                ))}
              </div>
              {onStartLevel && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => onStartLevel(suggested)}
                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:w-auto"
                  >
                    <GraduationCap size={14} />
                    ابدأ {levelTitles[suggested]}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-black text-main outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
            >
              <RotateCcw size={14} />
              إعادة الاختبار
            </button>
            <button
              type="button"
              onClick={onClose}
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

  if (!current) return null

  const isLast = qIndex === total - 1

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[9px] font-bold tabular-nums text-primary">
          سؤال {qIndex + 1} من {total}
        </span>
        <div className="min-w-0 flex-1">
          <ProgressBar value={percent} variant="primary" size="sm" />
        </div>
      </div>

      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Award size={13} />
        </span>
        <p className="rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-bold leading-relaxed text-main">
          {current.prompt}
        </p>
      </div>

      <div className="grid gap-2" role="listbox" aria-label={quiz.title}>
        {current.options.map((option, i) => {
          const isCorrect = current.correctIndex === i
          const isSelected = selected === i
          const stateClass = !answered
            ? 'cursor-pointer border-border bg-card text-main hover:border-primary/40 hover:bg-hover'
            : isCorrect
              ? 'cursor-default border-success bg-success text-on-success'
              : isSelected
                ? 'cursor-default border-error bg-error text-on-error'
                : 'cursor-default border-border bg-card text-muted opacity-60'
          return (
            <button
              key={i}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={answered}
              onClick={() => select(i)}
              className={cn(
                'flex min-h-11 items-center justify-between gap-2 whitespace-normal rounded-xl border px-3.5 py-3 text-start text-xs font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus',
                stateClass,
              )}
            >
              <span className="min-w-0 flex-1">{option}</span>
              {answered && isCorrect && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check size={12} />
                </span>
              )}
              {answered && isSelected && !isCorrect && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25">
                  <X size={12} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {answered && (
        <p
          className={cn(
            'mt-3 rounded-xl px-3 py-2 text-xs font-bold',
            selected === current.correctIndex
              ? 'bg-success-soft text-success-strong'
              : 'bg-error-soft text-error',
          )}
        >
          {selected === current.correctIndex
            ? 'إجابة صحيحة! أحسنت'
            : 'إجابة خاطئة — الإجابة الصحيحة ملونة بالأخضر'}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        {qIndex > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-extrabold text-main outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
          >
            السابق
          </button>
        )}
        <div className="flex-1" />
        {!answered ? (
          <span className="text-[10px] font-bold text-muted">اختر إجابة للمتابعة…</span>
        ) : isLast ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-success px-6 text-xs font-black text-on-success shadow-elevation-1 outline-none transition-all hover:bg-success-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          >
            <Award size={14} />
            عرض النتيجة
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          >
            التالي
            <ArrowLeft size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
