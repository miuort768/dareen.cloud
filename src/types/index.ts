// Shared TypeScript Types
// Used across the application for type safety

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
  schedule: ScheduleSlot[]
  price?: number
  isFrozen?: boolean
  frozenReason?: string
  nextSessionNotes?: string
  teacherName?: string
}

export interface ScheduleSlot {
  day: string
  hour: string
  period: string
}

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
  parent?: { id: string; name: string; phone: string } | null
  totalPoints?: number
  badges?: string
  status?: 'scheduled' | 'completed' | 'cancelled'
  date?: string
  subject?: string
  studentId?: string
  startedAt?: string | null
}

export interface Teacher {
  id: string
  name: string
  phone1: string
  phone2?: string
  subject: string
  price: number
  currency?: string
  email?: string
  username?: string
  password?: string
  points?: number
}

export interface Parent {
  id: string
  name: string
  phone: string
  phone2?: string
  email?: string
  username?: string
  password?: string
}

export interface Session {
  id: string
  studentId: string
  studentName: string
  teacherName: string
  teacherId?: string
  subject: string
  date: string
  day: string
  time: string
  price?: number
  teacherPrice?: number
  studentCurrency?: string
  teacherCurrency?: string
  exchangeRateFrom?: string
  exchangeRateTo?: string
  exchangeRateValue?: number
  topics?: string
  homework?: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface TeacherInvoice {
  id: string
  teacher: string
  specialization: string
  amount: number
  currency?: string
  paymentMethod: string
  status: string
  personalExpenses: number
  date: string
}

export interface StudentInvoice {
  id: string
  studentId: string
  studentName: string
  amount: number
  currency?: string
  description: string
  date: string
  dueDate: string
  status: string
  paymentMethod: string
  notes: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  currency?: string
  date: string
  description: string
  status: string
  studentName?: string
  invoiceNumber?: string
  paymentMethod?: string
}

export interface Evaluation {
  id: string
  studentId: string
  teacherId: string
  teacherName: string
  rating: string
  points: number
  notes?: string
  date: string
  created_at: string
}

export type MeetingProvider = 'google_meet' | 'zoom' | 'custom'
export type LiveSessionStatus = 'active' | 'ended'

export interface LiveSession {
  id: string
  teacherId: string
  teacherName: string
  title?: string
  subject?: string
  meetingProvider: MeetingProvider
  meetingUrl?: string
  meetingCode?: string
  isExternalMeeting: boolean
  status: LiveSessionStatus
  targetStudentId?: string
  startedAt: string
  endedAt?: string
  endedBy?: string
}

export interface FixedExpense {
  id: number
  name: string
  amount: number
  currency?: string
}
