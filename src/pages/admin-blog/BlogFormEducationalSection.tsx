import type { BlogPost } from './types'
import { classroomsMap, gradesMap, subjectsMap } from '../../components/blog/LibraryConfig'

const allGrades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

const fallbackSubjects = [
  { id: 'arabic', name: 'عربي' },
  { id: 'math', name: 'رياضيات' },
  { id: 'islamic', name: 'إسلامية' },
  { id: 'english', name: 'إنجليزي' },
  { id: 'science', name: 'علوم' },
  { id: 'physics', name: 'فيزياء' },
  { id: 'chemistry', name: 'كيمياء' },
  { id: 'biology', name: 'أحياء' },
  { id: 'history', name: 'تاريخ' },
  { id: 'geography', name: 'جغرافيا' },
  { id: 'social', name: 'اجتماعيات' },
  { id: 'computer', name: 'حاسب آلي' },
  { id: 'stats', name: 'إحصاء' },
]

interface BlogFormEducationalSectionProps {
  currentPost: Partial<BlogPost>
  onSet: (field: string, value: string | number | boolean) => void
  onSetCurrentPost: React.Dispatch<React.SetStateAction<Partial<BlogPost> | null>>
}

const levelIds = Object.values(gradesMap).flatMap((levels) => levels.map((l) => l.id))
const allLevelIds = Array.from(new Set(levelIds))

export const BlogFormEducationalSection = ({
  currentPost,
  onSet,
  onSetCurrentPost,
}: BlogFormEducationalSectionProps) => {
  const isDisabled = currentPost.contentType === 'foundation' || currentPost.contentType === 'more'
  const curriculum = currentPost.curriculum || ''
  const level = currentPost.level || ''
  const grade = currentPost.grade || ''
  const subject = currentPost.subject || ''

  // خيارات الصف والمادة مقيدة بالمنهج/المرحلة — نفس خرائط المكتبة
  // حتى يظهر المقال دائمًا تحت تصنيفه الصحيح في صفحة المكتبة
  const gradeOptions =
    (curriculum && level ? classroomsMap[curriculum]?.[level] : undefined) || allGrades
  const subjectOptions = (level && subjectsMap[level]) || fallbackSubjects

  const handleCurriculumChange = (nextCurriculum: string) => {
    onSetCurrentPost((prev) => {
      const validLevels = nextCurriculum
        ? (gradesMap[nextCurriculum] || allLevelIds.map((id) => ({ id }))).map((l) => l.id)
        : allLevelIds
      const nextLevel = validLevels.includes(prev.level || '') ? prev.level || '' : ''
      const validGrades =
        nextCurriculum && nextLevel ? classroomsMap[nextCurriculum]?.[nextLevel] : undefined
      const nextGrade = !validGrades || validGrades.includes(prev.grade || '') ? prev.grade : ''
      const validSubjects = nextLevel ? subjectsMap[nextLevel] : undefined
      const nextSubject =
        !validSubjects || validSubjects.some((s) => s.id === (prev.subject || ''))
          ? prev.subject
          : ''
      return {
        ...prev,
        curriculum: nextCurriculum,
        level: nextLevel,
        grade: nextGrade,
        subject: nextSubject,
      }
    })
  }

  const handleLevelChange = (nextLevel: string) => {
    onSetCurrentPost((prev) => {
      const validGrades =
        prev.curriculum && nextLevel ? classroomsMap[prev.curriculum]?.[nextLevel] : undefined
      const nextGrade = !validGrades || validGrades.includes(prev.grade || '') ? prev.grade : ''
      const validSubjects = nextLevel ? subjectsMap[nextLevel] : undefined
      const nextSubject =
        !validSubjects || validSubjects.some((s) => s.id === (prev.subject || ''))
          ? prev.subject
          : ''
      return { ...prev, level: nextLevel, grade: nextGrade, subject: nextSubject }
    })
  }

  const handleGradeChange = (nextGrade: string) => {
    onSetCurrentPost((prev) => {
      // اشتقاق المرحلة تلقائيًا من الصف داخل المنهج المختار
      let nextLevel = prev.level || ''
      if (nextGrade && prev.curriculum) {
        const entry = Object.entries(classroomsMap[prev.curriculum] || {}).find(([, gs]) =>
          gs.includes(nextGrade),
        )
        if (entry) nextLevel = entry[0]
      }
      return { ...prev, grade: nextGrade, level: nextLevel }
    })
  }

  return (
    <div className="rounded-2xl border border-primary-soft bg-primary-soft p-4">
      <p className="mb-4 text-micro font-bold text-primary">تصنيف تعليمي — سيظهر في صفحة المواد</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="bf-ctype" className="mb-1 block text-micro font-bold text-muted">
            نوع المحتوى
          </label>
          <select
            id="bf-ctype"
            value={currentPost.contentType}
            onChange={(e) => {
              const v = e.target.value
              onSetCurrentPost((prev) => ({
                ...prev,
                contentType: v,
                ...(v === 'foundation' || v === 'more'
                  ? { curriculum: '', level: '', grade: '', term: '', subject: '' }
                  : {}),
              }))
            }}
            aria-label="نوع المحتوى"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <option value="notes">مذكرات</option>
            <option value="solutions">حل كتب</option>
            <option value="more">المزيد</option>
            <option value="foundation">تأسيس</option>
          </select>
        </div>
        <div>
          <label htmlFor="bf-cur" className="mb-1 block text-micro font-bold text-muted">
            المنهج
          </label>
          <select
            id="bf-cur"
            value={curriculum}
            onChange={(e) => handleCurriculumChange(e.target.value)}
            disabled={isDisabled}
            aria-label="المنهج الدراسي"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
          >
            <option value="">بدون تحديد</option>
            <option value="kuwait">الكويت</option>
            <option value="qatar">قطر</option>
            <option value="uae">الإمارات</option>
            <option value="saudi">السعودية</option>
            <option value="oman">عمان</option>
            <option value="jordan">الأردن</option>
          </select>
        </div>
        <div>
          <label htmlFor="bf-level" className="mb-1 block text-micro font-bold text-muted">
            المرحلة
          </label>
          <select
            id="bf-level"
            value={level}
            onChange={(e) => handleLevelChange(e.target.value)}
            disabled={isDisabled}
            aria-label="المرحلة الدراسية"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
          >
            <option value="">بدون تحديد</option>
            {(curriculum ? gradesMap[curriculum] || [] : []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bf-grade" className="mb-1 block text-micro font-bold text-muted">
            الصف
          </label>
          <select
            id="bf-grade"
            value={grade}
            onChange={(e) => handleGradeChange(e.target.value)}
            disabled={isDisabled}
            aria-label="الصف الدراسي"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
          >
            <option value="">بدون تحديد</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                صف {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bf-term" className="mb-1 block text-micro font-bold text-muted">
            الفصل
          </label>
          <select
            id="bf-term"
            value={currentPost.term}
            onChange={(e) => onSet('term', e.target.value)}
            disabled={isDisabled}
            aria-label="الفصل الدراسي"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
          >
            <option value="">بدون</option>
            <option value="1">الفصل الأول</option>
            <option value="2">الفصل الثاني</option>
          </select>
        </div>
        <div>
          <label htmlFor="bf-subject" className="mb-1 block text-micro font-bold text-muted">
            المادة
          </label>
          <select
            id="bf-subject"
            value={subject}
            onChange={(e) => onSet('subject', e.target.value)}
            disabled={isDisabled}
            aria-label="المادة الدراسية"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
          >
            <option value="">بدون تحديد</option>
            {subjectOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
