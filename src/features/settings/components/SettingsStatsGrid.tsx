import { Moon, Server, Users, Database } from 'lucide-react';

interface SettingsStatsGridProps {
    usersCount: number;
    theme: string;
    autoBackup: boolean;
}

const statCards = [
    { label: 'المستخدمين النشطين', key: 'users', icon: Users, color: '#2563EB' },
    { label: 'حالة النظام', key: 'server', icon: Server, color: '#10B981' },
    { label: 'الوضع الليلي', key: 'theme', icon: Moon, color: '#8B5CF6' },
    { label: 'النسخ الاحتياطي', key: 'backup', icon: Database, color: '#F59E0B' },
] as const;

export const SettingsStatsGrid = ({ usersCount, theme, autoBackup }: SettingsStatsGridProps) => {
    const getValue = (key: string) => {
        switch (key) {
            case 'users': return usersCount;
            case 'server': return 'متصل';
            case 'theme': return theme === 'dark' ? 'مفعل' : 'معطل';
            case 'backup': return autoBackup ? 'تلقائي' : 'يدوي';
            default: return '';
        }
    };
    const getSub = (key: string) => {
        if (key === 'server') return 'قاعدة البيانات تعمل';
        return undefined;
    };
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map(s => (
                <div key={s.key} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm p-3 flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}12` }}>
                        <s.icon size={16} style={{ color: s.color }} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 leading-none">{s.label}</p>
                        <p className="text-sm font-black mt-1 leading-none" style={{ color: s.color }}>{getValue(s.key)}</p>
                        {getSub(s.key) && <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-none">{getSub(s.key)}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};
