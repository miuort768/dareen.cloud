import { TrendingUp, TrendingDown, ChevronLeft, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../../../lib/haptics';

const smallIconProps = { size: 14, strokeWidth: 1.5 };

interface AdminFinanceTabProps {
    stats: Record<string, unknown>;
}

export const AdminFinanceTab = ({ stats }: AdminFinanceTabProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <p className="text-micro font-bold text-muted px-1">المؤشرات المالية</p>

            <div className="bg-card rounded-card p-5 shadow-soft border border-border space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-success-soft border border-success">
                    <div>
                        <span className="text-micro font-bold text-success">الإيرادات</span>
                        <p className="text-lg font-bold text-main mt-1 tabular-nums">{(stats.totalRevenue || 0).toLocaleString()} ج.م</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center text-on-primary shadow-soft shadow-success/40">
                        <TrendingUp size={20} strokeWidth={1.5} />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-error-soft border border-error">
                    <div>
                        <span className="text-micro font-bold text-error">المصروفات</span>
                        <p className="text-lg font-bold text-main mt-1 tabular-nums">{(stats.totalExpenses || 0).toLocaleString()} ج.م</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-error flex items-center justify-center text-on-primary shadow-soft shadow-error/40">
                        <TrendingDown size={20} strokeWidth={1.5} />
                    </div>
                </div>

                <button
                    onClick={() => { triggerHaptic('light'); navigate('/finance'); }}
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-micro font-bold flex items-center justify-center gap-2 shadow-soft shadow-info/40 hover:shadow-md hover:shadow-info/60 transition-all active:scale-[0.98]"
                    aria-label="لوحة المالية كاملة"
                >
                    <Wallet {...smallIconProps} />
                    لوحة المالية كاملة
                    <ChevronLeft {...miniIconProps} />
                </button>
            </div>
        </div>
    );
};

const miniIconProps = { size: 12, strokeWidth: 1.5 };
