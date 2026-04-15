import { Phone, UserX } from 'lucide-react';
import type { LowBalanceStudent, DashboardStats as Stats } from '../types';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useApp } from '../../../context/AppContext';

interface RenewalAlertsListProps {
    stats: Stats;
    lowBalanceStudents: LowBalanceStudent[];
}

export const RenewalAlertsList = ({ stats, lowBalanceStudents }: RenewalAlertsListProps) => {
    const { adminPhone } = useApp();
    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 shadow-sm rounded-none border-t-2 border-t-rose-600 flex flex-col" dir="rtl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-rose-50 items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-500 text-white flex items-center justify-center">
                        <UserX size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">تجديد الاشتراكات</h3>
                    </div>
                </div>
                <div className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-100">
                    {stats.lowBalanceCount} طلاب استحقاق
                </div>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                {lowBalanceStudents.length > 0 ? (
                    lowBalanceStudents.map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-none border border-slate-100 dark:border-slate-800 flex items-center justify-between group transition-all hover:bg-white">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-none bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-500">
                                    {item.studentName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-[11px] text-slate-800 dark:text-white truncate">{item.studentName}</p>
                                    <p className="text-[9px] font-medium text-slate-400 truncate">{item.subject}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-none font-black text-[9px]",
                                    item.remainingSessions === 0
                                        ? "bg-rose-100 text-rose-600"
                                        : "bg-amber-100 text-amber-600"
                                )}>
                                    {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} حِصص`}
                                </span>
                                
                                <button
                                    onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                    className="w-7 h-7 bg-emerald-500 text-white rounded-none flex items-center justify-center hover:brightness-110 transition-all border border-emerald-600 shadow-none"
                                >
                                    <Phone size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                ) : (
                    <div className="py-10 text-center text-slate-400 text-[10px] italic border border-dashed border-slate-100">لا تجديدات</div>
                )}
            </div>
        </div>
    );
};
