import type { ReactNode } from 'react';
import { CalendarCheck2, Activity, MessageCircle } from 'lucide-react';
import { formatTimeAgo } from '../../../lib/utils';
import { Skeleton } from '../../../shared/components/ui/Skeleton';
import type { TeacherActivity } from '../types';

interface TeacherActivitySectionProps {
    activity?: TeacherActivity | null;
    activityLoading?: boolean;
}

const SummaryCard = ({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode }) => (
    <div className="bg-surface border border-border p-3.5 rounded-xl">
        <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10">
                {icon}
            </div>
            <p className="text-xs font-bold text-muted">{label}</p>
        </div>
        <p className="text-sm font-bold text-main leading-snug">{value}</p>
        {sub && <p className="text-[11px] text-muted mt-1 leading-snug">{sub}</p>}
    </div>
);

export const TeacherActivitySection = ({ activity, activityLoading }: TeacherActivitySectionProps) => {
    const lastSession = activity?.lastSession;
    const lastChat = activity?.lastChat;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activityLoading ? (
                <>
                    <Skeleton className="h-[92px] rounded-xl" />
                    <Skeleton className="h-[92px] rounded-xl" />
                    <Skeleton className="h-[92px] rounded-xl" />
                </>
            ) : (
                <>
                    <SummaryCard
                        icon={<CalendarCheck2 size={14} className="text-primary" />}
                        label="آخر حصة عطتها"
                        value={lastSession?.studentName || 'لم تسجل حصص بعد'}
                        sub={
                            lastSession?.studentName
                                ? `${lastSession.subject || 'بدون مادة'} — ${lastSession.date}${lastSession.time ? ` • ${lastSession.time}` : ''}`
                                : undefined
                        }
                    />
                    <SummaryCard
                        icon={<Activity size={14} className="text-primary" />}
                        label="آخر ظهور على المنصة"
                        value={activity?.lastLoginAt ? formatTimeAgo(activity.lastLoginAt) : 'لا يوجد'}
                        sub={activity?.lastLoginAt ? new Date(activity.lastLoginAt).toLocaleString('ar-EG') : undefined}
                    />
                    <SummaryCard
                        icon={<MessageCircle size={14} className="text-primary" />}
                        label="آخر رسالة في الدردشة"
                        value={lastChat ? `مع ${lastChat.withName || lastChat.conversationName || 'المجموعة'}` : 'لم ترسل رسائل بعد'}
                        sub={
                            lastChat
                                ? `${formatTimeAgo(lastChat.timestamp)}${lastChat.content ? ` — ${lastChat.content}` : ''}`
                                : undefined
                        }
                    />
                </>
            )}
        </div>
    );
};
