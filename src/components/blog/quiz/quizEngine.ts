import type { McqQuestion, QuizSet } from '../../../data/languageQuizzes'

export const QUIZ_ROUND_SIZE = 10
export const XP_PER_CORRECT = 10
export const XP_STREAK_BONUS = 2
export const XP_STREAK_BONUS_CAP = 5
export const PASS_STARS = 1
export const MAX_STARS = 3

export interface QuizLevelStat {
  bestStars: number
  bestCorrect: number
  bestTotal: number
  xp: number
  completed: boolean
}

export interface QuizLanguageProgress {
  levels: Record<string, QuizLevelStat>
  runs: Record<string, number[]>
}

export const emptyProgress = (): QuizLanguageProgress => ({ levels: {}, runs: {} })

export function calcPercent(correct: number, total: number): number {
  if (total <= 0) return 0
  const safe = Math.max(0, Math.min(correct, total))
  return Math.round((safe / total) * 100)
}

export function calcStars(correct: number, total: number): number {
  const pct = calcPercent(correct, total)
  if (pct >= 90) return 3
  if (pct >= 70) return 2
  if (pct >= 50) return 1
  return 0
}

export function isPassing(correct: number, total: number): boolean {
  return calcStars(correct, total) >= PASS_STARS
}

export function answerXp(isCorrect: boolean, streak: number): number {
  if (!isCorrect) return 0
  const extra = Math.min(Math.max(streak - 1, 0), XP_STREAK_BONUS_CAP)
  return XP_PER_CORRECT + extra * XP_STREAK_BONUS
}

export interface RunStats {
  answered: number
  correct: number
  xp: number
  streak: number
}

export function computeRunStats(
  questions: readonly McqQuestion[],
  answers: readonly number[],
): RunStats {
  let answered = 0
  let correct = 0
  let xp = 0
  let streak = 0
  for (let i = 0; i < questions.length; i++) {
    const answer = answers[i]
    if (typeof answer !== 'number' || answer < 0) continue
    answered += 1
    const question = questions[i]
    if (question && answer === question.correctIndex) {
      streak += 1
      correct += 1
      xp += answerXp(true, streak)
    } else {
      streak = 0
    }
  }
  return { answered, correct, xp, streak }
}

export function chunkQuestions<T>(items: readonly T[], size = QUIZ_ROUND_SIZE): T[][] {
  const rounds: T[][] = []
  for (let i = 0; i < items.length; i += size) rounds.push(items.slice(i, i + size))
  return rounds
}

export function roundCount(total: number, size = QUIZ_ROUND_SIZE): number {
  return Math.max(1, Math.ceil(total / size))
}

export function isLevelUnlocked(
  index: number,
  quizzes: readonly QuizSet[],
  progress: QuizLanguageProgress,
): boolean {
  if (index <= 1) return true
  const previous = quizzes[index - 1]
  if (!previous) return true
  const stat = progress.levels[previous.id]
  return !!stat && stat.bestStars >= PASS_STARS
}

export function firstUnansweredIndex(answers: readonly number[], total: number): number {
  for (let i = 0; i < total; i++) {
    const answer = answers[i]
    if (typeof answer !== 'number' || answer < 0) return i
  }
  return total
}

export function mergeStat(
  previous: QuizLevelStat | undefined,
  correct: number,
  total: number,
  xp: number,
): QuizLevelStat {
  const stars = calcStars(correct, total)
  if (!previous) {
    return { bestStars: stars, bestCorrect: correct, bestTotal: total, xp, completed: true }
  }
  const better =
    stars > previous.bestStars || (stars === previous.bestStars && correct > previous.bestCorrect)
  return {
    bestStars: better ? stars : previous.bestStars,
    bestCorrect: better ? correct : previous.bestCorrect,
    bestTotal: better ? total : previous.bestTotal,
    xp: Math.max(previous.xp, xp),
    completed: true,
  }
}

export interface ProgressSummary {
  totalStars: number
  maxStars: number
  totalXp: number
  completed: number
}

export function summarizeProgress(
  quizzes: readonly QuizSet[],
  progress: QuizLanguageProgress,
): ProgressSummary {
  let totalStars = 0
  let totalXp = 0
  let completed = 0
  for (const quiz of quizzes) {
    const stat = progress.levels[quiz.id]
    if (!stat) continue
    totalStars += stat.bestStars
    totalXp += stat.xp
    if (stat.completed) completed += 1
  }
  return { totalStars, maxStars: quizzes.length * MAX_STARS, totalXp, completed }
}

export function resultMessage(correct: number, total: number): string {
  const pct = calcPercent(correct, total)
  if (total > 0 && correct === total) return 'ممتاز! إجاباتك كلها صحيحة'
  if (pct >= 80) return 'ممتاز! أداء قوي'
  if (pct >= 50) return 'جيد، واصل التدريب'
  return 'ابدأ من الأساسيات وأعد المحاولة'
}

export function suggestedLevelIndex(correct: number, total: number): number {
  const pct = calcPercent(correct, total)
  if (pct >= 80) return 2
  if (pct >= 50) return 1
  return 0
}
