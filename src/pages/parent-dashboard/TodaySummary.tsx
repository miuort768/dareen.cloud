import { CheckCircle, XCircle, Calendar, BookOpen } from 'lucide-react';

interface TodaySummaryProps {
    sessions: Student[];
    children: Student[];
    todayTasks: { studentName: string; subject: string; teacher: string; time: string; period: string }[];
}

import type { Student } from '../../types';

export const TodaySummary = ({ sessions, children: kids, todayTasks }: TodaySummaryProps) => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const cancelled = sessions.filter(s => s.status === 'cancelled').length;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center ring-1 ring-success/20">
                    <CheckCircle size={14} className="text-success" />
                </div>
                <span className="text-sm font-bold text-main">{completed}</span>
                <span className="text-micro text-muted font-medium">حاضر</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-error-soft flex items-center justify-center ring-1 ring-error/20">
                    <XCircle size={14} className="text-error" />
                </div>
                <span className="text-sm font-bold text-main">{cancelled}</span>
                <span className="text-micro text-muted font-medium">غائب</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-info-soft flex items-center justify-center ring-1 ring-info/20">
                    <Calendar size={14} className="text-info" />
                </div>
                <span className="text-sm font-bold text-main">{todayTasks.length}</span>
                <span className="text-micro text-muted font-medium">اليوم</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center ring-1 ring-primary/20">
                    <BookOpen size={14} className="text-primary" />
                </div>
                <span className="text-sm font-bold text-main">{kids.length}</span>
                <span className="text-micro text-muted font-medium">الأبناء</span>
            </div>
        </div>
    );
};
