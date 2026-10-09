import { useMemo, useState } from 'react'
import { Award, BookOpen, ClipboardCheck, Layers, RotateCcw, Star, Zap } from 'lucide-react'
import { getQuizData, type QuizLanguageId, type QuizSet } from '../../data/languageQuizzes'
import { languages } from './LibraryConfig'
import { QuizGame } from './quiz/QuizGame'
import { QuizLevelMap } from './quiz/QuizLevelMap'
import { QuizResult } from './quiz/QuizResult'
import { useQuizProgress } from './quiz/useQuizProgress'
import { isLevelUnlocked, mergeStat, summarizeProgress } from './quiz/quizEngine'

export interface LanguageQuizSectionProps {
  languageId: string
}

interface RunResult {
  quizId: string
  correct: number
  total: number
  xp: number
}

export const LanguageQuizSection = ({ languageId }: LanguageQuizSectionProps) => {
  const language = languages.find((l) => l.id === languageId)
  const quizData = useMemo(
    () => (language ? getQuizData(languageId as QuizLanguageId) : undefined),
    [language, languageId],
  )
  const { progress, update, reset } = useQuizProgress(languageId)
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)

  if (!quizData || !language) return null

  const quizzes: QuizSet[] = [quizData.placement, ...quizData.levels]
  const totalQuestions = quizzes.reduce((sum, qz) => sum + qz.questions.length, 0)
  const summary = summarizeProgress(quizzes, progress)
  const activeIndex = activeQuizId ? quizzes.findIndex((q) => q.id === activeQuizId) : -1
  const activeQuiz = activeIndex >= 0 ? quizzes[activeIndex] : undefined
  const nextIndex = activeIndex + 1
  const canNext =
    activeIndex >= 0 && nextIndex < quizzes.length && isLevelUnlocked(nextIndex, quizzes, progress)

  const play = (quizId: string) => {
    setResult(null)
    setActiveQuizId(quizId)
  }

  const exit = () => {
    setResult(null)
    setActiveQuizId(null)
  }

  const restart = () => {
    const id = result?.quizId ?? activeQuizId
    if (!id) return
    update((prev) => {
      const runs = { ...prev.runs }
      delete runs[id]
      return { ...prev, runs }
    })
    setResult(null)
    setActiveQuizId(id)
  }

  const handleProgress = (quizId: string, answers: number[]) => {
    update((prev) => ({ ...prev, runs: { ...prev.runs, [quizId]: answers } }))
  }

  const handleComplete = (quizId: string, run: { correct: number; total: number; xp: number }) => {
    update((prev) => {
      const levels = {
        ...prev.levels,
        [quizId]: mergeStat(prev.levels[quizId], run.correct, run.total, run.xp),
      }
      return { ...prev, levels }
    })
    setResult({ quizId, ...run })
  }

  const goNext = () => {
    const next = quizzes[nextIndex]
    if (!next || !canNext) return
    setResult(null)
    setActiveQuizId(next.id)
  }

  const startLevel = (levelIdx: number) => {
    const level = quizData.levels[levelIdx]
    if (!level) return
    setResult(null)
    setActiveQuizId(level.id)
  }

  const hasProgress = summary.completed > 0 || summary.totalXp > 0

  return (
    <div className="mb-6">
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary-deep p-4 shadow-elevation-1 sm:p-5">
        <div
          className="pointer-events-none absolute -end-16 -top-20 h-44 w-44 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-on-primary ring-1 ring-white/20">
            <BookOpen size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-extrabold text-white/70">
              تعلّم بالأسئلة · تحدي المستويات
            </p>
            <h3 className="text-lg font-black leading-tight text-on-primary sm:text-xl">
              {language.name}
            </h3>
            <p className="mt-0.5 text-xs font-bold text-white/80">{language.sub}</p>
          </div>
          {hasProgress && (
            <button
              type="button"
              onClick={reset}
              title="تصفير كل تقدّم هذه اللغة"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-on-primary outline-none transition-colors hover:bg-error hover:text-on-error focus-visible:ring-2 focus-visible:ring-focus"
            >
              <RotateCcw size={15} />
            </button>
          )}
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold tabular-nums text-on-primary ring-1 ring-white/20">
            <Star size={11} className="fill-warning text-warning" />
            {summary.totalStars}/{summary.maxStars} نجمة
          </span>
          {summary.totalXp > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning px-2.5 py-1 text-[9px] font-black tabular-nums text-on-warning">
              <Zap size={11} />
              {summary.totalXp} نقطة
            </span>
          )}
          {summary.completed > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold text-on-primary ring-1 ring-white/20">
              <Award size={11} />
              {summary.completed}/{quizzes.length} مكتملة
            </span>
          )}
        </div>
      </div>

      {activeQuiz ? (
        result && result.quizId === activeQuiz.id ? (
          <QuizResult
            title={activeQuiz.title}
            correct={result.correct}
            total={result.total}
            xp={result.xp}
            levelTitles={activeIndex === 0 ? quizData.levels.map((l) => l.title) : undefined}
            canNext={canNext}
            onNext={canNext ? goNext : undefined}
            onRestart={restart}
            onExit={exit}
            onStartLevel={activeIndex === 0 ? startLevel : undefined}
          />
        ) : (
          <QuizGame
            key={activeQuiz.id}
            quiz={activeQuiz}
            languageName={language.name}
            initialAnswers={progress.runs[activeQuiz.id]}
            onProgress={(answers) => handleProgress(activeQuiz.id, answers)}
            onComplete={(run) => handleComplete(activeQuiz.id, run)}
            onExit={exit}
          />
        )
      ) : (
        <QuizLevelMap quizzes={quizzes} progress={progress} onPlay={play} />
      )}
    </div>
  )
}
