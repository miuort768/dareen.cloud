import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

interface AppointmentPullToRefreshProps {
    pullDistance: number;
    isRefreshing: boolean;
}

export const AppointmentPullToRefresh = ({ pullDistance, isRefreshing }: AppointmentPullToRefreshProps) => (
    <motion.div style={{ height: pullDistance }} animate={{ height: isRefreshing ? 50 : pullDistance }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="overflow-hidden flex items-center justify-center w-full">
        <div className="flex items-center gap-2.5 text-primary font-medium text-xs">
            {isRefreshing ? (
                <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /><span>جاري التحديث...</span></>
            ) : pullDistance > 55 ? (
                <><Sparkles size={16} className="animate-pulse" strokeWidth={1.5} /><span>أفلت للتحديث</span></>
            ) : (<span className="text-muted">اسحب للتحديث</span>)}
        </div>
    </motion.div>
);
