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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/50" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 w-full max-w-2xl rounded-none shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[95vh] overflow-hidden relative">
                
                <div className="flex-1 overflow-y-auto p-10 pb-6 custom-scrollbar relative z-10">
                    {/* Brand / Logo */}
                    <div className="flex flex-col items-center justify-center text-center space-y-6 mb-12">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-none flex items-center justify-center border-2 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <Award size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-slate-900 dark:text-white uppercase tracking-tight italic">تقرير التميز الأكاديمي</h3>
                            <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">منصة دارين التعليمية — {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Student Signature Header */}
                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-950 rounded-none">
                            <div className="space-y-1 text-right">
                                <p className="text-[9px] font-medium text-indigo-600 uppercase">نجمة أكاديمية</p>
                                <h4 className="text-2xl font-medium text-slate-900 dark:text-white uppercase tracking-tight">{student.name}</h4>
                            </div>
                            <div className="text-left bg-white dark:bg-slate-950 px-4 py-2 border-2 border-slate-950 rounded-none shadow-sm">
                                <p className="text-[9px] font-medium text-slate-400 uppercase mb-0.5">المستوى / المادة</p>
                                <p className="text-[11px] font-medium text-indigo-600 uppercase">{student.grade} - {student.subject}</p>
                            </div>
                        </div>

                        {/* Quantitative Metrics Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'الحضور', value: `${student.attendance}%`, icon: ShieldCheck, color: 'bg-emerald-600' },
                                { label: 'إجمالي النقاط', value: student.points, icon: Star, color: 'bg-amber-500' },
                                { label: 'الجلسات', value: student.sessionsCompleted, icon: Calendar, color: 'bg-indigo-600' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 p-5 border-2 border-slate-950 rounded-none text-center shadow-md transition-transform hover:translate-y-[-2px]">
                                    <div className={cn("w-10 h-10 rounded-none border-2 border-slate-950 flex items-center justify-center mx-auto mb-3 text-white", item.color)}>
                                        <item.icon size={20} />
                                    </div>
                                    <p className="text-xl font-medium text-slate-900 dark:text-white tabular-nums">{item.value}</p>
                                    <p className="text-[8px] font-medium text-slate-400 uppercase mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Qualitative Feedback */}
                        <div className="space-y-4 bg-slate-50 dark:bg-slate-800/20 p-6 border-2 border-slate-950 rounded-none">
                            <p className="text-[10px] font-medium text-slate-400 uppercase flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-indigo-600" />
                                التوصيات الأكاديمية ومسارات التطوير
                            </p>
                            <div className="space-y-3">
                                {student.lastNotes.map((note, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-none border border-slate-950 mt-1 shrink-0"></div>
                                        <p className="text-sm font-normal text-slate-700 dark:text-slate-300 leading-tight italic">"{note}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Message */}
                        <div className="p-6 bg-slate-950 text-white rounded-none border-2 border-slate-950 text-center shadow-[6px_6px_0px_0px_rgba(79,70,229,1)]">
                            <p className="text-[10px] font-medium uppercase italic">نحن فخورون بتقدمك المستمر يا بطل! استمر في التألق.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-950 flex gap-4 pt-6">
                    <button 
                        onClick={() => onShare('whatsapp')}
                        className="flex-1 h-14 bg-emerald-600 text-white rounded-none font-medium text-xs uppercase border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0 active:shadow-none flex items-center justify-center gap-2"
                    >
                        <Share2 size={18} />
                        إرسال لولي الأمر
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex-1 h-14 bg-white text-slate-950 rounded-none font-medium text-xs uppercase border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0 active:shadow-none flex items-center justify-center gap-2"
                    >
                        <FileDown size={18} />
                        تحميل PDF
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-14 h-14 bg-slate-950 text-white rounded-none border-2 border-slate-950 flex items-center justify-center hover:bg-rose-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );

};
