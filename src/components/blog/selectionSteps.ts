import type { ViewType } from './LibraryConfig'
import type { SelectionStep } from './SelectionHeroBanner'

export const STEP_LABELS: Record<
  'curriculums' | 'grades' | 'languages' | 'classrooms' | 'terms' | 'subjects',
  string
> = {
  curriculums: 'المنهج',
  grades: 'المرحلة',
  languages: 'اللغة',
  classrooms: 'الصف',
  terms: 'الترم',
  subjects: 'المادة',
}

export interface BuildStepsInput {
  view: ViewType
  typeName: string
  curriculumName: string
  levelName: string
  gradeLabel: string
  termLabel: string
}

/** Trail of already-picked steps plus the one the user is choosing now. */
export function buildSteps({
  view,
  typeName,
  curriculumName,
  levelName,
  gradeLabel,
  termLabel,
}: BuildStepsInput): SelectionStep[] {
  if (view === 'subjects') {
    return [
      { label: typeName, state: 'done' },
      { label: curriculumName, state: 'done' },
      { label: levelName, state: 'done' },
      { label: gradeLabel, state: 'done' },
      { label: termLabel, state: 'done' },
      { label: STEP_LABELS.subjects, state: 'current' },
    ]
  }
  if (view === 'terms') {
    return [
      { label: typeName, state: 'done' },
      { label: curriculumName, state: 'done' },
      { label: levelName, state: 'done' },
      { label: gradeLabel, state: 'done' },
      { label: STEP_LABELS.terms, state: 'current' },
    ]
  }
  if (view === 'classrooms') {
    return [
      { label: typeName, state: 'done' },
      { label: curriculumName, state: 'done' },
      { label: levelName, state: 'done' },
      { label: STEP_LABELS.classrooms, state: 'current' },
    ]
  }
  if (view === 'grades') {
    return [
      { label: typeName, state: 'done' },
      { label: curriculumName, state: 'done' },
      { label: STEP_LABELS.grades, state: 'current' },
    ]
  }
  if (view === 'languages') {
    return [
      { label: typeName, state: 'done' },
      { label: STEP_LABELS.languages, state: 'current' },
    ]
  }
  return [
    { label: typeName, state: 'done' },
    { label: STEP_LABELS.curriculums, state: 'current' },
  ]
}
