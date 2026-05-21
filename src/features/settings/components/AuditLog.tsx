import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import { SectionCard, SecondaryBtn } from './SettingsUI';

interface AuditLogSectionProps {
    auditLogs: any[];
    fetchLogs: () => void;
}

export const AuditLogSection = ({ auditLogs, fetchLogs }: AuditLogSectionProps) => (
    <SectionCard>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
                    <Activity size={16} className="text-[#5c59f2]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">سجل الرقابة</p>
                    <p className="text-[10px] text-slate-400">Global Activity Audit Log</p>
                </div>
            </div>
            <SecondaryBtn onClick={fetchLogs}>
                <RefreshCw size={13} /> تحديث
            </SecondaryBtn>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-right text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">التوقيت</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">المسؤول</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">الإجراء</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-400" dir="ltr">
                                {new Date(log.timestamp).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#5c59f2]">
                                        {log.username?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{log.username}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#5c59f2] rounded-full" />
                                    <span className="text-xs text-slate-600 dark:text-slate-300">{log.action}</span>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={3} className="py-16 text-center">
                                <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={24} />
                                <p className="text-sm font-bold text-slate-400">لا توجد سجلات</p>
                                <p className="text-[10px] text-slate-300 mt-1">No activity recorded</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Monitor Active
            </div>
            <span className="text-[10px] text-slate-300">{auditLogs.length} سجل</span>
        </div>
    </SectionCard>
);
