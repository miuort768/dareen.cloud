import { motion } from 'framer-motion';
import { cn } from '../../../../lib/utils';
import { triggerHaptic } from '../../../../lib/haptics';

const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

interface MobileScheduleDayChipsProps {
    selectedDay: string;
    onDayChange: (day: string) => void;
    todayName: string;
}

export const MobileScheduleDayChips = ({ selectedDay, onDayChange, todayName }: MobileScheduleDayChipsProps) => (
    <div className="px-4 py-2 overflow-x-auto custom-scrollbar" dir="ltr">
        <div className="flex gap-1.5 min-w-max" dir="rtl">
            {DAYS_OF_WEEK.map(day => {
                const isActive = day === selectedDay;
                const isToday = day === todayName;
                return (
                    <motion.button key={day} whileTap={{ scale: 0.93 }}
                        onClick={() => { triggerHaptic('light'); onDayChange(day); }}
                        className={cn("px-3.5 py-2 rounded-card text-micro font-bold whitespace-nowrap transition-all border",
                            isActive ? "bg-primary text-on-primary border-primary shadow-soft shadow-primary/40" : "bg-card text-muted border-border/50")}>
                        {day}
                        {isToday && <span className={cn("ms-1.5 inline-block w-1.5 h-1.5 rounded-full", isActive ? "bg-white" : "bg-primary")} />}
                    </motion.button>
                );
            })}
        </div>
    </div>
);
