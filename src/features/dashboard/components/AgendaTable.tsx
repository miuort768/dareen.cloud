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
        <div className="bg-white border border-primary-200 dark:bg-gray-900 dark:border-gray-800 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary-600 transition-all"></div>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-primary-50/30 dark:bg-primary-900/10">
                <div className="flex items-center gap-4">
                    <div className="relative p-2.5 bg-primary-600 shadow-lg shadow-primary-600/20 flex items-center justify-center">
                        <CalendarCheck size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm tracking-tight uppercase">جدول حصص اليوم</h3>
                        <p className="text-[10px] font-medium text-primary-600 uppercase tracking-widest opacity-80">أجندتك التعليمية ليوم {new Date().toLocaleDateString('ar-EG', { weekday: 'long' })}</p>
                    </div>
                </div>
                <Link to="/attendance" className="bg-white dark:bg-gray-800 border border-primary-200 text-primary-600 px-4 py-2 text-[10px] font-medium uppercase hover:bg-primary-50 transition-all">إدارة كل الحضور</Link>
            </div>

            <div className="p-0 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">الوقت</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">الطالب</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">المادة</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">الحالة</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">الإجراءات السريعة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todaySessions.length > 0 ? (
                            todaySessions.map((session, idx) => (
                                <tr key={idx} className="hover:bg-primary-50/20 transition-colors border-b last:border-0 border-gray-50 dark:border-gray-800/50 text-center">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-medium text-primary-600 text-xs">{session.time}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900 dark:text-white text-xs">{session.studentName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 text-[10px] font-normal uppercase">{session.subject}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 text-[10px] font-medium uppercase border",
                                            session.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                session.status === 'cancelled' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    "bg-blue-50 text-blue-600 border-blue-100"
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
                                                    session.status === 'completed' ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                                                )}
                                                title="تسجيل حضور"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateSessionStatus(session.id, 'cancelled')}
                                                className={cn(
                                                    "p-2 rounded-none transition-all",
                                                    session.status === 'cancelled' ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                                                )}
                                                title="تسجيل غياب"
                                            >
                                                <X size={16} />
                                            </button>
                                            <Link
                                                to="/schedule"
                                                className="p-2 bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
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
                                <td colSpan={5} className="px-6 py-12 text-center text-xs font-medium text-gray-400 opacity-30 uppercase tracking-widest">لا توجد حصص مجدولة لليوم</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
