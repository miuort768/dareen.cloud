import { Users, GraduationCap, UserCheck, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentStatsProps {
    totalStudents: number;
    activeEnrollments: number;
    uniqueGrades: number;
    averageSessionsPerStudent: number;
}

const statConfig = [
    { label: 'الطلاب', icon: Users, bg: 'bg-info-soft', text: 'text-info', ring: 'ring-info/20' },
    { label: 'الاشتراكات', icon: UserCheck, bg: 'bg-success-soft', text: 'text-success', ring: 'ring-success/20' },
    { label: 'المراحل', icon: GraduationCap, bg: 'bg-primary-soft', text: 'text-primary', ring: 'ring-primary/20' },
    { label: 'متوسط الحصص', icon: BookOpen, bg: 'bg-warning-soft', text: 'text-warning', ring: 'ring-warning/20' },
];

export const StudentStats = ({ totalStudents, activeEnrollments, uniqueGrades, averageSessionsPerStudent }: StudentStatsProps) => {
    const values = [totalStudents, activeEnrollments, uniqueGrades, averageSessionsPerStudent];
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {statConfig.map((stat, i) => (
                <div key={stat.label} className={cn("flex items-center gap-2.5 p-3 bg-card border border-border rounded-2xl")}>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1", stat.bg, stat.ring)}>
                        <stat.icon size={16} strokeWidth={1.5} className={stat.text} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted truncate">{stat.label}</p>
                        <p className="text-sm font-bold text-main tabular-nums font-dash">{values[i]}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
