import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

const StatCard = ({ label, value, icon: Icon, color, bg, trend, borderColor }: any) => (
    <div className={cn(
        "bg-white dark:bg-slate-900 border-x border-b border-slate-100 dark:border-slate-800 p-6 rounded-none shadow-sm flex flex-col items-start relative overflow-hidden transition-all hover:shadow-md",
        borderColor
    )}>
        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center mb-4 border border-white/10 shadow-sm", bg)}>
            <Icon size={18} className={color} />
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-xl font-black text-slate-800 dark:text-white mt-1 tracking-tighter italic">{value}</p>
        <div className="mt-4 flex items-center gap-1.5">
            <span className={cn("w-1 h-1 rounded-full", color.replace('text-', 'bg-'))}></span>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{trend}</p>
        </div>
    </div>
);

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6 mb-8" dir="rtl">
            <StatCard 
                label="إجمالي المعلمات" 
                value={totalTeachers} 
                icon={Users} 
                color="text-[#5c59f2]" 
                bg="bg-indigo-50 dark:bg-indigo-900/20"
                borderColor="border-t-4 border-t-[#5c59f2]"
                trend="الكوادر النشطة"
            />
            <StatCard 
                label="عدد الطلاب" 
                value={totalStudents} 
                icon={UserPlus} 
                color="text-emerald-500" 
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                borderColor="border-t-4 border-t-emerald-500"
                trend="منتسب حالي"
            />
            <StatCard 
                label="التخصصات" 
                value={uniqueSubjects} 
                icon={BookOpen} 
                color="text-fuchsia-500" 
                bg="bg-fuchsia-50 dark:bg-fuchsia-900/20"
                borderColor="border-t-4 border-t-fuchsia-500"
                trend="تنوع أكاديمي"
            />
            <StatCard 
                label="متوسط السعر" 
                value={`${averagePrice} ج.م`} 
                icon={DollarSign} 
                color="text-amber-500" 
                bg="bg-amber-50 dark:bg-amber-900/20"
                borderColor="border-t-4 border-t-amber-500"
                trend="لكل حصة"
            />
        </div>
    );
};
