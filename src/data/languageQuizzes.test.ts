import { describe, it, expect } from 'vitest'
import { languageQuizzes, allQuizzes } from './languageQuizzes'

describe('languageQuizzes data integrity', () => {
  it('covers exactly the four languages', () => {
    expect(Object.keys(languageQuizzes).sort()).toEqual(['arabic', 'english', 'french', 'spanish'])
  })

  it('every quiz has a placement test and exactly 3 levels', () => {
    for (const [langId, data] of Object.entries(languageQuizzes)) {
      expect(data.placement.id, `placement.id (${langId})`).toBe('placement')
      expect(
        data.placement.questions.length,
        `placement questions (${langId})`,
      ).toBeGreaterThanOrEqual(8)
      expect(data.levels).toHaveLength(3)
      for (const level of data.levels) {
        expect(
          level.questions.length,
          `level ${level.id} questions (${langId})`,
        ).toBeGreaterThanOrEqual(8)
      }
    }
  })

  it('keeps quiz ids unique within each language', () => {
    for (const [langId, data] of Object.entries(languageQuizzes)) {
      const ids = [data.placement, ...data.levels].map((q) => q.id)
      expect(new Set(ids).size, `quiz ids (${langId})`).toBe(ids.length)
    }
  })

  it('every question has 4 options, a valid correctIndex, and a unique id', () => {
    const allIds = new Set<string>()
    for (const quiz of allQuizzes) {
      for (const question of quiz.questions) {
        expect(question.options).toHaveLength(4)
        expect(question.correctIndex).toBeGreaterThanOrEqual(0)
        expect(question.correctIndex).toBeLessThan(4)
        expect(allIds.has(question.id), `duplicate question id ${question.id}`).toBe(false)
        allIds.add(question.id)
      }
    }
  })
})
