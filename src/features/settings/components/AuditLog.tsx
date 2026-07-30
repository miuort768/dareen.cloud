import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import { SectionCard, SecondaryBtn } from './SettingsUI';
import { cn } from '../../../lib/utils';

interface AuditLogSectionProps {
    auditLogs: { timestamp: string; username: string; action: string }[];
    fetchLogs: () => void;
}

export const AuditLogSection = ({ auditLogs, fetchLogs }: AuditLogSectionProps) => (
    <SectionCard>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/20">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                    <Activity size={16} className="text-primary" />
                </div>
                <div>
                    <p className="text-sm font-bold text-main">سجل الرقابة</p>
                    <p className="text-[11px] font-bold text-muted mt-0.5">سجل تدقيق النشاط العام</p>
                </div>
            </div>
            <SecondaryBtn onClick={fetchLogs}>
                <RefreshCw size={13} /> تحديث
            </SecondaryBtn>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/20">
            <table className="w-full text-start text-sm">
                <thead>
                    <tr className="bg-background">
                        <th className="px-4 py-3 text-[11px] font-bold text-muted">التوقيت</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-muted">المسؤول</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-muted">الإجراء</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                    {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-background transition-colors group">
                            <td className="px-4 py-3 font-mono text-[11px] text-muted" dir="ltr">
                                {new Date(log.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                                        {log.username?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <span className="text-xs font-bold text-main">{log.username}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                    <span className="text-xs text-main">{log.action}</span>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={3} className="py-16 text-center">
                                <CheckCircle2 className="mx-auto mb-2 text-success" size={24} />
                                <p className="text-sm font-bold text-muted">لا توجد سجلات</p>
                                <p className="text-[11px] text-muted mt-1">لا يوجد نشاط مسجل حتى الآن</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
                المراقبة نشطة
            </div>
            <span className="text-[11px] text-muted">{auditLogs.length} سجل</span>
        </div>
    </SectionCard>
);
