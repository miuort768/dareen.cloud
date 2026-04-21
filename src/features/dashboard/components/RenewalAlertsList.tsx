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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[1.5rem] shadow-sm flex flex-col h-full" dir="rtl">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center shadow-inner">
                        <UserX size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">تجديد الاشتراكات</h3>
                        <p className="text-slate-400 text-[10px] font-bold mt-0.5">طلاب بحاجة إلى متابعة</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-rose-500 text-white px-3 py-1 rounded-lg text-[9px] font-black shadow-md shadow-rose-200 dark:shadow-none self-start">
                    <AlertCircle size={10} />
                    {stats.lowBalanceCount} طلاب استحقاق
                </div>
            </div>

            {/* List Containers */}
            <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
                {lowBalanceStudents.length > 0 ? (
                    lowBalanceStudents.map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100/50 dark:border-slate-800 flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-slate-800">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center font-black text-xs text-[#5c59f2] border border-slate-200 dark:border-slate-600">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white dark:border-slate-800",
                                        item.remainingSessions === 0 ? "bg-rose-500" : "bg-amber-500"
                                    )}></div>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-[12px] text-slate-800 dark:text-white truncate">{item.studentName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate">{item.subject}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="text-left hidden sm:block">
                                    <p className={cn(
                                        "text-[10px] font-black",
                                        item.remainingSessions === 0 ? "text-rose-500" : "text-amber-500"
                                    )}>
                                        {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} حِصص`}
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                    className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-100 dark:shadow-none"
                                >
                                    <Phone size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-300 dark:text-slate-700 bg-slate-50/30 rounded-[1.5rem] border border-dashed border-slate-200">
                        <UserX size={32} className="opacity-20 mb-2" />
                        <p className="text-[11px] font-bold italic">قاعدة البيانات المالية منتظمة</p>
                    </div>
                )}
            </div>

            {/* View All Button */}
            <div className="mt-6 border-t border-slate-50 dark:border-slate-800 pt-4">
                <button className="w-full py-2 text-[#5c59f2] font-black text-xs flex items-center justify-center gap-2 hover:gap-3 transition-all">
                    عرض جميع السجلات
                    <ChevronLeft size={14} />
                </button>
            </div>
        </div>
    );
};
