import { Bell, UserPlus, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../../lib/haptics';

interface AdminAlertsTabProps {
    lowBalanceCount: number;
    onRefresh?: () => Promise<void> | void;
}

export const AdminAlertsTab = ({ lowBalanceCount }: AdminAlertsTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <p className="text-micro font-bold text-muted px-1">التنبيهات</p>

            {lowBalanceCount > 0 ? (
                <div className="bg-card rounded-card p-5 shadow-soft border border-error dark:border-error/30">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-error flex items-center justify-center text-on-primary shadow-soft shadow-error/40 shrink-0">
                            <Bell size={18} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xs text-main">إشعار مالي</h3>
                            <p className="text-micro font-medium text-muted mt-1">
                                يوجد {lowBalanceCount} طلاب بحاجة إلى تجديد الاشتراك
                            </p>
                            <button
                                onClick={() => { triggerHaptic('medium'); navigate('/students'); }}
                                className="mt-3 h-8 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-micro font-bold transition-all inline-flex items-center gap-1.5 shadow-soft shadow-info/30 active:scale-95"
                                aria-label="عرض الطلاب"
                            >
                                <UserPlus size={12} strokeWidth={1.5} />
                                عرض الطلاب
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-card p-5 text-center shadow-soft border border-border">
                    <div className="w-12 h-12 rounded-xl bg-success-soft flex items-center justify-center mx-auto mb-3">
                        <Bell size={24} strokeWidth={1.5} className="text-success" />
                    </div>
                    <p className="text-xs font-bold text-main">لا توجد تنبيهات</p>
                    <p className="text-micro font-medium text-muted mt-1">كل الأنظمة تعمل بشكل طبيعي</p>
                </div>
            )}

            <div className="relative rounded-card p-5 shadow-soft overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
                <div className="absolute -top-10 -start-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -end-8 w-24 h-24 bg-info-light/10 rounded-full blur-xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                            <Headphones size={18} strokeWidth={1.5} className="text-on-primary" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-on-primary">الدعم الفني</h4>
                            <p className="text-micro font-medium text-on-primary/60">متاح 24/7</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { triggerHaptic('heavy'); window.open('https://wa.me/message/DAREEN', '_blank'); }}
                        className="w-full h-11 rounded-xl bg-white/15 backdrop-blur-md text-on-primary text-micro font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-soft border border-white/10 hover:bg-white/25"
                        aria-label="تواصل مع الدعم الفني"
                    >
                        <Headphones size={14} strokeWidth={1.5} />
                        تواصل مع الدعم الفني
                    </button>
                </div>
            </div>
        </div>
    );
};
