import { memo } from 'react';
import type { ActivityItem as ServiceItem } from '../../services/executiveService';
import { History, TrendingUp, UserPlus, CreditCard, Edit3, Trash2, GraduationCap, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, typeof History> = {
    person_add: UserPlus,
    payment: CreditCard,
    edit: Edit3,
    delete: Trash2,
    school: GraduationCap,
    lock: Lock,
    trending_up: TrendingUp,
};

const VARIANT_CONFIG: Record<string, { bg: string; text: string }> = {
    user: { bg: 'bg-info-soft', text: 'text-info' },
    session: { bg: 'bg-success-soft', text: 'text-success' },
    payment: { bg: 'bg-warning-soft', text: 'text-warning' },
    system: { bg: 'bg-surface', text: 'text-muted' },
};

export const ActivityFeed = memo(function ActivityFeed({ items }: { items: ServiceItem[] }) {
    if (!items) return null;

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                    <History size={16} className="text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-main">النشاطات</h3>
                    <p className="text-[10px] text-muted">آخر العمليات</p>
                </div>
            </div>

            <div className="space-y-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                {items.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-surface flex items-center justify-center">
                            <History size={16} className="text-dim" />
                        </div>
                        <p className="text-xs font-bold text-muted">لا توجد نشاطات</p>
                    </div>
                )}
                {items.map((item) => {
                    const Icon = ICON_MAP[item.icon] || History;
                    const v = VARIANT_CONFIG[item.group] || VARIANT_CONFIG.system;

                    return (
                        <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface transition-colors">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", v.bg)}>
                                <Icon size={13} className={v.text} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-main truncate">
                                    <span className="text-primary">{item.username}</span> {item.action}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Clock size={9} className="text-muted" />
                                <span className="text-[9px] text-muted tabular-nums">{item.timestamp}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
