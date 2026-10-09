import { beforeEach, describe, expect, it } from 'vitest'
import { emptyProgress, type QuizLanguageProgress } from './quizEngine'
import { clearLanguageProgress, loadLanguageProgress, saveLanguageProgress } from './quizProgress'

const STORAGE_KEY = 'dareen:quiz-progress:v1'

const sample = (xp: number, answers: number[]): QuizLanguageProgress => ({
  levels: {
    l1: { bestStars: 2, bestCorrect: 2, bestTotal: 3, xp, completed: true },
  },
  runs: { l1: answers },
})

beforeEach(() => {
  window.localStorage.clear()
})

describe('quizProgress persistence', () => {
  it('saves and reloads a language progress', () => {
    const progress = sample(40, [0, 1, -1])
    saveLanguageProgress('english-persist', progress)
    expect(loadLanguageProgress('english-persist')).toEqual(progress)
  })

  it('returns empty progress for an unknown language', () => {
    expect(loadLanguageProgress('nope-unknown')).toEqual(emptyProgress())
  })

  it('clears a stored language', () => {
    saveLanguageProgress('german-clear', sample(10, [0]))
    clearLanguageProgress('german-clear')
    expect(loadLanguageProgress('german-clear')).toEqual(emptyProgress())
  })

  it('recovers from corrupted json', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-json')
    expect(loadLanguageProgress('broken-json')).toEqual(emptyProgress())
  })

  it('ignores a version mismatch', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, languages: { 'stale-version': sample(5, [0]) } }),
    )
    expect(loadLanguageProgress('stale-version')).toEqual(emptyProgress())
  })

  it('keeps languages isolated from each other', () => {
    saveLanguageProgress('iso-a', sample(10, [0]))
    saveLanguageProgress('iso-b', sample(20, [1, 2]))
    expect(loadLanguageProgress('iso-a').levels['l1']?.xp).toBe(10)
    expect(loadLanguageProgress('iso-b').levels['l1']?.xp).toBe(20)
  })
})
