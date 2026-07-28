import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import { SectionCard, SecondaryBtn } from './SettingsUI';

interface AuditLogSectionProps {
    auditLogs: { timestamp: string; username: string; action: string }[];
    fetchLogs: () => void;
}

export const AuditLogSection = ({ auditLogs, fetchLogs }: AuditLogSectionProps) => (
    <SectionCard>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-primary-soft">
                    <Activity size={16} className="text-primary" />
                </div>
                <div>
                    <p className="text-sm font-bold text-main">سجل الرقابة</p>
                    <p className="text-micro font-bold text-muted">سجل تدقيق النشاط العام</p>
                </div>
            </div>
            <SecondaryBtn onClick={fetchLogs}>
                <RefreshCw size={13} /> تحديث
            </SecondaryBtn>
        </div>

        <div className="overflow-x-auto border border-border">
            <table className="w-full text-start text-sm">
                <thead>
                    <tr className="bg-hover">
                        <th className="px-4 py-3 text-micro font-bold text-muted tracking-wide">التوقيت</th>
                        <th className="px-4 py-3 text-micro font-bold text-muted tracking-wide">المسؤول</th>
                        <th className="px-4 py-3 text-micro font-bold text-muted tracking-wide">الإجراء</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-hover transition-colors group">
                            <td className="px-4 py-3 font-mono text-micro text-muted" dir="ltr">
                                {new Date(log.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 flex items-center justify-center text-micro font-bold bg-primary-soft text-primary">
                                        {log.username?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <span className="text-xs font-medium text-main">{log.username}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    <span className="text-xs text-main">{log.action}</span>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={3} className="py-16 text-center">
                                <CheckCircle2 className="mx-auto mb-2 text-success" size={24} />
                                <p className="text-sm font-normal text-muted">لا توجد سجلات</p>
                                <p className="text-micro text-muted mt-1">لا يوجد نشاط مسجل</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1.5 text-micro text-muted">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
                المراقبة نشطة
            </div>
            <span className="text-micro text-muted">{auditLogs.length} سجل</span>
        </div>
    </SectionCard>
);
