import { formatLocalDate } from '../../../lib/utils'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUIStore } from '../../../store/uiStore'
import { useAuthStore } from '../../../store/authStore'
import { useTeachers } from '../hooks/useTeachers'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { confirm } from '../../../lib/confirmDialog'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { downloadExport } from '../../../lib/download'
import { TeacherToolbar } from '../components/TeacherToolbar'
import { TeacherForm } from '../components/TeacherForm'
import { TeacherTable } from '../components/TeacherTable'
import { TeacherDetails } from '../components/TeacherDetails'
import type { Teacher, Session, Student, Enrollment } from '../../../types'
import { TeachersPageHeader, TeachersPageModals } from './teachers-page'

const enrollmentTeacherName = (en: Enrollment): string | undefined => {
  if (typeof en.teacher === 'string') return en.teacher
  if (en.teacher && typeof en.teacher === 'object') return (en.teacher as { name?: string }).name
  return en.teacherFallback
}

const matchesTeacher = (en: Enrollment, t: Teacher): boolean => {
  const name = enrollmentTeacherName(en)
  return Boolean(
    (en.teacherId && t.id && en.teacherId === t.id) || (name && t.name && name === t.name),
  )
}

export const Teachers = () => {
  useEffect(() => {
    document.title = 'المعلمات | دارين السابعة للتعليم والتدريب'
  }, [])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const showNotification = useUIStore((s) => s.showNotification)
  const currentUser = useAuthStore((s) => s.currentUser)
  const isTeacher = currentUser?.role === 'teacher'
  const {
    teachers,
    isLoading: loadingTeachers,
    createTeacherAsync,
    updateTeacherAsync,
    deleteTeacher,
  } = useTeachers()
  const { data: studentsData = [], isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const data = await api.get<{ data: Student[] } | Student[]>('/students')
      return Array.isArray(data) ? data : data.data || []
    },
  })
  const students = useMemo(() => (Array.isArray(studentsData) ? studentsData : []), [studentsData])
  const { data: sessionsData = [], isLoading: loadingSessions } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const data = await api.get<Session[]>('/sessions')
      return Array.isArray(data) ? data : []
    },
  })
  const sessions = Array.isArray(sessionsData) ? sessionsData : []
  const loading = loadingTeachers || loadingStudents || loadingSessions

  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [logDate] = useState(formatLocalDate(new Date()) ?? '')
  const [secureModalData, setSecureModalData] = useState<{
    student: Student
    enrollment: Enrollment
  } | null>(null)
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null)
  const [notifyingTeacher, setNotifyingTeacher] = useState<Teacher | null>(null)
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({ isOpen: false, title: '', message: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uniqueSubjects = useMemo(
    () => [...new Set(teachers.map((t) => t.subject))].filter(Boolean),
    [teachers],
  )
  const subjectsList = useMemo(() => uniqueSubjects as string[], [uniqueSubjects])
  const averagePrice = useMemo(
    () =>
      teachers.length > 0
        ? Math.round(teachers.reduce((sum, t) => sum + Number(t.price), 0) / teachers.length)
        : 0,
    [teachers],
  )
  const studentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of teachers) counts[t.name] = 0
    for (const s of students) {
      for (const en of s.enrollments || []) {
        const t = teachers.find((t) => matchesTeacher(en, t))
        if (t) counts[t.name] = (counts[t.name] || 0) + 1
      }
    }
    return counts
  }, [students, teachers])

  const computeStatus = useCallback(
    (teacher: Teacher): string => {
      const count = studentCounts[teacher.name] || 0
      return count > 0 ? 'active' : 'inactive'
    },
    [studentCounts],
  )

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((t) => {
        const matchSearch =
          !searchTerm ||
          (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.phone1 || '').includes(searchTerm)
        const matchSubject = !filterSubject || t.subject === filterSubject
        const matchStatus = !filterStatus || computeStatus(t) === filterStatus
        return matchSearch && matchSubject && matchStatus
      }),
    [teachers, searchTerm, filterSubject, filterStatus, computeStatus],
  )

  const handleAddTeacher = async (data: Omit<Teacher, 'id'>) => {
    try {
      if (editId) {
        await updateTeacherAsync({ ...data, id: editId } as Teacher)
        setSuccessModalData({
          isOpen: true,
          title: 'تحديث ناجح',
          message: 'تم تحديث بيانات المعلمة بنجاح',
        })
      } else {
        await createTeacherAsync(data)
        setSuccessModalData({
          isOpen: true,
          title: 'عملية ناجحة',
          message: 'تم إضافة المعلمة بنجاح',
        })
      }
      setShowAddForm(false)
      setEditId(null)
    } catch (err) {
      console.error('Error adding teacher:', err)
    }
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setEditId(teacher.id)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteTeacher = () => {
    if (deletingTeacherId) {
      deleteTeacher(deletingTeacherId)
      setDeletingTeacherId(null)
    }
  }

  const handleConfirmLog = async (
    status: 'completed' | 'cancelled',
    topics?: string,
    homework?: string,
    needsCompensation?: boolean,
  ) => {
    if (!secureModalData || !selectedTeacher || !logDate) return false
    const { student, enrollment } = secureModalData
    const now = new Date()
    const currentTime = now.toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    try {
      await api.post('/sessions', {
        studentId: student.id,
        studentName: student.name,
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        subject: enrollment.subject,
        date: logDate,
        time: currentTime,
        status,
        teacherPrice: selectedTeacher.price,
        topics: topics || '',
        homework: homework || '',
        needsCompensation: needsCompensation || false,
      })
      showNotification(`تم تسجيل ${status === 'completed' ? 'حضور' : 'غياب'} بنجاح`, 'success')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      setSecureModalData(null)
      return true
    } catch (e) {
      console.error(e)
      showNotification('فشل تسجيل الحضور', 'error')
      return false
    }
  }

  const handleSendTeacherNotification = async (message: string) => {
    if (!notifyingTeacher) return
    try {
      await api.post('/notifications', {
        receiverId: notifyingTeacher.id,
        senderName: currentUser?.name || 'الإدارة',
        title: 'تنبيه من الإدارة',
        message,
        type: 'info',
        time: new Date().toISOString(),
        read: false,
      })
      showNotification('تم إرسال التنبيه للمعلمة بنجاح', 'success')
    } catch (e) {
      console.error(e)
      showNotification('فشل إرسال التنبيه', 'error')
    } finally {
      setNotifyingTeacher(null)
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/\.(json|csv|txt|xlsx|xls)$/i.test(file.name)) {
      showNotification('يرجى رفع ملف Excel أو CSV أو JSON', 'error')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        let parsedData: Record<string, string | number>[] = []
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(content)
          parsedData = Array.isArray(json) ? json : json.data || json.teachers || []
        } else {
          // CSV / Excel text lines
          const lines = content.split('\n')
          const rows = lines.map((l) =>
            l.split(',').map((c) => c.trim().replace(/^["']|["']$/g, '')),
          )
          const dataRows = rows.slice(
            rows.length > 1 && !!rows[0] && rows[0].some((h) => /name|اسم/i.test(h)) ? 1 : 0,
          )
          parsedData = dataRows
            .filter((r) => r.length >= 1 && r[0])
            .map((r) => ({
              name: r[0] || '',
              subject: r[1] || 'عام',
              phone1: r[2] || '',
              phone2: r[3] || '',
              price: Number(r[4] || 100),
            }))
        }
        if (parsedData.length === 0) {
          showNotification('لم يتم العثور على بيانات صالحة', 'error')
          return
        }
        showNotification('جاري استيراد المعلمات...', 'info')
        for (const item of parsedData) {
          try {
            const teacherData = {
              name: item.name || '',
              subject: item.subject || 'عام',
              phone1: item.phone1 || '',
              phone2: item.phone2 || '',
              price: Number(item.price || 100),
            }
            if (teacherData.name) {
              await createTeacherAsync(teacherData as Omit<Teacher, 'id'>)
              await new Promise((resolve) => setTimeout(resolve, 50))
            }
          } catch (err) {
            console.error('Import error:', err)
          }
        }
        showNotification('اكتملت عملية الاستيراد بنجاح', 'success')
        queryClient.invalidateQueries({ queryKey: ['teachers'] })
      } catch (e) {
        console.error(e)
        showNotification('فشل قراءة الملف', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDeleteAll = async () => {
    if (!(await confirm({ message: 'حذف جميع المعلمات؟ لا يمكن التراجع!', isDestructive: true })))
      return
    try {
      await api.delete('/teachers')
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      showNotification('تم الحذف بنجاح', 'success')
    } catch (e) {
      console.error(e)
      showNotification('فشل الحذف', 'error')
    }
  }

  const handleRowSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setShowDetails(true)
  }

  const unenrollMutation = useMutation({
    mutationFn: async ({
      student,
      teacherName,
      teacherId,
    }: {
      student: Student
      teacherName: string
      teacherId?: string
    }) => {
      const updatedEnrollments = (student.enrollments || []).filter((en: Enrollment) => {
        const name =
          typeof en.teacher === 'string'
            ? en.teacher
            : en.teacher && typeof en.teacher === 'object'
              ? (en.teacher as { name?: string }).name
              : en.teacherFallback
        return !(
          (teacherId && en.teacherId && en.teacherId === teacherId) ||
          (name && name === teacherName) ||
          (en.teacherFallback && en.teacherFallback === teacherName)
        )
      })
      await api.put(`/students/${student.id}`, { ...student, enrollments: updatedEnrollments })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      showNotification('تم إزالة الطالب بنجاح', 'success')
    },
  })

  if (loading)
    return (
      <div
        className="from-primary-soft/40 min-h-full bg-gradient-to-b via-background to-background"
        dir="rtl"
      >
        <div className="relative z-10 mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
          <Skeleton className="h-[104px] rounded-2xl" />
          <Skeleton className="h-[150px] rounded-2xl" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      </div>
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="from-primary-soft/40 min-h-full bg-gradient-to-b via-background to-background pb-2"
      dir="rtl"
    >
      <div className="relative z-10 mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
        <TeachersPageHeader
          totalTeachers={teachers.length}
          uniqueSubjects={subjectsList.length}
          averagePrice={averagePrice}
          showAddForm={showAddForm}
          onToggleForm={() => {
            setShowAddForm(!showAddForm)
            if (showAddForm) setEditId(null)
          }}
          totalStudents={students.length}
        />
        <TeacherToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showAddForm={showAddForm}
          onToggleAddForm={() => {
            setShowAddForm(!showAddForm)
            if (showAddForm) setEditId(null)
          }}
          onImport={() => fileInputRef.current?.click()}
          onExportExcel={() =>
            downloadExport('teachers', 'xlsx')
              .then(() => showNotification('تم تصدير Excel', 'success'))
              .catch((e) => showNotification(e.message, 'error'))
          }
          onExportPDF={() =>
            downloadExport('teachers', 'pdf')
              .then(() => showNotification('تم تصدير PDF', 'success'))
              .catch((e) => showNotification(e.message, 'error'))
          }
          onDeleteAll={handleDeleteAll}
          subjects={subjectsList}
          filterSubject={filterSubject}
          onFilterSubjectChange={setFilterSubject}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          totalTeachers={teachers.length}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt,.json"
          className="hidden"
          onChange={handleImportFile}
        />
        {showAddForm && (
          <TeacherForm
            onSubmit={handleAddTeacher}
            initialData={editId ? teachers.find((t) => t.id === editId) : null}
            onCancel={() => {
              setShowAddForm(false)
              setEditId(null)
            }}
            editId={editId}
          />
        )}
        {!showDetails ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TeacherTable
              teachers={filteredTeachers}
              onEdit={handleEditTeacher}
              onDelete={setDeletingTeacherId}
              onSelect={handleRowSelect}
              onChat={(id) => navigate('/chat', { state: { startChatWith: id } })}
              onNotify={(t) => setNotifyingTeacher(t)}
              selectedId={selectedTeacher?.id}
              studentCounts={studentCounts}
            />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {selectedTeacher && (
              <TeacherDetails
                teacher={selectedTeacher}
                onClose={() => setShowDetails(false)}
                students={students}
                sessions={sessions}
                onLogAttendance={(s, e) => setSecureModalData({ student: s, enrollment: e })}
                onUnenroll={(s, t) =>
                  unenrollMutation.mutate({
                    student: s,
                    teacherName: t,
                    teacherId: selectedTeacher?.id,
                  })
                }
                onSendNotification={(t) => setNotifyingTeacher(t)}
                isTeacherView={isTeacher}
              />
            )}
          </motion.div>
        )}
        <TeachersPageModals
          deletingTeacherId={deletingTeacherId}
          onConfirmDelete={handleDeleteTeacher}
          onCancelDelete={() => setDeletingTeacherId(null)}
          secureModalData={secureModalData}
          onSecureClose={() => setSecureModalData(null)}
          onSecureConfirm={handleConfirmLog}
          secureStudentName={secureModalData?.student?.name || ''}
          logDate={logDate}
          notifyingTeacher={notifyingTeacher}
          onNotifyClose={() => setNotifyingTeacher(null)}
          onNotifySend={handleSendTeacherNotification}
          notifyName={notifyingTeacher?.name || ''}
          successData={successModalData}
          onSuccessClose={() => setSuccessModalData({ ...successModalData, isOpen: false })}
        />

        {/* Teacher Details inline — no overlay drawer */}
      </div>
    </motion.div>
  )
}

export default Teachers
