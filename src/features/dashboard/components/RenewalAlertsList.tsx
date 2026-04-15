import { Bell, Phone, UserX } from 'lucide-react';
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
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-500/20">
                        <UserX size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">تجديد الاشتراكات</h3>
                        <p className="text-sm font-medium text-gray-400">متابعة الطلاب المنتهي رصيدهم</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-rose-500 text-white text-[11px] font-black rounded-xl shadow-lg shadow-rose-500/20">
                    {stats.lowBalanceCount} طلاب تعثروا
                </div>
            </div>

            <div className="overflow-x-auto flex-1 custom-scrollbar">
                {lowBalanceStudents.length > 0 ? (
                    <div className="space-y-4">
                        {lowBalanceStudents.map((item, idx) => (
                            <div key={idx} className="p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white">{item.studentName}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{item.subject}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-left hidden md:block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">الرصيد</p>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full font-black text-[10px] tracking-tighter",
                                            item.remainingSessions === 0
                                                ? "bg-rose-100 text-rose-600"
                                                : "bg-amber-100 text-amber-600"
                                        )}>
                                            {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} حِصص`}
                                        </span>
                                    </div>
                                    
                                    <button
                                        onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                        className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all hover:scale-110 shadow-lg shadow-emerald-500/20 group/btn"
                                    >
                                        <Phone size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400">لا توجد اشتراكات منتهية</p>
                    </div>
                )}
            </div>
        </div>
    );
};
