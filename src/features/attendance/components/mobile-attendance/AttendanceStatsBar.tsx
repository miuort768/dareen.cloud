import { motion } from 'framer-motion';

interface AttendanceStatsBarProps {
    completedToday: number;
    cancelledToday: number;
    scheduledToday: number;
}

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: 'easeOut' }
};

export const AttendanceStatsBar = ({ completedToday, cancelledToday, scheduledToday }: AttendanceStatsBarProps) => (
    <motion.div {...fadeUp} className="px-4 pt-3 pb-2">
        <div className="grid grid-cols-3 gap-2">
            <div className="bg-card rounded-2xl p-3 text-center border border-success/30">
                <p className="text-lg font-bold text-success tabular-nums leading-none">{completedToday}</p>
                <p className="text-micro font-bold text-success/70 mt-1">حضور</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-error/30">
                <p className="text-lg font-bold text-error tabular-nums leading-none">{cancelledToday}</p>
                <p className="text-micro font-bold text-error/70 mt-1">غياب</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-border/30">
                <p className="text-lg font-bold text-main tabular-nums leading-none">{scheduledToday}</p>
                <p className="text-micro font-bold text-muted mt-1">متبقي</p>
            </div>
        </div>
    </motion.div>
);
