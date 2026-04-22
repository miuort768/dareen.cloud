import React from 'react';
import { Users, GraduationCap, TrendingUp, UserCheck, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentStatsProps {
    totalStudents: number;
    activeEnrollments: number;
    uniqueGrades: number;
    averageSessionsPerStudent: number;
}

const StatItem = ({ label, value, icon: Icon, color, symbol, bg }: { label: string, value: string | number, icon: any, color: string, symbol: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", bg)}>
            <Icon size={16} className={color} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{value} <span className="text-[10px] font-bold text-slate-400">{symbol}</span></p>
    </div>
);

export const StudentStats = ({ totalStudents, activeEnrollments, uniqueGrades, averageSessionsPerStudent }: StudentStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6 mb-6">
            <StatItem 
                label="إجمالي القوة الطلابية" 
                value={totalStudents} 
                icon={Users} 
                color="text-slate-600" 
                bg="bg-slate-50 dark:bg-slate-800"
                symbol="طالب"
            />
            <StatItem 
                label="التراخيص النشطة" 
                value={activeEnrollments} 
                icon={UserCheck} 
                color="text-emerald-500" 
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                symbol="عقد"
            />
            <StatItem 
                label="التنوع الأكاديمي" 
                value={uniqueGrades} 
                icon={GraduationCap} 
                color="text-[#5c59f2]" 
                bg="bg-indigo-50 dark:bg-indigo-900/20"
                symbol="مرحلة"
            />
            <StatItem 
                label="الكثافة التشغيلية" 
                value={averageSessionsPerStudent} 
                icon={BookOpen} 
                color="text-rose-500" 
                bg="bg-rose-50 dark:bg-rose-900/20"
                symbol="ساعة"
            />
        </div>
    );
};
