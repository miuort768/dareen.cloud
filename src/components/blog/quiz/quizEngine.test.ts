import { describe, expect, it } from 'vitest'
import type { McqQuestion, QuizSet } from '../../../data/languageQuizzes'
import {
  answerXp,
  buildShuffledQuiz,
  calcPercent,
  calcStars,
  chunkQuestions,
  computeRunStats,
  emptyProgress,
  firstUnansweredIndex,
  isPassing,
  mergeStat,
  randomSeed,
  roundCount,
  shuffleWithSeed,
  suggestedLevelIndex,
  summarizeProgress,
  XP_STREAK_BONUS_CAP,
} from './quizEngine'

const q = (correctIndex: number): McqQuestion => ({
  id: `q-${correctIndex}-${Math.random()}`,
  prompt: 'سؤال',
  options: ['أ', 'ب', 'ج', 'د'],
  correctIndex,
})

const questions = (n: number): McqQuestion[] => Array.from({ length: n }, (_, i) => q(i % 4))

const quiz = (id: string, n: number): QuizSet => ({
  id,
  title: id,
  description: id,
  questions: questions(n),
})

describe('calcPercent', () => {
  it('rounds and guards division by zero', () => {
    expect(calcPercent(1, 2)).toBe(50)
    expect(calcPercent(2, 3)).toBe(67)
    expect(calcPercent(0, 0)).toBe(0)
  })

  it('clamps out-of-range values', () => {
    expect(calcPercent(9, 3)).toBe(100)
    expect(calcPercent(-2, 4)).toBe(0)
  })
})

describe('calcStars / isPassing', () => {
  it('maps percentage to 0-3 stars', () => {
    expect(calcStars(10, 10)).toBe(3)
    expect(calcStars(9, 10)).toBe(3)
    expect(calcStars(8, 10)).toBe(2)
    expect(calcStars(7, 10)).toBe(2)
    expect(calcStars(5, 10)).toBe(1)
    expect(calcStars(4, 10)).toBe(0)
  })

  it('passes from one star upward', () => {
    expect(isPassing(5, 10)).toBe(true)
    expect(isPassing(4, 10)).toBe(false)
  })
})

describe('answerXp', () => {
  it('gives nothing for a wrong answer', () => {
    expect(answerXp(false, 3)).toBe(0)
  })

  it('adds a streak bonus capped at the limit', () => {
    expect(answerXp(true, 1)).toBe(10)
    expect(answerXp(true, 2)).toBe(12)
    expect(answerXp(true, 3)).toBe(14)
    expect(answerXp(true, 100)).toBe(10 + XP_STREAK_BONUS_CAP * 2)
  })
})

describe('computeRunStats', () => {
  it('skips unanswered slots and tracks streak/xp', () => {
    const qs = [q(0), q(1), q(2), q(3)]
    const answers = [0, 1, -1, 0]
    const stats = computeRunStats(qs, answers)
    expect(stats.answered).toBe(3)
    expect(stats.correct).toBe(2)
    expect(stats.xp).toBe(22)
    expect(stats.streak).toBe(0)
  })

  it('rewards consecutive correct answers', () => {
    const qs = [q(0), q(1), q(2)]
    const stats = computeRunStats(qs, [0, 1, 2])
    expect(stats.correct).toBe(3)
    expect(stats.xp).toBe(10 + 12 + 14)
    expect(stats.streak).toBe(3)
  })
})

describe('chunkQuestions / roundCount', () => {
  it('splits into rounds of ten', () => {
    const rounds = chunkQuestions(questions(25))
    expect(rounds.map((r) => r.length)).toEqual([10, 10, 5])
    expect(roundCount(25)).toBe(3)
    expect(roundCount(0)).toBe(1)
  })
})

describe('firstUnansweredIndex', () => {
  it('finds the first open slot', () => {
    expect(firstUnansweredIndex([0, 1, -1, -1], 4)).toBe(2)
    expect(firstUnansweredIndex([0, 1, 2, 3], 4)).toBe(4)
    expect(firstUnansweredIndex([], 0)).toBe(0)
  })
})

describe('mergeStat', () => {
  it('creates a completed stat when none exists', () => {
    expect(mergeStat(undefined, 5, 10, 60)).toEqual({
      bestStars: 1,
      bestCorrect: 5,
      bestTotal: 10,
      xp: 60,
      completed: true,
    })
  })

  it('keeps the stronger result but the highest xp', () => {
    const previous = { bestStars: 3, bestCorrect: 9, bestTotal: 10, xp: 120, completed: true }
    expect(mergeStat(previous, 5, 10, 80)).toEqual({ ...previous, xp: 120 })
    expect(mergeStat(previous, 10, 10, 140)).toEqual({
      bestStars: 3,
      bestCorrect: 10,
      bestTotal: 10,
      xp: 140,
      completed: true,
    })
  })

  it('keeps a better star run', () => {
    const previous = { bestStars: 1, bestCorrect: 5, bestTotal: 10, xp: 50, completed: true }
    const merged = mergeStat(previous, 8, 10, 90)
    expect(merged.bestStars).toBe(2)
    expect(merged.bestCorrect).toBe(8)
  })
})

describe('summarizeProgress', () => {
  it('sums stars, xp and completions', () => {
    const quizzes = [quiz('placement', 3), quiz('l1', 3), quiz('l2', 3)]
    const progress = emptyProgress()
    progress.levels['placement'] = {
      bestStars: 2,
      bestCorrect: 2,
      bestTotal: 3,
      xp: 40,
      completed: true,
    }
    progress.levels['l1'] = { bestStars: 1, bestCorrect: 1, bestTotal: 3, xp: 20, completed: true }
    expect(summarizeProgress(quizzes, progress)).toEqual({
      totalStars: 3,
      maxStars: 9,
      totalXp: 60,
      completed: 2,
    })
  })
})

describe('suggestedLevelIndex', () => {
  it('recommends a level from placement performance', () => {
    expect(suggestedLevelIndex(9, 10)).toBe(2)
    expect(suggestedLevelIndex(6, 10)).toBe(1)
    expect(suggestedLevelIndex(2, 10)).toBe(0)
  })
})

describe('shuffleWithSeed / buildShuffledQuiz', () => {
  it('shuffles deterministically for the same seed', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(shuffleWithSeed(items, 5)).toEqual(shuffleWithSeed(items, 5))
    expect(shuffleWithSeed(items, 5)).not.toEqual(items)
  })

  it('rebuilds the same question set for the same seed', () => {
    const source = quiz('placement', 4)
    const a = buildShuffledQuiz(source, 123)
    const b = buildShuffledQuiz(source, 123)
    expect(a.questions.map((qs) => qs.options)).toEqual(b.questions.map((qs) => qs.options))
    expect(a.questions.map((qs) => qs.correctIndex)).toEqual(
      b.questions.map((qs) => qs.correctIndex),
    )
  })

  it('produces a different order for a different seed', () => {
    const source = quiz('placement', 4)
    const a = buildShuffledQuiz(source, 123)
    const b = buildShuffledQuiz(source, 456)
    const sameOrder = a.questions.every((qs, i) =>
      qs.options.every((opt, j) => opt === b.questions[i]?.options[j]),
    )
    expect(sameOrder).toBe(false)
  })

  it('keeps the same options set and preserves the correct answer', () => {
    const source = quiz('placement', 3)
    const shuffled = buildShuffledQuiz(source, 999)
    for (let i = 0; i < source.questions.length; i++) {
      const src = source.questions[i] as McqQuestion
      const out = shuffled.questions[i] as McqQuestion
      expect(out.options).toEqual(expect.arrayContaining(src.options))
      expect(src.options[src.correctIndex]).toBe(out.options[out.correctIndex])
    }
  })

  it('actually reorders options inside questions', () => {
    const source = quiz('placement', 8)
    const shuffled = buildShuffledQuiz(source, 777)
    const anyReordered = source.questions.some((qs, i) =>
      qs.options.some((opt, j) => opt !== shuffled.questions[i]?.options[j]),
    )
    expect(anyReordered).toBe(true)
  })

  it('generates an in-range random seed', () => {
    const seed = randomSeed()
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThan(0x80000000)
  })
})
