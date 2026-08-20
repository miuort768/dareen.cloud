import { useState, useEffect, useMemo } from 'react'
import { useStudents } from '../hooks/useStudents'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { useShowNotification } from '../../../context/AppContext'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import {
  AlertCircle,
  Plus,
  Users,
  BookOpen,
  GraduationCap,
  Star,
  Trash2,
  Megaphone,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Skeleton } from '../../../shared/components/ui'
import { SendNotificationModal } from '../../../shared/components/SendNotificationModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { StudentForm } from '../components/StudentForm'
import { StudentTable } from '../components/StudentTable'
import { StudentDrawer } from '../components/StudentDrawer'
import { StudentsToolbar } from '../components/StudentsToolbar'
import { generateSessionDates } from '../utils/sessionUtils'
import { periodLabel } from '../../attendance/utils/slotUtils'
import type { Student, ScheduleSlot } from '../types'
import { cn } from '../../../lib/utils'

const DELETE_ALL_PASSWORD = 'dareen'

function AnimatedCounter({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) {
      setDisplay(end.toLocaleString('ar-EG'))
      return
    }
    const duration = 800
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * end)
      setDisplay(start.toLocaleString('ar-EG'))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  return <span className={cn('font-bold tabular-nums', className)}>{display}</span>
}

const particles = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

interface EnrollmentFormData {
  teacherId?: string
  teacher: string
  subject: string
  curr: string
  curriculum?: string
  totalSessions: number
  teacherPrice?: number
  schedule: ScheduleSlot[]
}

export const Students = () => {
  useEffect(() => {
    document.title = 'الطلاب | دارين السابعة للتعليم والتدريب'
  }, [])
  const queryClient = useQueryClient()
  const showNotification = useShowNotification()

  const [searchTerm, setSearchTerm] = useState('')
  const [notifyingStudent, setNotifyingStudent] = useState<Student | null>(null)
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const {
    students: allStudents,
    isLoading: loadingStudents,
    createStudent,
    updateStudent,
    deleteAllStudentsAsync,
  } = useStudents()

  const uniqueGrades = useMemo(
    () => [...new Set(allStudents.map((s) => s.grade).filter(Boolean))].sort() as string[],
    [allStudents],
  )

  const students = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return allStudents
    return allStudents.filter((student) => {
      const name = (student.name || '').toLowerCase()
      const parentPhone = student.parentPhone || ''
      const studentPhone = student.studentPhone || ''
      const grade = (student.grade || '').toLowerCase()
      return (
        name.includes(term) ||
        parentPhone.includes(term) ||
        studentPhone.includes(term) ||
        grade.includes(term)
      )
    })
  }, [allStudents, searchTerm])

  const { teachers, isLoading: loadingTeachers } = useTeachers()

  const [showAddForm, setShowAddForm] = useState(false)
  const [, setSelectedStudent] = useState<Student | null>(null)
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [isDeletingAllBusy, setIsDeletingAllBusy] = useState(false)
  const [deleteAllPassword, setDeleteAllPassword] = useState('')
  const [deleteAllError, setDeleteAllError] = useState('')
  const [isAddingEnrollment, setIsAddingEnrollment] = useState(false)

  const loading = loadingStudents || loadingTeachers

  const activeEnrollments = useMemo(
    () => allStudents.reduce((acc, s) => acc + (s.enrollments?.length || 0), 0),
    [allStudents],
  )
  const totalExpectedSessions = useMemo(
    () =>
      allStudents.reduce(
        (acc, s) =>
          acc + (s.enrollments?.reduce((enAcc, en) => enAcc + (en.sessionsTotal || 0), 0) || 0),
        0,
      ),
    [allStudents],
  )
  const averageSessions = useMemo(
    () => (allStudents.length > 0 ? Math.round(totalExpectedSessions / allStudents.length) : 0),
    [allStudents.length, totalExpectedSessions],
  )
  const completedSessions = useMemo(
    () =>
      allStudents.reduce(
        (acc, s) => acc + (s.enrollments?.reduce((ea, en) => ea + (en.sessionsUsed || 0), 0) || 0),
        0,
      ),
    [allStudents],
  )

  const handleAddOrUpdateStudent = (data: Omit<Student, 'id' | 'enrollments'>) => {
    if (editId) {
      const existing = students.find((s) => s.id === editId)
      if (existing) {
        updateStudent({ ...existing, ...data } as Student)
      }
    } else {
      createStudent({ ...data, enrollments: [] } as Omit<Student, 'id'>)
    }
    setShowAddForm(false)
    setEditId(null)
  }

  const handleEditStudent = (student: Student) => {
    setEditId(student.id)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddEnrollment = async (student: Student, enrollData: EnrollmentFormData) => {
    if (!student) return
    setIsAddingEnrollment(true)

    try {
      const created = await api.post('/enrollments', {
        studentId: student.id,
        teacherId: enrollData.teacherId || null,
        teacher: enrollData.teacher,
        subject: enrollData.subject,
        curr: enrollData.curr,
        curriculum: enrollData.curriculum || '',
        sessionsTotal: enrollData.totalSessions,
        teacherPrice: enrollData.teacherPrice ?? null,
        schedule: enrollData.schedule,
        sessions: generateSessionDates(enrollData.schedule, enrollData.totalSessions).map(
          (info) => ({
            date: info.date.toISOString().split('T')[0],
            day: info.slot.day,
            time: `${info.slot.hour} ${periodLabel(info.slot.period, true)}`,
          }),
        ),
      })

      queryClient.invalidateQueries({ queryKey: ['students'] })
      const updatedStudent = {
        ...student,
        enrollments: [...(student.enrollments || []), created],
      }
      setSelectedStudent((prev) => (prev?.id === student.id ? updatedStudent : prev))
      setDrawerStudent((prev) => (prev?.id === student.id ? updatedStudent : prev))
      showNotification('تم إضافة الاشتراك والجلسات بنجاح', 'success')
    } catch (error) {
      console.error('Error adding enrollment:', error)
      showNotification(error?.message || 'فشل إضافة الاشتراك', 'error')
    } finally {
      setIsAddingEnrollment(false)
    }
  }

  const handleSendStudentNotification = async (message: string) => {
    if (!notifyingStudent) return
    try {
      await api.post('/notifications', {
        receiverId: notifyingStudent.id,
        senderName: 'الإدارة',
        title: 'تنبيه من الإدارة',
        message,
        type: 'info',
        time: new Date().toISOString(),
        read: false,
      })
      showNotification('تم إرسال التنبيه للطالب بنجاح', 'success')
    } catch (e) {
      console.error(e)
      showNotification('فشل إرسال التنبيه', 'error')
    } finally {
      setNotifyingStudent(null)
    }
  }

  const handleSendBroadcastNotification = async (message: string) => {
    try {
      const res = await api.post<{ count?: number }>('/notifications/broadcast', {
        senderName: 'الإدارة',
        title: 'تنبيه من الإدارة',
        message,
        type: 'info',
        time: new Date().toISOString(),
        read: false,
      })
      showNotification(
        `تم إرسال التنبيه لجميع الطلاب${res?.count ? ` (${res.count})` : ''} بنجاح`,
        'success',
      )
    } catch (e) {
      console.error(e)
      showNotification('فشل إرسال التنبيه العام', 'error')
    }
  }

  const handleDeleteAll = async () => {
    if (deleteAllPassword !== DELETE_ALL_PASSWORD) {
      setDeleteAllError('كلمة المرور التحذيرية غير صحيحة')
      return
    }
    setDeleteAllError('')
    setIsDeletingAllBusy(true)
    try {
      await deleteAllStudentsAsync(deleteAllPassword)
      setDeleteAllPassword('')
      setIsDeletingAll(false)
    } catch {
      // Error toast handled inside mutation onError
    } finally {
      setIsDeletingAllBusy(false)
    }
  }

  const statsCards = useMemo(
    () => [
      {
        label: 'إجمالي الطلاب',
        value: allStudents.length,
        icon: Users,
        gradient: 'from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10',
        iconBg: 'bg-primary/10 text-primary ring-primary/20',
        accent: 'bg-primary',
      },
      {
        label: 'الاشتراكات النشطة',
        value: activeEnrollments,
        icon: BookOpen,
        gradient: 'from-success/15 to-success/5 dark:from-success/25 dark:to-success/10',
        iconBg: 'bg-success/10 text-success ring-success/20',
        accent: 'bg-success',
      },
      {
        label: 'حصص مكتملة',
        value: completedSessions,
        icon: Star,
        gradient: 'from-warning/15 to-warning/5 dark:from-warning/25 dark:to-warning/10',
        iconBg: 'bg-warning/10 text-warning ring-warning/20',
        accent: 'bg-warning',
      },
      {
        label: 'متوسط الحصص للطالب',
        value: averageSessions,
        icon: GraduationCap,
        gradient: 'from-info/15 to-info/5 dark:from-info/25 dark:to-info/10',
        iconBg: 'bg-info/10 text-info ring-info/20',
        accent: 'bg-info',
      },
    ],
    [allStudents.length, activeEnrollments, completedSessions, averageSessions],
  )

  const fabActions = useMemo(
    () => [
      {
        icon: Plus,
        label: 'إضافة طالب',
        onClick: () => {
          setEditId(null)
          setShowAddForm(true)
        },
      },
      { icon: Megaphone, label: 'بث إشعار للجميع', onClick: () => setBroadcastOpen(true) },
      { icon: Trash2, label: 'حذف الكل', onClick: () => setIsDeletingAll(true) },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="relative min-h-full overflow-x-hidden bg-background pb-24" dir="rtl">
        <div className="relative z-10 mx-auto max-w-page space-y-4 px-2">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full overflow-x-hidden bg-background pb-24" dir="rtl">
      <div className="relative z-10 mx-auto max-w-page space-y-4 px-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 shadow-xl dark:border-primary/30 dark:from-primary/90 dark:via-primary-deep dark:to-primary-hover md:p-8"
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white/10"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-white/15 p-2 backdrop-blur-sm">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <span className="text-xs font-medium text-white/70">إدارة الطلاب</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-on-primary md:text-3xl">الطلاب</h1>
              <p className="text-sm text-white/70">إدارة بيانات الطلاب والاشتراكات والجلسات</p>
            </div>
            </div>
          </div>
          <div className="relative mt-4">
            <svg
              className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              aria-label="بحث عن طالب"
              placeholder="ابحث بالاسم أو الهاتف أو المرحلة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/15 py-2.5 pe-3 ps-9 text-xs font-bold text-white outline-none backdrop-blur-sm transition-all placeholder:text-white/40 focus:border-white/40 focus:bg-white/20"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statsCards.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-4 transition-all duration-300 hover:shadow-elevation-2',
                    stat.gradient,
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-0.5">
                    <div className={cn('h-full rounded-full', stat.accent)} />
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1', stat.iconBg)}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums tracking-tight text-main">
                      <AnimatedCounter value={stat.value} />
                    </p>
                    <p className="mt-1 text-xs text-muted">{stat.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {showAddForm && (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-elevation-1 md:p-6">
              <StudentForm
                initialData={editId ? allStudents.find((s) => s.id === editId) : null}
                teachers={teachers}
                onSubmit={handleAddOrUpdateStudent}
                onCancel={() => {
                  setShowAddForm(false)
                  setEditId(null)
                }}
              />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {isDeletingAll && (
            <div className="bg-error-soft/60 flex flex-col gap-4 rounded-2xl border border-error-soft p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="bg-error/10 rounded-xl p-2 text-error">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-error">حذف جميع الطلاب نهائيًا</p>
                  <p className="text-[11px] text-muted">
                    هذا الإجراء لا يمكن التراجع عنه وسيحذف كل الطلاب والاشتراكات والجلسات.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="password"
                  value={deleteAllPassword}
                  onChange={(e) => {
                    setDeleteAllPassword(e.target.value)
                    setDeleteAllError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDeleteAll()
                  }}
                  placeholder="أدخل كلمة المرور التحذيرية"
                  aria-label="كلمة المرور التحذيرية لحذف جميع الطلاب"
                  className="border-error/30 focus:ring-error/10 w-full rounded-xl border bg-surface px-3 py-2 text-xs font-normal text-main transition-all placeholder:text-muted focus:border-error focus:outline-none focus:ring-2 sm:max-w-xs"
                />
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeletingAllBusy}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-error px-4 text-micro font-bold text-on-error transition-all hover:bg-error-hover disabled:opacity-50"
                >
                  {isDeletingAllBusy && <Loader2 className="animate-spin" size={14} />}
                  تأكيد الحذف
                </button>
                <button
                  onClick={() => {
                    setIsDeletingAll(false)
                    setDeleteAllPassword('')
                    setDeleteAllError('')
                  }}
                  className="h-9 rounded-xl border border-border bg-surface px-4 text-micro font-bold text-main transition-all"
                >
                  إلغاء
                </button>
              </div>
              {deleteAllError && (
                <p className="flex items-center gap-1 text-[11px] font-bold text-error">
                  <AlertCircle size={12} />
                  {deleteAllError}
                </p>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StudentsToolbar
            filteredCount={students.length}
            totalCount={allStudents.length}
            onDeleteAll={() => setIsDeletingAll(true)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          {!drawerStudent ? (
            <StudentTable
              students={students}
              onEdit={handleEditStudent}
              onDelete={(id) => setDeletingId(id)}
              onSelect={(student) => setDrawerStudent(student)}
              onNotify={(student) => setNotifyingStudent(student)}
              selectedId={drawerStudent?.id}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <StudentDrawer
                student={drawerStudent}
                onClose={() => setDrawerStudent(null)}
                teachers={teachers}
                isAddingProgram={isAddingEnrollment}
                onAddProgram={(data) => drawerStudent && handleAddEnrollment(drawerStudent, data)}
                inline
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Student details now render inline above */}

      <SendNotificationModal
        isOpen={!!notifyingStudent}
        title="إرسال إشعار للطالب"
        recipientName={notifyingStudent?.name || ''}
        onSend={handleSendStudentNotification}
        onClose={() => setNotifyingStudent(null)}
      />

      <SendNotificationModal
        isOpen={broadcastOpen}
        title="بث إشعار لجميع الطلاب"
        recipientName=""
        onSend={handleSendBroadcastNotification}
        onClose={() => setBroadcastOpen(false)}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        title="حذف طالب"
        message="سيتم حذف كافة بيانات الطالب. هل أنت متأكد؟"
        onConfirm={async () => {
          if (deletingId) {
            try {
              await api.delete(`/students/${deletingId}`)
              queryClient.invalidateQueries({ queryKey: ['students'] })
              showNotification('تم حذف الطالب بنجاح', 'success')
            } catch (e) {
              console.error(e)
              showNotification('فشل حذف الطالب', 'error')
            }
            setDeletingId(null)
          }
        }}
        onClose={() => setDeletingId(null)}
      />

      <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * (fabActions.length - 1 - i) }}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-sm">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl"
                >
                  <action.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-on-primary shadow-xl transition-all',
            fabOpen ? 'rotate-45 bg-error' : 'bg-primary',
          )}
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </div>
  )
}

export default Students
