import { useEffect, useState } from 'react'
import { settingsService } from '../../settings/services/settingsService'
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { Spinner } from '../../../shared/components/ui'

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

export const MonitoringPage = () => {
  useEffect(() => {
    document.title = 'المراقبة | دارين السابعة للتعليم والتدريب'
  }, [])
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const d = await settingsService.getMonitoring()
      setData(d)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const d = await settingsService.getMonitoring()
        setData(d)
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  if (loading && !data)
    return (
      <div className="p-5">
        <Spinner />
      </div>
    )

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
    return `${d}d ${h}h ${m}m`
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-5 p-5" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-section font-bold text-main">مراقبة النظام</h2>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-sm transition-all hover:bg-primary-hover active:scale-95 active:bg-primary-active"
        >
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {(
          [
            ['الطلبات', data?.total || 0],
            ['الأخطاء', data?.errors || 0],
            ['البطيئة', data?.slow?.length || 0],
            ['المستخدمين', data?.counts?.users || 0],
            ['الجلسات', data?.counts?.sessions || 0],
            ['النسخ', data?.counts?.backups || 0],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-card border border-border bg-surface p-4 text-center dark:bg-card"
          >
            <div className="text-2xl font-bold text-main">{value}</div>
            <div className="mt-1 text-sm text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-4 dark:bg-card">
          <h3 className="mb-2 text-sm font-bold text-main">الذاكرة</h3>
          <div className="text-sm text-muted">المستخدم: {fmtBytes(data?.memory?.rss || 0)}</div>
          <div className="text-sm text-muted">
            Heap: {fmtBytes(data?.memory?.heapUsed || 0)} / {fmtBytes(data?.memory?.heapTotal || 0)}
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 dark:bg-card">
          <h3 className="mb-2 text-sm font-bold text-main">النظام</h3>
          <div className="text-sm text-muted">عمر التشغيل: {fmtUptime(data?.uptime || 0)}</div>
          <div className="text-sm text-muted">
            قاعدة البيانات:{' '}
            {data?.database === 'connected' ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={12} className="text-success" /> متصلة
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <XCircle size={12} className="text-error" /> منفصلة
              </span>
            )}
          </div>
          <div className="text-sm text-muted">
            آخر تحديث: {data?.timestamp ? new Date(data.timestamp).toLocaleString('ar-SA') : ''}
          </div>
        </div>
      </div>

      {data?.slow && data.slow.length > 0 && (
        <div className="rounded-card border border-warning-soft bg-warning-soft p-4">
          <h3 className="mb-2 text-sm font-bold text-main">الطلبات البطيئة (&gt;1s)</h3>
          <div className="space-y-1">
            {data.slow
              .slice(-10)
              .reverse()
              .map((s, i) => (
                <div key={`mon-${i}`} className="text-xs font-medium text-muted">
                  {s.method} {s.path} — {(s.duration / 1000).toFixed(1)}s
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-4 dark:bg-card">
          <h3 className="mb-2 text-sm font-bold text-main">حسب الطريقة</h3>
          <div className="space-y-1">
            {Object.entries(data?.byMethod || {}).map(([k, v]) => (
              <div key={k} className="text-sm text-muted">
                {k}: {v}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 dark:bg-card">
          <h3 className="mb-2 text-sm font-bold text-main">حسب المسار</h3>
          <div className="space-y-1">
            {Object.entries(data?.byPath || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, 15)
              .map(([k, v]) => (
                <div key={k} className="text-sm text-muted">
                  {k}: {v}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
