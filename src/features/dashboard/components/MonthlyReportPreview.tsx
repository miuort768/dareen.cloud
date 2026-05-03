import { Share2, FileDown, CheckCircle2, Star, Calendar, X, Award, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MonthlyReportPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        id: string;
        name: string;
        grade: string;
        subject: string;
        points: number;
        attendance: number; // percentage
        sessionsCompleted: number;
        lastNotes: string[];
    } | null;
    onShare: (platform: string) => void;
}

export const MonthlyReportPreview = ({ isOpen, onClose, student, onShare }: MonthlyReportPreviewProps) => {
    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-white dark:border-slate-800 w-full max-w-2xl rounded-[3.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden relative translate-y-0 animate-in slide-in-from-bottom-12 duration-700">
                
                {/* Visual Flair: Certificate Border Pattern */}
                <div className="absolute inset-4 border-2 border-indigo-500/10 rounded-[2.5rem] pointer-events-none"></div>

                <div className="flex-1 overflow-y-auto p-10 pb-2 custom-scrollbar relative z-10">
                    {/* Brand / Logo */}
                    <div className="flex flex-col items-center justify-center text-center space-y-6 mb-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl flex items-center justify-center rotate-3 shadow-2xl shadow-indigo-500/30">
                            <Award size={44} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">تقرير التميز الأكاديمي</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Darin Academy — {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Student Signature Header */}
                        <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                            <div className="space-y-2 text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">فخر دارين السابعة</p>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{student.name}</h4>
                            </div>
                            <div className="text-left bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المادة والمستوى</p>
                                <p className="text-sm font-black text-indigo-600 tracking-tight">{student.grade} - {student.subject}</p>
                            </div>
                        </div>

                        {/* Quantitative Metrics: Premium Grids */}
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'معدل الحضور', value: `${student.attendance}%`, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { label: 'نقاط التميز', value: student.points, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                { label: 'الحصص المنجزة', value: student.sessionsCompleted, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800/20 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center hover:scale-105 transition-transform">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4", item.bg)}>
                                        <item.icon size={24} className={item.color} />
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{item.value}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Qualitative Feedback */}
                        <div className="space-y-6 bg-slate-50/50 dark:bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-indigo-500" />
                                توصيات المعلمة ومسارات التطوير
                            </p>
                            <div className="space-y-5">
                                {student.lastNotes.map((note, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">"{note}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Premium Footer Text */}
                        <div className="p-8 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-[2.5rem] text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">نحن فخورون بتقدمك يا بطل! استمر في الابتكار والتألق.</p>
                        </div>
                    </div>
                </div>

                {/* Print/Share Actions */}
                <div className="p-10 bg-slate-50 dark:bg-slate-900 flex gap-6 relative z-10 pt-4">
                    <button 
                        onClick={() => onShare('whatsapp')}
                        className="flex-1 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn"
                    >
                        <Share2 size={20} className="group-hover/btn:rotate-12 transition-transform" />
                        إرسال لولي الأمر
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex-1 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group/btn"
                    >
                        <FileDown size={20} className="group-hover/btn:-translate-y-1 transition-transform" />
                        تحميل كوثيقة PDF
                    </button>
                    <button onClick={onClose} className="w-16 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-slate-800 transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
