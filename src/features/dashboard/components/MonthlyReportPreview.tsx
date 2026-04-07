import { Share2, FileDown, CheckCircle2, Star, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MonthlyReportPreviewProps {
    student: {
        id: string;
        name: string;
        grade: string;
        subject: string;
        points: number;
        attendance: number; // percentage
        sessionsCompleted: number;
        lastNotes: string[];
    };
    onShare: (platform: string) => void;
}

export const MonthlyReportPreview = ({ student, onShare }: MonthlyReportPreviewProps) => {
    return (
        <div className="bg-white border-4 border-gray-950 p-8 dark:bg-gray-900 dark:border-gray-800 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group max-w-lg mx-auto">
            
            {/* Header / Brand (Suggestion 2) */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-10 pb-10 border-b-4 border-gray-950 border-double">
                <div className="w-16 h-16 bg-primary-600 border-4 border-gray-950 flex items-center justify-center rotate-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <Star size={32} className="text-white fill-current" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">تقرير التقدم الأكاديمي والمهاري</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1 italic">معهد دارين للتعليم والتدريب - Darin Institute</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Student Info */}
                <div className="flex items-center justify-between border-2 border-gray-950 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">اسم البطل</p>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase leading-none">{student.name}</h4>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">المستوى الدراسي</p>
                        <p className="text-sm font-black text-primary-600 uppercase leading-none">{student.grade}</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2 text-center group/metric">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-gray-950 mx-auto flex items-center justify-center transform group-hover/metric:rotate-12 transition-transform">
                            <CheckCircle2 size={20} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{student.attendance}%</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-60">معدل الحضور</p>
                    </div>
                    <div className="space-y-2 text-center group/metric">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/10 border-2 border-gray-950 mx-auto flex items-center justify-center transform group-hover/metric:scale-110 transition-transform">
                            <Star size={20} className="text-amber-500" />
                        </div>
                        <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{student.points}</p>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest opacity-60">نقاط التميز</p>
                    </div>
                    <div className="space-y-2 text-center group/metric">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 border-2 border-gray-950 mx-auto flex items-center justify-center transform group-hover/metric:-rotate-12 transition-transform">
                            <Calendar size={20} className="text-blue-500" />
                        </div>
                        <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{student.sessionsCompleted}</p>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest opacity-60">حصص منجزة</p>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-100 dark:border-gray-800 pb-2 italic leading-none">ملاحظات المعلمة للتطوير</p>
                    <div className="space-y-4">
                        {student.lastNotes.map((note, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                                <div className="w-2 h-2 bg-gray-950 dark:bg-white mt-1.5 flex-shrink-0 animate-pulse"></div>
                                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-relaxed uppercase">{note}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Closing */}
                <div className="p-4 bg-primary-600 text-white border-2 border-gray-950 text-center relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">نحن فخورون بتقدمك يا بطل! استمر في التألق.</p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-12 pt-8 border-t-2 border-gray-100 dark:border-gray-800 flex gap-4">
                <button 
                    onClick={() => onShare('whatsapp')}
                    className="flex-1 py-4 bg-emerald-500 text-gray-950 border-4 border-gray-950 font-black text-xs uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 group/btn"
                >
                    <Share2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                    إرسال بالواتساب
                </button>
                <button 
                    onClick={() => window.print()}
                    className="flex-1 py-4 bg-white text-gray-950 border-4 border-gray-950 font-black text-xs uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 group/btn"
                >
                    <FileDown size={16} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                    تحميل PDF
                </button>
            </div>
        </div>
    );
};
