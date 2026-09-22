/**
 * أدوات مشتركة لحقول الاشتراك (Enrollment) — موحّدة بين لوحتي الوالدين والطالب
 * (مصدر واحد بدل دوال teacherLabel/sessionOutcome المكررة في كل لوحة).
 */

/** استخراج اسم المعلمة من أي شكل تسلسلي للاشتراك:
 * teacher نص → teacher كائن (name) → عمود teacherFallback → حقل teacherName.
 * (العلاقة قد تُكتب teacher نصًا في /parents و /student-portal/me بعد إعادة كتابة الخادم). */
export const enrollmentTeacherNameOf = (en: {
  teacher?: string | { id: string; name: string; subject?: string } | null
  teacherFallback?: string
  teacherName?: string
}): string => {
  if (typeof en.teacher === 'string') return en.teacher.trim()
  if (en.teacher && typeof en.teacher === 'object') return (en.teacher.name ?? '').trim()
  if (typeof en.teacherFallback === 'string' && en.teacherFallback.trim()) {
    return en.teacherFallback.trim()
  }
  if (typeof en.teacherName === 'string' && en.teacherName.trim()) return en.teacherName.trim()
  return ''
}

/** يحوّل حالات الجلسة (إنجليزية/عربية قديمة) إلى مفتاح واجهة موحّد. */
export const sessionOutcome = (status?: string | null): 'done' | 'cancelled' | null => {
  const s = (status || '').trim().toLowerCase()
  if (COMPLETED_STATUSES.includes(s)) return 'done'
  if (CANCELLED_STATUSES.includes(s)) return 'cancelled'
  return null
}

const COMPLETED_STATUSES = ['completed', 'مكتملة', 'تم الإنجاز', 'تمت']
const CANCELLED_STATUSES = ['cancelled', 'ملغاة', 'ملغي', 'ملغى']
