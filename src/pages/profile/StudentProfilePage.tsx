import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Target,
  Star,
  Phone,
  User,
  CalendarDays,
  Play,
  Flame,
} from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser, useLogout, useAcademyName } from '../../context/AppContext'
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks'
import { Skeleton } from '../../shared/components/ui'
import { StudentDashboardHeader } from '../student-dashboard/StudentDashboardHeader'
import { ProfileHero } from './ProfileHero'
import { ProfileAchievements } from './ProfileAchievements'
import { ProfileProgress } from './ProfileProgress'
import { ProfileBottomMotivation } from './ProfileBottomMotivation'

interface StudentData {
  id?: string
  name?: string
  grade?: string
  curriculum?: string
  totalPoints?: number
  parentPhone?: string
  studentPhone?: string
  email?: string
  city?: string
  enrollments?: {
    id?: string
    subject?: string
    teacherName?: string
    teacher?: string
    sessionsUsed?: number
    sessionsTotal?: number
  }[]
  [key: string]: unknown
}

interface Session {
  id?: string
  status: string
  subject?: string
  teacherName?: string
  date?: string
}

export const StudentProfilePage = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الملف الشخصي | ${academyName} للتعليم والتدريب`
  }, [academyName])
  const currentUser = useCurrentUser()
  const logout = useLogout()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchAll = async () => {
      try {
        setIsLoading(true)
        const [meRes, sessionsRes] = await Promise.all([
          api.get<StudentData>('/student-portal/me'),
          api.get<Session[]>('/student-portal/me/sessions'),
        ])
        if (cancelled) return
        setStudentData(meRes)
        setSessions(sessionsRes)
      } catch (e) {
        console.error('Error fetching profile:', e)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    if (currentUser?.role === 'student') fetchAll()
    return () => {
      cancelled = true
    }
  }, [currentUser])

  const enrollments = useMemo(() => studentData?.enrollments || [], [studentData?.enrollments])
  const points = studentData?.totalPoints || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const nextRank = getNextRank(points, STUDENT_RANKS)

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'completed').length
    const cancelled = sessions.filter((s) => s.status === 'cancelled').length
    const totalRecorded = completed + cancelled
    let sessionsUsed = 0,
      sessionsTotal = 0
    enrollments.forEach((en) => {
      sessionsUsed += Number(en.sessionsUsed || 0)
      sessionsTotal += Number(en.sessionsTotal || 0)
    })
    return {
      attendanceRate: totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0,
      curriculumProgress: sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0,
      totalSessions: totalRecorded,
      completedSessions: completed,
      totalSubjects: enrollments.length,
      sessionsUsed,
      sessionsTotal,
    }
  }, [sessions, enrollments])

  const achievements = [
    {
      id: '1',
      icon: <Trophy size={18} className="text-warning" />,
      title: 'الماسي',
      unlocked: points >= 1000,
      progress: Math.min(Math.round((points / 1000) * 100), 100),
    },
    {
      id: '2',
      icon: <Star size={18} className="text-warning" />,
      title: '500 نقطة',
      unlocked: points >= 500,
      progress: Math.min(Math.round((points / 500) * 100), 100),
    },
    {
      id: '3',
      icon: <BookOpen size={18} className="text-primary" />,
      title: '50 حصة',
      unlocked: stats.completedSessions >= 50,
      progress: Math.min(Math.round((stats.completedSessions / 50) * 100), 100),
    },
    {
      id: '4',
      icon: <Flame size={18} className="text-error" />,
      title: 'أسبوع مثالي',
      unlocked: stats.attendanceRate >= 95,
      progress: Math.min(stats.attendanceRate, 100),
    },
    {
      id: '5',
      icon: <Target size={18} className="text-info" />,
      title: 'تقدم المنهج',
      unlocked: stats.curriculumProgress >= 90,
      progress: Math.min(stats.curriculumProgress, 100),
    },
  ]

  const progressItems = [
    { label: 'تقدم المنهج', value: stats.curriculumProgress },
    { label: 'الحضور', value: stats.attendanceRate },
    {
      label: 'إنجاز الحصص',
      value:
        stats.sessionsTotal > 0 ? Math.round((stats.sessionsUsed / stats.sessionsTotal) * 100) : 0,
    },
    { label: 'النقاط', value: Math.min(Math.round((points / 1000) * 100), 100) },
  ]

  const infoFields = [
    {
      icon: <User size={13} className="text-primary" />,
      label: 'الاسم',
      value: studentData?.name || currentUser?.name || 'الطالب',
    },
    {
      icon: <GraduationCap size={13} className="text-info" />,
      label: 'الصف',
      value: studentData?.grade || '—',
    },
    {
      icon: <BookOpen size={13} className="text-success" />,
      label: 'المنهج',
      value: studentData?.curriculum || '—',
    },
    {
      icon: <Phone size={13} className="text-warning" />,
      label: 'رقم الطالب',
      value: studentData?.studentPhone || '—',
    },
    {
      icon: <Phone size={13} className="text-muted" />,
      label: 'رقم ولي الأمر',
      value: studentData?.parentPhone || '—',
    },
    {
      icon: <Trophy size={13} className="text-warning" />,
      label: 'الرتبة',
      value: rank?.name || '—',
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="hidden md:block">
          <StudentDashboardHeader logout={logout} />
        </div>
        <div className="mx-auto max-w-page space-y-4 px-4 pt-4">
          <Skeleton className="h-40 rounded-b-3xl" />
          <div className="flex gap-3 overflow-hidden">
            <Skeleton className="h-24 w-28 shrink-0 rounded-2xl" />
            <Skeleton className="h-24 w-28 shrink-0 rounded-2xl" />
            <Skeleton className="h-24 w-28 shrink-0 rounded-2xl" />
          </div>
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  const name = studentData?.name || currentUser?.name || 'الطالب'

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim()
    if (!trimmed || isSavingName) return
    setIsSavingName(true)
    try {
      await api.put('/student-portal/me', { name: trimmed })
      setStudentData((prev) => (prev ? { ...prev, name: trimmed } : prev))
      setEditingName(false)
    } catch (e) {
      console.error('Error updating name:', e)
    } finally {
      setIsSavingName(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background" dir="rtl">
      <div className="hidden md:block">
        <StudentDashboardHeader logout={logout} />
      </div>

      <div className="mx-auto max-w-page space-y-4 px-4 pb-24 pt-4 md:space-y-6 md:pt-6">
        {/* Hero */}
        <ProfileHero
          name={name}
          role="student"
          subtitle={`${studentData?.grade || ''} ${studentData?.curriculum ? `• ${studentData.curriculum}` : ''}`}
          rank={rank}
          attendanceRate={stats.attendanceRate}
          hideNavButtons
          onEditName={() => {
            setNameDraft(name)
            setEditingName(true)
          }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr] md:gap-6">
          {/* Right Column (Sidebar) */}
          <div className="space-y-4 md:space-y-6">
            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5"
            >
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-main">
                <User size={16} className="text-primary" />
                المعلومات الشخصية
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {infoFields.map((f, i) => (
                  <div
                    key={i}
                    className="bg-surface/50 border-border/50 flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-border"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
                      {f.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-muted">{f.label}</p>
                      <p className="truncate text-xs font-bold text-main">{f.value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Motivation */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
            >
              <ProfileBottomMotivation
                icon={<Target size={22} />}
                title={
                  nextRank.next
                    ? `تبقى ${nextRank.pointsNeeded} نقطة للوصول إلى ${nextRank.next.name}`
                    : 'أحسنت! وصلت لأعلى المراتب'
                }
                description={
                  nextRank.next
                    ? 'واصل التعلم واجمع النقاط لتصل إلى الرتبة التالية'
                    : `أنت نجم ${academyName}!`
                }
                progress={
                  nextRank.next
                    ? Math.min(
                        Math.round((points / (points + (nextRank.pointsNeeded || 1))) * 100),
                        100,
                      )
                    : 100
                }
                progressLabel="التقدم نحو الرتبة التالية"
                targetLabel={nextRank.next ? `${nextRank.pointsNeeded} نقطة متبقية` : 'أحسنت!'}
                color={nextRank.next ? 'primary' : 'success'}
              />
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <ProfileProgress items={progressItems} />
            </motion.div>
          </div>

          {/* Left Column (Main Content) */}
          <div className="space-y-4 md:space-y-6">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
            >
              {[
                {
                  icon: <BookOpen size={18} className="text-primary" />,
                  value: stats.totalSubjects,
                  label: 'المواد',
                  color: 'bg-primary/10 ring-primary/20 text-primary',
                },
                {
                  icon: <Play size={18} className="text-success" />,
                  value: stats.completedSessions,
                  label: 'الحصص',
                  color: 'bg-success/10 ring-success/20 text-success',
                },
                {
                  icon: <Target size={18} className="text-info" />,
                  value: `${stats.curriculumProgress}%`,
                  label: 'المنهج',
                  color: 'bg-info/10 ring-info/20 text-info',
                },
                {
                  icon: <Star size={18} className="text-warning" />,
                  value: points,
                  label: 'النقاط',
                  color: 'bg-warning/10 ring-warning/20 text-warning',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md md:p-5"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold tabular-nums leading-none text-main md:text-[26px]">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-medium text-muted">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Enrollments */}
            {enrollments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-bold text-main">
                    <BookOpen size={16} className="text-info" />
                    المواد المسجلة
                  </h3>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                    {enrollments.length} مواد
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                  {enrollments.map((en, idx) => {
                    const used = Number(en.sessionsUsed || 0)
                    const total = Number(en.sessionsTotal || 0)
                    const progress = total > 0 ? Math.round((used / total) * 100) : 0
                    return (
                      <div
                        key={en.id || idx}
                        className="bg-surface/50 border-border/50 rounded-xl border p-4 transition-colors hover:border-border"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                              <BookOpen size={16} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-main md:text-sm">{en.subject || 'مادة'}</p>
                              <p className="mt-0.5 text-[10px] text-muted md:text-xs">
                                {en.teacherName || en.teacher || ''}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {used}/{total}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <ProfileAchievements achievements={achievements} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit name modal */}
      {editingName && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setEditingName(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-elevation-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-sm font-bold text-main">تعديل الاسم</h3>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName()
              }}
              placeholder="أدخل الاسم الجديد"
              aria-label="الاسم"
              autoFocus
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingName(false)}
                className="flex-1 rounded-xl bg-surface py-2.5 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-95"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveName}
                disabled={!nameDraft.trim() || isSavingName}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
              >
                {isSavingName ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
