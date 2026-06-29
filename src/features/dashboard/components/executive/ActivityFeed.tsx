import { memo, useRef, useEffect } from 'react';
import { ActivityItem } from '../../services/executiveService';
import { History, TrendingUp, UserPlus, CreditCard, Edit3, Trash2, GraduationCap, Lock } from 'lucide-react';

const ICON_MAP: Record<string, typeof History> = {
    person_add: UserPlus,
    payment: CreditCard,
    edit: Edit3,
    delete: Trash2,
    school: GraduationCap,
    lock: Lock,
    trending_up: TrendingUp,
};

const GROUP_COLORS: Record<string, string> = {
    user: '#3b82f6',
    session: '#22c55e',
    payment: '#f59e0b',
    system: '#6b7280',
};

export const ActivityFeed = memo(function ActivityFeed({ items }: { items: ActivityItem[] }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [items]);

    if (!items) return null;

    return (
        <div className="rounded-3xl p-5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">النشاطات</h3>
                <History size={18} className="text-gray-500" />
            </div>

            <div className="space-y-0 max-h-72 overflow-y-auto">
                {items.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">لا توجد نشاطات</p>
                )}
                {items.map((item) => {
                    const Icon = ICON_MAP[item.icon] || History;
                    const color = GROUP_COLORS[item.group] || '#6b7280';
                    return (
                        <div
                            key={item.id}
                            className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: color + '18' }}
                            >
                                <Icon size={15} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 dark:text-white">
                                    <span className="font-semibold">{item.username}</span>
                                    {' '}{item.action}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.timestamp}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
        </div>
    );
});
