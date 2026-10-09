import type { LanguageBanks, QuizLanguageId } from './_bank-types'
import { arabicPlacement } from './arabic-placement'
import { arabicLevel1 } from './arabic-level1'
import { arabicLevel2 } from './arabic-level2'
import { englishPlacement } from './english-placement'
import { frenchPlacement } from './french-placement'
import { spanishPlacement } from './spanish-placement'

/**
 * banksByLanguage aggregates the authored banks per language.
 *
 * COMPLETENESS (authoring in progress): arabic has placement + levels 1-2 (validated by
 * scripts/check-banks.cjs + audit-bank-text.cjs); the other languages only have a placement
 * bank so far. `buildBankQuiz` (quizgen) is tolerant of partial banks: it serves whatever is
 * authored and the UI merges it over the static fallback per quiz slot.
 */
export const banksByLanguage: Partial<Record<QuizLanguageId, LanguageBanks>> = {
  arabic: {
    placement: arabicPlacement,
    levels: [arabicLevel1, arabicLevel2],
  },
  english: {
    placement: englishPlacement,
    levels: [],
  },
  french: {
    placement: frenchPlacement,
    levels: [],
  },
  spanish: {
    placement: spanishPlacement,
    levels: [],
  },
}

export type { LanguageBanks, QuizLanguageId }
