import { memo, useRef, useEffect } from 'react';
import type { ActivityItem as ServiceItem } from '../../services/executiveService';
import { History, TrendingUp, UserPlus, CreditCard, Edit3, Trash2, GraduationCap, Lock } from 'lucide-react';
import { ActivityFeed as SharedFeed } from '../../../../shared/components/ui';
import type { ActivityItem } from '../../../../shared/components/ui';

const ICON_MAP: Record<string, typeof History> = {
    person_add: UserPlus,
    payment: CreditCard,
    edit: Edit3,
    delete: Trash2,
    school: GraduationCap,
    lock: Lock,
    trending_up: TrendingUp,
};

const VARIANT_MAP: Record<string, ActivityItem['variant']> = {
    user: 'info',
    session: 'success',
    payment: 'warning',
    system: 'default',
};

export const ActivityFeed = memo(function ActivityFeed({ items }: { items: ServiceItem[] }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [items]);

    if (!items) return null;

    const feedItems: ActivityItem[] = items.map((item) => ({
        id: item.id,
        title: `${item.username} ${item.action}`,
        description: undefined,
        time: item.timestamp,
        icon: ICON_MAP[item.icon] || History,
        variant: VARIANT_MAP[item.group] || 'default',
    }));

    return (
        <>
            <SharedFeed
                items={feedItems}
                title="النشاطات"
                maxHeight={288}
            />
            <div ref={bottomRef} />
        </>
    );
});
