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
  Search,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Skeleton } from '../../../shared/components/ui'
import { MobilePageHeader } from '../../../shared/components/mobile'
import { SendNotificationModal } from '../../../shared/components/SendNotificationModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { StudentForm } from '../components/StudentForm'
import { StudentTable } from '../components/StudentTable'
import { StudentDrawer } from '../components/StudentDrawer'
import { StudentsToolbar } from '../components/StudentsToolbar'
import { generateSessionDates } from '../utils/sessionUtils'
import { periodLabel } from '../../attendance/utils/slotUtils'
import type { Student, Enrollment, ScheduleSlot } from '../types'
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
      const created = await api.post<Enrollment>('/enrollments', {
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
      showNotification(error instanceof Error ? error.message : 'فشل إضافة الاشتراك', 'error')
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
        gradient: 'from-primary-soft to-background dark:from-primary-soft dark:to-card',
        iconBg: 'bg-white/50 text-primary ring-primary-soft dark:bg-white/10',
        accent: 'bg-primary',
      },
      {
        label: 'الاشتراكات النشطة',
        value: activeEnrollments,
        icon: BookOpen,
        gradient: 'from-success-soft to-background dark:from-success-soft dark:to-card',
        iconBg: 'bg-white/50 text-success ring-success-soft dark:bg-white/10',
        accent: 'bg-success',
      },
      {
        label: 'حصص مكتملة',
        value: completedSessions,
        icon: Star,
        gradient: 'from-warning-soft to-background dark:from-warning-soft dark:to-card',
        iconBg: 'bg-white/50 text-warning ring-warning-soft dark:bg-white/10',
        accent: 'bg-warning',
      },
      {
        label: 'متوسط الحصص للطالب',
        value: averageSessions,
        icon: GraduationCap,
        gradient: 'from-info-soft to-background dark:from-info-soft dark:to-card',
        iconBg: 'bg-white/50 text-info ring-info-soft dark:bg-white/10',
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

  const drawerStudentId = drawerStudent?.id

  if (loading) {
    return (
      <div className="relative min-h-full bg-background" dir="rtl">
        <div className="relative z-10 mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[52px] w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full bg-background pb-2" dir="rtl">
      <div className="relative z-10 mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
        {/* Mobile compact header */}
        <div className="md:hidden">
          <MobilePageHeader
            title="إدارة الطلاب"
            subtitle="الطلاب والاشتراكات والجلسات"
            icon={<GraduationCap size={20} />}
            action={
              <button
                onClick={() => {
                  setEditId(null)
                  setShowAddForm(true)
                }}
                aria-label="إضافة طالب"
                className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-on-primary shadow-md shadow-primary/25 transition-colors active:scale-95"
              >
                <Plus size={16} /> طالب
              </button>
            }
          />
        </div>
        {/* Mobile search */}
        <div className="relative md:hidden">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            aria-label="بحث عن طالب"
            placeholder="ابحث بالاسم أو الهاتف أو المرحلة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pe-3 ps-10 text-xs font-bold text-main shadow-elevation-1 outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
          />
        </div>
        {/* Desktop hero — internally divided: identity | search | count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative hidden overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm md:block md:p-6"
        >
          <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="bg-accent/10 pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <GraduationCap size={22} className="text-on-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black leading-tight text-main">إدارة الطلاب</h1>
                <p className="text-xs text-muted">إدارة بيانات الطلاب والاشتراكات والجلسات</p>
              </div>
            </div>

            <div className="hidden h-12 w-px bg-border lg:block" />

            <div className="relative w-full lg:max-w-sm lg:flex-1">
              <Search
                className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
                size={15}
              />
              <input
                type="text"
                aria-label="بحث عن طالب"
                placeholder="ابحث بالاسم أو الهاتف أو المرحلة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface pe-3 ps-10 text-xs font-bold text-main outline-none transition-all placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
              />
            </div>

            <span className="hidden shrink-0 items-center rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[11px] font-bold tabular-nums text-muted lg:inline-flex">
              {allStudents.length} طالب
            </span>
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
                    'relative overflow-hidden rounded-none border border-border bg-gradient-to-br p-4 transition-shadow hover:shadow-elevation-2',
                    stat.gradient,
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-0.5">
                    <div className={cn('h-full rounded-full', stat.accent)} />
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl ring-1',
                        stat.iconBg,
                      )}
                    >
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
            <div className="flex flex-col gap-4 rounded-2xl border border-error-soft bg-error-soft p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-error-soft p-2 text-error">
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
                  className="w-full rounded-xl border border-error-soft bg-surface px-3 py-2 text-xs font-normal text-main transition-all placeholder:text-muted focus:border-error focus:outline-none focus:ring-2 focus:ring-error-soft sm:max-w-xs"
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
              selectedId={drawerStudentId}
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
        recipientName={notifyingStudent?.name || ''}
        onSend={handleSendStudentNotification}
        onClose={() => setNotifyingStudent(null)}
      />

      <SendNotificationModal
        isOpen={broadcastOpen}
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

      <div
        className="fixed end-4 z-50 flex flex-col items-end gap-3 md:end-8"
        style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
      >
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
                  aria-label={action.label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-main shadow-elevation-2 transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
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
          aria-label={fabOpen ? 'إغلاق القائمة' : 'خيارات الطلاب'}
          aria-expanded={fabOpen}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl text-on-primary shadow-elevation-3 transition-colors focus-visible:ring-2 focus-visible:ring-focus',
            fabOpen ? 'bg-error' : 'bg-primary',
          )}
        >
          <Plus
            size={24}
            className={cn('transition-transform duration-normal', fabOpen && 'rotate-45')}
          />
        </motion.button>
      </div>
    </div>
  )
}

export default Students
