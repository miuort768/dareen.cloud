import { Users, GraduationCap, TrendingUp, UserCheck, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentStatsProps {
    totalStudents: number;
    activeEnrollments: number;
    uniqueGrades: number;
    averageSessionsPerStudent: number;
}

export const StudentStats = ({ totalStudents, activeEnrollments, uniqueGrades, averageSessionsPerStudent }: StudentStatsProps) => {
    const stats = [
        {
            label: 'إجمالي القوة الطلابية',
            value: totalStudents,
            icon: Users,
            color: 'slate',
            symbol: 'طالب'
        },
        {
            label: 'التراخيص النشطة',
            value: activeEnrollments,
            icon: UserCheck,
            color: 'emerald',
            symbol: 'عقد'
        },
        {
            label: 'التنوع الأكاديمي',
            value: uniqueGrades,
            icon: GraduationCap,
            color: 'indigo',
            symbol: 'مرحلة'
        },
        {
            label: 'الكثافة التشغيلية',
            value: averageSessionsPerStudent,
            icon: BookOpen,
            color: 'rose',
            symbol: 'ساعة'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
                <div 
                    key={i}
                    className="group bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.02)] hover:border-slate-900 dark:hover:border-white transition-all relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 -skew-x-12 translate-x-12 -translate-y-12"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className={cn(
                                "w-12 h-12 flex items-center justify-center border-2 shadow-sm transition-transform group-hover:rotate-6",
                                stat.color === 'slate' ? "border-slate-900 text-slate-900 dark:border-white dark:text-white" :
                                stat.color === 'emerald' ? "border-emerald-500 text-emerald-500" :
                                stat.color === 'indigo' ? "border-indigo-500 text-indigo-500" : "border-rose-500 text-rose-500"
                            )}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 font-mono italic">0{i+1}</span>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2 italic">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white font-mono italic tracking-tighter leading-none">
                                    {stat.value}
                                </h3>
                                <span className={cn(
                                    "text-[10px] font-black uppercase italic leading-none",
                                    stat.color === 'emerald' ? "text-emerald-500" : "text-indigo-500"
                                )}>
                                    {stat.symbol}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                             <div className="flex items-center gap-2">
                                <TrendingUp size={12} className="text-emerald-500" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">نمو مستقر +١٢٪</span>
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
