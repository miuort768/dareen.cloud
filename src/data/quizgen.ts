import type {
  BankTemplate,
  ItemRow,
  LanguageBanks,
  LanguageQuiz,
  LevelBank,
  McqQuestion,
  QuizLanguageId,
  QuizSet,
  TemplateType,
} from './banks/_bank-types'
import { banksByLanguage } from './banks'

const LANG_PREFIX: Record<QuizLanguageId, string> = {
  arabic: 'ar',
  english: 'en',
  french: 'fr',
  spanish: 'es',
}

const LANG_LABEL: Record<QuizLanguageId, string> = {
  arabic: 'العربية',
  english: 'الإنجليزية',
  french: 'الفرنسية',
  spanish: 'الإسبانية',
}

/* ---------------------------- deterministic helpers ---------------------------- */

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  }
  return h
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

/* ------------------------------- prompt builders ------------------------------- */

interface BuiltAnswer {
  prompt: string
  correct: string
}

const buildPrompt: Record<TemplateType, (row: ItemRow, label: string) => BuiltAnswer> = {
  tr: (row) => ({ prompt: `ما معنى «${row[0]}»؟`, correct: row[1] }),
  trA: (row, label) => ({ prompt: `ما الكلمة ${label} التي تعني «${row[0]}»؟`, correct: row[1] }),
  phrase: (row) => ({ prompt: `ما معنى العبارة «${row[0]}»؟`, correct: row[1] }),
  art: (row) => ({ prompt: `ما أداة التعريف الصحيحة قبل «${row[0]}»؟`, correct: row[1] }),
  plur: (row) => ({ prompt: `ما جمع كلمة «${row[0]}»؟`, correct: row[1] }),
  num: (row) => ({ prompt: `اختر الكتابة الصحيحة للعدد «${row[0]}»:`, correct: row[1] }),
  cloze: (row) => ({ prompt: row[0], correct: row[1] }),
  syn: (row) => ({ prompt: `ما مرادف «${row[0]}»؟`, correct: row[1] }),
  ant: (row) => ({ prompt: `ما ضد «${row[0]}»؟`, correct: row[1] }),
  gram: (row) => ({ prompt: row[0], correct: row[1] }),
  'ar-begin': (row) => ({ prompt: `أي كلمة تبدأ بحرف «${row[0]}»؟`, correct: row[1] }),
  'ar-end': (row) => ({ prompt: `أي كلمة تنتهي بحرف «${row[0]}»؟`, correct: row[1] }),
  'ar-type': (row) => ({ prompt: `كلمة «${row[0]}» هي:`, correct: row[1] }),
  'ar-muthanna': (row) => ({ prompt: `ما المثنى من كلمة «${row[0]}»؟`, correct: row[1] }),
}

/* ------------------------------ bank → questions ------------------------------ */

function buildLevel(langId: QuizLanguageId, bank: LevelBank): QuizSet {
  const label = LANG_LABEL[langId]
  const prefix = LANG_PREFIX[langId]
  const rng = mulberry32(hashStr(`${langId}:${bank.id}`))
  const questions: McqQuestion[] = []
  let counter = 0

  for (const template of bank.templates) {
    const poolAnswers = template.items.map((row) => row.at(-1) ?? '')
    for (const row of template.items) {
      counter += 1
      questions.push(
        buildQuestion(
          template,
          row,
          label,
          rng,
          `${prefix}-${bank.id}-${String(counter).padStart(4, '0')}`,
          poolAnswers,
        ),
      )
    }
  }

  return { id: bank.id, title: bank.title, description: bank.description, questions }
}

function buildQuestion(
  template: BankTemplate,
  row: ItemRow,
  label: string,
  rng: () => number,
  id: string,
  poolAnswers: string[],
): McqQuestion {
  const builder = buildPrompt[template.type]
  const { prompt, correct } = builder(row, label)
  const wrongs = pickWrongs(template, poolAnswers, correct, rng, row)
  if (wrongs.length !== 3) {
    throw new Error(`[quizgen] template "${template.type}" could not build 3 distractors`)
  }
  const options = shuffled([correct, ...wrongs], rng)
  return { id, prompt, options, correctIndex: options.indexOf(correct) }
}

function pickWrongs(
  template: BankTemplate,
  poolAnswers: string[],
  correct: string,
  rng: () => number,
  row: ItemRow,
): string[] {
  const target = row[0] ?? ''
  const candidates = Array.from(
    new Set(
      [...(template.distractors ?? []), ...poolAnswers].filter((a) => a !== correct && a !== ''),
    ),
  ).filter((a) => {
    if (template.type === 'ar-begin' && a.startsWith(target)) return false
    if (template.type === 'ar-end' && a.endsWith(target)) return false
    return true
  })
  const picked: string[] = []
  const seen = new Set<string>([correct])
  for (const candidate of shuffled(candidates, rng)) {
    if (picked.length >= 3) break
    if (!seen.has(candidate)) {
      seen.add(candidate)
      picked.push(candidate)
    }
  }
  return picked
}

/* --------------------------------- public API --------------------------------- */

const cache = new Map<QuizLanguageId, LanguageQuiz>()

export function getLanguageQuizzes(langId: QuizLanguageId): LanguageQuiz {
  const cached = cache.get(langId)
  if (cached) return cached

  const banks: LanguageBanks | undefined = banksByLanguage[langId]
  if (!banks) throw new Error(`[quizgen] no bank data for language "${langId}"`)
  const level0: LevelBank | undefined = banks.levels[0]
  const level1: LevelBank | undefined = banks.levels[1]
  const level2: LevelBank | undefined = banks.levels[2]
  if (!level0 || !level1 || !level2)
    throw new Error(`[quizgen] language "${langId}" must define 3 levels`)

  const quiz: LanguageQuiz = {
    placement: buildLevel(langId, banks.placement),
    levels: [buildLevel(langId, level0), buildLevel(langId, level1), buildLevel(langId, level2)],
  }
  cache.set(langId, quiz)
  return quiz
}

export function getQuizQuestions(langId: QuizLanguageId, quizId: string): McqQuestion[] {
  const quiz = getLanguageQuizzes(langId)
  if (quiz.placement.id === quizId) return quiz.placement.questions
  const level = quiz.levels.find((l) => l.id === quizId)
  return level ? level.questions : []
}
