import { describe, expect, it } from 'vitest'
import { getQuizData, languageQuizzes, type LanguageQuiz } from './languageQuizzes'

const LANG_IDS = ['arabic', 'english', 'french', 'spanish'] as const

const allSets = (quiz: LanguageQuiz) => [quiz.placement, ...quiz.levels]

describe('quiz bank wiring', () => {
  it('serves the full authored arabic bank, falling back per slot', () => {
    const arabic = getQuizData('arabic')
    expect(arabic.levels).toHaveLength(3)

    // Placement + levels 1-2 are authored in the bank and should dwarf the static 8.
    expect(arabic.placement.questions.length).toBeGreaterThanOrEqual(25)
    expect(arabic.levels[0].questions.length).toBeGreaterThan(500)
    expect(arabic.levels[1].questions.length).toBeGreaterThan(300)

    // Level 3 has no authored bank yet -> falls back to the static 8.
    expect(arabic.levels[2].questions.length).toBe(
      languageQuizzes.arabic.levels[2].questions.length,
    )
  })

  it('merges authored placements over the static fallback for the other languages', () => {
    for (const id of ['english', 'french', 'spanish'] as const) {
      const data = getQuizData(id)
      expect(data.placement.questions.length).toBeGreaterThanOrEqual(25)
      // No authored levels yet -> every level keeps the static count.
      expect(data.levels.map((l) => l.questions.length)).toEqual(
        languageQuizzes[id].levels.map((l) => l.questions.length),
      )
    }
  })

  it('returns cached references so repeated calls are stable', () => {
    expect(getQuizData('arabic')).toBe(getQuizData('arabic'))
  })

  it('generates well-formed 4-option questions everywhere', () => {
    for (const id of LANG_IDS) {
      for (const set of allSets(getQuizData(id))) {
        expect(set.questions.length).toBeGreaterThan(0)
        for (const q of set.questions) {
          expect(q.options).toHaveLength(4)
          expect(q.correctIndex).toBeGreaterThanOrEqual(0)
          expect(q.correctIndex).toBeLessThan(4)
          expect(q.options[q.correctIndex]).toBeTruthy()
        }
      }
    }
  })

  it('keeps question ids unique across the merged arabic quizzes', () => {
    const ids = allSets(getQuizData('arabic')).flatMap((s) => s.questions.map((q) => q.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
