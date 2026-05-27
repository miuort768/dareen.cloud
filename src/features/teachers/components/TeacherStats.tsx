import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

const statSettings: Record<string, { color: string }> = {
  'إجمالي المعلمات': { color: '#8B5CF6' },
  'عدد الطلاب': { color: '#22C55E' },
  'التخصصات': { color: '#2563EB' },
  'متوسط السعر': { color: '#F59E0B' },
};

const StatCard = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ size?: number }> }) => {
    const { color } = statSettings[label] || { color: '#8B5CF6' };
    return (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 p-4 transition-all hover:shadow-md">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12`, color }}>
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#64748B] leading-none">{label}</p>
                <p className="text-2xl font-black text-[#0F172A] dark:text-white tabular-nums mt-1" style={{ color }}>{value}</p>
            </div>
        </div>
    );
};

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-0 mb-8" dir="rtl">
            <StatCard label="إجمالي المعلمات" value={totalTeachers} icon={Users} />
            <StatCard label="عدد الطلاب" value={totalStudents} icon={UserPlus} />
            <StatCard label="التخصصات" value={uniqueSubjects} icon={BookOpen} />
            <StatCard label="متوسط السعر" value={`${averagePrice} ج.م`} icon={DollarSign} />
        </div>
    );
};

