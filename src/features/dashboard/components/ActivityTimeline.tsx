import { ListTodo, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ActivityTimelineProps {
    sessions: { id: string; studentName: string; date?: string; status?: string }[];
    tasks: { id: string; title: string; dueDate?: string; status?: string; priority?: string }[];
}

interface TimelineItem {
    id: string;
    title: string;
    time: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    variant: 'success' | 'error' | 'info' | 'warning';
    badge: string;
}

export const ActivityTimeline = ({ sessions, tasks }: ActivityTimelineProps) => {
    const sessionItems: TimelineItem[] = sessions.slice(0, 5).map(s => ({
        id: `s-${s.id}`,
        title: `جلسة: ${s.studentName}`,
        time: s.date || '',
        icon: Calendar,
        variant: s.status === 'completed' ? 'success' : s.status === 'cancelled' ? 'error' : 'info',
        badge: s.status === 'completed' ? 'تمت' : s.status === 'cancelled' ? 'ملغاة' : 'نشطة',
    }));

    const taskItems: TimelineItem[] = tasks.slice(0, 5).map(t => ({
        id: `t-${t.id}`,
        title: t.title,
        time: t.dueDate || '',
        icon: ListTodo,
        variant: t.status === 'completed' ? 'success' : 'warning',
        badge: t.status === 'completed' ? 'منجزة' : 'نشطة',
    }));

    const allItems = [...sessionItems, ...taskItems]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8);

    const variantStyles: Record<string, { dot: string; badge: string; iconBg: string; iconText: string }> = {
        success: { dot: 'bg-success', badge: 'bg-success-soft text-success border-border', iconBg: 'bg-success-soft', iconText: 'text-success' },
        error: { dot: 'bg-error', badge: 'bg-error-soft text-error border-border', iconBg: 'bg-error-soft', iconText: 'text-error' },
        info: { dot: 'bg-info', badge: 'bg-info-soft text-info border-border', iconBg: 'bg-info-soft', iconText: 'text-info' },
        warning: { dot: 'bg-warning', badge: 'bg-warning-soft text-warning border-border', iconBg: 'bg-warning-soft', iconText: 'text-warning' },
    };

    return (
        <div className="rounded-2xl bg-card dark:bg-card border border-border dark:border-primary/20 shadow-elevation-1 p-5 font-dash" dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-info-soft dark:bg-info/10 flex items-center justify-center">
                        <Clock size={16} className="text-info" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main dark:text-main">سجل النشاطات</h3>
                        <p className="text-[10px] text-muted dark:text-muted">آخر العمليات المسجلة</p>
                    </div>
                </div>
                {allItems.length > 0 && (
                    <Badge variant="default" className="text-[10px] h-5 px-2.5 rounded-lg bg-info-soft text-info border-border">
                        {allItems.length} نشاط
                    </Badge>
                )}
            </div>

            {allItems.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-soft flex items-center justify-center">
                        <Clock size={24} className="text-primary-200" />
                    </div>
                    <p className="text-sm font-bold text-muted dark:text-muted">لا توجد نشاطات مؤخراً</p>
                    <p className="text-[11px] text-dim dark:text-dim mt-1">ستظهر الأنشطة عند تسجيلها</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {allItems.map((item) => {
                        const Icon = item.icon;
                        const v = variantStyles[item.variant] || variantStyles.info;

                        return (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface dark:bg-hover hover:bg-hover dark:hover:bg-hover transition-colors"
                            >
                                <div className="relative shrink-0">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", v.iconBg)}>
                                        <Icon size={13} className={v.iconText} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[11px] font-bold text-main dark:text-main truncate">{item.title}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Clock size={9} className="text-muted dark:text-dim shrink-0" />
                                        <span className="text-[10px] text-muted dark:text-muted">{item.time}</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cn("text-[9px] h-5 px-2 rounded-md shrink-0 border", v.badge)}>
                                    {item.badge}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
