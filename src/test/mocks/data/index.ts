/**
 * Mock data factories for MSW handlers.
 * Realistic Arabic sample data matching the app's domain (education institute).
 */

export interface MockStudent {
  id: string
  name: string
  phone: string
  guardianPhone: string
  status: 'active' | 'frozen' | 'inactive'
  createdAt: string
}

export interface MockTeacher {
  id: string
  name: string
  phone: string
  email: string
  subject: string
  active: boolean
  createdAt: string
}

export interface MockSession {
  id: string
  studentId: string
  teacherId: string
  day: string
  period: string
  status: 'scheduled' | 'completed' | 'cancelled'
  date: string
}

export interface MockNotification {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

let counter = 100

/** Generate a unique incrementing id — keeps created mocks stable per test. */
export const nextId = (prefix: string) => `${prefix}-${++counter}`

export const makeStudent = (overrides: Partial<MockStudent> = {}): MockStudent => ({
  id: nextId('student'),
  name: 'طالب تجريبي',
  phone: '966500000001',
  guardianPhone: '966500000002',
  status: 'active',
  createdAt: '2026-01-15T08:00:00.000Z',
  ...overrides,
})

export const makeTeacher = (overrides: Partial<MockTeacher> = {}): MockTeacher => ({
  id: nextId('teacher'),
  name: 'معلم تجريبي',
  phone: '966510000001',
  email: 'teacher@example.com',
  subject: 'الرياضيات',
  active: true,
  createdAt: '2026-01-10T08:00:00.000Z',
  ...overrides,
})

export const makeSession = (overrides: Partial<MockSession> = {}): MockSession => ({
  id: nextId('session'),
  studentId: 'student-1',
  teacherId: 'teacher-1',
  day: 'الأحد',
  period: '04:00 PM - 05:00 PM',
  status: 'scheduled',
  date: '2026-08-17',
  ...overrides,
})

export const makeNotification = (overrides: Partial<MockNotification> = {}): MockNotification => ({
  id: nextId('notif'),
  title: 'إشعار تجريبي',
  body: 'هذا إشعار تجريبي للاختبار',
  read: false,
  createdAt: '2026-08-17T10:00:00.000Z',
  ...overrides,
})

/** Stable seed collections — deterministic across tests. */
export const db = {
  students: [
    makeStudent({ id: 'student-1', name: 'أحمد محمد', status: 'active' }),
    makeStudent({ id: 'student-2', name: 'سارة خالد', status: 'active' }),
    makeStudent({ id: 'student-3', name: 'عمر علي', status: 'frozen' }),
  ],
  teachers: [
    makeTeacher({ id: 'teacher-1', name: 'خالد إبراهيم', subject: 'الرياضيات' }),
    makeTeacher({ id: 'teacher-2', name: 'منى عبدالله', subject: 'اللغة الإنجليزية' }),
  ],
  sessions: [
    makeSession({ id: 'session-1', studentId: 'student-1', teacherId: 'teacher-1', day: 'الأحد' }),
    makeSession({
      id: 'session-2',
      studentId: 'student-2',
      teacherId: 'teacher-2',
      day: 'الثلاثاء',
    }),
    makeSession({
      id: 'session-3',
      studentId: 'student-1',
      teacherId: 'teacher-2',
      day: 'الأربعاء',
      status: 'completed',
    }),
  ],
  notifications: [
    makeNotification({ id: 'notif-1', title: 'تنبيه الحضور', read: false }),
    makeNotification({ id: 'notif-2', title: 'تذكير جلسة', read: true }),
  ],
}

/** Reset the in-memory database between tests (called from setup.ts if needed). */
export const resetDb = () => {
  counter = 100
  db.students = [
    makeStudent({ id: 'student-1', name: 'أحمد محمد', status: 'active' }),
    makeStudent({ id: 'student-2', name: 'سارة خالد', status: 'active' }),
    makeStudent({ id: 'student-3', name: 'عمر علي', status: 'frozen' }),
  ]
  db.teachers = [
    makeTeacher({ id: 'teacher-1', name: 'خالد إبراهيم', subject: 'الرياضيات' }),
    makeTeacher({ id: 'teacher-2', name: 'منى عبدالله', subject: 'اللغة الإنجليزية' }),
  ]
  db.sessions = [
    makeSession({ id: 'session-1', studentId: 'student-1', teacherId: 'teacher-1', day: 'الأحد' }),
    makeSession({
      id: 'session-2',
      studentId: 'student-2',
      teacherId: 'teacher-2',
      day: 'الثلاثاء',
    }),
    makeSession({
      id: 'session-3',
      studentId: 'student-1',
      teacherId: 'teacher-2',
      day: 'الأربعاء',
      status: 'completed',
    }),
  ]
  db.notifications = [
    makeNotification({ id: 'notif-1', title: 'تنبيه الحضور', read: false }),
    makeNotification({ id: 'notif-2', title: 'تذكير جلسة', read: true }),
  ]
}
