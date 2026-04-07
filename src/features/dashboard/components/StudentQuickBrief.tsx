import { User, Star, MessageSquare, Award, Clock } from 'lucide-react';

interface BriefSession {
    date: string;
    topics: string;
    homework?: string;
    rating: string;
}

interface StudentQuickBriefProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateReport?: (student: any) => void;
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border-4 border-gray-950 w-full max-w-lg shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
                
                {/* Header (Suggestion 2 - Cheat Sheet) */}
                <div className="p-6 border-b-4 border-gray-950 bg-primary-50 dark:bg-primary-900/10 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white dark:bg-gray-950 border-4 border-gray-950 flex items-center justify-center text-primary-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <User size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-950 dark:text-white mb-1 uppercase tracking-tighter">{student.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-black px-2 py-0.5 bg-gray-950 text-white dark:bg-white dark:text-gray-950 uppercase">{student.grade}</span>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500 text-white border-2 border-gray-950">
                                    {student.totalPoints || 0} نقطة ذكاء
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-rose-500 text-white border-2 border-gray-950 hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Clock size={16} className="rotate-45" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Next Session Notes (Suggestion 2 part) */}
                    {enrollment?.nextSessionNotes && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-gray-950 p-4 relative group">
                            <div className="absolute -top-3 right-4 bg-amber-400 text-gray-950 px-2 py-0.5 border-2 border-gray-950 text-[9px] font-black uppercase">ملاحظاتك السابقة</div>
                            <p className="text-xs font-black text-amber-800 dark:text-amber-400 italic">"{enrollment.nextSessionNotes}"</p>
                        </div>
                    )}

                    {/* Parent Context (Suggestion 2 requirement) */}
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 mb-2 uppercase flex items-center gap-2">
                            <MessageSquare size={12} className="text-primary-500" /> ملخص حالة الطالب
                        </h4>
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 border-2 border-gray-950">
                            {student.notes || 'لا يوجد ملاحظات خاصة لهذا الطالب من ولي الأمر.'}
                        </div>
                    </div>

                    {/* Recent Progress (Suggestion 2) */}
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 mb-3 uppercase flex items-center gap-2">
                            <Star size={12} className="text-yellow-500" /> آخر التطورات (الدروس الأخيرة)
                        </h4>
                        <div className="space-y-3">
                            {recentSessions.length > 0 ? recentSessions.map((sess, idx) => (
                                <div key={idx} className="p-3 bg-white dark:bg-gray-950 border-2 border-gray-950 flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-gray-400 mb-1">{sess.date}</p>
                                        <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">{sess.topics}</p>
                                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                            التقييم: {sess.rating}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-gray-950 dark:text-gray-600 opacity-20">
                                        <Award size={20} />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-[10px] text-gray-400 italic text-center">لا يوجد جلسات مسجلة قريباً.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t-4 border-gray-950 flex gap-4">
                    <button 
                        onClick={() => onGenerateReport?.(student)}
                        className="flex-1 py-4 bg-emerald-500 text-gray-950 border-2 border-gray-950 font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        إصدار تقرير شهري
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 bg-gray-950 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};
