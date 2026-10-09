import { emptyProgress, type QuizLanguageProgress } from './quizEngine'

const STORAGE_KEY = 'dareen:quiz-progress:v1'
const VERSION = 1

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

function readRoot(): StoredRoot | null {
  if (!canUseStorage()) return null
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  if (!raw) return { version: VERSION, languages: {} }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredRoot>
    if (!parsed || parsed.version !== VERSION || !parsed.languages) {
      return { version: VERSION, languages: {} }
    }
    return { version: VERSION, languages: parsed.languages }
  } catch {
    return { version: VERSION, languages: {} }
  }
}

function normalize(stored: QuizLanguageProgress | undefined): QuizLanguageProgress {
  if (!stored) return emptyProgress()
  return {
    levels: stored.levels ?? {},
    runs: stored.runs ?? {},
  }
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
