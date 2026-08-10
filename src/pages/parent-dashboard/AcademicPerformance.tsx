import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, BookMarked, Star } from 'lucide-react';
import type { Student } from '../../types';

interface AcademicPerformanceProps {
    sessions: Student[];
    children: Student[];
    points: number;
    rank: { name: string };
}

const ProgressBar = ({ value, color, label, icon: Icon, max }: { value: number; color: string; label: string; icon: React.ElementType; max: number }) => {
    const percent = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${color}/10 flex items-center justify-center`}>
                        <Icon size={13} className={color} />
                    </div>
                    <span className="text-xs font-bold text-main dark:text-main">{label}</span>
                </div>
                <span className={`text-xs font-bold ${color}`}>{percent}%</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-border overflow-hidden">
                <motion.div
                    className={`absolute inset-y-0 start-0 rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

export const AcademicPerformance = ({ sessions, children: kids, points, rank }: AcademicPerformanceProps) => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const totalRecorded = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;
    const attendanceRate = totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0;

    let sessionsUsed = 0;
    let sessionsTotal = 0;
    kids.forEach(c => {
        (c.enrollments || []).forEach((en: { sessionsUsed?: number; sessionsTotal?: number }) => {
            sessionsUsed += Number(en.sessionsUsed || 0);
            sessionsTotal += Number(en.sessionsTotal || 0);
        });
    });

    const totalSubjects = kids.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);

    return (
        <div className="rounded-2xl bg-card dark:bg-card border border-border dark:border-primary/20 p-5 md:p-6 transition-all duration-300 hover:shadow-elevation-1">
            <h3 className="text-base md:text-[22px] font-bold text-main dark:text-main mb-5">التقدم الأكاديمي</h3>

            <div className="space-y-4">
                <ProgressBar
                    value={attendanceRate}
                    max={100}
                    color="text-success"
                    label="الحضور"
                    icon={CheckCircle2}
                />
                <ProgressBar
                    value={totalSubjects}
                    max={Math.max(totalSubjects, 1)}
                    color="text-info"
                    label="الواجبات"
                    icon={BookOpen}
                />
                <ProgressBar
                    value={sessionsUsed}
                    max={Math.max(sessionsTotal, 1)}
                    color="text-primary"
                    label="المنهج"
                    icon={BookMarked}
                />
                <ProgressBar
                    value={Math.min(points, 500)}
                    max={500}
                    color="text-warning"
                    label="XP"
                    icon={Star}
                />
            </div>

            <div className="mt-5 p-4 rounded-xl bg-gradient-to-l from-warning/10 via-warning/[0.03] to-surface dark:from-primary/10 dark:via-primary/[0.03] dark:to-card border border-warning/20 dark:border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                        <Star size={20} className="text-warning" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-main dark:text-main">{rank.name}</p>
                        <p className="text-xs text-muted dark:text-muted font-medium">{points} نقطة خبرة</p>
                    </div>
                </div>
                <span className="text-lg font-bold text-warning bg-warning/10 px-3 py-1.5 rounded-xl">{points}</span>
            </div>
        </div>
    );
};