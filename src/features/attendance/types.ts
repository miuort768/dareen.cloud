import type { ScheduleSlot } from '../../types'
import type { Student as GlobalStudent } from '../../types/dashboard'
export type { User as GlobalUser } from '../../types/auth'
export type { ScheduleSlot } from '../../types'

export interface Session {
  id: string
  studentId: string
  studentName: string
  teacherName: string
  teacherId?: string
  subject: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  day: string
  date: string
  price?: number
  teacherPrice?: number
  topics?: string
  homework?: string
  needsCompensation?: boolean // Flag for cancelled sessions that should be made up
  isCompensation?: boolean // Flag for the session that is the make-up session
}

export interface Enrollment {
  id?: string
  teacher: string | { id?: string | number; name?: string }
  teacherId?: string
  subject: string
  sessionsTotal: number
  sessionsUsed: number
  schedule: ScheduleSlot[]
  price?: number
  discount?: number
  isFrozen?: boolean
  frozenReason?: string
  nextSessionNotes?: string
}

export interface Student extends Omit<GlobalStudent, 'enrollments'> {
  id: string
  name: string
  grade: string
  parentId?: string // To link siblings
  curriculum?: string
  enrollments: Enrollment[]
}

export interface AttendanceStats {
  todayCompleted: number
  todayCancelled: number
  todayScheduled: number
  todayTotal: number
  totalCompleted: number
  totalCancelled: number
}

export interface TeacherStats {
  expected: number
  used: number
  remaining: number
  rate: number
}

export interface TeacherAttendanceRate {
  teacherName: string
  totalSessions: number
  completed: number
  cancelled: number
  scheduled: number
  rate: number
  students: {
    studentId: string
    studentName: string
    subject: string
    completed: number
    total: number
    rate: number
  }[]
}
