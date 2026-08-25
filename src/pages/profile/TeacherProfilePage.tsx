import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  Phone,
  Mail,
  BookOpen,
  Star,
  Trophy,
  Target,
  Edit3,
  CheckCircle2,
  UserPlus,
  Activity,
} from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser, useAcademyName } from '../../context/AppContext'
import { CURRENCY_SYMBOL } from '../../config/constants'
import { getRankByPoints, TEACHER_RANKS } from '../../shared/utils/ranks'
import { Skeleton } from '../../shared/components/ui'
import { PaymentSettingsSection } from './PaymentSettingsSection'
import type { DashboardStats } from '../../features/dashboard/types'

interface TeacherData {
  id: string
  name: string
  phone1: string
  phone2?: string
  subject: string
  price: number
  email?: string
  points?: number
  city?: string
  biography?: string
  stage?: string
}

const stagger: Variants = { animate: { transition: { staggerChildren: 0.05 } } }
const item: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export const TeacherProfilePage = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `الملف الشخصي | ${academyName}`
  }, [academyName])

  const currentUser = useCurrentUser()
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [dashboardStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchAll = async () => {
      try {
        setIsLoading(true)
        const me = await api.get<TeacherData>('/teachers/me')
        if (cancelled) return
        setTeacherData(me)
      } catch (e) {
        console.error('Error fetching teacher profile:', e)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    if (currentUser?.role === 'teacher') fetchAll()
    return () => {
      cancelled = true
    }
  }, [currentUser])

  const points = teacherData?.points || dashboardStats?.teacherPoints || 0
  const rank = getRankByPoints(points, TEACHER_RANKS)
  const nextRankNeeded = points < 1000 ? 1000 - points : 0
  const nextRankName = 'المعلمة الذهبية'

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim()
    if (!trimmed || isSavingName) return
    setIsSavingName(true)
    try {
      await api.put('/teachers/me', { name: trimmed })
      setTeacherData((prev) => (prev ? { ...prev, name: trimmed } : prev))
      setEditingName(false)
    } catch (e) {
      console.error('Error updating name:', e)
    } finally {
      setIsSavingName(false)
    }
  }

  const reviews = [
    {
      id: 'r1',
      studentName: 'سارة أحمد',
      rating: 5,
      text: 'معلمة ممتازة، أسلوبها في الشرح سهل ومبسط.',
      date: '١٥ يونيو ٢٠٢٦',
    },
    {
      id: 'r2',
      studentName: 'محمد علي',
      rating: 5,
      text: 'أفضل معلمة تعاملتها معها، صبورة ومخلصة.',
      date: '١٠ يونيو ٢٠٢٦',
    },
  ]

  const activities = [
    {
      id: 'a1',
      icon: <UserPlus size={14} className="text-success" />,
      title: 'طالب جديد',
      description: 'أحمد محمد',
      time: 'منذ ساعتين',
    },
    {
      id: 'a2',
      icon: <CheckCircle2 size={14} className="text-info" />,
      title: 'إنهاء حصة',
      description: 'مع محمد علي',
      time: 'منذ 4 ساعات',
    },
    {
      id: 'a3',
      icon: <Trophy size={14} className="text-warning" />,
      title: 'شارة جديدة',
      description: 'المعلمة الذهبية',
      time: 'منذ يومين',
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        {currentUser?.role === 'teacher' && <div className="hidden md:block"></div>}
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

  const name = teacherData?.name || currentUser?.name || 'المعلمة'

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-24" dir="rtl">
      {currentUser?.role === 'teacher' && <div className="hidden md:block"></div>}

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
                  ملف المعلم
                </span>
                <span className="border-warning/20 bg-warning/10 flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold text-warning">
                  <Star size={10} className="fill-warning" />
                  {rank?.name || 'معلم متميز'}
                </span>
              </div>
              <h1 className="truncate text-2xl font-black text-main md:text-3xl">{name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-muted">
                <BookOpen size={16} />
                {teacherData?.subject || 'مادة غير محددة'}
              </p>
            </div>
          </div>

          <div className="hidden flex-1 md:block" />

          {/* Core Metrics Strip */}
          <div className="bg-surface/50 border-border/50 z-10 grid w-full grid-cols-3 gap-4 rounded-2xl border p-4 md:w-auto md:gap-8 md:px-8 md:py-5">
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                الطلاب
              </span>
              <span className="text-xl font-black tabular-nums text-main md:text-2xl">
                {dashboardStats?.studentsCount || 0}
              </span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                الحصص
              </span>
              <span className="text-xl font-black tabular-nums text-main md:text-2xl">
                {dashboardStats?.completedSessions || 0}
              </span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                السعر
              </span>
              <span className="flex items-end gap-1 text-xl font-black tabular-nums text-success md:text-2xl">
                {teacherData?.price || 0}
                <span className="mb-1 text-[10px] font-bold text-muted">{CURRENCY_SYMBOL}</span>
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
                  <p className="text-[10px] font-bold text-muted">النقاط الحالية</p>
                </div>
                {nextRankNeeded > 0 && (
                  <div className="text-end">
                    <p className="mb-1 text-sm font-bold leading-none text-main">{nextRankName}</p>
                    <p className="text-[10px] font-bold text-muted">الرتبة القادمة</p>
                  </div>
                )}
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{
                    width: `${nextRankNeeded > 0 ? Math.min((points / 1000) * 100, 100) : 100}%`,
                  }}
                />
              </div>
            </motion.div>

            {/* Contact & Setup */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-muted">
                بيانات الاتصال
              </h3>
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                    <Phone size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      رقم الهاتف الأساسي
                    </p>
                    <p className="text-xs font-bold text-main">
                      {teacherData?.phone1 || 'غير متوفر'}
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
                      {teacherData?.email || 'غير متوفر'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-muted">
                  الإعدادات المالية
                </h3>
                <PaymentSettingsSection />
              </div>
            </motion.div>
          </div>

          {/* Main Content (2/3) */}
          <div className="space-y-6 md:space-y-8 xl:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {/* Activity Timeline */}
              <motion.div
                variants={item}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-main">
                    <ActivityIcon />
                    النشاط الأخير
                  </h3>
                </div>

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
              </motion.div>

              {/* Reviews Overview */}
              <motion.div
                variants={item}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-main">
                    <Star size={16} className="fill-warning text-warning" />
                    أحدث التقييمات
                  </h3>
                </div>

                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="rounded-xl border border-border bg-surface p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-main">{rev.studentName}</span>
                        <div className="flex items-center gap-0.5 text-warning">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i < rev.rating ? 'fill-warning' : 'fill-transparent text-border'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">
                        {rev.text}
                      </p>
                      <span className="text-muted/50 mt-2 block text-[9px] font-bold">
                        {rev.date}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
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

const ActivityIcon = () => <Activity size={16} className="text-info" />
