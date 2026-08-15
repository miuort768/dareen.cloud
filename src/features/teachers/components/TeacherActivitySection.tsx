import { Clock, Calendar, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Session } from '../types';

interface TeacherActivitySectionProps {
    teacherName: string;
    sessions: Session[];
    isTeacherView: boolean;
    onDeleteSession: (sessionId: string) => void;
}

export const TeacherActivitySection = ({ teacherName, sessions, isTeacherView, onDeleteSession }: TeacherActivitySectionProps) => {
    return (
        <div className="border-t border-border pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {sessions.map(session => (
                    <div key={session.id} className="bg-surface border border-border p-3.5 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group">
                        <div className={cn(
                            "absolute top-0 start-0 w-1 h-full",
                            session.status === 'completed' ? "bg-success" : "bg-error"
                        )} />

                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                                    <Calendar size={14} className="text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-main truncate">{session.studentName}</p>
                                    <p className="text-[10px] text-muted">{session.date}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted">
                                <Clock size={10} /> {session.time}
                            </div>
                            {!isTeacherView && (
                                <button onClick={() => onDeleteSession(session.id)} className="min-w-[24px] min-h-[24px] w-6 h-6 flex items-center justify-center text-muted hover:text-error opacity-0 group-hover:opacity-100 rounded-lg hover:bg-error/10 transition-all" aria-label="حذف">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {sessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
                        <Clock size={28} className="text-muted/30" />
                    </div>
                    <p className="text-sm font-bold text-muted">لا توجد نشاطات مسجلة</p>
                    <p className="text-[11px] text-muted mt-1">{teacherName}</p>
                </div>
            )}
        </div>
    );
};
