import type { LanguageBanks, QuizLanguageId } from './_bank-types'
import { arabicPlacement } from './arabic-placement'
import { arabicLevel1 } from './arabic-level1'
import { englishPlacement } from './english-placement'
import { frenchPlacement } from './french-placement'
import { spanishPlacement } from './spanish-placement'

/**
 * banksByLanguage aggregates the authored banks per language.
 *
 * COMPLETENESS (authoring in progress): only arabic level1 is authored so far
 * (1000 rows, validator-clean); the remaining level files are being filled template-by-template
 * (each validated by scripts/check-banks.cjs + audit-bank-text.cjs). A language becomes
 * servable — i.e. appears in `availableLanguageIds` — only once it has a placement bank AND
 * three fully-authored level banks. Until then it is wired with an empty/partial `levels`
 * array so getLanguageQuizzes' 3-level guard fails safely instead of serving a truncated bank.
 */
export const banksByLanguage: Partial<Record<QuizLanguageId, LanguageBanks>> = {
  arabic: {
    placement: arabicPlacement,
    levels: [arabicLevel1],
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

/** Languages with a complete bank set (placement + 3 full levels) ready to be served. */
export const availableLanguageIds: QuizLanguageId[] = (
  Object.entries(banksByLanguage) as Array<[QuizLanguageId, LanguageBanks]>
)
  .filter(([, banks]) => banks.levels.length === 3)
  .map(([id]) => id)

export type { LanguageBanks, QuizLanguageId }
