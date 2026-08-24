import { Users } from 'lucide-react'
import { useShowNotification } from '../../context/AppContext'
import { confirm } from '../../lib/confirmDialog'
import type { Student, Enrollment, Session } from '../../features/attendance/types'
import { normalizeDayName } from '../../features/attendance/utils/slotUtils'

interface BulkAttendanceButtonProps {
  matchedEnrollments: { student: Student; enrollment: Enrollment }[]
  allSessions: Session[]
  logDate: string
  logAttendance: (data: Omit<Session, 'id'>) => Promise<{ success: boolean; error?: string }>
}

export const BulkAttendanceButton = ({
  matchedEnrollments,
  allSessions,
  logDate,
  logAttendance,
}: BulkAttendanceButtonProps) => {
  const showNotification = useShowNotification()

  const handleBulk = async () => {
    const selectedDayName = new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' })
    const todayStudents = (matchedEnrollments || []).filter(({ student, enrollment }) => {
      const isScheduledToday = enrollment.schedule?.some(
        (slot) => normalizeDayName(slot.day) === selectedDayName,
      )
      const alreadyLogged = allSessions.some(
        (s) => s.studentId === student.id && s.subject === enrollment.subject && s.date === logDate,
      )
      return isScheduledToday && !alreadyLogged
    })

    if (todayStudents.length === 0) {
      showNotification('لا يوجد طلاب متاحون للتسجيل', 'info')
      return
    }

    if (!(await confirm(`سيتم تسجيل (${todayStudents.length}) طالب كحضور تلقائي`))) return

    const now = new Date()
    const currentTime = now.toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })

    let successCount = 0
    for (const { student, enrollment } of todayStudents) {
      const teacherRaw = enrollment.teacher
      const result = await logAttendance({
        studentId: student.id,
        studentName: student.name,
        teacherName: typeof teacherRaw === 'string' ? teacherRaw : (teacherRaw?.name ?? ''),
        teacherId: enrollment.teacherId,
        subject: enrollment.subject,
        date: logDate,
        time: currentTime,
        status: 'completed',
        day: selectedDayName,
        price: enrollment.price ? enrollment.price - (enrollment.discount || 0) : undefined,
      })
      if (result?.success) successCount++
    }
    showNotification(`تم تسجيل ${successCount} طالب بنجاح`, 'success')
  }

  return (
    <div className="mb-2 px-0">
      <button
        onClick={handleBulk}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3.5 text-xs font-semibold text-on-success shadow-sm transition-all duration-200 hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
      >
        تسجيل حضور اليوم بالكامل <Users size={16} />
      </button>
    </div>
  )
}
