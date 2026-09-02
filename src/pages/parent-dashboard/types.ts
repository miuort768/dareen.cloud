import type { Student } from '../../types'

export type ParentUser = { id: string; name?: string | null; username?: string | null } | null

export interface PointLogEntry {
  id: string
  studentName: string
  amount?: number
  action?: string
  timestamp?: string
  date?: string
  status?: string
  points?: number
}

/** جلسة نشطة من /active-sessions/my — تشمل اسم المعلمة والمادة ووقت البدء */
export interface ActiveTimerSession {
  id: string
  studentId: string
  teacherId?: string
  teacherName?: string
  subject: string
  timerSeconds?: number
  startedAt: string
}

export interface ChildNextSession {
  day: string
  hour: string
  period: string
  subject: string
  teacher: string
  minutes: number
  isToday: boolean
}

export interface ChildNote {
  subject: string
  teacher: string
  text: string
}

export interface ChildStats {
  attendanceRate: number
  completed: number
  cancelled: number
  sessionsUsed: number
  sessionsTotal: number
  progress: number
  nextSession: ChildNextSession | null
  notes: ChildNote[]
}

export interface TodayTimelineItem {
  id: string
  studentId: string
  studentName: string
  subject: string
  teacher: string
  hour: string
  period: string
  minutes: number
  status: 'live' | 'done' | 'cancelled' | 'upcoming'
}

export interface WeeklyPulseStats {
  completed: number
  weeklyCompleted: number
  cancelled: number
  todayCount: number
  attendanceRate: number
  academicProgress: number
}

export interface ParentDashboardProps {
  currentUser: ParentUser
  adminPhone: string | undefined
  children: Student[]
  eldestChild?: Student | null
  allPointLogs: PointLogEntry[]
  activeTimers: ActiveTimerSession[]
  childStats: Record<string, ChildStats>
  timeline: TodayTimelineItem[]
  weekly: WeeklyPulseStats
  points: number
  selectedChildId: string | null
  onSelectChild: (id: string) => void
  formatTime: (startedAt: string | null | undefined) => string
  onRefresh: () => void
}
