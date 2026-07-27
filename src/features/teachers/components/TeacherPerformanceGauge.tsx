import { TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

interface TeacherPerformanceGaugeProps {
    monthlySessions: number;
    prevMonthSessions: number;
    performanceChange: number;
}

export const TeacherPerformanceGauge = ({ monthlySessions, prevMonthSessions, performanceChange }: TeacherPerformanceGaugeProps) => (
    <div className="p-5 bg-card border border-border rounded-2xl font-dash">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-xs text-muted mb-1">الإنتاجية (الحالية)</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-main">{monthlySessions}</span>
                    <span className="text-xs text-muted">جلسة منجزة</span>
                </div>
            </div>
            <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg",
                performanceChange >= 0 ? "bg-success-soft text-success" : "bg-error-soft text-error"
            )}>
                <TrendingUp size={10} className={performanceChange < 0 ? "rotate-180" : ""} />
                {performanceChange > 0 ? `+${performanceChange}%` : `${performanceChange}%`}
            </div>
        </div>
        <div className="h-1.5 bg-hover rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (monthlySessions / (prevMonthSessions || 1)) * 50)}%` }}
                className="h-full bg-success rounded-full"
            />
        </div>
    </div>
);
