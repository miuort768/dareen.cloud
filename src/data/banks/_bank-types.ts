export interface McqQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

export interface QuizSet {
  id: string
  title: string
  description: string
  questions: McqQuestion[]
}

export interface LanguageQuiz {
  placement: QuizSet
  levels: [QuizSet, QuizSet, QuizSet]
}

export type QuizLanguageId = 'arabic' | 'english' | 'french' | 'spanish'

/**
 * A bank row is a tuple of display data; the LAST element is always the correct answer.
 * The first two elements are required (prompt field + answer field).
 * e.g. tr rows are [sourceWord, arabicTranslation]; cloze rows are [sentenceWithBlank, answer].
 */
export type ItemRow = Readonly<[string, string, ...string[]]>

export type TemplateType =
  | 'tr' // ما معنى «src»؟            row [src, ar]
  | 'trA' // ما الكلمة {label} التي تعني «ar»؟  row [ar, src]
  | 'phrase' // ما معنى العبارة «src»؟      row [srcPhrase, arPhrase]
  | 'art' // ما أداة التعريف الصحيحة قبل «word»؟  row [word, article]
  | 'plur' // ما جمع كلمة «sg»؟           row [sg, plural]
  | 'num' // اختر الكتابة الصحيحة للعدد «digits»:  row [digits, word]
  | 'cloze' // sentence with blank          row [sentenceWithBlank, answer]
  | 'syn' // ما مرادف كلمة «w»؟           row [w, synonym]
  | 'ant' // ما ضد كلمة «w»؟              row [w, antonym]
  | 'gram' // authored question text         row [questionText, answer]
  | 'ar-begin' // أي كلمة تبدأ بحرف «letter»؟    row [letter, word]
  | 'ar-end' // أي كلمة تنتهي بحرف «letter»؟    row [letter, word]
  | 'ar-type' // كلمة «w» هي:                  row [w, اسم|فعل|حرف|صفة]
  | 'ar-muthanna' // ما المثنى من «sg»؟          row [sg, muthanna]

export interface BankTemplate {
  type: TemplateType
  /** Optional fixed wrong options (for finite-answer types like articles, ar-type). */
  distractors?: string[]
  items: ItemRow[]
}

export interface LevelBank {
  id: string
  title: string
  description: string
  templates: BankTemplate[]
}

export interface LanguageBanks {
  placement: LevelBank
  levels: LevelBank[]
}
