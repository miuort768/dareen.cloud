import { User, Star, MessageSquare, Award, X, Sparkles, TrendingUp } from 'lucide-react';


interface BriefSession {
    date: string;
    topics: string;
    homework?: string;
    rating: string;
}

interface StudentQuickBriefProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateReport?: (student: Record<string, unknown>) => void;
    student: {
        id: string;
        name: string;
        grade: string;
        notes?: string;
        curriculum?: string;
        totalPoints?: number;
    } | null;
    enrollment?: {
        subject: string;
        nextSessionNotes?: string;
    };
    recentSessions: BriefSession[];
}

export const StudentQuickBrief = ({ isOpen, onClose, onGenerateReport, student, enrollment, recentSessions }: StudentQuickBriefProps) => {
    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40" dir="rtl">
            <div className="bg-white dark:bg-primary-active border-2 border-border w-full max-w-xl rounded-none shadow-[12px_12px_0px_0px_#000] flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header Section */}
                <div className="p-6 border-b-2 border-border bg-background dark:bg-primary-active">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-background text-on-primary rounded-none flex items-center justify-center border-2 border-border shadow-md shrink-0">
                                <User size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-main dark:text-on-primary uppercase tracking-tight">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-background text-on-primary text-[9px] font-medium uppercase">{student.grade}</span>
                                    <span className="px-2 py-0.5 bg-warning text-warning border-2 border-border text-[9px] font-medium uppercase flex items-center gap-1">
                                        <Star size={10} className="fill-warning" />
                                        {student.totalPoints || 0} النقاط
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-none bg-white dark:bg-primary-active text-main border-2 border-border hover:bg-error hover:text-on-primary transition-all flex items-center justify-center"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Reminder Row */}
                    {enrollment?.nextSessionNotes && (
                        <div className="bg-warning-light dark:bg-warning/10 p-5 border-2 border-warning rounded-none relative">
                             <div className="absolute top-2 left-2">
                                <Sparkles size={16} className="text-warning/30" />
                             </div>
                             <p className="text-[9px] font-medium text-warning uppercase mb-2">تحضير الجلسة القادمة</p>
                             <p className="text-sm font-normal text-warning dark:text-warning leading-tight">"{enrollment.nextSessionNotes}"</p>
                        </div>
                    )}

                    {/* Context Row */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-muted">
                            <MessageSquare size={14} className="text-primary" />
                            <h4 className="text-[10px] font-medium uppercase">سياق ولي الأمر</h4>
                        </div>
                        <div className="text-sm font-normal text-main dark:text-dim leading-relaxed bg-background dark:bg-primary-active/40 p-5 border-2 border-border rounded-none">
                            {student.notes || 'لا توجد ملاحظات من ولي الأمر لهذا الطالب.'}
                        </div>
                    </div>

                    {/* Timeline Row */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-muted">
                            <TrendingUp size={14} className="text-success" />
                            <h4 className="text-[10px] font-medium uppercase">مسار التعلم الأخير</h4>
                        </div>

                        <div className="space-y-2">
                            {recentSessions.length > 0 ? recentSessions.map((sess, idx) => (
                                <div key={idx} className="p-4 bg-white dark:bg-primary-active border-2 border-border/10 hover:border-border transition-all rounded-none flex items-center justify-between group">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-medium text-muted uppercase mb-1">{sess.date}</p>
                                        <p className="text-sm font-medium text-main dark:text-on-primary truncate uppercase tracking-tight">{sess.topics}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="w-1.5 h-1.5 rounded-none bg-success border border-border/20"></div>
                                            <p className="text-[10px] font-medium text-success uppercase">
                                                الأداء: {sess.rating}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-none border-2 border-border flex items-center justify-center bg-background text-muted">
                                        <Award size={20} />
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center border-2 border-dashed border-border rounded-none bg-background">
                                    <p className="text-[10px] text-muted font-medium uppercase">مرحلة البدء</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-background dark:bg-background border-t-2 border-border flex gap-4">
                    <button 
                        onClick={() => onGenerateReport?.(student)}
                        className="flex-1 h-12 bg-success text-on-primary rounded-none font-medium text-[11px] uppercase border-2 border-border shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all active:translate-y-0 active:shadow-none flex items-center justify-center gap-2"
                    >
                        <Sparkles size={16} />
                        إصدار تقرير شهري
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-8 h-12 bg-background text-on-primary rounded-none font-medium text-[11px] uppercase border-2 border-border shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all active:translate-y-0 active:shadow-none"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );

};
