import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

const StatCard = ({ label, value, icon: Icon, color, bg, trend, borderColor }: { label: string; value: string | number; icon: React.ComponentType<{ size?: number }>; color: string; bg: string; trend?: string; borderColor?: string }) => (
    <div className={cn(
        "bg-white dark:bg-slate-900 border-x border-b border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm relative overflow-hidden transition-all hover:shadow-sm group",
        borderColor
    )}>
        {/* Background Large Digit Accent */}
        <div className={cn("absolute -left-2 -bottom-4 text-6xl font-medium opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none italic", color)}>
            {typeof value === 'number' ? value : value.split(' ')[0]}
        </div>

        <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col gap-2">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 shadow-sm", bg)}>
                    <Icon size={14} className={color} />
                </div>
                <p className="text-[8px] font-medium text-slate-400 uppercase tracking-[0.2em]">{label}</p>
            </div>
            
            <div className="text-left flex flex-col items-end">
                <p className={cn("text-2xl font-medium tracking-tighter italic leading-none mb-1", color)}>
                    {value}
                </p>
                <div className="flex items-center gap-1.5">
                    <p className="text-[7px] font-medium text-slate-400 uppercase tracking-widest">{trend}</p>
                    <span className={cn("w-1 h-1 rounded-full", color.replace('text-', 'bg-'))}></span>
                </div>
            </div>
        </div>
    </div>
);

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-0 mb-8" dir="rtl">
            <StatCard 
                label="إجمالي المعلمات" 
                value={totalTeachers} 
                icon={Users} 
                color="text-[#2563EB]" 
                bg="bg-blue-50 dark:bg-blue-900/20"
                borderColor="border-t-4 border-t-[#2563EB]"
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

