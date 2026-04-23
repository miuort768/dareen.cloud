import { Users, GraduationCap, UserCheck, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentStatsProps {
    totalStudents: number;
    activeEnrollments: number;
    uniqueGrades: number;
    averageSessionsPerStudent: number;
}

const StatItem = ({ label, value, icon: Icon, color, symbol, bg, borderAccent }: { label: string, value: string | number, icon: any, color: string, symbol: string, bg: string, borderAccent: string }) => (
    <div className={cn("bg-white dark:bg-slate-900 border-x border-b border-slate-100 dark:border-slate-800 p-3 rounded-none shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow relative overflow-hidden", borderAccent)}>
        <div className={cn("absolute -right-2 -bottom-4 text-5xl font-black opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none italic", color)}>
            {value}
        </div>
        <div className={cn("w-6 h-6 rounded-none flex items-center justify-center mb-1.5 relative z-10", bg)}>
            <Icon size={12} className={color} />
        </div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest relative z-10">{label}</p>
        <p className={cn("text-sm font-black mt-0.5 relative z-10", color)}>{value} <span className="text-[8px] font-bold text-slate-400">{symbol}</span></p>
    </div>
);

export const StudentStats = ({ totalStudents, activeEnrollments, uniqueGrades, averageSessionsPerStudent }: StudentStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6 mb-6">
            <StatItem 
                label="إجمالي القوة الطلابية" 
                value={totalStudents} 
                icon={Users} 
                color="text-indigo-600 dark:text-indigo-400" 
                bg="bg-indigo-50 dark:bg-indigo-900/20"
                borderAccent="border-t-2 border-t-indigo-500"
                symbol="طالب"
            />
            <StatItem 
                label="التراخيص النشطة" 
                value={activeEnrollments} 
                icon={UserCheck} 
                color="text-emerald-600 dark:text-emerald-400" 
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                borderAccent="border-t-2 border-t-emerald-500"
                symbol="عقد"
            />
            <StatItem 
                label="التنوع الأكاديمي" 
                value={uniqueGrades} 
                icon={GraduationCap} 
                color="text-fuchsia-600 dark:text-fuchsia-400" 
                bg="bg-fuchsia-50 dark:bg-fuchsia-900/20"
                borderAccent="border-t-2 border-t-fuchsia-500"
                symbol="مرحلة"
            />
            <StatItem 
                label="الكثافة التشغيلية" 
                value={averageSessionsPerStudent} 
                icon={BookOpen} 
                color="text-amber-600 dark:text-amber-400" 
                bg="bg-amber-50 dark:bg-amber-900/20"
                borderAccent="border-t-2 border-t-amber-500"
                symbol="ساعة"
            />
        </div>
    );
};
