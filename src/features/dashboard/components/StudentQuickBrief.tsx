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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 w-full max-w-xl rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header Section */}
                <div className="p-6 border-b-2 border-slate-950 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-slate-950 text-white rounded-none flex items-center justify-center border-2 border-slate-950 shadow-md shrink-0">
                                <User size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-slate-900 dark:text-white uppercase tracking-tight">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-slate-950 text-white text-[9px] font-medium uppercase">{student.grade}</span>
                                    <span className="px-2 py-0.5 bg-amber-400 text-amber-950 border-2 border-slate-950 text-[9px] font-medium uppercase flex items-center gap-1">
                                        <Star size={10} className="fill-amber-950" />
                                        {student.totalPoints || 0} POINTS
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-none bg-white dark:bg-slate-700 text-slate-950 border-2 border-slate-950 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Reminder Row */}
                    {enrollment?.nextSessionNotes && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 border-2 border-amber-500 rounded-none relative">
                             <div className="absolute top-2 left-2">
                                <Sparkles size={16} className="text-amber-600/30" />
                             </div>
                             <p className="text-[9px] font-medium text-amber-600 uppercase mb-2">NEXT SESSION PREP</p>
                             <p className="text-sm font-normal text-amber-950 dark:text-amber-400 leading-tight">"{enrollment.nextSessionNotes}"</p>
                        </div>
                    )}

                    {/* Context Row */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                            <MessageSquare size={14} className="text-indigo-600" />
                            <h4 className="text-[10px] font-medium uppercase">Guardian Context</h4>
                        </div>
                        <div className="text-sm font-normal text-slate-900 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-5 border-2 border-slate-950 rounded-none">
                            {student.notes || 'No parent notes recorded for this student.'}
                        </div>
                    </div>

                    {/* Timeline Row */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <TrendingUp size={14} className="text-emerald-600" />
                            <h4 className="text-[10px] font-medium uppercase">Recent Learning Path</h4>
                        </div>

                        <div className="space-y-2">
                            {recentSessions.length > 0 ? recentSessions.map((sess, idx) => (
                                <div key={idx} className="p-4 bg-white dark:bg-slate-800 border-2 border-slate-950/10 hover:border-slate-950 transition-all rounded-none flex items-center justify-between group">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-medium text-slate-400 uppercase mb-1">{sess.date}</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate uppercase tracking-tight">{sess.topics}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="w-1.5 h-1.5 rounded-none bg-emerald-600 border border-slate-950/20"></div>
                                            <p className="text-[10px] font-medium text-emerald-600 uppercase">
                                                Performance: {sess.rating}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-none border-2 border-slate-950 flex items-center justify-center bg-slate-50 text-slate-400">
                                        <Award size={20} />
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center border-2 border-dashed border-slate-300 rounded-none bg-slate-50">
                                    <p className="text-[10px] text-slate-400 font-medium uppercase">Initialization phase</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-950 flex gap-4">
                    <button 
                        onClick={() => onGenerateReport?.(student)}
                        className="flex-1 h-12 bg-emerald-600 text-white rounded-none font-medium text-[11px] uppercase border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0 active:shadow-none flex items-center justify-center gap-2"
                    >
                        <Sparkles size={16} />
                        إصدار تقرير شهري
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-8 h-12 bg-slate-950 text-white rounded-none font-medium text-[11px] uppercase border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0 active:shadow-none"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );

};
