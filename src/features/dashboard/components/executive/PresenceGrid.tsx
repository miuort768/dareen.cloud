import { memo } from 'react';
import { PresenceUser } from '../../services/executiveService';
import { Circle, Users } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    online: 'var(--bg-success)',
    away: 'var(--bg-warning)',
    offline: 'var(--border-strong)',
};

export const PresenceGrid = memo(function PresenceGrid({ users, total }: { users: PresenceUser[]; total: number }) {
    if (!users) return null;

    return (
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:bg-card border border-border dark:border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted dark:text-muted">الحضور المباشر</h3>
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-muted" />
                    <span className="text-xs font-medium text-muted">{users.filter(u => u.status === 'online').length}/{total}</span>
                </div>
            </div>

            <div className="space-y-1">
                {users.length === 0 && (
                    <p className="text-xs text-muted dark:text-muted text-center py-4">لا يوجد متصلين</p>
                )}
                {users.map((user) => (
                    <div
                        key={user.userId}
                        className="flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-surface dark:hover:bg-card/50"
                    >
                        <Circle size={10} style={{ color: STATUS_COLORS[user.status] || 'var(--border-strong)' }} fill={(STATUS_COLORS[user.status] || 'var(--border-strong)')} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-main dark:text-on-primary truncate">{user.name}</p>
                            <p className="text-[11px] text-muted">
                                {user.role === 'admin' ? 'مدير' : user.role === 'teacher' ? 'معلم' : user.role === 'parent' ? 'ولي أمر' : user.role === 'student' ? 'طالب' : user.role}
                                {user.teachingSubject && ` · ${user.teachingSubject}`}
                                {user.status === 'away' && ' · بعيد'}
                            </p>
                        </div>
                        {user.status === 'offline' && user.secondsAgo < 3600 && (
                            <span className="text-[10px] text-muted whitespace-nowrap">منذ {user.secondsAgo < 60 ? `${user.secondsAgo}ث` : `${Math.round(user.secondsAgo / 60)}د`}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
});
