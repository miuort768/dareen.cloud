import { CheckCircle2, User, ShieldCheck, BookOpen } from 'lucide-react';
import { triggerHaptic } from '../../../../lib/haptics';
import { BottomSheet } from '../../../../shared/components/mobile';
import type { AppointmentEvent } from './types';

interface AppointmentDetailsSheetProps {
    show: boolean;
    appointment: AppointmentEvent | null;
    activeTab: 'upcoming' | 'completed';
    onClose: () => void;
    onComplete: (id: string, e: React.MouseEvent) => void;
}

export const AppointmentDetailsSheet = ({ show, appointment, activeTab, onClose, onComplete }: AppointmentDetailsSheetProps) => (
    <BottomSheet
        open={show && !!appointment}
        onOpenChange={(v) => { if (!v) { triggerHaptic('light'); onClose(); } }}
        title="تفاصيل الموعد"
        subtitle={appointment?.day}
        footer={activeTab === 'upcoming' && appointment ? (
            <button
                onClick={(e) => { onComplete(appointment.id, e); onClose(); }}
                className="w-full py-3 rounded-2xl bg-success text-on-success text-micro font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
                <CheckCircle2 size={14} strokeWidth={1.5} /> إتمام الحصة
            </button>
        ) : undefined}
    >
        {appointment && (
            <div className="space-y-3">
                <div className="flex justify-center pb-1">
                    <div className="px-4 py-2 rounded-xl bg-primary/10">
                        <p className="font-bold text-lg tabular-nums text-primary leading-none">{appointment.time}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary-soft border-e-[3px] border-e-primary">
                    <div>
                        <span className="text-micro font-bold text-muted">الطالب</span>
                        <p className="text-sm font-bold text-main">{appointment.studentName}</p>
                        <span className="text-micro font-bold text-primary">{appointment.studentGrade}</span>
                    </div>
                    <User size={18} className="text-muted" strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-success-soft border-e-[3px] border-e-success">
                    <div>
                        <span className="text-micro font-bold text-muted">المعلمة</span>
                        <p className="text-sm font-bold text-main">{appointment.teacherName}</p>
                    </div>
                    <ShieldCheck size={18} className="text-muted" strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-warning-soft border-e-[3px] border-e-warning">
                    <div>
                        <span className="text-micro font-bold text-muted">المادة</span>
                        <p className="text-sm font-bold text-main">{appointment.subject}</p>
                        <span className="text-micro font-bold px-1.5 py-0.5 mt-1 inline-block rounded-lg bg-warning-soft text-warning">{appointment.curriculum}</span>
                    </div>
                    <BookOpen size={18} className="text-muted" strokeWidth={1.5} />
                </div>
            </div>
        )}
    </BottomSheet>
);
