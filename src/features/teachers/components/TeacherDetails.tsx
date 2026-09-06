import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Bell, MessageCircle, Clock, ChevronDown } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { Teacher, Session } from '../types'
import type { Student, Enrollment } from '../../../types'
import { TeacherPerformanceGauge } from './TeacherPerformanceGauge'
import { TeacherEnrollmentList } from './TeacherEnrollmentList'
import { TeacherActivitySection } from './TeacherActivitySection'
import { TeacherPaymentInfo } from './TeacherPaymentInfo'
import { useTeacherActivity } from '../hooks/useTeacherActivity'

interface TeacherDetailsProps {
  teacher: Teacher
  onClose: () => void
  students: Student[]
  sessions: Session[]
  onLogAttendance: (student: Student, enrollment: Enrollment) => void
  onUnenroll: (student: Student, teacherName: string) => void
  onSendNotification: (teacher: Teacher) => void
  isTeacherView: boolean
}

export const TeacherDetails = ({
  teacher,
  onClose,
  students,
  sessions,
  onLogAttendance,
  onUnenroll,
  onSendNotification,
  isTeacherView,
}: TeacherDetailsProps) => {
  const navigate = useNavigate()
  const [showActivity, setShowActivity] = useState(false)
  const { data: activity, isLoading: activityLoading } = useTeacherActivity(teacher.id)

  const enrolledStudents = students.filter((s) =>
    s.enrollments?.some((e: Enrollment) => {
      const name =
        typeof e.teacher === 'string'
          ? e.teacher
          : e.teacher && typeof e.teacher === 'object'
            ? e.teacher.name
            : e.teacherFallback
      return (
        (e.teacherId && e.teacherId === teacher.id) ||
        (name && name === teacher.name) ||
        (e.teacherFallback && e.teacherFallback === teacher.name)
      )
    }),
  )

  const teacherSessions = sessions
    .filter((s) => (s.teacherId && s.teacherId === teacher.id) || s.teacherName === teacher.name)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthlySessions = teacherSessions.filter((s) => {
    const d = new Date(s.date)
    return (
      d.getMonth() === currentMonth && d.getFullYear() === currentYear && s.status === 'completed'
    )
  }).length

  const prevMonthSessions = teacherSessions.filter((s) => {
    const d = new Date(s.date)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const year = currentMonth === 0 ? currentYear - 1 : currentYear
    return d.getMonth() === prevMonth && d.getFullYear() === year && s.status === 'completed'
  }).length

  const performanceChange =
    prevMonthSessions === 0
      ? 100
      : Math.round(((monthlySessions - prevMonthSessions) / prevMonthSessions) * 100)

  return (
    <div
      className={cn(
        'flex h-fit flex-col overflow-hidden border border-border bg-card',
        'lg:static lg:sticky lg:top-4',
      )}
      dir="rtl"
    >
      {/* Header Section */}
      <div className="bg-primary px-5 py-5 md:px-7 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-white/15">
              <span className="text-xl font-bold text-on-primary">
                {(teacher.name || '?').charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-on-primary">{teacher.name}</h3>
              <span className="bg-error-soft px-2 py-0.5 text-[10px] text-error">
                {teacher.subject}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isTeacherView && (
              <>
                <button
                  onClick={() => onSendNotification(teacher)}
                  className="flex h-9 w-9 items-center justify-center bg-white/15 text-on-primary transition-all hover:bg-white/25"
                  title="إرسال إشعار"
                  aria-label="إرسال إشعار"
                >
                  <Bell size={16} />
                </button>
                <button
                  onClick={() => navigate('/chat', { state: { startChatWith: teacher.id } })}
                  className="flex h-9 w-9 items-center justify-center bg-white/15 text-on-primary transition-all hover:bg-white/25"
                  title="مراسلة"
                  aria-label="مراسلة"
                >
                  <MessageCircle size={16} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center bg-white/15 text-on-primary transition-all hover:bg-white/25"
              title="إغلاق"
              aria-label="إغلاق"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-200px)] space-y-6 overflow-y-auto p-6 lg:max-h-none">
        <TeacherPerformanceGauge
          monthlySessions={monthlySessions}
          prevMonthSessions={prevMonthSessions}
          performanceChange={performanceChange}
        />

        {!isTeacherView && <TeacherPaymentInfo teacherId={teacher.id} />}

        <TeacherEnrollmentList
          enrolledStudents={enrolledStudents}
          teacherId={teacher.id}
          teacherName={teacher.name}
          onLogAttendance={onLogAttendance}
          onUnenroll={onUnenroll}
          isTeacherView={isTeacherView}
        />

        <div className="space-y-3 pt-4">
          <button
            onClick={() => setShowActivity((v) => !v)}
            aria-expanded={showActivity}
            aria-label="سجل النشاطات المفصل"
            className={cn(
              'group flex w-full items-center justify-between border px-6 py-4 transition-all',
              showActivity
                ? 'border-primary bg-primary text-on-primary'
                : 'border-primary/20 bg-primary-soft hover:border-primary',
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center bg-primary transition-all group-hover:bg-primary-hover">
                <Clock size={18} className="text-on-primary" />
              </div>
              <div className="text-start">
                <p
                  className={cn(
                    'text-sm transition-all',
                    showActivity ? 'text-on-primary' : 'text-main group-hover:text-primary',
                  )}
                >
                  سجل النشاطات المفصل
                </p>
                <p
                  className={cn('mt-0.5 text-xs', showActivity ? 'text-white/80' : 'text-primary')}
                >
                  عرض آخر {teacherSessions.length} عملية
                </p>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={cn('transition-transform', showActivity && 'rotate-180')}
            />
          </button>

          {showActivity && (
            <div className="duration-slow animate-in fade-in slide-in-from-top-2">
              <TeacherActivitySection activity={activity} activityLoading={activityLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
