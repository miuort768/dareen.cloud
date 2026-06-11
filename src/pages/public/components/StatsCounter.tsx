import { Users, GraduationCap, BookOpen, Award } from 'lucide-react';
import { useAnimatedNumber } from '../../../shared/hooks/useAnimatedNumber';

type StatProps = { icon: any; target: number; suffix: string; label: string };

const StatCard = ({ icon: Icon, target, suffix, label }: StatProps) => {
    const { value, ref } = useAnimatedNumber(target);
    return (
        <div ref={ref} className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center group hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 md:w-7 md:h-7 text-indigo-600 dark:text-indigo-400" />
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
        { icon: Users, target: 5000, suffix: '+', label: 'طالب مسجل' },
        { icon: GraduationCap, target: 200, suffix: '+', label: 'معلم معتمد' },
        { icon: BookOpen, target: 10000, suffix: '+', label: 'حصة تعليمية' },
        { icon: Award, target: 5, suffix: '+', label: 'سنوات من التميز' },
    ];

    return (
        <section className="py-4 md:py-6 relative overflow-hidden bg-[#F8F8FC] dark:bg-slate-950 transition-colors duration-500">
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
