import { useCallback, useEffect, useRef, useState } from 'react'
import { emptyProgress, type QuizLanguageProgress } from './quizEngine'
import { loadLanguageProgress, saveLanguageProgress } from './quizProgress'

export interface QuizProgressApi {
  progress: QuizLanguageProgress
  update: (updater: (prev: QuizLanguageProgress) => QuizLanguageProgress) => void
  reset: () => void
}

export function useQuizProgress(languageId: string): QuizProgressApi {
  const [progress, setProgress] = useState<QuizLanguageProgress>(() =>
    loadLanguageProgress(languageId),
  )
  const langRef = useRef(languageId)

  useEffect(() => {
    if (langRef.current === languageId) return
    langRef.current = languageId
    setProgress(loadLanguageProgress(languageId))
  }, [languageId])

  useEffect(() => {
    saveLanguageProgress(languageId, progress)
  }, [languageId, progress])

  const update = useCallback((updater: (prev: QuizLanguageProgress) => QuizLanguageProgress) => {
    setProgress((prev) => updater(prev))
  }, [])

  const reset = useCallback(() => {
    setProgress(emptyProgress())
  }, [])

  return { progress, update, reset }
}
