import { memo } from 'react';
import { PresenceUser } from '../../services/executiveService';
import { Users } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    online: 'var(--bg-success)',
    away: 'var(--bg-warning)',
    offline: 'var(--border-strong)',
};

const ROLE_LABELS: Record<string, string> = {
    admin: 'مدير',
    teacher: 'معلم',
    parent: 'ولي أمر',
    student: 'طالب',
};

function getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
}

export const PresenceGrid = memo(function PresenceGrid({ users, total }: { users: PresenceUser[]; total: number }) {
    if (!users) return null;
    const onlineCount = users.filter(u => u.status === 'online').length;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 dark:border-border/50 shadow-lg shadow-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-primary-soft/5 dark:from-success/5 dark:to-primary-soft/5 pointer-events-none" />
            <div className="relative p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-muted/60" />
                        <h3 className="text-sm font-semibold text-muted dark:text-muted/80">الحضور المباشر</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-micro font-semibold text-success">{onlineCount}/{total}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    {users.length === 0 && (
                        <p className="text-xs text-muted/50 dark:text-muted/30 text-center py-8">لا يوجد متصلين</p>
                    )}
                    {users.map((user) => {
                        const statusColor = STATUS_COLORS[user.status] || 'var(--border-strong)';
                        const initials = getInitials(user.name);
                        const isOnline = user.status === 'online';
                        return (
                            <div
                                key={user.userId}
                                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-surface/50 dark:hover:bg-card/30 group"
                            >
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                                        style={{
                                            backgroundColor: statusColor + '20',
                                            color: statusColor,
                                        }}
                                    >
                                        {initials}
                                    </div>
                                    {isOnline && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-white dark:border-card">
                                            <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-40" />
                                        </span>
                                    )}
                                    {user.status === 'away' && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-warning border-2 border-white dark:border-card" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-main dark:text-on-primary/90 truncate">{user.name}</p>
                                    <p className="text-xs text-muted/60 dark:text-muted/40">
                                        {ROLE_LABELS[user.role] || user.role}
                                        {user.teachingSubject && ` · ${user.teachingSubject}`}
                                        {user.status === 'away' && ' · بعيد'}
                                    </p>
                                </div>
                                {user.status === 'offline' && user.secondsAgo < 3600 && (
                                    <span className="text-micro text-muted/40 dark:text-muted/30 whitespace-nowrap">
                                        منذ {user.secondsAgo < 60 ? `${user.secondsAgo}ث` : `${Math.round(user.secondsAgo / 60)}د`}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
