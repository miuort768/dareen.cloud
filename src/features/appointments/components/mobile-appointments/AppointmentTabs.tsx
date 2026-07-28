import { motion } from 'framer-motion';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { triggerHaptic } from '../../../../lib/haptics';

interface AppointmentTabsProps {
    activeTab: 'upcoming' | 'completed';
    onTabChange: (tab: 'upcoming' | 'completed') => void;
    totalCount: number;
    completedCount: number;
    setSearchTerm: (v: string) => void;
}

export const AppointmentTabs = ({ activeTab, onTabChange, totalCount, completedCount, setSearchTerm }: AppointmentTabsProps) => (
    <div className="px-4 pb-2">
        <div className="flex bg-surface rounded-2xl p-1 gap-1">
            {[
                { id: 'upcoming' as const, label: 'المواعيد', badge: totalCount - completedCount },
                { id: 'completed' as const, label: 'المكتملة', badge: completedCount },
            ].map(tab => (
                <motion.button key={tab.id}
                    onClick={() => { triggerHaptic('light'); onTabChange(tab.id); setSearchTerm(''); }}
                    whileTap={{ scale: 0.96 }}
                    className={cn("flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-all duration-300 relative rounded-xl",
                        activeTab === tab.id ? "bg-card shadow-elevation-1 text-primary font-bold" : "text-muted font-medium"
                    )}>
                    {tab.id === 'upcoming' ? <Calendar size={14} strokeWidth={1.5} /> : <CheckCircle2 size={14} strokeWidth={1.5} />}
                    <span className="text-micro">{tab.label}</span>
                    {tab.badge > 0 && (
                        <span className={cn("text-micro font-bold px-1.5 py-0.5 rounded-full",
                            activeTab === tab.id ? "bg-primary text-on-primary" : "bg-surface text-muted"
                        )}>{tab.badge}</span>
                    )}
                </motion.button>
            ))}
        </div>
    </div>
);
