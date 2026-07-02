import { Phone, UserX, AlertCircle, ChevronLeft } from 'lucide-react';
import type { LowBalanceStudent, DashboardStats as Stats } from '../types';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useAdminPhone } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface RenewalAlertsListProps {
    stats: Stats;
    lowBalanceStudents: LowBalanceStudent[];
}

export const RenewalAlertsList = ({ stats, lowBalanceStudents }: RenewalAlertsListProps) => {
    const adminPhone = useAdminPhone();
    const navigate = useNavigate();
    return (
        <div className="bg-white dark:bg-primary-active border-2 border-border dark:border-border p-6 rounded-none shadow-sm flex flex-col h-full" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-background text-on-primary rounded-none flex items-center justify-center shadow-lg">
                        <UserX size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-main dark:text-on-primary uppercase tracking-tighter">تجديد الاشتراكات</h3>
                        <p className="text-[10px] font-medium text-muted uppercase tracking-widest mt-1">المراقبة المالية</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-error-light dark:bg-error/20 text-error border border-error dark:border-error/20 px-3 py-1.5 rounded-none text-[10px] font-medium uppercase tracking-widest">
                    <AlertCircle size={12} />
                    {stats.lowBalanceCount} طلاب استحقاق
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 -mr-2 custom-scrollbar">
                {lowBalanceStudents.length > 0 ? (
                    lowBalanceStudents.map((item, idx) => (
                        <div key={idx} className="p-4 bg-background dark:bg-primary-active/30 rounded-none border-b border-border dark:border-border hover:bg-surface dark:hover:bg-primary-active transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-none bg-white dark:bg-primary-active flex items-center justify-center font-medium text-xs text-primary border-2 border-border">
                                        {item.studentName.charAt(0)}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-none border-2 border-border",
                                        item.remainingSessions === 0 ? "bg-error" : "bg-warning"
                                    )} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-medium text-xs text-main dark:text-on-primary truncate group-hover:text-primary transition-colors uppercase tracking-tight">{item.studentName}</h4>
                                    <p className="text-[10px] font-medium text-muted truncate mt-1 uppercase tracking-widest">{item.subject}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <span className={cn(
                                    "text-[9px] font-medium px-2 py-0.5 rounded-none uppercase tracking-widest",
                                    item.remainingSessions === 0 ? "bg-error-light text-error" : "bg-warning-light text-warning"
                                )}>
                                    {item.remainingSessions === 0 ? 'انتهاء' : `${item.remainingSessions} م` }
                                </span>
                                
                                <button
                                    onClick={() => sendWhatsAppReminder(item, undefined, adminPhone)}
                                    className="w-10 h-10 bg-background text-on-primary hover:bg-success rounded-none flex items-center justify-center transition-all shadow-md active:scale-95"
                                >
                                    <Phone size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 opacity-20 flex flex-col items-center">
                         <UserX size={48} className="text-dim mb-4" />
                         <p className="text-[10px] font-medium uppercase tracking-[0.2em]">لا توجد أرصدة منخفضة</p>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-6">
                <button onClick={() => navigate('/attendance')} className="w-full h-11 flex items-center justify-center gap-2 bg-surface dark:bg-primary-active text-muted dark:text-muted font-medium text-[10px] uppercase tracking-widest hover:bg-primary hover:text-on-primary rounded-none transition-all active:scale-95 border border-border dark:border-border">
                    عرض كافة السجلات
                    <ChevronLeft size={16} />
                </button>
            </div>
        </div>
    );
};
