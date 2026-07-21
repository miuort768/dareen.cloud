import { motion } from 'framer-motion';
import { MessageSquare, Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Student } from '../../types';

const glass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/[0.03]";

interface NotesSectionProps {
    children: Student[];
}

export const ParentNotesSection = ({ children }: NotesSectionProps) => {
    if (!children.some((child) => child.enrollments?.some((en) => en.nextSessionNotes))) return null;
    return (
        <div className={cn(glass, "p-4 md:p-5")}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-lg shadow-warning/20">
                    <MessageSquare size={13} className="text-white" />
                </div>
                <h3 className="text-sm md:text-lg font-medium text-main">الواجبات والملاحظات</h3>
            </div>
            <div className="space-y-3">
                {children.filter((child) => child.enrollments?.some((en) => en.nextSessionNotes)).map((child) => (
                    <div key={child.id} className="space-y-1">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                            <span className="text-xs font-medium text-muted">{child.name}</span>
                        </div>
                        <div className="space-y-2">
                            {child.enrollments.filter((en) => en.nextSessionNotes).map((en, idx) => (
                                <div key={`note-${idx}`} className="bg-warning/10 dark:bg-warning/10 p-3 rounded-xl border border-warning/30">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-warning">{en.subject}</span>
                                        <span className="text-xs font-normal text-muted">{en.teacher}</span>
                                    </div>
                                    <p className="text-micro font-normal text-main leading-relaxed">{en.nextSessionNotes}</p>
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
            <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-1 h-4 bg-gradient-to-b from-warning to-orange-500 rounded-full" />
                <h2 className="text-main text-sm font-black">الواجبات والملاحظات</h2>
            </div>
            <div className={cn(glass, "p-3.5 space-y-3")}>
                {children.filter((child) => child.enrollments?.some((en) => en.nextSessionNotes)).map((child) => (
                    <div key={child.id}>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-muted">{child.name}</span>
                        </div>
                        <div className="space-y-2 ms-4">
                            {child.enrollments.filter((en) => en.nextSessionNotes).map((en, idx) => (
                                <div key={`note-${idx}`} className="bg-primary/10 dark:bg-primary/10 p-3 rounded-xl border border-primary/30">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-primary dark:text-primary">{en.subject}</span>
                                        <span className="text-micro text-muted">{en.teacher}</span>
                                    </div>
                                    <p className="text-micro text-main leading-relaxed">{en.nextSessionNotes}</p>
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
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-warning to-orange-600 p-5 md:p-6 shadow-lg shadow-warning/20">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm md:text-xl font-medium text-white mb-1">التقدم الأكاديمي العام</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Award size={20} className="text-white" />
                </div>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between items-center text-micro font-medium text-white/80">
                    <span>الهدف: 100</span>
                    <span>{academicProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(academicProgress, 100)}%` }}
                        className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                </div>
            </div>
        </div>
    </div>
);

export const ParentMobileAcademicProgress = ({ academicProgress }: AcademicProgressProps) => (
    <section>
        <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-4 bg-gradient-to-b from-success to-emerald-500 rounded-full" />
            <h2 className="text-main text-sm font-black">التقدم الأكاديمي</h2>
        </div>
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-purple-600 p-4 shadow-lg shadow-primary/20">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-black text-white">التقدم الأكاديمي العام</h3>
                    <Award size={18} className="text-white/60" />
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-micro text-white/70">
                        <span>الهدف: 100</span>
                        <span>{academicProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(academicProgress, 100)}%` }}
                            className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                    </div>
                </div>
            </div>
        </div>
    </section>
);