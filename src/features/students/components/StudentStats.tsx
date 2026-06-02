import { Users, GraduationCap, UserCheck, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentStatsProps {
    totalStudents: number;
    activeEnrollments: number;
    uniqueGrades: number;
    averageSessionsPerStudent: number;
}

const statSettings: Record<string, { color: string }> = {
  'إجمالي القوة الطلابية': { color: '#2563EB' },
  'التراخيص النشطة': { color: '#22C55E' },
  'التنوع الأكاديمي': { color: '#8B5CF6' },
  'الكثافة التشغيلية': { color: '#F59E0B' },
};

const StatItem = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: React.ComponentType<{ size?: number }> }) => {
    const { color } = statSettings[label] || { color: '#2563EB' };
    return (
        <div className="flex items-center gap-3 shadow-sm p-4 transition-all hover:shadow-md rounded-none dark:brightness-[0.65]" style={{ backgroundColor: color }}>
            <div className="w-11 h-11 flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-white/70 leading-none">{label}</p>
                <p className="text-xl font-black text-white tabular-nums mt-1">{value}</p>
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

