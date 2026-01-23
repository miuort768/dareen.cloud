import { Bell, Phone } from 'lucide-react';
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
        <div className="bg-white border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30 overflow-hidden shadow-xl relative group h-full flex flex-col">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-600 group-hover:w-2 transition-all"></div>
            <div className="p-5 border-b border-rose-100 dark:border-rose-900/20 flex items-center justify-between bg-gradient-to-l from-rose-50/80 to-transparent dark:from-rose-900/10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-rose-600/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative p-2.5 bg-rose-600 shadow-lg shadow-rose-600/20 flex items-center justify-center">
                            <Bell size={22} className="text-white animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="font-black text-gray-900 dark:text-white text-sm tracking-tight">تنبيهات تجديد الاشتراك</h3>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></div>
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.15em] opacity-80">تتطلب متابعة فورية</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="px-4 py-1.5 bg-rose-600 text-white text-[11px] font-black shadow-lg shadow-rose-600/30">
                        {stats.lowBalanceCount} طلاب متعثرين
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">قائمة التجديد</p>
                </div>
            </div>

            <div className="hidden sm:block overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الطالب</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">المادة</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الرصيد المتبقي</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowBalanceStudents.length > 0 ? (
                            lowBalanceStudents.map((item, idx) => (
                                <tr key={idx} className="hover:bg-rose-50/20 dark:hover:bg-rose-900/5 transition-colors border-b last:border-0 border-gray-50 dark:border-gray-800/50">
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-black text-gray-900 dark:text-white text-xs">{item.studentName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{item.subject}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "px-4 py-1.5 font-black text-[10px] tracking-tighter shadow-sm",
                                                item.remainingSessions === 0
                                                    ? "bg-rose-600 text-white shadow-rose-600/20"
                                                    : "bg-amber-100/80 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500"
                                            )}>
                                                {item.remainingSessions === 0 ? 'منتهي الصلاحية' : `${item.remainingSessions} حِصص متبقية`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                                className="bg-emerald-600 text-white px-4 py-1.5 text-[10px] font-black uppercase hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2 group/btn"
                                            >
                                                إرسال تذكير
                                                <Phone size={12} className="group-hover/btn:rotate-12 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-xs font-black text-gray-400 opacity-30">لا توجد اشتراكات منتهية حالياً</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="sm:hidden p-4 space-y-4">
                {lowBalanceStudents.length > 0 ? (
                    lowBalanceStudents.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800/50 p-4 border border-rose-100 dark:border-rose-900/20 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-sm mb-0.5">{item.studentName}</h4>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{item.subject}</p>
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 font-black text-[9px] uppercase tracking-tighter",
                                    item.remainingSessions === 0 ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-700"
                                )}>
                                    {item.remainingSessions === 0 ? 'منتهي' : `${item.remainingSessions} حِصص`}
                                </span>
                            </div>
                            <button
                                onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                className="w-full bg-emerald-600 text-white py-2.5 text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                إرسال تذكير عبر واتساب
                                <Phone size={14} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center text-xs font-black text-gray-400 opacity-30">لا توجد اشتراكات منتهية</div>
                )}
            </div>
        </div>
    );
};
