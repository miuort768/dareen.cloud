import { memo } from 'react';
import type { PresenceUser } from '../../services/executiveService';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_DOT: Record<string, string> = {
    online: 'bg-success',
    away: 'bg-warning',
    offline: 'bg-muted',
};

const STATUS_BG: Record<string, string> = {
    online: 'bg-success-soft',
    away: 'bg-warning-soft',
    offline: 'bg-surface',
};

const STATUS_TEXT: Record<string, string> = {
    online: 'text-success',
    away: 'text-warning',
    offline: 'text-muted',
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
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center">
                        <Users size={16} className="text-success" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main">الحضور المباشر</h3>
                        <p className="text-[10px] text-muted">المتصلون الآن</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-success-soft border border-success/20">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold tabular-nums text-success">{onlineCount}/{total}</span>
                </div>
            </div>

            <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
                {users.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-surface flex items-center justify-center">
                            <Users size={16} className="text-muted/50" />
                        </div>
                        <p className="text-xs font-bold text-muted">لا يوجد متصلين</p>
                    </div>
                )}
                {users.map((user) => {
                    const initials = getInitials(user.name);
                    return (
                        <div key={user.userId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface transition-colors">
                            <div className="relative shrink-0">
                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold", STATUS_BG[user.status] || 'bg-surface', STATUS_TEXT[user.status] || 'text-muted')}>
                                    {initials}
                                </div>
                                {user.status === 'online' && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card">
                                        <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-40" />
                                    </span>
                                )}
                                {user.status === 'away' && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-warning border-2 border-card" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-main truncate">{user.name}</p>
                                <p className="text-[10px] text-muted">
                                    {ROLE_LABELS[user.role] || user.role}
                                    {user.teachingSubject && ` · ${user.teachingSubject}`}
                                </p>
                            </div>
                            {user.status === 'offline' && user.secondsAgo < 3600 && (
                                <span className="text-[9px] text-muted whitespace-nowrap tabular-nums">
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
