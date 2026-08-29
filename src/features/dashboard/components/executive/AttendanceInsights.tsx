import { memo, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, UserCheck, UserMinus, Users, BookOpen, Clock } from 'lucide-react'
import { api } from '../../../../lib/api'
import type { Session } from '../../../../types'
import { getSafeArray } from '../../utils/dashboardHelpers'
import { cn } from '@/lib/utils'

const COMPLETED = ['completed', 'مكتملة', 'تم الإنجاز']

interface RankEntry {
  name: string
  count: number
}

interface HourEntry {
  hour: number
  count: number
}

function formatHourLabel(h: number): string {
  if (h === 0) return '12 ص'
  if (h === 12) return '12 م'
  return h < 12 ? `${h} ص` : `${h - 12} م`
}

const rankFromCounts = (counts: Record<string, number>): RankEntry[] =>
  Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ar'))

const Card = ({
  icon: Icon,
  title,
  iconBg,
  iconText,
  children,
}: {
  icon: typeof UserCheck
  title: string
  iconBg: string
  iconText: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col rounded-none border border-border bg-surface p-2.5">
    <div className="mb-2 flex items-center gap-1.5">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-none',
          iconBg,
          iconText,
        )}
      >
        <Icon size={12} />
      </span>
      <h4 className="text-[10px] font-black leading-tight text-muted">{title}</h4>
    </div>
    <div className="flex-1 space-y-1">{children}</div>
  </div>
)

const RankRow = ({
  index,
  name,
  count,
  badgeBg,
  badgeText,
}: {
  index: number
  name: string
  count: number
  badgeBg: string
  badgeText: string
}) => (
  <div className="flex items-center justify-between gap-2 rounded-none border border-border bg-background px-2 py-1.5">
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-none text-[9px] font-black tabular-nums',
          badgeBg,
          badgeText,
        )}
      >
        {index + 1}
      </span>
      <span className="truncate text-[11px] font-bold text-main">{name}</span>
    </div>
    <span className="shrink-0 text-[11px] font-black tabular-nums text-main">
      {count}
      <span className="ms-1 text-[9px] font-bold text-dim">حصة</span>
    </span>
  </div>
)

export const AttendanceInsights = memo(function AttendanceInsights() {
  const { data } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get<Session[]>('/sessions'),
    staleTime: 60_000,
  })

  const analytics = useMemo(() => {
    const sessions = getSafeArray(data) as Session[]
    const completed = sessions.filter((s) =>
      COMPLETED.includes(String(s.status ?? '').toLowerCase()),
    )

    const teacherCounts: Record<string, number> = {}
    sessions.forEach((s) => {
      const t = (s.teacherName || '').trim()
      if (t && !(t in teacherCounts)) teacherCounts[t] = 0
    })
    completed.forEach((s) => {
      const t = (s.teacherName || '').trim()
      if (t) teacherCounts[t] = (teacherCounts[t] || 0) + 1
    })

    const studentCounts: Record<string, number> = {}
    const subjectCounts: Record<string, number> = {}
    const hourCounts: Record<number, number> = {}
    completed.forEach((s) => {
      const st = (s.studentName || '').trim()
      if (st) studentCounts[st] = (studentCounts[st] || 0) + 1
      const sub = (s.subject || '').trim()
      if (sub) subjectCounts[sub] = (subjectCounts[sub] || 0) + 1
      const h = parseInt(String(s.time || '').split(':')[0] ?? '', 10)
      if (!Number.isNaN(h) && h >= 0 && h <= 23) hourCounts[h] = (hourCounts[h] || 0) + 1
    })

    const teachers = rankFromCounts(teacherCounts)
    const hours: HourEntry[] = Object.entries(hourCounts)
      .map(([h, count]) => ({ hour: Number(h), count }))
      .sort((a, b) => b.count - a.count)

    return {
      hasData: completed.length > 0,
      totalCompleted: completed.length,
      topTeachers: teachers.slice(0, 3),
      leastTeacher: teachers.length > 0 ? teachers[teachers.length - 1] : null,
      topStudents: rankFromCounts(studentCounts).slice(0, 3),
      topSubjects: rankFromCounts(subjectCounts).slice(0, 3),
      topHours: hours.slice(0, 3),
    }
  }, [data])

  return (
    <div className="mt-4 border-t border-border pt-4" dir="rtl">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-none bg-primary-soft">
            <CalendarCheck size={13} className="text-primary" />
          </div>
          <h4 className="text-xs font-black text-main">تحليلات الحضور</h4>
        </div>
        {analytics.totalCompleted > 0 && (
          <span className="rounded-none bg-surface px-1.5 py-0.5 text-[9px] font-black tabular-nums text-muted">
            {analytics.totalCompleted} حصة مسجلة
          </span>
        )}
      </div>

      {!analytics.hasData ? (
        <p className="rounded-none border border-dashed border-border bg-surface py-4 text-center text-[10px] font-bold text-dim">
          لا توجد بيانات حضور بعد
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Card
              icon={UserCheck}
              title="أكثر المعلمات تسجيل حضور"
              iconBg="bg-primary-soft"
              iconText="text-primary"
            >
              {analytics.topTeachers.map((t, i) => (
                <RankRow
                  key={`teacher-${t.name}`}
                  index={i}
                  name={t.name}
                  count={t.count}
                  badgeBg="bg-primary-soft"
                  badgeText="text-primary"
                />
              ))}
            </Card>

            <Card
              icon={Users}
              title="أكثر الطلبة حضوراً"
              iconBg="bg-info-soft"
              iconText="text-info"
            >
              {analytics.topStudents.map((s, i) => (
                <RankRow
                  key={`student-${s.name}`}
                  index={i}
                  name={s.name}
                  count={s.count}
                  badgeBg="bg-info-soft"
                  badgeText="text-info"
                />
              ))}
            </Card>
          </div>

          {analytics.leastTeacher && (
            <div className="flex items-center justify-between gap-2 rounded-none border border-error-soft bg-error-soft px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-card text-error">
                  <UserMinus size={12} />
                </span>
                <p className="truncate text-[11px] font-bold text-main">
                  أقل معلمة تسجيل حضور:{' '}
                  <span className="font-black text-error">{analytics.leastTeacher.name}</span>
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-black tabular-nums text-error">
                {analytics.leastTeacher.count}
                <span className="ms-1 text-[9px] font-bold">حصة</span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Card
              icon={BookOpen}
              title="أكثر المواد حضوراً"
              iconBg="bg-success-soft"
              iconText="text-success"
            >
              {analytics.topSubjects.map((sub, i) => (
                <RankRow
                  key={`subject-${sub.name}`}
                  index={i}
                  name={sub.name}
                  count={sub.count}
                  badgeBg="bg-success-soft"
                  badgeText="text-success"
                />
              ))}
            </Card>

            <Card
              icon={Clock}
              title="أكثر توقيت حضوراً"
              iconBg="bg-warning-soft"
              iconText="text-warning"
            >
              {analytics.topHours.map((h, i) => (
                <div
                  key={`hour-${h.hour}`}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-none border px-2 py-1.5',
                    i === 0 ? 'border-warning-soft bg-warning-soft' : 'border-border bg-background',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-none text-[9px] font-black tabular-nums',
                        i === 0 ? 'bg-warning text-on-warning' : 'bg-warning-soft text-warning',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate text-[11px] font-black text-main">
                      {formatHourLabel(h.hour)}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] font-black tabular-nums text-main">
                    {h.count}
                    <span className="ms-1 text-[9px] font-bold text-dim">حصة</span>
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
})
