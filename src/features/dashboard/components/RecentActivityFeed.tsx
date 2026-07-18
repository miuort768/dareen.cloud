import { ListTodo, Calendar } from 'lucide-react';
import { ActivityFeed } from '../../../shared/components/ui';
import type { ActivityItem } from '../../../shared/components/ui';

interface RecentActivityFeedProps {
    sessions: { id: string; studentName: string; date?: string; status?: string }[];
    tasks: { id: string; title: string; dueDate?: string; status?: string }[];
}

export const RecentActivityFeed = ({ sessions, tasks }: RecentActivityFeedProps) => {
    const sessionItems: ActivityItem[] = sessions.slice(0, 5).map(s => ({
        id: `s-${s.id}`,
        title: `جلسة: ${s.studentName}`,
        time: s.date || '',
        icon: Calendar,
        variant: s.status === 'completed' ? 'success' : s.status === 'cancelled' ? 'error' : 'info',
        badge: s.status === 'completed' ? 'تمت الجلسة' : s.status === 'cancelled' ? 'ملغاة' : 'نشطة الآن',
        badgeVariant: s.status === 'completed' ? 'success' : s.status === 'cancelled' ? 'error' : 'info',
    }));

    const taskItems: ActivityItem[] = tasks.slice(0, 5).map(t => ({
        id: `t-${t.id}`,
        title: t.title,
        time: t.dueDate || '',
        icon: ListTodo,
        variant: t.status === 'completed' ? 'success' : 'warning',
        badge: t.status === 'completed' ? 'مهمة منجزة' : 'قيد التنفيذ',
        badgeVariant: t.status === 'completed' ? 'success' : 'warning',
    }));

    const allItems = [...sessionItems, ...taskItems]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8);

    return (
        <ActivityFeed
            items={allItems}
            title="سجل النشاطات"
            subtitle="سجل المراقبة الفورية"
            emptyMessage="لا توجد نشاطات مؤخراً"
        />
    );
};
