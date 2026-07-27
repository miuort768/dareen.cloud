import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

const statConfig = [
    { label: 'المعلمات', icon: Users, bg: 'bg-primary-soft', text: 'text-primary', ring: 'ring-primary/20' },
    { label: 'الطلاب', icon: UserPlus, bg: 'bg-success-soft', text: 'text-success', ring: 'ring-success/20' },
    { label: 'التخصصات', icon: BookOpen, bg: 'bg-info-soft', text: 'text-info', ring: 'ring-info/20' },
    { label: 'متوسط السعر', icon: DollarSign, bg: 'bg-warning-soft', text: 'text-warning', ring: 'ring-warning/20' },
];

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    const values = [totalTeachers, totalStudents, uniqueSubjects, `${averagePrice} ج.م`];
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {statConfig.map((stat, i) => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-2.5 font-dash">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1", stat.bg, stat.ring)}>
                        <stat.icon size={16} strokeWidth={1.5} className={stat.text} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted truncate">{stat.label}</p>
                        <p className="text-sm font-bold text-main tabular-nums">{values[i]}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
