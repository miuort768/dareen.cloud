import { TrendingUp, TrendingDown, Wallet, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AdminFinanceTabProps {
    stats: Record<string, unknown>;
}

export const AdminFinanceTab = ({ stats }: AdminFinanceTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-3">
            <p className="text-[10px] font-bold text-dim mb-1 px-1">المؤشرات المالية</p>

            {/* Revenue */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
                className="bg-card border border-border/50 rounded-2xl p-4"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-success">الإيرادات</p>
                        <p className="text-lg font-bold text-main tabular-nums mt-1">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-success-soft ring-1 ring-success/20 flex items-center justify-center">
                        <TrendingUp size={18} className="text-success" />
                    </div>
                </div>
            </motion.div>

            {/* Expenses */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
                className="bg-card border border-border/50 rounded-2xl p-4"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-error">المصروفات</p>
                        <p className="text-lg font-bold text-main tabular-nums mt-1">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-error-soft ring-1 ring-error/20 flex items-center justify-center">
                        <TrendingDown size={18} className="text-error" />
                    </div>
                </div>
            </motion.div>

            {/* Net */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
                className="bg-card border border-border/50 rounded-2xl p-4"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-primary">صافي الربح</p>
                        <p className="text-lg font-bold text-main tabular-nums mt-1">{((stats.totalRevenue || 0) - (stats.totalExpenses || 0)).toLocaleString()} ج.م</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary-soft ring-1 ring-primary/20 flex items-center justify-center">
                        <Wallet size={18} className="text-primary" />
                    </div>
                </div>
            </motion.div>

            {/* CTA */}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                onClick={() => navigate('/finance')}
                className="w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
                <Wallet size={14} />
                عرض لوحة المالية كاملة
                <ChevronLeft size={13} />
            </motion.button>
        </div>
    );
};
