import { User, BookOpen, Clock, Video } from 'lucide-react';
import { triggerHaptic } from '../../../../lib/haptics';
import { BottomSheet } from '../../../../shared/components/mobile';

interface ScheduleEvent {
    id: string;
    studentId: string;
    studentName: string;
    studentGrade: string;
    teacherName: string;
    subject: string;
    curriculum: string;
    day: string;
    hour: string;
    period: string;
    time: string;
    isPM: boolean;
}

interface MobileScheduleDetailsSheetProps {
    showDetails: boolean;
    event: ScheduleEvent | null;
    onClose: () => void;
    onStartSession: () => void;
    onViewStudent: () => void;
}

export const MobileScheduleDetailsSheet = ({ showDetails, event, onClose, onStartSession, onViewStudent }: MobileScheduleDetailsSheetProps) => (
    <BottomSheet
        open={showDetails && !!event}
        onOpenChange={(v) => { if (!v) { triggerHaptic('light'); onClose(); } }}
        title="تفاصيل الحصة"
        subtitle={event?.day}
        footer={event && (
            <div className="flex gap-2.5">
                <button
                    onClick={() => { triggerHaptic('medium'); onStartSession(); }}
                    className="flex-1 py-3 rounded-2xl bg-primary text-on-primary text-micro font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                >
                    <Video size={14} strokeWidth={1.5} /> بدء بث مباشر
                </button>
                <button
                    onClick={() => { triggerHaptic('light'); onViewStudent(); }}
                    className="flex-1 py-3 rounded-2xl bg-surface text-muted text-micro font-bold border border-border"
                >
                    عرض الطالب
                </button>
            </div>
        )}
    >
        {event && (
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary-soft border-e-[3px] border-e-primary">
                    <div>
                        <span className="text-micro font-bold text-muted">الطالب</span>
                        <p className="text-sm font-bold text-main">{event.studentName}</p>
                        <span className="text-micro font-bold text-primary">{event.studentGrade} · {event.subject}</span>
                    </div>
                    <User size={18} className="text-muted" strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-success-soft border-e-[3px] border-e-success">
                    <div>
                        <span className="text-micro font-bold text-muted">المعلمة</span>
                        <p className="text-sm font-bold text-main">{event.teacherName}</p>
                    </div>
                    <BookOpen size={18} className="text-muted" strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-warning-soft border-e-[3px] border-e-warning">
                    <div>
                        <span className="text-micro font-bold text-muted">الوقت</span>
                        <p className="text-sm font-bold text-main">{event.time}</p>
                    </div>
                    <Clock size={18} className="text-muted" strokeWidth={1.5} />
                </div>
            </div>
        )}
    </BottomSheet>
);
