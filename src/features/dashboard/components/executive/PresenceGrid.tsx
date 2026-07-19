import { memo } from 'react';
import type { PresenceUser } from '../../services/executiveService';
import { Users } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    online: 'var(--bg-success)',
    away: 'var(--bg-warning)',
    offline: 'var(--text-muted)',
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
        <div className="bg-card border border-border/50 shadow-soft rounded-card p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-muted" />
                    <h3 className="text-xs text-muted">الحضور المباشر</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft border border-success/20">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-micro font-semibold text-success">{onlineCount}/{total}</span>
                </div>
            </div>

            <div className="space-y-1">
                {users.length === 0 && (
                    <p className="text-xs text-muted text-center py-8">لا يوجد متصلين</p>
                )}
                {users.map((user) => {
                    const statusColor = STATUS_COLORS[user.status] || 'var(--text-muted)';
                    const initials = getInitials(user.name);
                    const isOnline = user.status === 'online';
                    return (
                        <div
                            key={user.userId}
                            className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-surface/50 group"
                        >
                            <div className="relative flex-shrink-0">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm"
                                    style={{
                                        backgroundColor: statusColor + '20',
                                        color: statusColor,
                                    }}
                                >
                                    {initials}
                                </div>
                                {isOnline && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card">
                                        <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-40" />
                                    </span>
                                )}
                                {user.status === 'away' && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-warning border-2 border-card" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-main truncate">{user.name}</p>
                                <p className="text-xs text-muted">
                                    {ROLE_LABELS[user.role] || user.role}
                                    {user.teachingSubject && ` · ${user.teachingSubject}`}
                                    {user.status === 'away' && ' · بعيد'}
                                </p>
                            </div>
                            {user.status === 'offline' && user.secondsAgo < 3600 && (
                                <span className="text-micro text-muted whitespace-nowrap">
                                    منذ {user.secondsAgo < 60 ? `${user.secondsAgo}ث` : `${Math.round(user.secondsAgo / 60)}د`}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
