import { Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, X, Clock } from 'lucide-react';
import type { Session } from '../../../types';
import { cn } from '../../../lib/utils';

interface AgendaTableProps {
    todaySessions: Session[];
    updateSessionStatus: (id: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => Promise<void>;
}

export const AgendaTable = ({ todaySessions, updateSessionStatus }: AgendaTableProps) => {
    return (
        <div className="bg-white border border-primary dark:bg-card dark:border-border shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary transition-all"></div>
            <div className="p-5 border-b border-border dark:border-border flex items-center justify-between bg-primary-soft/30 dark:bg-primary/10">
                <div className="flex items-center gap-4">
                    <div className="relative p-2.5 bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                        <CalendarCheck size={22} className="text-on-primary" />
                    </div>
                    <div>
                        <h3 className="font-medium text-main dark:text-on-primary text-sm tracking-tight uppercase">جدول حصص اليوم</h3>
                        <p className="text-[10px] font-medium text-primary uppercase tracking-widest opacity-80">أجندتك التعليمية ليوم {new Date().toLocaleDateString('ar-EG', { weekday: 'long' })}</p>
                    </div>
                </div>
                <Link to="/attendance" className="bg-white dark:bg-card border border-primary text-primary px-4 py-2 text-[10px] font-medium uppercase hover:bg-primary-soft transition-all">إدارة كل الحضور</Link>
            </div>

            <div className="p-0 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-background/50 dark:bg-card/30 border-b border-border dark:border-border">
                            <th className="px-6 py-4 text-[10px] font-medium text-muted uppercase tracking-widest text-center">الوقت</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-muted uppercase tracking-widest text-center">الطالب</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-muted uppercase tracking-widest text-center">المادة</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-muted uppercase tracking-widest text-center">الحالة</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-muted uppercase tracking-widest text-center">الإجراءات السريعة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todaySessions.length > 0 ? (
                            todaySessions.map((session, idx) => (
                                <tr key={idx} className="hover:bg-primary-soft/20 transition-colors border-b last:border-0 border-border dark:border-border/50 text-center">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-medium text-primary text-xs">{session.time}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-main dark:text-on-primary text-xs">{session.studentName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-surface dark:bg-card text-muted text-[10px] font-normal uppercase">{session.subject}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 text-[10px] font-medium uppercase border",
                                            session.status === 'completed' ? "bg-success-light text-success border-success" :
                                                session.status === 'cancelled' ? "bg-error-light text-error border-error" :
                                                    "bg-info-light text-info border-info"
                                        )}>
                                            {session.status === 'completed' ? 'حاضر' :
                                                session.status === 'cancelled' ? 'غائب' : 'مجدول'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => updateSessionStatus(session.id, 'completed')}
                                                className={cn(
                                                    "p-2 rounded-none transition-all",
                                                    session.status === 'completed' ? "bg-success text-on-primary" : "bg-surface text-muted hover:bg-success-light hover:text-success"
                                                )}
                                                title="تسجيل حضور"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateSessionStatus(session.id, 'cancelled')}
                                                className={cn(
                                                    "p-2 rounded-none transition-all",
                                                    session.status === 'cancelled' ? "bg-error text-on-primary" : "bg-surface text-muted hover:bg-error-light hover:text-error"
                                                )}
                                                title="تسجيل غياب"
                                            >
                                                <X size={16} />
                                            </button>
                                            <Link
                                                to="/schedule"
                                                className="p-2 bg-surface text-muted hover:bg-info-light hover:text-info transition-all"
                                                title="إعادة جدولة"
                                            >
                                                <Clock size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-xs font-medium text-muted opacity-30 uppercase tracking-widest">لا توجد حصص مجدولة لليوم</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
