import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  RefreshCw,
  Users,
  Calendar,
  Award,
  Sparkle,
  CheckCircle2,
  Star,
  User,
  MessageSquareText,
  HeartHandshake,
} from 'lucide-react'
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks'
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
import { LiveNowBanner } from './LiveNowBanner'
import { ChildSwitcher } from './ChildSwitcher'
import { ChildPanel } from './ChildPanel'
import { TodayTimeline } from './TodayTimeline'
import { WeeklyPulse } from './WeeklyPulse'
import { PointsActivityCard } from './PointsActivityCard'
import { SupportStrip } from './SupportStrip'
import { AnnouncementsBanner } from '../../shared/components/AnnouncementsBanner'
import { SessionCallAlert } from '../../components/ui/SessionCallAlert'
import type { ParentDashboardProps } from './types'
import type { Student } from '../../types'
import { useNavigate } from 'react-router-dom'

interface ShellProps extends ParentDashboardProps {
  childNames: Record<string, string>
}

export const ParentDashboardMobile = ({
  adminPhone,
  children: kids,
  allPointLogs,
  activeTimers,
  childStats,
  timeline,
  weekly,
  points,
  selectedChildId,
  onSelectChild,
  formatTime,
  onRefresh,
  childNames,
}: ShellProps) => {
  const navigate = useNavigate()
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh })
  const childPanelRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const rank = getRankByPoints(points, STUDENT_RANKS)
  const selectedChild: Student | undefined = kids.find((c) => c.id === selectedChildId) ?? kids[0]

  const contextOptions = useMemo(
    () =>
      kids.map((c) => ({
        id: c.id,
        label: c.name,
      })),
    [kids],
  )

  const categories: OverviewCategoryItem[] = useMemo(
    () => [
      { id: 'all', label: 'الكل', icon: Sparkle },
      { id: 'children', label: 'الأبناء', icon: Users, count: kids.length },
      { id: 'sessions', label: 'الحصص', icon: Calendar, count: weekly.todayCount },
      { id: 'attendance', label: 'الالتزام', icon: CheckCircle2 },
      { id: 'points', label: 'النقاط', icon: Award, count: points },
    ],
    [kids.length, weekly.todayCount, points],
  )

  // Filter children for featured cards
  const filteredKids = useMemo(() => {
    let list = kids
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (c) => c.name?.toLowerCase().includes(q) || c.grade?.toLowerCase().includes(q),
      )
    }
    return list
  }, [kids, searchQuery])

  const scrollToChild = (childId: string) => {
    onSelectChild(childId)
    childPanelRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="overview-mobile-scope min-h-screen overflow-x-hidden bg-background font-parent text-main transition-colors duration-slow"
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
          slogan="متابعة مسيرة الأبناء التعليمية"
          logoIcon={<Users size={22} className="text-on-accent" strokeWidth={2.2} />}
          notificationCount={activeTimers.length}
          onNotificationClick={() => navigate('/parent-announcements')}
          contextLabel={selectedChild ? `الابن: ${selectedChild.name}` : 'اختر الابن'}
          contextOptions={contextOptions}
          selectedContextId={selectedChildId}
          onSelectContext={onSelectChild}
        />

        {/* 2. Petly Style Hero Banner */}
        <OverviewHero
          badge="متابعة أداء الأبناء"
          title="أهلاً بك، ولي الأمر"
          subtitle={`لديك ${kids.length} أبناء مسجلين بالأكاديمية · متابعة أداء وحضور الأبناء وجداول الحصص اليوم.`}
          metric={{
            value: `${weekly.attendanceRate}%`,
            label: 'نسبة حضور الأبناء',
          }}
          ctaText="تفاصيل الأبناء"
          onCtaClick={() => {
            if (selectedChild) scrollToChild(selectedChild.id)
          }}
          illustration={
            <div className="border-accent/40 bg-accent/20 relative flex h-20 w-20 items-center justify-center rounded-3xl border text-accent shadow-elevation-2">
              <HeartHandshake size={38} strokeWidth={2} />
            </div>
          }
        />

        {/* 3. Search & Filter Bar */}
        <OverviewSearchFilter
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ابحث عن ابن، مادة، أو معلم..."
        />

        {/* 4. Category Pills Row */}
        <OverviewCategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Alerts and Live Now */}
        <SessionCallAlert />
        <LiveNowBanner
          activeTimers={activeTimers}
          childNames={childNames}
          formatTime={formatTime}
        />

        {/* 5. Featured Cards ("العناصر المميزة" / بطاقات الأبناء) */}
        {(activeCategory === 'all' || activeCategory === 'children') && kids.length > 0 && (
          <section>
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="bg-accent/20 flex h-6 w-6 items-center justify-center rounded-lg text-accent">
                  <Star size={13} strokeWidth={2.5} className="fill-accent text-accent" />
                </span>
                <h3 className="text-sm font-black text-main">الأبناء المميزون</h3>
              </div>
              <span className="text-xs font-bold text-accent">{kids.length} أبناء</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {filteredKids.map((child) => {
                const isSelected = child.id === selectedChildId
                const cStat = childStats[child.id]
                const attendance = cStat ? cStat.attendanceRate : 0
                return (
                  <OverviewFeaturedCard
                    key={child.id}
                    badge={{
                      label: isSelected ? 'المحدد حالياً' : `${attendance}% حضور`,
                      tone: isSelected ? 'accent' : attendance >= 85 ? 'success' : 'warning',
                    }}
                    title={child.name}
                    subtitle={child.grade || 'مرحلة دراسية'}
                    meta={
                      cStat?.nextSession
                        ? `حصة: ${cStat.nextSession.subject || 'مجدولة'}`
                        : 'لا توجد حصص اليوم'
                    }
                    highlight={`${attendance}%`}
                    highlightLabel="نسبة التزام الحضور"
                    actionLabel="الملف"
                    onClick={() => scrollToChild(child.id)}
                    visual={
                      <div className="flex flex-col items-center justify-center gap-1 text-primary">
                        <User size={26} strokeWidth={1.8} />
                        <span className="line-clamp-1 text-[9px] font-black text-main">
                          {child.name}
                        </span>
                      </div>
                    }
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* 6. Petly Style Promo Banner */}
        <OverviewPromoBanner
          title="تواصل مباشر مع الإدارة والمعلمين"
          subtitle="استفسر عن أي تفاصيل دراسية أو مالية لأبنائك عبر المحادثة"
          icon={<MessageSquareText size={24} className="text-accent" strokeWidth={2} />}
          onClick={() => navigate('/chat')}
          ariaLabel="الانتقال إلى الدردشة"
        />

        {/* 7. Preserved Existing Panels */}
        {(activeCategory === 'all' || activeCategory === 'attendance') && (
          <motion.div {...fadeUp(0.15)}>
            <WeeklyPulse stats={weekly} />
          </motion.div>
        )}

        {kids.length > 0 && (
          <div ref={childPanelRef} className="space-y-4">
            <motion.div {...fadeUp(0.2)}>
              <ChildSwitcher
                children={kids}
                selectedId={selectedChildId}
                onSelect={onSelectChild}
              />
            </motion.div>

            {selectedChild && (
              <motion.div {...fadeUp(0.25)}>
                <ChildPanel
                  key={selectedChild.id}
                  child={selectedChild}
                  stats={
                    childStats[selectedChild.id] || {
                      attendanceRate: 0,
                      completed: 0,
                      cancelled: 0,
                      sessionsUsed: 0,
                      sessionsTotal: 0,
                      progress: 0,
                      nextSession: null,
                      notes: [],
                    }
                  }
                />
              </motion.div>
            )}
          </div>
        )}

        {(activeCategory === 'all' || activeCategory === 'sessions') && (
          <motion.div {...fadeUp(0.3)}>
            <TodayTimeline items={timeline} />
          </motion.div>
        )}

        {(activeCategory === 'all' || activeCategory === 'points') && (
          <motion.div {...fadeUp(0.35)}>
            <PointsActivityCard
              points={points}
              rankName={rank.name}
              rankIcon={rank.icon}
              logs={allPointLogs}
            />
          </motion.div>
        )}

        {activeCategory === 'all' && (
          <>
            <motion.div {...fadeUp(0.05)}>
              <AnnouncementsBanner
                href="/parent-announcements"
                label="إعلانات الأكاديمية"
                description="آخر الإعلانات والتنبيهات الموجهة لأولياء الأمور"
                variant="classic"
              />
            </motion.div>

            <motion.div {...fadeUp(0.4)}>
              <SupportStrip adminPhone={adminPhone} />
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
