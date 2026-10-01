import type {
  DashboardStats,
  LowBalanceStudent,
  DashboardTask,
} from '../../features/dashboard/types'
import type { Session } from '../../types'
import type { User } from '../../types/auth'

/** صف في الخط الزمني لليوم — الشكل الفعلي من stats.todayTimeline مع توسيع اختياري لـ studentId */
export interface TeacherTimelineItem {
  id: string
  studentId?: string
  studentName: string
  time: string
  subject: string
  status: string
}

/** طالب محتاج متابعة — من focusStudents في useDashboardData */
export interface TeacherFocusStudent {
  id: string
  name: string
  reason: string
  type: string
}

/** Props مشتركة بين شِل الموبايل والتابلت والديسكتوب — مصدر واحد بدل 3 نسخ */
export interface TeacherDashboardShellProps {
  currentUser: User | null
  stats: DashboardStats
  rawSessions: Session[]
  tasks: DashboardTask[]
  lowBalanceStudents: LowBalanceStudent[]
  focusStudents: TeacherFocusStudent[]
  timeline: TeacherTimelineItem[]
  weekCounts: number[]
}

/** الموبايل وحده يدعم السحب للتحديث */
export type TeacherDashboardMobileProps = TeacherDashboardShellProps & {
  onRefresh: () => void
}
