import { Phone, UserX, AlertCircle, ChevronLeft } from 'lucide-react';
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm flex flex-col h-full" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center">
                        <UserX size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">تجديد الاشتراكات</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">متابعة الأرصدة المالية</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 px-3 py-1 rounded-xl text-[10px] font-bold">
                    <AlertCircle size={12} />
                    {stats.lowBalanceCount} طلاب استحقاق
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 -mr-2 custom-scrollbar">
                {lowBalanceStudents.length > 0 ? (
                    lowBalanceStudents.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-500 border border-slate-100 dark:border-slate-700">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                                        item.remainingSessions === 0 ? "bg-rose-500" : "bg-amber-500"
                                    )} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate group-hover:text-indigo-500 transition-colors">{item.studentName}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{item.subject}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-lg",
                                    item.remainingSessions === 0 ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
                                )}>
                                    {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} حِصص`}
                                </span>
                                
                                <button
                                    onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                    className="w-8 h-8 bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                                >
                                    <Phone size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 italic font-bold text-slate-400 text-xs">
                        لا توجد أرصدة منخفضة
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button className="w-full h-11 flex items-center justify-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all active:scale-95">
                    عرض كافة السجلات
                    <ChevronLeft size={16} />
                </button>
            </div>
        </div>
    );
};
