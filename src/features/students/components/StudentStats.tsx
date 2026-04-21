import React from 'react';
import { Users, GraduationCap, Award, TrendingUp, UserCheck, BookOpen } from 'lucide-react';
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
            label: 'إجمالي الطلاب',
            value: totalStudents,
            icon: Users,
            color: 'indigo',
            desc: 'في قاعدة البيانات'
        },
        {
            label: 'الاشتراكات النشطة',
            value: activeEnrollments,
            icon: UserCheck,
            color: 'emerald',
            desc: 'طلاب مسجلون حالياً'
        },
        {
            label: 'المراحل الدراسية',
            value: uniqueGrades,
            icon: GraduationCap,
            color: 'amber',
            desc: 'تنوع أكاديمي'
        },
        {
            label: 'معدل الحصص',
            value: averageSessionsPerStudent,
            icon: BookOpen,
            color: 'purple',
            desc: 'لكل طالب شهرياً'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {stats.map((stat, i) => (
                <div 
                    key={i}
                    className="relative group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 rounded-none overflow-hidden"
                >
                    {/* Background Accent */}
                    <div className={cn(
                        "absolute top-0 left-0 w-1 h-full opacity-50",
                        stat.color === 'indigo' ? "bg-[#5c59f2]" :
                        stat.color === 'emerald' ? "bg-emerald-500" :
                        stat.color === 'amber' ? "bg-amber-500" : "bg-purple-500"
                    )}></div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">
                                    {stat.value}
                                </h3>
                                <TrendingUp size={12} className={cn(
                                    "opacity-20",
                                    stat.color === 'emerald' ? "text-emerald-500" : "text-[#5c59f2]"
                                )} />
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 italic mt-2">{stat.desc}</p>
                        </div>
                        <div className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-none shadow-inner rotate-3 group-hover:rotate-0 transition-transform",
                            stat.color === 'indigo' ? "bg-indigo-50 dark:bg-indigo-900/20 text-[#5c59f2]" :
                            stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                            stat.color === 'amber' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                        )}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
