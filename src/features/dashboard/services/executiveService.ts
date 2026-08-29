import { api } from '../../../lib/api'

export interface ExecutiveStats {
  todayRevenue: number
  cashToday: number
  todayProfit: number
  activeSessions: number
  occupancyRate: number
  renewalRate: number
  todayAbsences: number
  attendanceRate: number
  avgRating: number
  lateStarts: number
  newStudentsThisWeek: number
  overdueInvoicesCount: number
  lowSessionStudentsCount: number
  mostProfitableSubject: { name: string; revenue: number }
  mostActiveTeacher: { name: string; sessions: number }
  teachersCount: number
  studentsCount: number
}

export interface ExecutiveAlert {
  type: string
  message: string
  severity: string
  count?: number
  sessionId?: string
  time?: string
}

export interface ExecutiveAlerts {
  critical: ExecutiveAlert[]
  warning: ExecutiveAlert[]
  reminder: ExecutiveAlert[]
  info: ExecutiveAlert[]
}

export interface ExecutivePulse {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'critical' | 'unavailable'
  message: string
}

export interface SystemHealth {
  database: { status: string; latency: number }
  redis: { status: string; fallbacks: number }
  memory: { used: number; total: number; usagePercent: number }
  cpu: { load: number; cores: number }
  uptime: number
  platform: string
  node: string
  timestamp: string
}

export interface PresenceUser {
  userId: string
  name: string
  role: string
  status: 'online' | 'away' | 'offline'
  teachingSubject: string | null
  lastSeen: string
  secondsAgo: number
}

export interface UpcomingSession {
  id: string
  studentName: string
  subject: string
  time: string
  teacherName: string
  minutesUntil: number
  urgency: 'now' | 'very_soon' | 'soon' | 'within_hour' | 'later'
}

export interface ActivityItem {
  id: number
  userId: string
  username: string
  action: string
  details: string | null
  entityType: string | null
  entityId: string | null
  timestamp: string
  group: string
  icon: string
}

export interface ExecutiveDashboardData {
  stats: ExecutiveStats
  alerts: ExecutiveAlerts
  pulse: ExecutivePulse
  health: SystemHealth
  presence: PresenceUser[]
  upcoming: UpcomingSession[]
  activity: ActivityItem[]
  /** Sections that failed server-side and are serving fallback data */
  degraded?: string[]
}

export const executiveService = {
  async getDashboard(activityFilter = 'all') {
    return api.get<ExecutiveDashboardData>(`/v1/executive/dashboard?activity=${activityFilter}`)
  },
}
