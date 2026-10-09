import { emptyProgress, type QuizLanguageProgress, type QuizRun } from './quizEngine'

const STORAGE_KEY = 'dareen:quiz-progress:v1'
const CURRENT_VERSION = 2

interface StoredRoot {
  version: number
  languages: Record<string, QuizLanguageProgress>
}

const memory: Record<string, QuizLanguageProgress> = {}

const canUseStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

function migrateStored(stored: StoredRoot | null): StoredRoot {
  if (!stored) return { version: CURRENT_VERSION, languages: {} }
  if (stored.version !== 1 && stored.version !== CURRENT_VERSION) {
    return { version: CURRENT_VERSION, languages: {} }
  }
  if (stored.version === 1) {
    const languages: Record<string, QuizLanguageProgress> = {}
    for (const [id, lang] of Object.entries(stored.languages)) {
      languages[id] = { levels: lang.levels ?? {}, runs: {} }
    }
    return { version: CURRENT_VERSION, languages }
  }
  return { version: CURRENT_VERSION, languages: stored.languages }
}

function readRoot(): StoredRoot | null {
  if (!canUseStorage()) return null
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  if (!raw) return { version: CURRENT_VERSION, languages: {} }
  try {
    return migrateStored(JSON.parse(raw) as StoredRoot)
  } catch {
    return { version: CURRENT_VERSION, languages: {} }
  }
}

function normalizeRun(run: unknown): QuizRun | null {
  if (!run || typeof run !== 'object') return null
  const candidate = run as { seed?: unknown; answers?: unknown }
  if (typeof candidate.seed !== 'number' || !Number.isFinite(candidate.seed)) return null
  if (!Array.isArray(candidate.answers)) return null
  if (!candidate.answers.every((a) => typeof a === 'number')) return null
  return { seed: candidate.seed, answers: candidate.answers as number[] }
}

function normalize(stored: QuizLanguageProgress | undefined): QuizLanguageProgress {
  if (!stored) return emptyProgress()
  const runs: Record<string, QuizRun> = {}
  for (const [id, run] of Object.entries(stored.runs ?? {})) {
    const parsed = normalizeRun(run)
    if (parsed) runs[id] = parsed
  }
  return { levels: stored.levels ?? {}, runs }
}

export function loadLanguageProgress(languageId: string): QuizLanguageProgress {
  const root = readRoot()
  if (!root) return memory[languageId] ?? emptyProgress()
  return normalize(root.languages[languageId])
}

export function saveLanguageProgress(languageId: string, progress: QuizLanguageProgress): void {
  memory[languageId] = progress
  const root = readRoot()
  if (!root) return
  try {
    root.languages[languageId] = progress
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(root))
  } catch {
    /* storage full or blocked — memory fallback already holds the state */
  }
}

export function clearLanguageProgress(languageId: string): void {
  delete memory[languageId]
  const root = readRoot()
  if (!root) return
  try {
    delete root.languages[languageId]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(root))
  } catch {
    /* ignore */
  }
}
