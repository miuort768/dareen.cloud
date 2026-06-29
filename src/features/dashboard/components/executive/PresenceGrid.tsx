import { memo } from 'react';
import { PresenceUser } from '../../services/executiveService';
import { Circle, Users } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    online: '#22c55e',
    away: '#f59e0b',
    offline: '#d1d5db',
};

export const PresenceGrid = memo(function PresenceGrid({ users, total }: { users: PresenceUser[]; total: number }) {
    if (!users) return null;

    return (
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">الحضور المباشر</h3>
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-500">{users.filter(u => u.status === 'online').length}/{total}</span>
                </div>
            </div>

            <div className="space-y-1">
                {users.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">لا يوجد متصلين</p>
                )}
                {users.map((user) => (
                    <div
                        key={user.userId}
                        className="flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                        <Circle size={10} style={{ color: STATUS_COLORS[user.status] || '#d1d5db' }} fill={(STATUS_COLORS[user.status] || '#d1d5db')} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user.name}</p>
                            <p className="text-[11px] text-gray-400">
                                {user.role === 'admin' ? 'مدير' : user.role === 'teacher' ? 'معلم' : user.role === 'parent' ? 'ولي أمر' : user.role === 'student' ? 'طالب' : user.role}
                                {user.teachingSubject && ` · ${user.teachingSubject}`}
                                {user.status === 'away' && ' · بعيد'}
                            </p>
                        </div>
                        {user.status === 'offline' && user.secondsAgo < 3600 && (
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">منذ {user.secondsAgo < 60 ? `${user.secondsAgo}ث` : `${Math.round(user.secondsAgo / 60)}د`}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
});
