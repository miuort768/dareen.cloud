import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../../../lib/api'
import { Skeleton } from '../../../shared/components/ui'
import { ParentsStudentHeader } from '../components/ParentsStudentHeader'
import { ParentStudentCard } from '../components/ParentStudentCard'
import { SessionsModal } from '../components/SessionsModal'
import { AttendanceModal } from '../components/AttendanceModal'

interface ParentEnrollment {
  teacherName?: string
  sessionsTotal?: number
  sessionsUsed?: number
  subject?: string
  teacher?: string
  date?: string
  [key: string]: unknown
}

interface ParentStudent {
  id: string
  name: string
  grade?: string
  enrollments?: ParentEnrollment[]
  totalPoints?: number
  parentPhone?: string
  [key: string]: unknown
}

interface ChildSession {
  id: string
  date: string
  subject: string
  status: string
  notes?: string
  [key: string]: unknown
}

interface ParentPointLog {
  id?: string
  amount?: number
  action?: string
  [key: string]: unknown
}

export const ParentStudents = () => {
  useEffect(() => {
    document.title = 'أطفالي | دارين السابعة للتعليم والتدريب'
  }, [])
  const [students, setStudents] = useState<ParentStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingStudent, setViewingStudent] = useState<ParentStudent | null>(null)
  const [viewingAttendanceStudent, setViewingAttendanceStudent] = useState<ParentStudent | null>(
    null,
  )
  const [viewingAchievements, setViewingAchievements] = useState<ParentStudent | null>(null)
  const [viewingSubject, setViewingSubject] = useState<ParentEnrollment | null>(null)
  const [sessionsPage, setSessionsPage] = useState(1)
  const [childSessions, setChildSessions] = useState<ChildSession[]>([])
  const [pointLogs, setPointLogs] = useState<ParentPointLog[]>([])
  const [isSessionsLoading, setIsSessionsLoading] = useState(false)
  const [sessionsStartDate, setSessionsStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0] ?? ''
  })
  const [sessionsEndDate, setSessionsEndDate] = useState(
    new Date().toISOString().split('T')[0] ?? '',
  )

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true)
        const data = await api.get<ParentStudent[]>('/parents/my-children')
        setStudents(data)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const fetchChildSessions = async (studentId: string) => {
    try {
      setIsSessionsLoading(true)
      const data = await api.get<ChildSession[]>(`/parents/child-sessions/${studentId}`)
      setChildSessions(data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsSessionsLoading(false)
    }
  }

  const handleViewDates = (student: ParentStudent) => {
    setViewingStudent(student)
    setViewingSubject(null)
    setSessionsPage(1)
    fetchChildSessions(student.id)
  }

  const handleViewAttendance = (student: ParentStudent) => {
    setViewingAttendanceStudent(student)
    fetchChildSessions(student.id)
  }

  const handleViewAchievements = async (student: ParentStudent) => {
    if (viewingAchievements?.id === student.id) {
      setViewingAchievements(null)
      return
    }
    setViewingAchievements(student)
    try {
      const logs = await api.get<ParentPointLog[]>(
        `/student-portal/me/points-log?studentId=${student.id}`,
      )
      setPointLogs(logs)
    } catch (error) {
      console.error('Error fetching student points log', error)
    }
  }

  const filteredStudents = students.filter((s) =>
    (s.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()),
  )

  if (isLoading)
    return (
      <div className="min-h-screen bg-background pb-24" dir="rtl">
        {currentUser?.role === 'parent' && <div className="hidden md:block"></div>}
        <div className="mx-auto max-w-page space-y-6 px-2.5 pt-6 sm:px-4 md:px-6 md:pt-10">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background pb-24"
      dir="rtl"
    >
      {currentUser?.role === 'parent' && <div className="hidden md:block"></div>}
      <div className="mx-auto max-w-page space-y-6 px-2.5 pt-6 sm:px-4 md:px-6 md:pt-10">
        <ParentsStudentHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <ParentStudentCard
              key={student.id}
              student={student}
              viewingAchievements={viewingAchievements}
              onViewDates={handleViewDates}
              onViewAttendance={handleViewAttendance}
              onViewAchievements={handleViewAchievements}
              onCloseAchievements={() => setViewingAchievements(null)}
              pointLogs={pointLogs}
            />
          ))}
          {filteredStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-full rounded-2xl border border-dashed border-border bg-card py-20 text-center"
            >
              <Users size={48} className="mx-auto mb-4 text-muted" />
              <h3 className="text-lg font-medium text-muted">لا يوجد أبناء مسجلين</h3>
              <p className="mt-2 text-xs font-normal italic text-muted">
                يرجى التواصل مع إدارة المعهد في حال وجود أي استفسار.
              </p>
            </motion.div>
          )}
        </div>
      </div>
      <SessionsModal
        viewingStudent={viewingStudent}
        onClose={() => setViewingStudent(null)}
        viewingSubject={viewingSubject}
        onSelectSubject={setViewingSubject}
        sessionsPage={sessionsPage}
        onPageChange={setSessionsPage}
        childSessions={childSessions}
        isSessionsLoading={isSessionsLoading}
        sessionsStartDate={sessionsStartDate}
        onStartDateChange={setSessionsStartDate}
        sessionsEndDate={sessionsEndDate}
        onEndDateChange={setSessionsEndDate}
      />
      <AttendanceModal
        viewingAttendanceStudent={viewingAttendanceStudent}
        onClose={() => setViewingAttendanceStudent(null)}
        childSessions={childSessions}
        isSessionsLoading={isSessionsLoading}
      />
    </motion.div>
  )
}

export default ParentStudents
