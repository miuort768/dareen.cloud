import { Bell, UserPlus, Headphones, Sparkles, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AdminAlertsTabProps {
    lowBalanceCount: number;
    onRefresh?: () => Promise<void> | void;
}

export const AdminAlertsTab = ({ lowBalanceCount }: AdminAlertsTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4 px-1">
            <div className="flex items-center gap-2 px-1">
                <Sparkles size={14} className="text-primary" />
                <h2 className="text-xs font-bold text-muted">التنبيهات</h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                {lowBalanceCount > 0 ? (
                    <div className="rounded-2xl p-5 bg-card border border-border">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-error-soft flex items-center justify-center shrink-0">
                                <Bell size={18} strokeWidth={1.5} className="text-error" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm text-main">إشعار مالي</h3>
                                <p className="text-xs text-muted mt-1">
                                    يوجد {lowBalanceCount} طلاب بحاجة إلى تجديد الاشتراك
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/students')}
                                        className="h-10 px-5 rounded-xl bg-primary text-on-primary text-xs font-bold inline-flex items-center gap-1.5"
                                    >
                                        <UserPlus size={13} strokeWidth={1.5} />
                                        عرض الطلاب
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl p-8 text-center bg-card border border-border">
                        <div className="w-14 h-14 rounded-2xl bg-success-soft flex items-center justify-center mx-auto mb-3">
                            <Bell size={24} className="text-success/50" />
                        </div>
                        <p className="text-sm font-bold text-main">لا توجد تنبيهات</p>
                        <p className="text-xs text-muted mt-1">كل الأنظمة تعمل بشكل طبيعي</p>
                    </div>
                )}
            </motion.div>

            {/* Support CTA — solid primary card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-5 bg-primary overflow-hidden relative"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-on-primary/20 flex items-center justify-center">
                            <Headphones size={18} className="text-on-primary" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-on-primary">الدعم الفني</h4>
                            <p className="text-[11px] font-medium text-on-primary/60">متاح 24/7</p>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                        className="w-full h-12 rounded-xl bg-on-primary/20 text-on-primary text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <Headphones size={14} strokeWidth={1.5} />
                        تواصل مع الدعم الفني
                        <ChevronLeft size={13} />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};
