import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Target,
  Phone,
  User,
  CalendarDays,
  Play,
  Flame,
  CheckCircle2,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser, useAcademyName } from '../../context/AppContext'
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks'
import { Skeleton } from '../../shared/components/ui'

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
  duration?: number
}

const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
}
const item: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export const StudentProfilePage = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الملف الشخصي | ${academyName}`
  }, [academyName])

  const currentUser = useCurrentUser()
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="hidden md:block"></div>
        <div className="mx-auto max-w-page space-y-6 p-4 md:p-8">
          <Skeleton className="h-40 rounded-3xl" />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Skeleton className="h-96 rounded-2xl xl:col-span-1" />
            <Skeleton className="h-96 rounded-2xl xl:col-span-2" />
          </div>
        </div>
      </div>
    )
  }

  const name = studentData?.name || currentUser?.name || 'الطالب'
  const recentSessions = sessions.filter((s) => s.status === 'completed').slice(0, 4)

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-24" dir="rtl">
      <div className="hidden md:block"></div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger}
        className="mx-auto max-w-page space-y-6 px-2.5 pt-6 sm:px-4 md:space-y-8 md:p-8"
      >
        {/* Modern ID Header */}
        <motion.div
          variants={item}
          className="relative flex flex-col items-start gap-8 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:p-8"
        >
          <div className="pointer-events-none absolute end-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

          <div className="z-10 flex w-full items-center gap-5 md:w-auto">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary-soft text-3xl font-black text-primary md:h-24 md:w-24">
              {name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded border border-border bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                  الملف الشخصي
                </span>
                <span className="border-warning/20 bg-warning/10 flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold text-warning">
                  <Trophy size={10} />
                  {rank?.name}
                </span>
              </div>
              <h1 className="truncate text-2xl font-black text-main md:text-3xl">{name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-muted">
                <GraduationCap size={16} />
                {studentData?.grade || 'غير محدد'}{' '}
                {studentData?.curriculum ? `• ${studentData.curriculum}` : ''}
              </p>
            </div>
          </div>

          <div className="hidden flex-1 md:block" />

          {/* Core Metrics Strip */}
          <div className="bg-surface/50 border-border/50 z-10 grid w-full grid-cols-3 gap-4 rounded-2xl border p-4 md:w-auto md:gap-8 md:px-8 md:py-5">
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                النقاط
              </span>
              <span className="text-xl font-black tabular-nums text-main md:text-2xl">
                {points}
              </span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                المواد
              </span>
              <span className="text-xl font-black tabular-nums text-main md:text-2xl">
                {stats.totalSubjects}
              </span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                الالتزام
              </span>
              <span className="text-xl font-black tabular-nums text-success md:text-2xl">
                {stats.attendanceRate}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-3">
          {/* Left Sidebar (1/3) */}
          <div className="space-y-6 md:space-y-8">
            {/* Rank Progress */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                  تقدم الرتبة
                </h3>
                <Target size={14} className="text-muted" />
              </div>

              <div className="mb-2 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-2xl font-black tabular-nums leading-none text-main">
                    {points}
                  </p>
                  <p className="text-[10px] font-bold text-muted">نقطة حالية</p>
                </div>
                {nextRank.next && (
                  <div className="text-end">
                    <p className="mb-1 text-sm font-bold leading-none text-main">
                      {nextRank.next.name}
                    </p>
                    <p className="text-[10px] font-bold text-muted">الرتبة القادمة</p>
                  </div>
                )}
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{
                    width: `${nextRank.next ? Math.min((points / (points + (nextRank.pointsNeeded || 1))) * 100, 100) : 100}%`,
                  }}
                />
              </div>

              {nextRank.next && (
                <p className="mt-3 rounded-lg bg-primary-soft py-1.5 text-center text-[10px] font-bold text-primary">
                  تبقى {nextRank.pointsNeeded} نقطة للترقية
                </p>
              )}
            </motion.div>

            {/* Contact Details */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-muted">
                بيانات الاتصال
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                    <Phone size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      رقم الطالب
                    </p>
                    <p className="text-xs font-bold text-main">
                      {studentData?.studentPhone || 'غير متوفر'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                    <User size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      رقم ولي الأمر
                    </p>
                    <p className="text-xs font-bold text-main">
                      {studentData?.parentPhone || 'غير متوفر'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                    <Mail size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      البريد الإلكتروني
                    </p>
                    <p className="max-w-[200px] truncate text-xs font-bold text-main">
                      {studentData?.email || 'غير متوفر'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                    <MapPin size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      المدينة
                    </p>
                    <p className="text-xs font-bold text-main">
                      {studentData?.city || 'غير متوفر'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Badges Overview */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-muted">
                الأوسمة النشطة
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 text-center">
                  <Flame
                    size={18}
                    className={stats.attendanceRate >= 95 ? 'text-error' : 'text-muted opacity-50'}
                  />
                  <span className="text-[10px] font-bold text-main">أسبوع مثالي</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 text-center">
                  <Play
                    size={18}
                    className={
                      stats.completedSessions >= 50 ? 'text-success' : 'text-muted opacity-50'
                    }
                  />
                  <span className="text-[10px] font-bold text-main">50 حصة</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content (2/3) */}
          <div className="space-y-6 md:space-y-8 xl:col-span-2">
            {/* Enrollments / Subjects */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-main">
                  <BookOpen size={16} className="text-primary" />
                  التقدم الدراسي
                </h3>
                <span className="text-xs font-bold text-muted">
                  {enrollments.length} مواد مسجلة
                </span>
              </div>

              {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {enrollments.map((en, idx) => {
                    const used = Number(en.sessionsUsed || 0)
                    const total = Number(en.sessionsTotal || 0)
                    const progress = total > 0 ? Math.round((used / total) * 100) : 0

                    return (
                      <div
                        key={en.id || idx}
                        className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/30"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h4 className="mb-1 text-sm font-black text-main">
                              {en.subject || 'مادة'}
                            </h4>
                            <p className="text-[11px] font-bold text-muted">
                              {en.teacherName || en.teacher || 'معلم غير محدد'}
                            </p>
                          </div>
                          <div className="rounded-md border border-border bg-card px-2 py-1">
                            <span className="text-[10px] font-bold tabular-nums text-main">
                              {used} / {total} حصة
                            </span>
                          </div>
                        </div>

                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className="absolute start-0 top-0 h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border-border/50 rounded-xl border border-dashed bg-surface py-12 text-center">
                  <BookOpen size={24} className="mx-auto mb-3 text-muted opacity-50" />
                  <p className="mb-1 text-sm font-bold text-main">لا توجد مواد مسجلة</p>
                  <p className="text-xs text-muted">لم تقم بالتسجيل في أي مواد بعد</p>
                </div>
              )}
            </motion.div>

            {/* Recent Sessions Timeline */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-main">
                  <CalendarDays size={16} className="text-info" />
                  أحدث الحصص المنجزة
                </h3>
              </div>

              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session, i) => (
                    <div
                      key={session.id || i}
                      className="flex items-center gap-4 rounded-xl border border-transparent p-4 transition-colors hover:border-border hover:bg-surface"
                    >
                      <div className="bg-success/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-success">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-0.5 truncate text-sm font-bold text-main">
                          {session.subject || 'حصة'}
                        </h4>
                        <p className="text-[11px] font-bold text-muted">
                          مع {session.teacherName || 'معلم'}
                        </p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="text-xs font-bold tabular-nums text-main">
                          {session.date
                            ? new Date(session.date).toLocaleDateString('ar-EG')
                            : 'حديثاً'}
                        </p>
                        <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-bold text-muted">
                          <Clock size={10} />
                          {session.duration || 60} دقيقة
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-border/50 rounded-xl border border-dashed bg-surface py-12 text-center">
                  <CalendarDays size={24} className="mx-auto mb-3 text-muted opacity-50" />
                  <p className="mb-1 text-sm font-bold text-main">لا يوجد سجل حصص</p>
                  <p className="text-xs text-muted">لم تنجز أي حصص حتى الآن</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
