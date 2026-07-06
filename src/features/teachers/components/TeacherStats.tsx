import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

const statCards = [
    { label: 'إجمالي المعلمات', icon: Users, gradient: 'bg-primary' },
    { label: 'عدد الطلاب', icon: UserPlus, gradient: 'bg-success' },
    { label: 'التخصصات', icon: BookOpen, gradient: 'bg-info' },
    { label: 'متوسط السعر', icon: DollarSign, gradient: 'bg-warning' },
];

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    const values = [totalTeachers, totalStudents, uniqueSubjects, `${averagePrice} ج.م`];
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-0 mb-8" dir="rtl">
            {statCards.map((s, i) => (
                <div key={s.label} className={cn('flex items-center gap-3 p-4 rounded-2xl shadow-sm', s.gradient)}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white/15 backdrop-blur-sm border border-white/10">
                        <s.icon size={20} className="text-on-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-micro font-bold text-on-primary opacity-70 leading-none">{s.label}</p>
                        <p className="text-2xl font-black text-on-primary tabular-nums mt-1">{values[i]}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
