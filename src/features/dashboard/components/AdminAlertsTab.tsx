import { Bell, UserPlus, Headphones, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface AdminAlertsTabProps {
    lowBalanceCount: number;
    onRefresh?: () => Promise<void> | void;
}

export const AdminAlertsTab = ({ lowBalanceCount }: AdminAlertsTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-3">
            <p className="text-[10px] font-bold text-dim mb-1 px-1">التنبيهات</p>

            {/* Alert Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
                {lowBalanceCount > 0 ? (
                    <div className="bg-card border border-border/50 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-error-soft ring-1 ring-error/20 flex items-center justify-center shrink-0">
                                <Bell size={17} className="text-error" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xs text-main">إشعار مالي</h3>
                                <p className="text-[11px] text-dim mt-1">
                                    يوجد {lowBalanceCount} طلاب بحاجة إلى تجديد الاشتراك
                                </p>
                                <button onClick={() => navigate('/students')}
                                    className="mt-3 h-9 px-4 rounded-xl bg-primary text-on-primary text-[11px] font-bold inline-flex items-center gap-1.5 active:scale-[0.97] transition-transform">
                                    <UserPlus size={12} />
                                    عرض الطلاب
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
                        <div className="w-12 h-12 rounded-xl bg-success-soft ring-1 ring-success/20 flex items-center justify-center mx-auto mb-3">
                            <Bell size={20} className="text-success/50" />
                        </div>
                        <p className="text-xs font-bold text-main">لا توجد تنبيهات</p>
                        <p className="text-[10px] text-dim mt-1">كل الأنظمة تعمل بشكل طبيعي</p>
                    </div>
                )}
            </motion.div>

            {/* Support Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="bg-card border border-border/50 rounded-2xl p-4"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft ring-1 ring-primary/20 flex items-center justify-center">
                        <Headphones size={17} className="text-primary" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-main">الدعم الفني</h4>
                        <p className="text-[10px] text-dim">متاح 24/7</p>
                    </div>
                </div>
                <button onClick={() => window.open('https://wa.me/message/DAREEN', '_blank')}
                    className="w-full py-3 rounded-xl bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
                    <Headphones size={13} />
                    تواصل مع الدعم الفني
                    <ChevronLeft size={12} />
                </button>
            </motion.div>
        </div>
    );
};
