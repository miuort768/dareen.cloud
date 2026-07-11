import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

const statCards = [
    { label: 'إجمالي المعلمات', icon: Users, iconBg: 'bg-primary-soft', iconColor: 'text-primary', valueColor: 'text-primary' },
    { label: 'عدد الطلاب', icon: UserPlus, iconBg: 'bg-success-soft', iconColor: 'text-success', valueColor: 'text-success' },
    { label: 'التخصصات', icon: BookOpen, iconBg: 'bg-info-soft', iconColor: 'text-info', valueColor: 'text-info' },
    { label: 'متوسط السعر', icon: DollarSign, iconBg: 'bg-warning-soft', iconColor: 'text-warning', valueColor: 'text-warning' },
];

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    const values = [totalTeachers, totalStudents, uniqueSubjects, `${averagePrice} ج.م`];
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6" dir="rtl">
            {statCards.map((s, i) => (
                <div key={s.label} className="bg-card border border-border/50 shadow-soft rounded-card p-4 flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-card flex items-center justify-center shrink-0 ${s.iconBg}`}>
                        <s.icon size={20} className={s.iconColor} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-muted leading-none">{s.label}</p>
                        <p className={`text-xl font-bold font-heading tabular-nums mt-1 ${s.valueColor}`}>{values[i]}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
