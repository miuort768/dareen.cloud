import React from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { SectionCard, SectionTitle } from './ClosingUI';

interface CompensationSession {
    needsCompensation?: boolean;
    status: string;
    studentName: string;
    teacherName: string;
    date: string;
}

interface CompensationTableProps {
    filteredSessions: CompensationSession[];
}

export const CompensationTable: React.FC<CompensationTableProps> = ({ filteredSessions }) => {
    const cancelledNeedingComp = filteredSessions.filter(s => s.needsCompensation && s.status === 'cancelled');

    return (
        <SectionCard>
            <div className="p-4 border-b border-border/50 dark:border-border/50">
                <SectionTitle icon={RefreshCw} label="سجل حصص التعويض المعلقة" sub="الإلغاءات التي تتطلب إعادة جدولة" color="var(--bg-warning)" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-start">
                    <thead className="bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)]">
                        <tr>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary uppercase tracking-wider">الطالب</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary">المعلمة</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">التاريخ</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border">
                        {cancelledNeedingComp.map((session, idx) => (
                            <tr key={idx} className="hover:bg-surface/50 dark:hover:bg-primary-active/30 transition-colors">
                                <td className="px-4 py-4 text-xs font-bold text-main dark:text-on-primary">{session.studentName}</td>
                                <td className="px-4 py-4 text-xs font-bold text-muted dark:text-muted">{session.teacherName}</td>
                                <td className="px-4 py-4 text-center font-mono text-micro text-error">{session.date}</td>
                                <td className="px-4 py-4 text-center">
                                    <div className="inline-block px-2 py-0.5 text-micro font-bold rounded-lg" style={{ backgroundColor: 'rgba(244,63,94,0.07)', color: 'var(--bg-error)' }}>تعويض معلق</div>
                                </td>
                            </tr>
                        ))}
                        {cancelledNeedingComp.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <CheckCircle2 className="mx-auto mb-3" size={48} style={{ color: 'rgba(16,185,129,0.13)' }} />
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest">لا توجد تعويضات معلقة</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </SectionCard>
    );
};
