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

const StatCard = ({ label, value, icon: Icon, sub, gradient, accent }: { label: string; value: string | number; icon: React.ComponentType<{ size?: number }>; sub?: string; gradient?: string; accent?: string }) => (
    <div className={cn("relative overflow-hidden rounded-none p-5 flex flex-col justify-between shadow-sm", gradient)}>
        {/* Background icon */}
        <div className="absolute -left-3 -bottom-3 opacity-10">
            <Icon size={70} />
        </div>
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
            <div className={cn("w-9 h-9 rounded-none flex items-center justify-center bg-white/20 backdrop-blur-sm")}>
                <Icon size={18} className="text-white" />
            </div>
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest text-left">{sub}</span>
        </div>
        {/* Value */}
        <div>
            <p className="text-2xl font-black text-white font-mono leading-none">{value}</p>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1.5">{label}</p>
        </div>
        {/* Bottom accent bar */}
        <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 opacity-40", accent)} />
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
            <StatCard
                label="إجمالي الطلاب"
                value={totalStudents}
                sub={`${totalEnrollments} اشتراك`}
                icon={Users}
                gradient="bg-gradient-to-br from-blue-600 to-blue-800"
                accent="bg-blue-300"
            />
            <StatCard
                label="الحصص المتوقعة"
                value={totalSessions}
                sub={`${completedSessions} مكتملة`}
                icon={Calendar}
                gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
                accent="bg-emerald-300"
            />
            <StatCard
                label="نسبة الحضور"
                value={attendanceRate + '%'}
                sub={`${cancelledSessions} غياب`}
                icon={TrendingUp}
                gradient="bg-gradient-to-br from-indigo-600 to-violet-800"
                accent="bg-indigo-300"
            />
            <StatCard
                label="الإيرادات الكلية"
                value={totalRevenue.toLocaleString()}
                sub={`${monthRevenue.toLocaleString()} ج.م/شهر`}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-amber-500 to-orange-700"
                accent="bg-amber-300"
            />
        </div>
    );
};
