import { CalendarDays, Video, X } from 'lucide-react';

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
    studentPoints?: number;
}

interface ScheduleDetailsModalProps {
    event: ScheduleEvent;
    onClose: () => void;
    onStartLiveSession: () => void;
    onViewStudent: () => void;
}

export const ScheduleDetailsModal = ({ event, onClose, onStartLiveSession, onViewStudent }: ScheduleDetailsModalProps) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="bg-white dark:bg-surface w-full max-w-sm shadow-sm border border-border overflow-hidden rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 text-on-primary flex items-center justify-between bg-primary">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <CalendarDays size={16} />
                    تفاصيل الحصة
                </h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/10 transition-colors rounded-xl" aria-label="إغلاق">
                    <X size={16} />
                </button>
            </div>
            <div className="p-5 space-y-4">
                <div>
                    <span className="text-micro font-bold text-muted block mb-1">الطالب</span>
                    <p className="font-bold text-sm text-main">{event.studentName}</p>
                </div>
                <div>
                    <span className="text-micro font-bold text-muted block mb-1">المعلمة</span>
                    <p className="font-bold text-sm text-main">{event.teacherName}</p>
                </div>
                <div>
                    <span className="text-micro font-bold text-muted block mb-1">المادة</span>
                    <p className="font-bold text-sm text-main">{event.subject}</p>
                </div>
                <div>
                    <span className="text-micro font-bold text-muted block mb-1">الموعد</span>
                    <p className="font-bold text-sm text-main">{event.day} - {event.time}</p>
                </div>
            </div>
            <div className="flex gap-2 p-5 pt-0">
                <button onClick={onStartLiveSession}
                    className="flex-1 h-10 text-white text-micro font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover">
                    <Video size={14} />
                    بدء بث مباشر
                </button>
                <button onClick={onViewStudent}
                    className="flex-1 h-10 bg-white dark:bg-background text-main text-micro font-bold border border-border shadow-sm hover:bg-surface transition-all active:scale-95 rounded-xl">
                    عرض الطالب
                </button>
            </div>
        </div>
    </div>
);
