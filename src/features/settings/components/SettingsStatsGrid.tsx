import { Moon, Server, Users, Database } from 'lucide-react';
import { StatsCard } from '../../../shared/components/StatsCard';

interface SettingsStatsGridProps {
    usersCount: number;
    theme: string;
    autoBackup: boolean;
}

export const SettingsStatsGrid = ({ usersCount, theme, autoBackup }: SettingsStatsGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                title="المستخدمين النشطين"
                value={usersCount}
                icon={Users}
                color="blue"
            />
            <StatsCard
                title="حالة النظام"
                value="متصل"
                icon={Server}
                color="emerald"
                trend="قاعدة البيانات تعمل"
            />
            <StatsCard
                title="الوضع الليلي"
                value={theme === 'dark' ? 'مفعل' : 'معطل'}
                icon={Moon}
                color="purple"
            />
            <StatsCard
                title="النسخ الاحتياطي"
                value={autoBackup ? 'تلقائي' : 'يدوي'}
                icon={Database}
                color="amber"
            />
        </div>
    );
};
