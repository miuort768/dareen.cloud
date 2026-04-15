import { User, Star, MessageSquare, Award, X, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white dark:border-slate-800 w-full max-w-xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden translate-y-0 animate-in slide-in-from-bottom-8 duration-500">
                
                {/* Header: Premium Gradient Header */}
                <div className="p-8 pb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
                    
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                                <User size={40} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{student.grade}</span>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase">
                                        <Star size={10} className="inline mr-1 fill-emerald-600" />
                                        {student.totalPoints || 0} نقطة تميز
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:rotate-90"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-10 custom-scrollbar">
                    
                    {/* Important Sticky Note Style */}
                    {enrollment?.nextSessionNotes && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-950/20 rounded-[2.5rem] p-6 border border-amber-500/20 relative group overflow-hidden">
                             <div className="absolute top-0 right-0 p-3">
                                <Sparkles size={20} className="text-amber-500/40" />
                             </div>
                             <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 italic">تذكير للحقائب التدريبية القادمة</p>
                             <p className="text-sm font-bold text-amber-900 dark:text-amber-400 leading-relaxed italic">"{enrollment.nextSessionNotes}"</p>
                        </div>
                    )}

                    {/* Brief context */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <MessageSquare size={16} />
                            </div>
                            <h4 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                                السياق الأبوي والتربوي
                            </h4>
                        </div>
                        <div className="text-sm font-medium text-slate-600 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                            {student.notes || 'لا يوجد ملاحظات خاصة لهذا الطالب من ولي الأمر حالياً.'}
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <TrendingUp size={16} />
                                </div>
                                <h4 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                                    المسار التعليمي الأخير
                                </h4>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {recentSessions.length > 0 ? recentSessions.map((sess, idx) => (
                                <div key={idx} className="p-5 bg-white/50 dark:bg-slate-800/20 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all group">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 mb-1">{sess.date}</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate pr-4">{sess.topics}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <p className="text-[11px] font-black text-emerald-600">
                                                الأداء: {sess.rating}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-700">
                                        <Award size={24} />
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                                    <p className="text-xs text-slate-400 font-bold uppercase italic">بداية مسار تعليمي جديد</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions: Large Premium Buttons */}
                <div className="p-8 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                    <button 
                        onClick={() => onGenerateReport?.(student)}
                        className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                    >
                        <Sparkles size={18} />
                        إصدار تقرير شهري
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};
