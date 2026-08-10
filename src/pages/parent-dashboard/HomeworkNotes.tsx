import { FileText, ChevronLeft } from 'lucide-react';
import type { Student } from '../../types';

interface HomeworkNotesProps {
    children: Student[];
}

export const HomeworkNotes = ({ children: kids }: HomeworkNotesProps) => {
    const hasNotes = kids.some(child => child.enrollments?.some((en) => en.nextSessionNotes));
    if (!hasNotes) return null;

    return (
        <div className="bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-xl bg-warning-soft dark:bg-[#D4AF37]/15 flex items-center justify-center">
                    <FileText size={13} className="text-warning dark:text-[#D4AF37]" />
                </div>
                <h3 className="text-sm font-bold text-main dark:text-white">الواجبات والملاحظات</h3>
            </div>
            <div className="space-y-3">
                {kids.filter(child => child.enrollments?.some((en) => en.nextSessionNotes)).map((child) => (
                    <div key={child.id} className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-[#D4AF37]" />
                            <span className="text-xs font-bold text-muted dark:text-zinc-400">{child.name}</span>
                        </div>
                        <div className="space-y-2 ms-4">
                            {child.enrollments.filter((en) => en.nextSessionNotes).map((en, idx) => (
                                <div key={`note-${child.id}-${idx}`} className="bg-warning/10 dark:bg-[#D4AF37]/10 p-3 rounded-xl border border-warning/30 dark:border-[#D4AF37]/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-warning dark:text-[#D4AF37]">{en.subject}</span>
                                        <span className="text-micro text-muted dark:text-zinc-500">{en.teacher || en.teacherName}</span>
                                    </div>
                                    <p className="text-micro text-main dark:text-zinc-300 leading-relaxed">{en.nextSessionNotes}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
