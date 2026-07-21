import { TrendingUp, TrendingDown, ChevronLeft, Wallet, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const glass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10";

interface AdminFinanceTabProps {
    stats: Record<string, unknown>;
}

export const AdminFinanceTab = ({ stats }: AdminFinanceTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4 px-1">
            <div className="flex items-center gap-2 px-1">
                <Sparkles size={14} className="text-primary" />
                <h2 className="text-xs font-bold text-muted">المؤشرات المالية</h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className={cn("rounded-2xl p-5 shadow-lg shadow-black/[0.03]", glass)}
            >
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-success/10 via-emerald-500/5 to-success/5 border border-success/20 mb-3">
                    <div>
                        <span className="text-[11px] font-bold text-success">الإيرادات</span>
                        <p className="text-lg font-bold text-main mt-1 tabular-nums">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-success to-emerald-500 flex items-center justify-center shadow-lg shadow-success/20">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-error/10 via-rose-500/5 to-error/5 border border-error/20">
                    <div>
                        <span className="text-[11px] font-bold text-error">المصروفات</span>
                        <p className="text-lg font-bold text-main mt-1 tabular-nums">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-error to-rose-500 flex items-center justify-center shadow-lg shadow-error/20">
                        <TrendingDown size={20} className="text-white" />
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/finance')}
                    className="w-full mt-4 h-12 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Wallet size={14} />
                    لوحة المالية كاملة
                    <ChevronLeft size={13} />
                </motion.button>
            </motion.div>
        </div>
    );
};
