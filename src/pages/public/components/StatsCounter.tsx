import { Users, GraduationCap, BookOpen, Award } from 'lucide-react';
import { useAnimatedNumber } from '../../../shared/hooks/useAnimatedNumber';

const colors = [
    { card: 'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-900', icon: 'bg-indigo-100 dark:bg-indigo-900/50', iconColor: 'text-indigo-600 dark:text-indigo-400' },
    { card: 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900', icon: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { card: 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900', icon: 'bg-amber-100 dark:bg-amber-900/50', iconColor: 'text-amber-600 dark:text-amber-400' },
    { card: 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/40 dark:to-slate-900', icon: 'bg-rose-100 dark:bg-rose-900/50', iconColor: 'text-rose-600 dark:text-rose-400' },
];

type StatProps = { icon: any; target: number; suffix: string; label: string; colorIndex: number };

const StatCard = ({ icon: Icon, target, suffix, label, colorIndex }: StatProps) => {
    const { value, ref } = useAnimatedNumber(target);
    const c = colors[colorIndex];
    return (
        <div ref={ref} className={`${c.card} rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100/50 dark:border-slate-800 flex flex-col items-center text-center group hover:shadow-md hover:-translate-y-0.5 transition-all`}>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${c.icon} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 md:w-7 md:h-7 ${c.iconColor}`} />
            </div>
            <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white font-heading tabular-nums">
                {value}{suffix}
            </span>
            <span className="text-xs md:text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">{label}</span>
        </div>
    );
};

export const StatsCounter = () => {
    const stats: StatProps[] = [
        { icon: Users, target: 5000, suffix: '+', label: 'طالب مسجل', colorIndex: 0 },
        { icon: GraduationCap, target: 200, suffix: '+', label: 'معلم معتمد', colorIndex: 1 },
        { icon: BookOpen, target: 10000, suffix: '+', label: 'حصة تعليمية', colorIndex: 2 },
        { icon: Award, target: 5, suffix: '+', label: 'سنوات من التميز', colorIndex: 3 },
    ];

    return (
        <section className="pt-0 pb-4 md:pt-0 md:pb-6 relative overflow-hidden bg-[#F8F8FC] dark:bg-slate-950 transition-colors duration-500">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {stats.map((s) => (
                            <StatCard key={s.label} {...s} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
