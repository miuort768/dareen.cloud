import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    const stats = [
        { label: 'إجمالي المعلمات', value: totalTeachers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50/50', border: 'border-indigo-100', trend: 'نمو مستمر' },
        { label: 'عدد الطلاب', value: totalStudents, icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100', trend: 'نشط الآن' },
        { label: 'التخصصات', value: uniqueSubjects, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50/50', border: 'border-purple-100', trend: 'تنوع أكاديمي' },
        { label: 'متوسط السعر', value: `${averagePrice} ج.م`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100', trend: 'لكل حصة' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
            {stats.map((stat, i) => (
                <div key={i} className={cn(
                    "relative overflow-hidden bg-white dark:bg-slate-900 border-r-4 p-4 shadow-sm transition-all hover:shadow-md",
                    stat.border.replace('border-', 'border-r-')
                )}>
                    {/* Background Accent */}
                    <div className={cn("absolute -right-4 -top-4 w-12 h-12 rounded-full blur-2xl opacity-20", stat.color.replace('text-', 'bg-'))}></div>
                    
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className={cn("w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800")}>
                                <stat.icon size={16} className={stat.color} />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{stat.trend}</span>
                        </div>
                        
                        <div className="mt-1">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{stat.label}</h4>
                            <p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{stat.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
