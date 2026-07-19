import { motion } from 'framer-motion';
import { MessageSquare, Award } from 'lucide-react';
import type { Student } from '../../types';

interface NotesSectionProps {
    children: Student[];
}

export const ParentNotesSection = ({ children }: NotesSectionProps) => {
    if (!children.some((child) => child.enrollments?.some((en) => en.nextSessionNotes))) return null;
    return (
        <div className="bg-card border border-border rounded-card p-4 md:p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="text-warning" size={16} />
                <h3 className="text-sm md:text-lg font-medium text-main">الواجبات والملاحظات</h3>
            </div>
            <div className="space-y-3">
                {children.filter((child) => child.enrollments?.some((en) => en.nextSessionNotes)).map((child) => (
                    <div key={child.id} className="space-y-1">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                            <span className="text-xs font-medium text-muted uppercase tracking-widest">{child.name}</span>
                        </div>
                        <div className="space-y-2">
                            {child.enrollments.filter((en) => en.nextSessionNotes).map((en, idx) => (
                                <div key={`note-${idx}`} className="bg-warning-soft dark:bg-warning-soft p-3 rounded-card border border-warning dark:border-warning">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-warning-dark dark:text-warning uppercase tracking-widest">{en.subject}</span>
                                        <span className="text-xs font-normal text-muted">{en.teacher}</span>
                                    </div>
                                    <p className="text-micro font-normal text-main dark:text-main leading-relaxed">{en.nextSessionNotes}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ParentMobileNotesSection = ({ children }: NotesSectionProps) => {
    if (!children.some((child) => child.enrollments?.some((en) => en.nextSessionNotes))) return null;
    return (
        <section>
            <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-1 h-4 bg-warning rounded-full" />
                <h2 className="text-main text-sm font-black">الواجبات والملاحظات</h2>
            </div>
            <div className="bg-card rounded-card shadow-md p-3.5 space-y-3">
                {children.filter((child) => child.enrollments?.some((en) => en.nextSessionNotes)).map((child) => (
                    <div key={child.id}>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-muted">{child.name}</span>
                        </div>
                        <div className="space-y-2 ms-4">
                            {child.enrollments.filter((en) => en.nextSessionNotes).map((en, idx) => (
                                <div key={`note-${idx}`} className="bg-primary-soft dark:bg-primary-soft p-3 rounded-card border border-primary dark:border-primary">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-primary dark:text-primary">{en.subject}</span>
                                        <span className="text-micro text-muted">{en.teacher}</span>
                                    </div>
                                    <p className="text-micro text-main dark:text-main leading-relaxed">{en.nextSessionNotes}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

interface AcademicProgressProps {
    academicProgress: number;
}

export const ParentAcademicProgress = ({ academicProgress }: AcademicProgressProps) => (
    <div className="bg-warning rounded-card p-5 md:p-6 text-on-warning shadow-soft">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-sm md:text-xl font-medium mb-1">التقدم الأكاديمي العام</h3>
            </div>
            <div className="w-10 h-10 bg-warning-soft rounded-card flex items-center justify-center shrink-0">
                <Award size={20} />
            </div>
        </div>
        <div className="space-y-1">
            <div className="flex justify-between items-center text-micro font-medium opacity-90">
                <span>الهدف: 100</span>
                <span>{academicProgress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(academicProgress, 100)}%` }}
                    className="h-full bg-white dark:bg-primary rounded-full shadow-soft" />
            </div>
        </div>
    </div>
);

export const ParentMobileAcademicProgress = ({ academicProgress }: AcademicProgressProps) => (
    <section>
        <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-success rounded-full" />
            <h2 className="text-main text-sm font-black">التقدم الأكاديمي</h2>
        </div>
        <div className="bg-primary rounded-card p-4 text-on-primary shadow-soft">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black">التقدم الأكاديمي العام</h3>
                <Award size={18} className="text-on-primary opacity-60" />
            </div>
            <div className="space-y-1.5">
                <div className="flex justify-between text-micro text-on-primary/70">
                    <span>الهدف: 100</span>
                    <span>{academicProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(academicProgress, 100)}%` }}
                        className="h-full bg-white rounded-full shadow-[0_0_8px_var(--bg-shadow)]" />
                </div>
            </div>
        </div>
    </section>
);
