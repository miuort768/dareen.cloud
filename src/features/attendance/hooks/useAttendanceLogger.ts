import { useState } from 'react'
import {
  useCurrentUser,
  useShowNotification,
  useWhatsappAutoNotify,
  useWhatsappTemplate,
} from '../../../context/AppContext'
import { generateWhatsAppLink } from '../../../lib/whatsapp'
import { teacherNameOf } from './useAttendance'
import type { Session, Student, Enrollment } from '../types'

interface SecureLogTarget {
  student: Student
  enrollment: Enrollment
}

interface UseAttendanceLoggerOptions {
  allSessions: Session[]
  logAttendance: (data: Omit<Session, 'id'>) => Promise<{ success: boolean; error?: string }>
}

/**
 * منطق تسجيل الحضور المشترك بين صفحة سطح المكتب وواجهة الهاتف:
 * يدير تاريخ التسجيل، الهدف المحدد للمودال الآمن، ومنطق التأكيد مع إشعارات واتساب.
 */
export const useAttendanceLogger = ({ allSessions, logAttendance }: UseAttendanceLoggerOptions) => {
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const whatsappAutoNotify = useWhatsappAutoNotify()
  const whatsappTemplate = useWhatsappTemplate()

  const [logDate, setLogDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [secureModalData, setSecureModalData] = useState<SecureLogTarget | null>(null)
  const [isLogging, setIsLogging] = useState(false)

  const openSecureLog = (student: Student, enrollment: Enrollment) =>
    setSecureModalData({ student, enrollment })

  const closeSecureLog = () => setSecureModalData(null)

  const handleConfirmLog = async (
    status: 'completed' | 'cancelled',
    topics?: string,
    homework?: string,
    needsCompensation?: boolean,
  ) => {
    if (!secureModalData || !logDate || isLogging) return false
    setIsLogging(true)
    const { student, enrollment } = secureModalData
    const alreadyLogged = allSessions.some(
      (s) => s.studentId === student.id && s.subject === enrollment.subject && s.date === logDate,
    )
    if (alreadyLogged) {
      showNotification('الحصة مسجلة بالفعل لهذا الطالب والمادة في هذا التاريخ', 'warning')
      setSecureModalData(null)
      setIsLogging(false)
      return true
    }
    const now = new Date()
    const currentTime = now.toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    const calculatedPrice = enrollment.price
      ? enrollment.price - (enrollment.discount || 0)
      : undefined
    const result = await logAttendance({
      studentId: student.id,
      studentName: student.name || 'غير محدد',
      teacherName: teacherNameOf(enrollment) || currentUser?.teacherName || currentUser?.name || '',
      teacherId: enrollment.teacherId,
      subject: enrollment.subject,
      date: logDate,
      time: currentTime,
      status,
      day: new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' }),
      topics,
      homework,
      needsCompensation,
      price: calculatedPrice,
    })
    if (result.success) {
      showNotification(
        `تم تسجيل ${student.name} (${status === 'completed' ? 'حضور' : 'غياب'})`,
        'success',
      )
      if (whatsappAutoNotify && status === 'completed' && student.parentPhone) {
        const waLink = generateWhatsAppLink(student.parentPhone, whatsappTemplate, {
          Student: student.name,
          Subject: enrollment.subject,
          Teacher: teacherNameOf(enrollment),
          Date: logDate,
          Price: calculatedPrice?.toString() || '0',
        })
        window.open(waLink, '_blank')
      }
      setSecureModalData(null)
      setIsLogging(false)
      return true
    }
    showNotification(result.error || 'فشل تسجيل الحصة', 'error')
    setIsLogging(false)
    return false
  }

  return {
    logDate,
    setLogDate,
    secureModalData,
    openSecureLog,
    closeSecureLog,
    isLogging,
    handleConfirmLog,
  }
}
