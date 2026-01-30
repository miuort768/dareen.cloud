import { Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';

interface TeacherStatsProps {
    totalTeachers: number;
    totalStudents: number;
    uniqueSubjects: number;
    averagePrice: number;
}

export const TeacherStats = ({ totalTeachers, totalStudents, uniqueSubjects, averagePrice }: TeacherStatsProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatsCard
                title="عدد المعلمات"
                value={totalTeachers}
                icon={Users}
                color="emerald"
                trend={`${totalTeachers > 0 ? '+1' : '0'}`}
                trendUp={true}
                className="rounded-none"
            />
            <StatsCard
                title="إجمالي الطلاب"
                value={totalStudents}
                icon={UserPlus}
                color="blue"
                trend="نشط"
                className="rounded-none"
            />
            <StatsCard
                title="المواد المقدمة"
                value={uniqueSubjects}
                icon={BookOpen}
                color="purple"
                trend="تنوع"
                className="rounded-none"
            />
            <StatsCard
                title="متوسط السعر"
                value={`${averagePrice} ج.م`}
                icon={DollarSign}
                color="amber"
                trend="للحصة"
                className="rounded-none"
            />
        </div>
    );
};
