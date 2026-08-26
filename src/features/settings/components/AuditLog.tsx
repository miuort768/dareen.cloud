import { Activity, CheckCircle2, RefreshCw } from 'lucide-react'
import { SectionCard, SecondaryBtn } from './SettingsUI'

interface AuditLogSectionProps {
  auditLogs: { timestamp: string; username: string; action: string }[]
  fetchLogs: () => void
}

export const AuditLogSection = ({ auditLogs, fetchLogs }: AuditLogSectionProps) => (
  <SectionCard>
    <div className="mb-4 flex items-center justify-between border-b border-divider pb-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
          <Activity size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-main">سجل الرقابة</p>
          <p className="mt-0.5 text-[11px] font-bold text-muted">سجل تدقيق النشاط العام</p>
        </div>
      </div>
      <SecondaryBtn onClick={fetchLogs}>
        <RefreshCw size={13} /> تحديث
      </SecondaryBtn>
    </div>

    <div className="overflow-x-auto rounded-xl border border-divider">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="bg-background">
            <th className="px-4 py-3 text-[11px] font-bold text-muted">التوقيت</th>
            <th className="px-4 py-3 text-[11px] font-bold text-muted">المسؤول</th>
            <th className="px-4 py-3 text-[11px] font-bold text-muted">الإجراء</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {auditLogs.length > 0 ? (
            auditLogs.map((log, idx) => (
              <tr key={idx} className="group transition-colors hover:bg-background">
                <td className="px-4 py-3 font-mono text-[11px] text-muted" dir="ltr">
                  {new Date(log.timestamp).toLocaleString('ar-EG', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-[11px] font-bold text-primary">
                      {log.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <span className="text-xs font-bold text-main">{log.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                    <span className="text-xs text-main">{log.action}</span>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="py-16 text-center">
                <CheckCircle2 className="mx-auto mb-2 text-success" size={24} />
                <p className="text-sm font-bold text-muted">لا توجد سجلات</p>
                <p className="mt-1 text-[11px] text-muted">لا يوجد نشاط مسجل حتى الآن</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="mt-3 flex items-center justify-between px-1">
      <div className="flex items-center gap-1.5 text-[11px] text-muted">
        <div className="h-1.5 w-1.5 animate-ping rounded-full bg-success" />
        المراقبة نشطة
      </div>
      <span className="text-[11px] text-muted">{auditLogs.length} سجل</span>
    </div>
  </SectionCard>
)
