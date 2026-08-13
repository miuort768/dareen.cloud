import type { Enrollment } from '../types';

export const enrollmentTeacherName = (en: Enrollment): string | undefined => {
  if (typeof en.teacher === 'string') return en.teacher;
  if (en.teacher && typeof en.teacher === 'object') return en.teacher.name;
  return en.teacherFallback;
};
