import { motion } from 'framer-motion';

interface AppointmentStatsProps {
    todayCount: number;
    totalCount: number;
    completedCount: number;
}

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: 'easeOut' as const }
};

export const AppointmentStats = ({ todayCount, totalCount, completedCount }: AppointmentStatsProps) => (
    <motion.div {...fadeUp} className="px-4 pt-3 pb-2">
        <div className="grid grid-cols-3 gap-2">
            <div className="bg-card rounded-2xl p-3 text-center border border-primary/20">
                <p className="text-lg font-bold text-primary tabular-nums leading-none">{todayCount}</p>
                <p className="text-micro font-bold text-primary/70 mt-1">اليوم</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-success/50">
                <p className="text-lg font-bold text-success tabular-nums leading-none">{totalCount - completedCount}</p>
                <p className="text-micro font-bold text-success/70 mt-1">المتبقي</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-info/50">
                <p className="text-lg font-bold text-primary tabular-nums leading-none">{totalCount}</p>
                <p className="text-micro font-bold text-info/70 mt-1">الإجمالي</p>
            </div>
        </div>
    </motion.div>
);
