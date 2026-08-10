import { User, Star, MessageSquare, Award, X, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface BriefSession {
    date: string;
    topics: string;
    homework?: string;
    rating: string;
}

interface BriefStudent {
    id: string;
    name: string;
    grade: string;
    notes?: string;
    curriculum?: string;
    totalPoints?: number;
}

interface StudentQuickBriefProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateReport?: (student: BriefStudent) => void;
    student: BriefStudent | null;
    enrollment?: {
        subject: string;
        nextSessionNotes?: string;
    };
    recentSessions: BriefSession[];
}

export const StudentQuickBrief = ({ isOpen, onClose, onGenerateReport, student, enrollment, recentSessions }: StudentQuickBriefProps) => {
    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 dark:bg-black/70" dir="rtl">
            <div className="bg-card dark:bg-[#0d0d0f] border-2 border-border dark:border-[#D4AF37]/20 w-full max-w-xl rounded-none shadow-[12px_12px_0px_0px_black] flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header Section */}
                <div className="p-6 border-b-2 border-border dark:border-[#D4AF37]/20 bg-background dark:bg-[#0a0a0c]">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-background dark:bg-[#1a1a1f] text-main dark:text-white rounded-none flex items-center justify-center border-2 border-border dark:border-[#D4AF37]/20 shadow-md shrink-0">
                                <User size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-main dark:text-white uppercase tracking-tight">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-background dark:bg-[#1a1a1f] text-main dark:text-white text-micro font-medium uppercase">{student.grade}</span>
                                    <span className="px-2 py-0.5 bg-warning dark:bg-[#D4AF37] text-on-warning dark:text-black border-2 border-border dark:border-[#D4AF37]/20 text-micro font-medium uppercase flex items-center gap-1">
                                        <Star size={10} className="fill-warning dark:fill-[#D4AF37]" />
                                        {student.totalPoints || 0} النقاط
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            className="w-8 h-8 rounded-none border-2 border-border dark:border-[#D4AF37]/20 hover:bg-error hover:text-on-error"
                            aria-label="إغلاق"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Reminder Row */}
                    {enrollment?.nextSessionNotes && (
                        <div className="bg-warning-soft dark:bg-[#D4AF37]/5 p-5 border-2 border-warning dark:border-[#D4AF37]/30 rounded-none relative">
                             <div className="absolute top-2 end-2">
                                <Sparkles size={16} className="text-warning/30" />
                             </div>
                             <p className="text-micro font-medium text-warning dark:text-[#D4AF37] uppercase mb-2">تحضير الجلسة القادمة</p>
                             <p className="text-sm font-normal text-warning dark:text-[#D4AF37]/80 leading-tight">"{enrollment.nextSessionNotes}"</p>
                        </div>
                    )}

                    {/* Context Row */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-muted dark:text-zinc-400">
                            <MessageSquare size={14} className="text-primary dark:text-[#D4AF37]" />
                            <h4 className="text-micro font-medium uppercase">سياق ولي الأمر</h4>
                        </div>
                        <div className="text-sm font-normal text-main dark:text-white leading-relaxed bg-background dark:bg-[#0a0a0c] p-5 border-2 border-border dark:border-[#D4AF37]/20 rounded-none">
                            {student.notes || 'لا توجد ملاحظات من ولي الأمر لهذا الطالب.'}
                        </div>
                    </div>

                    {/* Timeline Row */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-muted dark:text-zinc-400">
                            <TrendingUp size={14} className="text-success" />
                            <h4 className="text-micro font-medium uppercase">مسار التعلم الأخير</h4>
                        </div>

                        <div className="space-y-2">
                            {recentSessions.length > 0 ? recentSessions.map((sess, idx) => (
                                <div key={idx} className="p-4 bg-card dark:bg-[#0d0d0f] border-2 border-border/10 dark:border-[#D4AF37]/10 hover:border-border dark:hover:border-[#D4AF37]/30 transition-all rounded-none flex items-center justify-between group">
                                    <div className="min-w-0">
                                        <p className="text-micro font-medium text-muted dark:text-zinc-400 uppercase mb-1">{sess.date}</p>
                                        <p className="text-sm font-medium text-main dark:text-white truncate uppercase tracking-tight">{sess.topics}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="w-1.5 h-1.5 rounded-none bg-success border border-border/20"></div>
                                            <p className="text-micro font-medium text-success uppercase">
                                                الأداء: {sess.rating}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-none border-2 border-border dark:border-[#D4AF37]/20 flex items-center justify-center bg-background dark:bg-[#1a1a1f] text-muted dark:text-zinc-400">
                                        <Award size={20} />
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center border-2 border-dashed border-border dark:border-[#D4AF37]/20 rounded-none bg-background dark:bg-[#0a0a0c]">
                                    <p className="text-micro text-muted dark:text-zinc-400 font-medium uppercase">مرحلة البدء</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-background dark:bg-[#0a0a0c] border-t-2 border-border dark:border-[#D4AF37]/20 flex gap-4">
                    <Button
                        onClick={() => onGenerateReport?.(student)}
                        className="flex-1 h-12 bg-success text-on-success rounded-none border-2 border-border shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-none"
                    >
                        <Sparkles size={16} />
                        إصدار تقرير شهري
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="px-8 h-12 rounded-none border-2 border-border shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-none"
                    >
                        إغلاق
                    </Button>
                </div>
            </div>
        </div>
    );

};
