import { ArrowLeft, GraduationCap, BookOpen } from 'lucide-react'
import { gradeNames, subjectIcons } from './LibraryConfig'
import type { ViewType } from './LibraryConfig'

interface SelectionGridProps {
  view: ViewType
  currentClassrooms: string[]
  currentSubjects: { id: string; name: string }[]
  selectedGrade: string
  termLabel: string
  currentCurriculumName: string
  currentLevelName: string
  filteredCount: number
  goBack: () => void
  onSelectGrade: (id: string) => void
  onSelectTerm: (term: string) => void
  onSelectSubject: (id: string) => void
  isMobile?: boolean
}

export const SelectionGrid = ({
  view,
  currentClassrooms,
  currentSubjects,
  selectedGrade,
  termLabel,
  currentCurriculumName,
  currentLevelName,
  filteredCount,
  goBack,
  onSelectGrade,
  onSelectTerm,
  onSelectSubject,
  isMobile,
}: SelectionGridProps) => {
  const headerLabel =
    view === 'classrooms'
      ? `${currentCurriculumName} — ${currentLevelName}`
      : view === 'terms'
        ? `الصف ${gradeNames[selectedGrade]}`
        : `المواد — ${termLabel}`

  const headerTitle = view === 'classrooms' ? 'الصف الدراسي' : view === 'terms' ? 'الترم' : 'المادة'

  const headerSubtitle =
    view === 'classrooms'
      ? 'اختر الصف للوصول للمحتوى'
      : view === 'terms'
        ? 'اختر الترم الدراسي'
        : `${filteredCount} نتيجة متاحة`

  const headerIcon = view === 'classrooms' ? GraduationCap : BookOpen

  if (isMobile && (view === 'classrooms' || view === 'terms' || view === 'subjects')) {
    return (
      <div className="pb-6">
        {/* Header Card */}
        <div className="mb-5 mt-2 rounded-[1.5rem] border border-border bg-card p-5 shadow-elevation-1">
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary-soft px-3 py-1.5">
            {(() => {
              const Icon = headerIcon
              return <Icon size={12} className="text-primary" />
            })()}
            <span className="text-[11px] font-extrabold text-primary">{headerLabel}</span>
          </div>
          <h2 className="text-base font-black text-main">
            اختر <span className="text-primary">{headerTitle}</span>
          </h2>
          <p className="mt-1 text-[11px] font-medium text-muted">{headerSubtitle}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {view === 'classrooms' &&
            currentClassrooms.map((cls) => (
              <button
                type="button"
                key={cls}
                onClick={() => onSelectGrade(cls)}
                className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl bg-primary p-4 text-on-primary shadow-elevation-1 outline-none transition-all duration-200 hover:bg-primary-hover hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <GraduationCap size={18} />
                </div>
                <span className="text-center text-xs font-extrabold">
                  الصف {gradeNames[cls] || cls}
                </span>
              </button>
            ))}

          {view === 'terms' && (
            <>
              <button
                type="button"
                onClick={() => onSelectTerm('1')}
                className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl bg-success p-4 text-on-success shadow-elevation-1 outline-none transition-all duration-200 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <BookOpen size={18} />
                </div>
                <span className="text-xs font-extrabold">ترم أول</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTerm('2')}
                className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl bg-success p-4 text-on-success shadow-elevation-1 outline-none transition-all duration-200 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <BookOpen size={18} />
                </div>
                <span className="text-xs font-extrabold">ترم ثاني</span>
              </button>
            </>
          )}

          {view === 'subjects' &&
            currentSubjects.map((subj) => {
              const Icon = subjectIcons[subj.id] || BookOpen
              return (
                <button
                  type="button"
                  key={subj.id}
                  onClick={() => {
                    onSelectSubject(subj.id)
                    window.scrollTo(0, 0)
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl bg-info p-4 text-on-info shadow-elevation-1 outline-none transition-all duration-200 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Icon size={18} />
                  </div>
                  <span className="text-center text-xs font-extrabold">{subj.name}</span>
                </button>
              )
            })}
        </div>

        {/* Back */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-xs font-extrabold text-main shadow-elevation-1 outline-none transition-all duration-200 hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] sm:w-auto"
          >
            <ArrowLeft size={14} className="text-primary" />
            <span>العودة</span>
          </button>
        </div>
      </div>
    )
  }

  if (!isMobile && (view === 'classrooms' || view === 'terms' || view === 'subjects')) {
    return (
      <>
        {/* Header */}
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary-soft px-4 py-2">
            {(() => {
              const Icon = headerIcon
              return <Icon size={13} className="text-primary" />
            })()}
            <span className="text-xs font-extrabold text-primary">{headerLabel}</span>
          </div>
          <h2 className="mb-3 font-heading text-2xl font-black text-main">
            اختر <span className="text-primary">{headerTitle}</span>
          </h2>
          <p className="text-sm font-medium text-muted">{headerSubtitle}</p>
        </div>

        {/* Grid */}
        <div className="mx-auto w-full px-6 pb-16 lg:px-10">
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            {view === 'classrooms' &&
              currentClassrooms.map((cls) => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => onSelectGrade(cls)}
                  className="flex w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-primary px-3 py-6 text-on-primary shadow-elevation-1 outline-none transition-all duration-200 hover:bg-primary-hover hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <GraduationCap size={22} />
                  </div>
                  <span className="text-center text-sm font-extrabold">
                    الصف {gradeNames[cls] || cls}
                  </span>
                </button>
              ))}

            {view === 'terms' && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTerm('1')}
                  className="flex w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-success px-3 py-6 text-on-success shadow-elevation-1 outline-none transition-all duration-200 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <BookOpen size={22} />
                  </div>
                  <span className="text-sm font-extrabold">ترم أول</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTerm('2')}
                  className="flex w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-success px-3 py-6 text-on-success shadow-elevation-1 outline-none transition-all duration-200 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <BookOpen size={22} />
                  </div>
                  <span className="text-sm font-extrabold">ترم ثاني</span>
                </button>
              </>
            )}

            {view === 'subjects' &&
              currentSubjects.map((subj) => {
                const Icon = subjectIcons[subj.id] || BookOpen
                return (
                  <button
                    type="button"
                    key={subj.id}
                    onClick={() => {
                      onSelectSubject(subj.id)
                      window.scrollTo(0, 0)
                    }}
                    className="flex w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-info px-3 py-6 text-on-info shadow-elevation-1 outline-none transition-all duration-200 hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                      <Icon size={22} />
                    </div>
                    <span className="text-center text-sm font-extrabold">{subj.name}</span>
                  </button>
                )
              })}
          </div>

          {/* Back */}
          <div className="flex justify-center pb-6">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-border bg-card px-10 py-3 text-sm font-extrabold text-main shadow-elevation-1 outline-none transition-all duration-200 hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              <ArrowLeft size={16} className="text-primary" />
              <span>العودة</span>
            </button>
          </div>
        </div>
      </>
    )
  }

  return null
}
