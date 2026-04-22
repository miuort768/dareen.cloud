import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

const StatCard = ({ label, value, icon: Icon, color, bg, trend }: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", bg)}>
            <Icon size={16} className={color} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{value}</p>
        <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{trend}</p>
    </div>
);

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" dir="rtl">
            <StatCard 
                label="إجمالي المعلمات" 
                value={totalTeachers} 
                icon={Users} 
                color="text-[#5c59f2]" 
                bg="bg-indigo-50 dark:bg-indigo-900/20"
                trend="الكوادر النشطة"
            />
            <StatCard 
                label="عدد الطلاب" 
                value={totalStudents} 
                icon={UserPlus} 
                color="text-emerald-500" 
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                trend="منتسب حالي"
            />
            <StatCard 
                label="التخصصات" 
                value={uniqueSubjects} 
                icon={BookOpen} 
                color="text-purple-500" 
                bg="bg-purple-50 dark:bg-purple-900/20"
                trend="تنوع أكاديمي"
            />
            <StatCard 
                label="متوسط السعر" 
                value={`${averagePrice} ج.م`} 
                icon={DollarSign} 
                color="text-amber-500" 
                bg="bg-amber-50 dark:bg-amber-900/20"
                trend="لكل حصة"
            />
        </div>
    );
};
