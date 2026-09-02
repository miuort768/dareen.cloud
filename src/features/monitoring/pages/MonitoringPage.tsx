import { useEffect, useState, useCallback } from 'react'
import { settingsService } from '../../settings/services/settingsService'
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
  ShieldAlert,
  Timer,
  Users,
  CalendarClock,
  DatabaseBackup,
  Cpu,
  Gauge,
  Loader2,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

interface MonitoringData {
  total: number
  errors: number
  slow: { method: string; path: string; duration: number }[]
  uptime: number
  memory: { rss: number; heapUsed: number; heapTotal: number }
  database: string
  counts: { users: number; sessions: number; backups: number }
  timestamp: string
  byMethod: Record<string, number>
  byPath: Record<string, number>
}

const fmtBytes = (b: number) =>
  b > 1073741824
    ? `${(b / 1073741824).toFixed(1)} GB`
    : b > 1048576
      ? `${(b / 1048576).toFixed(1)} MB`
      : `${(b / 1024).toFixed(1)} KB`

const fmtUptime = (s: number) => {
  const d = Math.floor(s / 86400)
  s %= 86400
  const h = Math.floor(s / 3600)
  s %= 3600
  const m = Math.floor(s / 60)
  return `${d} يوم ${h} ساعة ${m} دقيقة`
}

const METHOD_TONE: Record<string, string> = {
  GET: 'bg-info-soft text-info',
  POST: 'bg-success-soft text-success',
  PUT: 'bg-warning-soft text-warning',
  PATCH: 'bg-warning-soft text-warning',
  DELETE: 'bg-error-soft text-error',
}

const StatTile = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Activity
  label: string
  value: number
  tone: string
}) => (
  <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-sm transition-colors duration-300">
    <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-xl', tone)}>
      <Icon size={14} />
    </div>
    <p className="text-lg font-black tabular-nums leading-none text-main">
      {value.toLocaleString()}
    </p>
    <p className="mt-1.5 text-[11px] font-bold text-muted">{label}</p>
  </div>
)

const SectionCard = ({
  title,
  icon: Icon,
  iconTone,
  children,
  accent,
}: {
  title: string
  icon: typeof Activity
  iconTone: string
  children: React.ReactNode
  accent?: string
}) => (
  <section
    className={cn(
      'overflow-hidden rounded-3xl border bg-surface shadow-sm transition-colors duration-300',
      accent || 'border-border',
    )}
  >
    <div className="flex items-center gap-2.5 border-b border-divider px-4 py-3">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconTone)}>
        <Icon size={14} />
      </div>
      <h3 className="text-xs font-black text-main">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </section>
)

const BarRow = ({ label, value, max }: { label: string; value: number; max: number }) => (
  <div className="flex items-center gap-2">
    <span
      className="w-24 shrink-0 truncate font-mono text-[10px] font-bold text-muted"
      title={label}
    >
      {label}
    </span>
    <div className="bg-divider/50 relative h-4 flex-1 overflow-hidden rounded-full">
      <div
        className="absolute inset-y-0 start-0 rounded-full bg-primary transition-all duration-700"
        style={{ width: `${Math.max((value / Math.max(max, 1)) * 100, 4)}%` }}
      />
    </div>
    <span className="w-10 shrink-0 text-end text-[11px] font-black tabular-nums text-main">
      {value.toLocaleString()}
    </span>
  </div>
)

export const MonitoringPage = () => {
  useEffect(() => {
    document.title = 'المراقبة | دارين السابعة للتعليم والتدريب'
  }, [])
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const d = await settingsService.getMonitoring()
      setData(d)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [load])

  const dbConnected = data?.database === 'connected'
  const heapPct =
    data?.memory?.heapTotal > 0
      ? Math.round((data.memory.heapUsed / data.memory.heapTotal) * 100)
      : 0
  const maxPath = Math.max(...Object.values(data?.byPath || {}), 1)
  const errorRate = data?.total > 0 ? ((data.errors / data.total) * 100).toFixed(1) : '0.0'

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 bg-background p-4" dir="rtl">
        <SkeletonBlock className="h-28 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={`sk-${i}`} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SkeletonBlock className="h-40 rounded-3xl" />
          <SkeletonBlock className="h-40 rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4" dir="rtl">
      {/* Header — family greeting strip */}
      <section
        aria-label="مراقبة النظام"
        className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-sm transition-colors duration-300"
      >
        <div
          className="pointer-events-none absolute inset-y-0 start-0 w-1.5 bg-primary"
          aria-hidden="true"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 ps-3">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted">
              <Gauge size={12} />
              تحديث تلقائي كل 15 ثانية
              {refreshing && <Loader2 size={11} className="animate-spin text-primary" />}
            </p>
            <h1 className="text-xl font-black leading-tight text-main">مراقبة النظام</h1>
            <p className="mt-1 text-[11px] font-bold text-muted">
              نبض الخادم مباشرة: الطلبات، الأخطاء، الذاكرة وقاعدة البيانات
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {dbConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success-soft bg-success-soft px-3 py-1.5 text-[11px] font-black text-success">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                الخادم يعمل
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-error-soft bg-error-soft px-3 py-1.5 text-[11px] font-black text-error">
                <span className="h-2 w-2 rounded-full bg-error" />
                الخادم منفصل
              </span>
            )}
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 active:bg-primary-active"
              aria-label="تحديث البيانات الآن"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>
        </div>
      </section>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatTile
          icon={Activity}
          label="إجمالي الطلبات"
          value={data?.total || 0}
          tone="bg-info-soft text-info"
        />
        <StatTile
          icon={ShieldAlert}
          label="الأخطاء"
          value={data?.errors || 0}
          tone={
            (data?.errors || 0) > 0 ? 'bg-error-soft text-error' : 'bg-success-soft text-success'
          }
        />
        <StatTile
          icon={Timer}
          label="طلبات بطيئة >1s"
          value={data?.slow?.length || 0}
          tone="bg-warning-soft text-warning"
        />
        <StatTile
          icon={Users}
          label="المستخدمون"
          value={data?.counts?.users || 0}
          tone="bg-primary-soft text-primary"
        />
        <StatTile
          icon={CalendarClock}
          label="الجلسات"
          value={data?.counts?.sessions || 0}
          tone="bg-success-soft text-success"
        />
        <StatTile
          icon={DatabaseBackup}
          label="النسخ الاحتياطية"
          value={data?.counts?.backups || 0}
          tone="bg-divider text-muted"
        />
      </div>

      {/* Health row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="الذاكرة" icon={Cpu} iconTone="bg-primary-soft text-primary">
          <div className="mb-3 flex items-end justify-between">
            <span className="text-2xl font-black tabular-nums text-main">{heapPct}%</span>
            <span className="text-[11px] font-bold text-muted">
              {fmtBytes(data?.memory?.heapUsed || 0)} من {fmtBytes(data?.memory?.heapTotal || 0)}
            </span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-divider">
            <div
              className={cn(
                'absolute inset-y-0 start-0 rounded-full transition-all duration-700',
                heapPct >= 90 ? 'bg-error' : heapPct >= 75 ? 'bg-warning' : 'bg-success',
              )}
              style={{ width: `${Math.min(heapPct, 100)}%` }}
            />
          </div>
          <p className="mt-3 border-t border-divider pt-2.5 text-[11px] font-bold text-muted">
            ذاكرة العملية (RSS):{' '}
            <span className="font-black text-main">{fmtBytes(data?.memory?.rss || 0)}</span>
          </p>
        </SectionCard>

        <SectionCard title="حالة النظام" icon={Activity} iconTone="bg-success-soft text-success">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted">قاعدة البيانات</span>
              {dbConnected ? (
                <span className="inline-flex items-center gap-1 text-xs font-black text-success">
                  <CheckCircle2 size={13} /> متصلة
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-black text-error">
                  <XCircle size={13} /> منفصلة
                </span>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-divider pt-2.5">
              <span className="text-[11px] font-bold text-muted">عمر التشغيل</span>
              <span className="text-xs font-black tabular-nums text-main">
                {fmtUptime(data?.uptime || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-divider pt-2.5">
              <span className="text-[11px] font-bold text-muted">نسبة الأخطاء</span>
              <span
                className={cn(
                  'text-xs font-black tabular-nums',
                  (data?.errors || 0) > 0 ? 'text-error' : 'text-success',
                )}
              >
                {errorRate}%
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-divider pt-2.5">
              <span className="text-[11px] font-bold text-muted">آخر تحديث</span>
              <span className="text-xs font-bold text-main">
                {data?.timestamp ? new Date(data.timestamp).toLocaleString('ar-SA') : '—'}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Slow requests */}
      {data?.slow && data.slow.length > 0 && (
        <SectionCard
          title={`طلبات بطيئة (أكثر من ثانية) — آخر ${Math.min(data.slow.length, 10)}`}
          icon={Timer}
          iconTone="bg-warning-soft text-warning"
          accent="border-warning/30"
        >
          <div className="space-y-1.5">
            {data.slow
              .slice(-10)
              .reverse()
              .map((s, i) => (
                <div
                  key={`slow-${i}`}
                  className="bg-divider/40 flex items-center justify-between gap-2 rounded-xl px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-2 py-0.5 text-[9px] font-black',
                        METHOD_TONE[s.method] || 'bg-divider text-muted',
                      )}
                    >
                      {s.method}
                    </span>
                    <span className="truncate font-mono text-[11px] font-bold text-main">
                      {s.path}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-lg bg-warning-soft px-2 py-0.5 text-[10px] font-black tabular-nums text-warning">
                    {(s.duration / 1000).toFixed(1)} ثانية
                  </span>
                </div>
              ))}
          </div>
        </SectionCard>
      )}

      {/* Traffic distribution */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="التوزيع حسب الطريقة" icon={Activity} iconTone="bg-info-soft text-info">
          <div className="space-y-2">
            {Object.entries(data?.byMethod || {}).length === 0 ? (
              <p className="py-4 text-center text-xs font-bold text-muted">لا توجد بيانات</p>
            ) : (
              Object.entries(data?.byMethod || {})
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => <BarRow key={`m-${k}`} label={k} value={v} max={maxPath} />)
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="أكثر المسارات طلبًا (أعلى 15)"
          icon={Gauge}
          iconTone="bg-primary-soft text-primary"
        >
          <div className="space-y-2">
            {Object.entries(data?.byPath || {}).length === 0 ? (
              <p className="py-4 text-center text-xs font-bold text-muted">لا توجد بيانات</p>
            ) : (
              Object.entries(data?.byPath || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15)
                .map(([k, v]) => <BarRow key={`p-${k}`} label={k} value={v} max={maxPath} />)
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('bg-divider/60 animate-pulse rounded-xl', className)} />
)

export default MonitoringPage
