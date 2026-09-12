export type { Student, Enrollment, ScheduleSlot } from '../../types'

export interface AppointmentEvent {
  id: string
  studentName: string
  studentGrade: string
  teacherName: string
  subject: string
  curriculum: string
  day: string
  hour: string
  period: string
  time: string
  isPM: boolean
}

export const DAYS_OF_WEEK = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
]

/** استخراج اسم المعلمة بأمان سواء كان teacher نصًا أو كائنًا أو null */
export const appointmentTeacherNameOf = (enrollment: {
  teacher: unknown
  teacherId?: string | number
}): string => {
  if (typeof enrollment.teacher === 'string') return enrollment.teacher.trim()
  if (
    enrollment.teacher &&
    typeof enrollment.teacher === 'object' &&
    'name' in (enrollment.teacher as Record<string, unknown>)
  ) {
    return String((enrollment.teacher as { name?: unknown }).name ?? '').trim()
  }
  return ''
}

/**
 * مفتاح معرّف ثابت للمعلمة في معرّف الحدث — يعتمد على teacherId (الثابت عبر كل
 * النقاط: المعلمة/المشرف/الطالب/ولي الأمر) بدل الاسم النصي الذي يُحلّ بشكل
 * مختلف في /students و/student-portal/me (العمود الخام) مقابل /parents/my-children
 * (relation.name). التابع للاسم فقط عند غياب teacherId.
 */
export const appointmentTeacherKeyOf = (enrollment: {
  teacher: unknown
  teacherId?: string | number
}): string => {
  const id = enrollment.teacherId
  if (id !== undefined && id !== null && String(id).trim() !== '') return String(id)
  return appointmentTeacherNameOf(enrollment)
}

/** فرز زمني: الساعة + إزاحة مساءً (12h → ترتيب صحيح) */
export const appointmentTimeSort = (a: AppointmentEvent, b: AppointmentEvent): number => {
  const toMinutes = (e: AppointmentEvent) => {
    const h = Number(e.hour) || 0
    return ((h % 12) + (e.isPM ? 12 : 0)) * 60
  }
  return toMinutes(a) - toMinutes(b)
}
