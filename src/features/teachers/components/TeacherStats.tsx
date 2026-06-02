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
        <div className="flex items-center gap-3 shadow-sm p-4 transition-all hover:shadow-md rounded-none dark:brightness-[0.65]" style={{ backgroundColor: color }}>
            <div className="w-11 h-11 flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-white/70 leading-none">{label}</p>
                <p className="text-2xl font-black text-white tabular-nums mt-1">{value}</p>
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

