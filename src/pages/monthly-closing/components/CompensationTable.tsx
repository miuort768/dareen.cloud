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
            <div className="p-4 border-b border-slate-100/50 dark:border-slate-800/50">
                <SectionTitle icon={RefreshCw} label="سجل حصص التعويض المعلقة" sub="الإلغاءات التي تتطلب إعادة جدولة" color="#F59E0B" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500 uppercase tracking-wider">الطالب</th>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500">المعلمة</th>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">التاريخ</th>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {cancelledNeedingComp.map((session, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-white">{session.studentName}</td>
                                <td className="px-4 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{session.teacherName}</td>
                                <td className="px-4 py-4 text-center font-mono text-[10px] text-rose-500">{session.date}</td>
                                <td className="px-4 py-4 text-center">
                                    <div className="inline-block px-2 py-0.5 text-[9px] font-bold rounded-lg" style={{ backgroundColor: '#F43F5E12', color: '#F43F5E' }}>تعويض معلق</div>
                                </td>
                            </tr>
                        ))}
                        {cancelledNeedingComp.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <CheckCircle2 className="mx-auto mb-3" size={48} style={{ color: '#10B98120' }} />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">لا توجد تعويضات معلقة</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </SectionCard>
    );
};
