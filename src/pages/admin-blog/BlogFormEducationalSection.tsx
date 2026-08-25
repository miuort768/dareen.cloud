import type { BlogPost } from './types'

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const subjects = [
  { value: 'arabic', label: 'عربي' },
  { value: 'math', label: 'رياضيات' },
  { value: 'islamic', label: 'إسلامية' },
  { value: 'english', label: 'إنجليزي' },
  { value: 'science', label: 'علوم' },
  { value: 'physics', label: 'فيزياء' },
  { value: 'chemistry', label: 'كيمياء' },
  { value: 'biology', label: 'أحياء' },
  { value: 'history', label: 'تاريخ' },
  { value: 'geography', label: 'جغرافيا' },
  { value: 'social', label: 'اجتماعيات' },
  { value: 'computer', label: 'حاسب آلي' },
  { value: 'stats', label: 'إحصاء' },
]

interface BlogFormEducationalSectionProps {
  currentPost: Partial<BlogPost>
  onSet: (field: string, value: string | number | boolean) => void
  onSetCurrentPost: React.Dispatch<React.SetStateAction<Partial<BlogPost> | null>>
}

export const BlogFormEducationalSection = ({
  currentPost,
  onSet,
  onSetCurrentPost,
}: BlogFormEducationalSectionProps) => {
  const isDisabled = currentPost.contentType === 'foundation' || currentPost.contentType === 'more'

  return (
    <div className="bg-error-soft/50 border-error/10 rounded-2xl border p-4">
      <p className="mb-4 text-micro font-bold text-error">تصنيف تعليمي — سيظهر في صفحة المواد</p>
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
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
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
            value={currentPost.curriculum}
            onChange={(e) => onSet('curriculum', e.target.value)}
            disabled={isDisabled}
            aria-label="المنهج الدراسي"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-50"
          >
            <option value="">بدون تحديد</option>
            <option value="kuwait">الكويت</option>
            <option value="qatar">قطر</option>
            <option value="uae">الإمارات</option>
            <option value="saudi">السعودية</option>
          </select>
        </div>
        <div>
          <label htmlFor="bf-level" className="mb-1 block text-micro font-bold text-muted">
            المرحلة
          </label>
          <select
            id="bf-level"
            value={currentPost.level}
            onChange={(e) => onSet('level', e.target.value)}
            disabled={isDisabled}
            aria-label="المرحلة الدراسية"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-50"
          >
            <option value="">بدون تحديد</option>
            <option value="primary">ابتدائي</option>
            <option value="middle">متوسط</option>
            <option value="secondary">ثانوي</option>
            <option value="basic">أساسي (عمان)</option>
            <option value="preparatory">إعدادي (مصر)</option>
          </select>
        </div>
        <div>
          <label htmlFor="bf-grade" className="mb-1 block text-micro font-bold text-muted">
            الصف
          </label>
          <select
            id="bf-grade"
            value={currentPost.grade}
            onChange={(e) => onSet('grade', e.target.value)}
            disabled={isDisabled}
            aria-label="الصف الدراسي"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-50"
          >
            <option value="">بدون تحديد</option>
            {grades.map((g) => (
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
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-50"
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
            value={currentPost.subject}
            onChange={(e) => onSet('subject', e.target.value)}
            disabled={isDisabled}
            aria-label="المادة الدراسية"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-50"
          >
            <option value="">بدون تحديد</option>
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
