export const parentEnrollmentTeacherName = (en: {
  teacher?: unknown
  teacherFallback?: string
}): string => {
  const t = en.teacher
  if (typeof t === 'string' && t.trim()) return t.trim()
  if (t && typeof t === 'object' && 'name' in t) {
    const n = (t as { name?: string }).name
    if (typeof n === 'string' && n.trim()) return n.trim()
  }
  return (en.teacherFallback || '').trim()
}
