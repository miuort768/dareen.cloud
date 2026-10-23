import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw, BookOpen, Calendar, Award, ListCheck, Sparkle } from 'lucide-react'
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks'
import { periodLabel } from '../../features/attendance/utils/slotUtils'
import {
  usePullToRefresh,
  OverviewHeader,
  OverviewHero,
  OverviewSearchFilter,
  OverviewCategoryPills,
  OverviewFeaturedCard,
  OverviewPromoBanner,
  type OverviewCategoryItem,
} from '../../shared/components/mobile'
import { fadeUp } from '../../shared/animations/fadeUp'
import type {
  StudentDashboardData,
  Session,
  PointLog,
  StudentStats,
  TodayTimelineItem,
  NextSessionInfo,
  SubjectProgress,
} from './types'
import { NextSessionRadar } from './NextSessionRadar'
import { TodayTimeline } from './TodayTimeline'
import { SubjectsBoard } from './SubjectsBoard'
import { RankJourney } from './RankJourney'
import { PointsFeed } from './PointsFeed'
import { InvoicesStrip } from './InvoicesStrip'
import { LiveSessionBanner, type StudentActiveSession } from './LiveSessionBanner'
import { KpiStrip } from './KpiStrip'
import { StudentSupportStrip } from './StudentSupportStrip'
import { AnnouncementsBanner } from '../../shared/components/AnnouncementsBanner'
import { SessionCallAlert } from '../../components/ui/SessionCallAlert'
import { useNavigate } from 'react-router-dom'

interface StudentDashboardMobileProps {
  studentData: StudentDashboardData | null
  sessions: Session[]
  pointLogs: PointLog[]
  stats: StudentStats
  todayItems: TodayTimelineItem[]
  nextSession: NextSessionInfo | null
  subjects: SubjectProgress[]
  activeSession: StudentActiveSession | null
  onRefresh: () => void
}

export const StudentDashboardMobile = ({
  studentData,
  sessions,
  pointLogs,
  stats,
  todayItems,
  nextSession,
  subjects,
  activeSession,
  onRefresh,
}: StudentDashboardMobileProps) => {
  const navigate = useNavigate()
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const rankRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const points = studentData?.totalPoints || 0
  const rank = getRankByPoints(points, STUDENT_RANKS)
  const nextRank = getNextRank(points, STUDENT_RANKS)
  const recentSessions = sessions.slice(0, 3)
  const firstName = (studentData?.name || 'الطالب').split(' ')[0] || 'البطل'

  const nextSessionLabel = nextSession
    ? nextSession.isToday
      ? `اليوم ${nextSession.hour} ${periodLabel(nextSession.period, true)}`
      : `${nextSession.day} ${nextSession.hour} ${periodLabel(nextSession.period, true)}`
    : null

  const categories: OverviewCategoryItem[] = useMemo(
    () => [
      { id: 'all', label: 'الكل', icon: Sparkle },
      { id: 'classes', label: 'حصصي', icon: Calendar, count: todayItems.length },
      { id: 'subjects', label: 'المواد', icon: BookOpen, count: subjects.length },
      { id: 'points', label: 'نقاطي', icon: Award, count: points },
      { id: 'tasks', label: 'الواجبات', icon: ListCheck },
    ],
    [todayItems.length, subjects.length, points],
  )

  // Filter subjects for the featured cards
  const filteredSubjects = useMemo(() => {
    let list = subjects
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (s) => s.subject?.toLowerCase().includes(q) || s.teacher?.toLowerCase().includes(q),
      )
    }
    return list
  }, [subjects, searchQuery])

  const scrollToRank = () => {
    rankRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-background font-student transition-colors duration-slow"
      dir="rtl"
      {...handlers}
    >
      {/* Pull To Refresh Indicator */}
      <motion.div
        animate={{ height: isRefreshing ? 44 : pullDistance }}
        className="flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          {isRefreshing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التحديث...</span>
            </>
          ) : pullDistance > 40 ? (
            <>
              <RefreshCw size={16} className="animate-pulse" />
              <span>أفلت للتحديث</span>
            </>
          ) : (
            <span className="text-muted">اسحب للتحديث</span>
          )}
        </div>
      </motion.div>

      <div className="mx-auto max-w-page space-y-4 px-2.5 pb-8 pt-2 sm:px-4">
        {/* 1. Petly Style Top Header */}
        <OverviewHeader
          appName="أكاديمية دارين"
          slogan={`مرحباً يا بطل · ${studentData?.grade || 'طالب متميز'}`}
          logoIcon={<span className="text-2xl">🎓</span>}
          notificationCount={activeSession ? 1 : 0}
          onNotificationClick={() => navigate('/announcements')}
          contextLabel={`مسار التعلم · ${studentData?.grade || 'المرحلة الدراسية'}`}
        />

        {/* 2. Petly Style Hero Banner */}
        <OverviewHero
          badge={`الرتبة: ${rank.name} 🏆`}
          title={`أهلاً بك، يا ${firstName} 👋`}
          subtitle={
            nextSessionLabel
              ? `حصتك القادمة: ${nextSessionLabel} · استعد جيداً وكن حاضراً!`
              : 'واصل تفوقك الأكاديمي، أنجز مهامك واجمع المزيد من النقاط اليوم!'
          }
          metric={{
            value: `${points} نقطة`,
            label: 'رصيد نقاط التميز',
          }}
          ctaText="رحلة الرتب"
          onCtaClick={scrollToRank}
          illustration={
            <div className="bg-accent/20 border-accent/30 relative flex h-24 w-24 items-center justify-center rounded-3xl border shadow-elevation-2">
              <span className="text-5xl drop-shadow-md">🏅</span>
            </div>
          }
        />

        {/* 3. Search & Filter Bar */}
        <OverviewSearchFilter
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ابحث في موادي، معلمي، أو حصصي..."
        />

        {/* 4. Category Pills Row */}
        <OverviewCategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Active Session & Session Call Alerts */}
        <LiveSessionBanner session={activeSession} />
        <SessionCallAlert />

        {/* 5. Featured Cards ("العناصر المميزة" / موادي التعليمية) */}
        {(activeCategory === 'all' || activeCategory === 'subjects') && (
          <section>
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="bg-accent/20 flex h-6 w-6 items-center justify-center rounded-lg text-xs text-main">
                  ⭐
                </span>
                <h3 className="text-sm font-black text-main">موادي الدراسية المميزة</h3>
              </div>
              <span className="text-xs font-bold text-accent">{subjects.length} مواد مسجلة</span>
            </div>

            {filteredSubjects.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSubjects.slice(0, 4).map((sub, idx) => (
                  <OverviewFeaturedCard
                    key={`${sub.subject}-${idx}`}
                    badge={{
                      label: `${sub.progress}% إنجاز`,
                      tone: sub.progress >= 80 ? 'success' : 'accent',
                    }}
                    title={sub.subject}
                    subtitle={sub.teacher ? `المعلم: ${sub.teacher}` : 'مادة مقررة'}
                    meta={`${sub.sessionsUsed} من ${sub.sessionsTotal} حصة`}
                    highlight={`${sub.progress}%`}
                    highlightLabel="نسبة الحضور والإنجاز"
                    actionLabel="عرض"
                    visual={
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl">📘</span>
                        <span className="mt-1 line-clamp-1 text-[9px] font-black text-main">
                          {sub.subject}
                        </span>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-elevation-1">
                <p className="text-xs font-bold text-muted">لا توجد مواد تطابق البحث</p>
              </div>
            )}
          </section>
        )}

        {/* 6. Petly Style Promo Banner */}
        <OverviewPromoBanner
          title="تحديات التفوق ورتب المجد"
          subtitle={`تحتاج ${nextRank.pointsNeeded || 0} نقطة إضافية للوصول إلى رتبة ${nextRank.next?.name || 'القمة'}`}
          iconEmoji="🚀"
          onClick={scrollToRank}
          ariaLabel="الانتقال إلى لوحة الرتب"
        />

        {/* 7. Preserved Existing Panels */}
        {(activeCategory === 'all' || activeCategory === 'classes') && (
          <>
            <motion.div {...fadeUp(0.03)}>
              <KpiStrip stats={stats} />
            </motion.div>

            <motion.div {...fadeUp(0.05)}>
              <NextSessionRadar session={nextSession} />
            </motion.div>

            <motion.div {...fadeUp(0.15)}>
              <TodayTimeline items={todayItems} />
            </motion.div>
          </>
        )}

        {(activeCategory === 'all' || activeCategory === 'points') && (
          <div ref={rankRef}>
            <motion.div {...fadeUp(0.1)}>
              <RankJourney
                points={points}
                rank={rank}
                nextRankName={nextRank.next?.name || null}
                pointsNeeded={nextRank.pointsNeeded}
              />
            </motion.div>

            <motion.div {...fadeUp(0.45)} className="mt-4">
              <PointsFeed pointLogs={pointLogs} recentSessions={recentSessions} />
            </motion.div>
          </div>
        )}

        {activeCategory === 'all' && (
          <>
            {subjects.length > 0 && (
              <motion.div {...fadeUp(0.2)}>
                <SubjectsBoard subjects={subjects} />
              </motion.div>
            )}

            <motion.div {...fadeUp(0.25)}>
              <InvoicesStrip />
            </motion.div>

            <motion.div {...fadeUp(0.3)}>
              <AnnouncementsBanner
                href="/announcements"
                label="الإعلانات"
                description="اطلع على آخر التنبيهات والإعلانات العامة"
                variant="classic"
              />
            </motion.div>

            <motion.div {...fadeUp(0.35)}>
              <StudentSupportStrip />
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
