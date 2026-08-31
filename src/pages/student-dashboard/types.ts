export interface Enrollment {
  id?: string
  subject?: string
  teacher?: string
  teacherName?: string
  sessionsUsed?: number
  sessionsTotal?: number
  schedule?: { day: string; hour: string; period: string }[]
  nextSessionNotes?: string
  progress?: number
  image?: string
  level?: string
  curr?: string
  price?: number
  isFrozen?: boolean
}

export interface StudentDashboardData {
  id?: string
  name?: string
  grade?: string
  curriculum?: string
  totalPoints?: number
  enrollments?: Enrollment[]
  [key: string]: unknown
}

export interface Session {
  id?: string
  status: string
  subject?: string
  teacherName?: string
  date?: string
  day?: string
  time?: string
}

export interface PointLog {
  id?: string
  amount: number
  action: string
  date?: string
  status?: string
  timestamp?: string
}

export interface StudentStats {
  sessionsUsed: number
  sessionsTotal: number
  attendance: number
  absence: number
  attendanceRate: number
  curriculumProgress: number
}

export interface NextSessionInfo {
  subject: string
  teacher: string
  hour: string
  period: 'am' | 'pm'
  day: string
  isToday: boolean
  minutes: number
  notes?: string
}

export interface TodayTimelineItem {
  id: string
  subject: string
  teacher: string
  hour: string
  period: 'am' | 'pm'
  minutes: number
  notes?: string
  status: 'done' | 'cancelled' | 'upcoming'
}

export interface SubjectProgress {
  id: string
  subject: string
  teacher: string
  used: number
  total: number
  percent: number
  isFrozen: boolean
  weekDays: string[]
  notes?: string
}
