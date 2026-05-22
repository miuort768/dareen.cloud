import { Phone, UserX, AlertCircle, ChevronLeft } from 'lucide-react';
import type { LowBalanceStudent, DashboardStats as Stats } from '../types';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useAdminPhone } from '../../../context/AppContext';

interface RenewalAlertsListProps {
    stats: Stats;
    lowBalanceStudents: LowBalanceStudent[];
}

export const RenewalAlertsList = ({ stats, lowBalanceStudents }: RenewalAlertsListProps) => {
    const adminPhone = useAdminPhone();
    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 p-6 rounded-none shadow-sm flex flex-col h-full" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-950 text-white rounded-none flex items-center justify-center shadow-lg">
                        <UserX size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-950 dark:text-white uppercase tracking-tighter">تجديد الاشتراكات</h3>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Financial Monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-100 dark:border-rose-900/20 px-3 py-1.5 rounded-none text-[10px] font-medium uppercase tracking-widest">
                    <AlertCircle size={12} />
                    {stats.lowBalanceCount} طلاب استحقاق
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 -mr-2 custom-scrollbar">
                {lowBalanceStudents.length > 0 ? (
                    lowBalanceStudents.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-none border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-none bg-white dark:bg-slate-800 flex items-center justify-center font-medium text-xs text-indigo-600 border-2 border-slate-950">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-none border-2 border-slate-950",
                                        item.remainingSessions === 0 ? "bg-rose-500" : "bg-amber-500"
                                    )} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-medium text-xs text-slate-950 dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.studentName}</h4>
                                    <p className="text-[10px] font-medium text-slate-400 truncate mt-1 uppercase tracking-widest">{item.subject}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <span className={cn(
                                    "text-[9px] font-medium px-2 py-0.5 rounded-none uppercase tracking-widest",
                                    item.remainingSessions === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                                )}>
                                    {item.remainingSessions === 0 ? 'Exp' : `${item.remainingSessions} S` }
                                </span>
                                
                                <button
                                    onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                    className="w-10 h-10 bg-slate-950 text-white hover:bg-emerald-600 rounded-none flex items-center justify-center transition-all shadow-md active:scale-95"
                                >
                                    <Phone size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 opacity-20 flex flex-col items-center">
                         <UserX size={48} className="text-slate-300 mb-4" />
                         <p className="text-[10px] font-medium uppercase tracking-[0.2em]">لا توجد أرصدة منخفضة</p>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-6">
                <button className="w-full h-11 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white rounded-none transition-all active:scale-95 border border-slate-200 dark:border-slate-700">
                    عرض كافة السجلات
                    <ChevronLeft size={16} />
                </button>
            </div>
        </div>
    );
};
