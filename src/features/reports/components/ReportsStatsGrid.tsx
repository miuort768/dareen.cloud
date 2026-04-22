import { Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ReportsStatsGridProps {
    totalStudents: number;
    totalEnrollments: number;
    totalSessions: number;
    completedSessions: number;
    attendanceRate: number;
    cancelledSessions: number;
    totalRevenue: number;
    monthRevenue: number;
}

const CompactStat = ({ label, value, icon: Icon, sub, color, bg }: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm flex flex-col items-center text-center">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", bg)}>
            <Icon size={16} className={color} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
        <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-[8px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
);

export const ReportsStatsGrid = ({
    totalStudents,
    totalEnrollments,
    totalSessions,
    completedSessions,
    attendanceRate,
    cancelledSessions,
    totalRevenue,
    monthRevenue
}: ReportsStatsGridProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <CompactStat
                label="إجمالي الطلاب"
                value={totalStudents}
                sub={`اشتراكات: ${totalEnrollments}`}
                icon={Users}
                color="text-blue-500"
                bg="bg-blue-50 dark:bg-blue-900/20"
            />
            <CompactStat
                label="الحصص المتوقعة"
                value={totalSessions}
                sub={`مكتملة: ${completedSessions}`}
                icon={Calendar}
                color="text-emerald-500"
                bg="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <CompactStat
                label="نسبة الحضور"
                value={attendanceRate + '%'}
                sub={`غياب: ${cancelledSessions}`}
                icon={TrendingUp}
                color="text-[#5c59f2]"
                bg="bg-[#eef2ff] dark:bg-indigo-900/30"
            />
            <CompactStat
                label="الإيرادات"
                value={totalRevenue.toLocaleString() + ' ج.م'}
                sub={`${monthRevenue.toLocaleString()} ج.م هذا الشهر`}
                icon={DollarSign}
                color="text-amber-500"
                bg="bg-amber-50 dark:bg-amber-900/20"
            />
        </div>
    );
};
