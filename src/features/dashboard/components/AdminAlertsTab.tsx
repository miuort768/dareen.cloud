import { Bell, UserPlus, Headphones, Sparkles, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface AdminAlertsTabProps {
    lowBalanceCount: number;
    onRefresh?: () => Promise<void> | void;
}

const glass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10";

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
                    <div className={cn("rounded-2xl p-5 shadow-lg shadow-black/[0.03]", glass)}>
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-error to-rose-500 flex items-center justify-center shadow-lg shadow-error/20 shrink-0">
                                <Bell size={18} strokeWidth={1.5} className="text-white" />
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
                                        className="h-10 px-5 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-bold shadow-lg shadow-primary/20 inline-flex items-center gap-1.5"
                                    >
                                        <UserPlus size={13} strokeWidth={1.5} />
                                        عرض الطلاب
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cn("rounded-2xl p-8 text-center shadow-lg shadow-black/[0.03]", glass)}>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/10 to-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                            <Bell size={24} className="text-success/50" />
                        </div>
                        <p className="text-sm font-bold text-main">لا توجد تنبيهات</p>
                        <p className="text-xs text-muted mt-1">كل الأنظمة تعمل بشكل طبيعي</p>
                    </div>
                )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="relative rounded-2xl p-5 shadow-lg overflow-hidden bg-gradient-to-br from-primary to-purple-600"
            >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
                <div className="absolute -top-10 -start-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -end-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Headphones size={18} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">الدعم الفني</h4>
                            <p className="text-[11px] font-medium text-white/60">متاح 24/7</p>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                        className="w-full h-12 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg border border-white/10"
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
