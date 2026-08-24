import type { ScheduleSlot } from '../../types'

export type { ScheduleSlot }

export interface Student {
  id: string
  name: string
  grade: string
  parentPhone: string
  studentPhone?: string
  curriculum?: string
  notes?: string
  sessionPrice: number
  currency?: string
  enrollments: Enrollment[]
  totalPoints?: number
  badges?: string
  username?: string
  password?: string
}

export interface Enrollment {
  id?: string
  teacher: string | { id: string; name: string; subject?: string } | null
  teacherId?: string
  teacherFallback?: string
  subject: string
  curr: string
  curriculum?: string
  sessionsTotal: number
  sessionsUsed: number
  teacherPrice?: number
  schedule: ScheduleSlot[]
  price?: number
  isFrozen?: boolean
  frozenReason?: string
  nextSessionNotes?: string
}

export interface StudentInvoice {
  id: string
  studentId: string
  studentName: string
  subject: string
  amount: number
  date: string
  status: 'pending' | 'paid' | 'cancelled'
}
