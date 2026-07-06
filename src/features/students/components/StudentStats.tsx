import { Users, GraduationCap, UserCheck, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentStatsProps {
    totalStudents: number;
    activeEnrollments: number;
    uniqueGrades: number;
    averageSessionsPerStudent: number;
}

const statClass: Record<string, string> = {
  'إجمالي القوة الطلابية': 'bg-primary',
  'التراخيص النشطة': 'bg-success',
  'التنوع الأكاديمي': 'bg-info',
  'الكثافة التشغيلية': 'bg-warning',
};

const StatItem = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: React.ComponentType<{ size?: number }> }) => {
    const bgClass = statClass[label] || 'bg-primary';
    return (
        <div className={cn("flex items-center gap-3 shadow-sm p-4 transition-all hover:shadow-md rounded-2xl", bgClass)}>
            <div className="w-11 h-11 flex items-center justify-center shrink-0 shadow-sm rounded-2xl bg-white/15 text-inverse">
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-micro font-bold text-inverse opacity-70 leading-none">{label}</p>
                <p className="text-xl font-black text-inverse tabular-nums mt-1">{value}</p>
            </div>
        </div>
    );
};

export const StudentStats = ({ totalStudents, activeEnrollments, uniqueGrades, averageSessionsPerStudent }: StudentStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
            <StatItem label="إجمالي القوة الطلابية" value={totalStudents} icon={Users} />
            <StatItem label="التراخيص النشطة" value={activeEnrollments} icon={UserCheck} />
            <StatItem label="التنوع الأكاديمي" value={uniqueGrades} icon={GraduationCap} />
            <StatItem label="الكثافة التشغيلية" value={averageSessionsPerStudent} icon={BookOpen} />
        </div>
    );
};

