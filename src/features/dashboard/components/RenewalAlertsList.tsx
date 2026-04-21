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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full" dir="rtl">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <UserX size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">تجديد الاشتراكات</h3>
                        <p className="text-slate-400 text-xs font-bold mt-0.5">طلاب بحاجة إلى متابعة مالية</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg shadow-rose-200 dark:shadow-none self-start">
                    <AlertCircle size={14} />
                    {stats.lowBalanceCount} طلاب استحقاق
                </div>
            </div>

            {/* List Containers */}
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
                {lowBalanceStudents.length > 0 ? (
                    lowBalanceStudents.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100/50 dark:border-slate-800 flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:shadow-slate-100 dark:hover:shadow-none">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center font-black text-sm text-[#5c59f2] border-2 border-slate-200 dark:border-slate-600 shadow-sm">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800",
                                        item.remainingSessions === 0 ? "bg-rose-500" : "bg-amber-500"
                                    )}></div>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-sm text-slate-800 dark:text-white truncate">{item.studentName}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                        <p className="text-[11px] font-bold text-slate-400 truncate">{item.subject}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <div className="text-left hidden sm:block">
                                    <p className={cn(
                                        "text-xs font-black",
                                        item.remainingSessions === 0 ? "text-rose-500" : "text-amber-500"
                                    )}>
                                        {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} حِصص`}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">الرصيد المتبقي</p>
                                </div>
                                
                                <button
                                    onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                    className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
                                    title="إرسال رسالة تذكير"
                                >
                                    <Phone size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-700 bg-slate-50/30 dark:bg-slate-800/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <UserX size={48} className="opacity-20 mb-3" />
                        <p className="text-sm font-bold italic">لا يوجد طلاب بانتظار التجديد</p>
                        <p className="text-[10px] font-medium mt-1">قاعدة البيانات المالية منتظمة</p>
                    </div>
                )}
            </div>

            {/* View All Button */}
            <div className="mt-8 border-t border-slate-50 dark:border-slate-800 pt-6">
                <button className="w-full py-4 text-[#5c59f2] font-black text-sm flex items-center justify-center gap-2 hover:gap-4 transition-all">
                    عرض جميع السجلات المالية
                    <ChevronLeft size={18} />
                </button>
            </div>
        </div>
    );
};
