import { ArrowLeft } from 'lucide-react'
import {
  gradeNames,
  subjectIcons,
  subjectTones,
  type SubjectTone,
  type ViewType,
} from './LibraryConfig'
import { SelectionHeroBanner } from './SelectionHeroBanner'
import { buildSteps } from './selectionSteps'
import { useSettingsStore } from '../../store/settingsStore'

interface SelectionGridProps {
  view: ViewType
  currentClassrooms: string[]
  currentSubjects: { id: string; name: string }[]
  selectedGrade: string
  termLabel: string
  currentTypeName: string
  currentCurriculumName: string
  currentLevelName: string
  filteredCount: number
  goBack: () => void
  onSelectGrade: (id: string) => void
  onSelectTerm: (term: string) => void
  onSelectSubject: (id: string) => void
  isMobile?: boolean
}

const ARABIC_DIGITS: Record<string, string> = {
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
  '10': '١٠',
  '11': '١١',
  '12': '١٢',
}

const SUBJECT_TONE_FILL: Record<SubjectTone, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  success: 'bg-success text-on-success hover:bg-success-hover',
  info: 'bg-info text-on-info hover:bg-info-hover',
  warning: 'bg-warning text-on-warning hover:bg-warning-hover',
  error: 'bg-error text-on-error hover:bg-error-hover',
  accent: 'bg-accent text-on-accent hover:bg-accent-hover',
}

export const SelectionGrid = ({
  view,
  currentClassrooms,
  currentSubjects,
  selectedGrade,
  termLabel,
  currentTypeName,
  currentCurriculumName,
  currentLevelName,
  filteredCount,
  goBack,
  onSelectGrade,
  onSelectTerm,
  onSelectSubject,
  isMobile,
}: SelectionGridProps) => {
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const whatsappNumber = adminPhone.replace(/\D/g, '')

  const gradeLabel = `الصف ${gradeNames[selectedGrade] || selectedGrade}`

  const steps = buildSteps({
    view,
    typeName: currentTypeName,
    curriculumName: currentCurriculumName,
    levelName: currentLevelName,
    gradeLabel,
    termLabel,
  })

  const heroTitle =
    view === 'classrooms' ? (
      <>
        اختر <span className="text-accent">الصف الدراسي</span>
      </>
    ) : view === 'terms' ? (
      <>
        اختر <span className="text-accent">الترم</span>
      </>
    ) : (
      <>
        اختر <span className="text-accent">المادة</span>
      </>
    )

  const heroDescription =
    view === 'classrooms'
      ? `جميع ملفات ${currentCurriculumName} — ${currentLevelName} مرتبة حسب الصف`
      : view === 'terms'
        ? `اختر الترم للوصول إلى مواد ${gradeLabel}`
        : `اختر المادة لعرض ${filteredCount} من الملفات المتاحة`

  const isClassrooms = view === 'classrooms'
  const isTerms = view === 'terms'

  const heroStats =
    view === 'classrooms'
      ? [
          { value: String(currentClassrooms.length), label: 'صفوف' },
          { value: String(filteredCount), label: 'ملف' },
        ]
      : view === 'terms'
        ? [
            { value: '٢', label: 'ترم' },
            { value: String(filteredCount), label: 'ملف' },
          ]
        : [
            { value: String(currentSubjects.length), label: 'مواد' },
            { value: String(filteredCount), label: 'ملف' },
          ]

  if (isMobile && (view === 'classrooms' || view === 'terms' || view === 'subjects')) {
    return (
      <div className="pb-6">
        <SelectionHeroBanner
          className="mb-5 mt-2"
          steps={steps}
          title={heroTitle}
          description={heroDescription}
          whatsappNumber={whatsappNumber}
          stats={heroStats}
        />

        <div className="grid grid-cols-2 gap-2.5">
          {isClassrooms &&
            currentClassrooms.map((cls) => (
              <button
                type="button"
                key={cls}
                onClick={() => onSelectGrade(cls)}
                className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl bg-primary p-4 text-on-primary shadow-elevation-1 outline-none transition-all duration-200 hover:bg-primary-hover hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-dash text-lg font-black">
                  {ARABIC_DIGITS[cls] || cls}
                </div>
                <span className="text-center text-xs font-extrabold">
                  الصف {gradeNames[cls] || cls}
                </span>
              </button>
            ))}

          {isTerms && (
            <>
              {[
                { id: '1', label: 'ترم أول' },
                { id: '2', label: 'ترم ثاني' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => onSelectTerm(t.id)}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl bg-success p-4 text-on-success shadow-elevation-1 outline-none transition-all duration-200 hover:bg-success-hover hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-dash text-lg font-black">
                    {ARABIC_DIGITS[t.id]}
                  </div>
                  <span className="text-xs font-extrabold">{t.label}</span>
                </button>
              ))}
            </>
          )}

          {view === 'subjects' &&
            currentSubjects.map((subj) => {
              const Icon = subjectIcons[subj.id]
              const tone = subjectTones[subj.id] ?? 'info'
              return (
                <button
                  type="button"
                  key={subj.id}
                  onClick={() => {
                    onSelectSubject(subj.id)
                    window.scrollTo(0, 0)
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl p-4 shadow-elevation-1 outline-none transition-all duration-200 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] ${SUBJECT_TONE_FILL[tone]}`}
                >
                  {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <Icon size={18} />
                    </div>
                  )}
                  <span className="text-center text-xs font-extrabold">{subj.name}</span>
                </button>
              )
            })}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-error px-6 py-3 text-xs font-extrabold text-on-error shadow-elevation-1 outline-none transition-all duration-200 hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:w-auto"
          >
            <ArrowLeft size={14} />
            <span>العودة</span>
          </button>
        </div>
      </div>
    )
  }

  if (!isMobile && (view === 'classrooms' || view === 'terms' || view === 'subjects')) {
    return (
      <div className="container relative z-10 mx-auto max-w-[1400px] px-6 pb-16 lg:px-10">
        <SelectionHeroBanner
          steps={steps}
          title={heroTitle}
          description={heroDescription}
          whatsappNumber={whatsappNumber}
          stats={heroStats}
        />

        <div className="mb-6 mt-8 flex flex-wrap justify-center gap-4">
          {isClassrooms &&
            currentClassrooms.map((cls) => (
              <button
                type="button"
                key={cls}
                onClick={() => onSelectGrade(cls)}
                className="flex w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-primary px-3 py-6 text-on-primary shadow-elevation-1 outline-none transition-all duration-200 hover:bg-primary-hover hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 font-dash text-xl font-black">
                  {ARABIC_DIGITS[cls] || cls}
                </div>
                <span className="text-center text-sm font-extrabold">
                  الصف {gradeNames[cls] || cls}
                </span>
              </button>
            ))}

          {isTerms && (
            <>
              {[
                { id: '1', label: 'ترم أول' },
                { id: '2', label: 'ترم ثاني' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => onSelectTerm(t.id)}
                  className="flex w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-success px-3 py-6 text-on-success shadow-elevation-1 outline-none transition-all duration-200 hover:bg-success-hover hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 font-dash text-xl font-black">
                    {ARABIC_DIGITS[t.id]}
                  </div>
                  <span className="text-sm font-extrabold">{t.label}</span>
                </button>
              ))}
            </>
          )}

          {view === 'subjects' &&
            currentSubjects.map((subj) => {
              const Icon = subjectIcons[subj.id]
              const tone = subjectTones[subj.id] ?? 'info'
              return (
                <button
                  type="button"
                  key={subj.id}
                  onClick={() => {
                    onSelectSubject(subj.id)
                    window.scrollTo(0, 0)
                  }}
                  className={`flex w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl px-3 py-6 shadow-elevation-1 outline-none transition-all duration-200 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] ${SUBJECT_TONE_FILL[tone]}`}
                >
                  {Icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                      <Icon size={22} />
                    </div>
                  )}
                  <span className="text-center text-sm font-extrabold">{subj.name}</span>
                </button>
              )
            })}
        </div>

        <div className="flex justify-center pb-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-11 w-full max-w-[32rem] cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-error px-10 py-3 text-sm font-extrabold text-on-error shadow-elevation-1 outline-none transition-all duration-200 hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          >
            <ArrowLeft size={16} />
            <span>العودة</span>
          </button>
        </div>
      </div>
    )
  }

  return null
}
