import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Phone,
  Users,
  BookOpen,
  Star,
  User,
  Heart,
  Trophy,
  ChevronLeft,
  Activity,
  Edit3,
} from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser, useLogout, useAcademyName } from '../../context/AppContext'
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks'
import { Skeleton } from '../../shared/components/ui'
import { ParentDashboardHeader } from '../parent-dashboard/ParentDashboardHeader'
import type { Student } from '../../types'

interface PointLog {
  id: string
  points?: number
  studentName?: string
  reason?: string
  createdAt?: string
}

const stagger: Variants = { animate: { transition: { staggerChildren: 0.05 } } }
const item: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export const ParentProfilePage = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الملف الشخصي | ${academyName}`
  }, [academyName])

  const currentUser = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()
  const [children, setChildren] = useState<Student[]>([])
  const [pointLogs, setPointLogs] = useState<PointLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameOverride, setNameOverride] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchAll = async () => {
      try {
        setIsLoading(true)
        const students = await api.get<Student[]>('/parents/my-children')
        if (cancelled) return
        setChildren(students)

        const logsPromises = students.map(async (s) => {
          try {
            const logs = await api.get<PointLog[]>(
              `/student-portal/me/points-log?studentId=${s.id}`,
            )
            return (logs || []).map((l) => ({ ...l, studentName: s.name }))
          } catch {
            return []
          }
        })
        const allLogsResults = await Promise.all(logsPromises)
        if (cancelled) return
        setPointLogs(allLogsResults.flat())
      } catch (e) {
        console.error('Error fetching parent profile:', e)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    if (currentUser?.role === 'parent') fetchAll()
    return () => {
      cancelled = true
    }
  }, [currentUser])

  const totalPoints = useMemo(() => pointLogs.reduce((s, l) => s + (l.points || 0), 0), [pointLogs])
  const rank = getRankByPoints(totalPoints, STUDENT_RANKS)
  const nextRankNeeded = totalPoints < 1000 ? 1000 - totalPoints : 0

  const childrenStats = useMemo(() => {
    return children.map((child) => {
      const enrollments = child.enrollments || []
      const totalUsed = enrollments.reduce((s, en) => s + Number(en.sessionsUsed || 0), 0)
      const totalSessions = enrollments.reduce((s, en) => s + Number(en.sessionsTotal || 0), 0)
      const progress = totalSessions > 0 ? Math.round((totalUsed / totalSessions) * 100) : 0
      return { ...child, progress, subjectCount: enrollments.length }
    })
  }, [children])

  const totalSubjects = children.reduce((s, c) => s + (c.enrollments?.length || 0), 0)
  const name = nameOverride || currentUser?.name || currentUser?.username || 'ولي الأمر'

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim()
    if (!trimmed || isSavingName) return
    setIsSavingName(true)
    try {
      await api.put('/parents/me', { name: trimmed })
      setNameOverride(trimmed)
      setEditingName(false)
    } catch (e) {
      console.error('Error updating name:', e)
    } finally {
      setIsSavingName(false)
    }
  }

  const activities = useMemo(() => {
    return pointLogs.slice(0, 5).map((l, i) => ({
      id: l.id || `log-${i}`,
      icon: <Star size={14} className="fill-warning text-warning" />,
      title: `${l.studentName || 'طالب'} حصل على ${l.points || 0} نقطة`,
      description: l.reason || 'تقدم في التعلم',
      time: l.createdAt ? new Date(l.createdAt).toLocaleDateString('ar-EG') : `منذ ${i + 1} أيام`,
    }))
  }, [pointLogs])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="hidden md:block">
          <ParentDashboardHeader logout={logout} />
        </div>
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-24" dir="rtl">
      <div className="hidden md:block">
        <ParentDashboardHeader logout={logout} />
      </div>

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
            <div className="group relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary-soft text-3xl font-black text-primary md:h-24 md:w-24">
              {name.charAt(0)}
              <button
                onClick={() => {
                  setNameDraft(name)
                  setEditingName(true)
                }}
                className="absolute -bottom-2 -end-2 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-muted opacity-0 shadow-sm transition-opacity hover:text-main group-hover:opacity-100"
              >
                <Edit3 size={12} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded border border-border bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                  ملف العائلة
                </span>
                <span className="border-warning/20 bg-warning/10 flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold text-warning">
                  <Star size={10} className="fill-warning" />
                  {rank?.name || 'عائلة مميزة'}
                </span>
              </div>
              <h1 className="truncate text-2xl font-black text-main md:text-3xl">{name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-muted">
                <Users size={16} />
                {children.length} {children.length === 1 ? 'ابن مسجل' : 'أبناء مسجلين'}
              </p>
            </div>
          </div>

          <div className="hidden flex-1 md:block" />

          {/* Core Metrics Strip */}
          <div className="bg-surface/50 border-border/50 z-10 grid w-full grid-cols-3 gap-4 rounded-2xl border p-4 md:w-auto md:gap-8 md:px-8 md:py-5">
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                النقاط العائلية
              </span>
              <span className="text-xl font-black tabular-nums text-main md:text-2xl">
                {totalPoints}
              </span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                إجمالي المواد
              </span>
              <span className="text-xl font-black tabular-nums text-main md:text-2xl">
                {totalSubjects}
              </span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                الأبناء
              </span>
              <span className="text-xl font-black tabular-nums text-main md:text-2xl">
                {children.length}
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
                  الترتيب العائلي
                </h3>
                <Trophy size={14} className="text-warning" />
              </div>

              <div className="mb-2 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-2xl font-black tabular-nums leading-none text-main">
                    {totalPoints}
                  </p>
                  <p className="text-[10px] font-bold text-muted">نقطة عائلية</p>
                </div>
                {nextRankNeeded > 0 && (
                  <div className="text-end">
                    <p className="mb-1 text-sm font-bold leading-none text-main">العائلة الذهبية</p>
                    <p className="text-[10px] font-bold text-muted">الرتبة القادمة</p>
                  </div>
                )}
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{
                    width: `${nextRankNeeded > 0 ? Math.min((totalPoints / 1000) * 100, 100) : 100}%`,
                  }}
                />
              </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-muted">
                بيانات الحساب
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                    <Phone size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      رقم الهاتف الأساسي
                    </p>
                    <p className="text-xs font-bold text-main">
                      {currentUser?.username || 'غير متوفر'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                    <User size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      الاسم المسجل
                    </p>
                    <p className="text-xs font-bold text-main">{name}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Top Badges */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-muted">
                أوسمة العائلة
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 text-center">
                  <Users
                    size={18}
                    className={children.length >= 2 ? 'text-primary' : 'text-muted opacity-50'}
                  />
                  <span className="text-[10px] font-bold text-main">أب/أم مثالي</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 text-center">
                  <BookOpen
                    size={18}
                    className={totalSubjects >= 5 ? 'text-info' : 'text-muted opacity-50'}
                  />
                  <span className="text-[10px] font-bold text-main">متابع مميز</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content (2/3) */}
          <div className="space-y-6 md:space-y-8 xl:col-span-2">
            {/* Children Cards */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-main">
                  <Heart size={16} className="fill-error/20 text-error" />
                  متابعة الأبناء
                </h3>
                {childrenStats.length > 0 && (
                  <button
                    onClick={() => navigate('/parent-students')}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    عرض التفاصيل <ChevronLeft size={12} />
                  </button>
                )}
              </div>

              {childrenStats.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {childrenStats.map((child) => (
                    <div
                      key={child.id}
                      className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/30"
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-black text-primary">
                          {(child.name || 'ط').charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-black text-main">{child.name}</h4>
                          <p className="mt-0.5 text-[11px] font-bold text-muted">
                            {child.grade && <span>{child.grade} • </span>}
                            <span>
                              {child.subjectCount} {child.subjectCount === 1 ? 'مادة' : 'مواد'}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-md border border-border bg-card px-2 py-1 text-[10px] font-bold tabular-nums text-main">
                          {child.progress}%
                        </div>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="absolute start-0 top-0 h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${Math.min(child.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-border/50 rounded-xl border border-dashed bg-surface py-12 text-center">
                  <Users size={24} className="mx-auto mb-3 text-muted opacity-50" />
                  <p className="mb-1 text-sm font-bold text-main">لا يوجد أبناء مسجلين</p>
                  <p className="text-xs text-muted">قم بإضافة أبنائك لمتابعة تقدمهم</p>
                </div>
              )}
            </motion.div>

            {/* Recent Activity Timeline */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-main">
                  <Activity size={16} className="text-info" />
                  النشاط العائلي
                </h3>
              </div>

              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((act, i) => (
                    <div key={act.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface">
                          {act.icon}
                        </div>
                        {i !== activities.length - 1 && (
                          <div className="mt-2 h-full w-px bg-border" />
                        )}
                      </div>
                      <div className="pb-4">
                        <h4 className="text-sm font-bold text-main">{act.title}</h4>
                        <p className="mt-0.5 text-[11px] font-bold text-muted">{act.description}</p>
                        <p className="mt-1 text-[9px] text-muted opacity-70">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-border/50 rounded-xl border border-dashed bg-surface py-12 text-center">
                  <Activity size={24} className="mx-auto mb-3 text-muted opacity-50" />
                  <p className="mb-1 text-sm font-bold text-main">لا توجد نشاطات حديثة</p>
                  <p className="text-xs text-muted">ستظهر النشاطات والنقاط المكتسبة هنا</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Edit name modal */}
      {editingName && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setEditingName(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-sm font-black text-main">تعديل الاسم</h3>
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
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setEditingName(false)}
                className="flex-1 rounded-xl bg-surface py-3 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-95"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveName}
                disabled={!nameDraft.trim() || isSavingName}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-black text-on-primary transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
              >
                {isSavingName ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
