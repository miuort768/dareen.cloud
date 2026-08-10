import { Share2, FileDown, CheckCircle2, Star, Calendar, X, Award, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAcademyName } from '../../../context/AppContext';

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
    const academyName = useAcademyName();

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/50 dark:bg-black/70" dir="rtl">
            <div className="bg-card dark:bg-card border-2 border-border dark:border-primary/20 w-full max-w-2xl rounded-none shadow-[16px_16px_0px_0px_black] flex flex-col max-h-[95vh] overflow-hidden relative">
                
                <div className="flex-1 overflow-y-auto p-10 pb-6 custom-scrollbar relative z-10">
                    {/* Brand / Logo */}
                    <div className="flex flex-col items-center justify-center text-center space-y-6 mb-12">
                        <div className="w-16 h-16 bg-primary dark:bg-primary text-on-primary dark:text-black rounded-none flex items-center justify-center border-2 border-border dark:border-primary/20 shadow-[6px_6px_0px_0px_black]">
                            <Award size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-main dark:text-main uppercase tracking-tight italic">تقرير التميز الأكاديمي</h3>
                            <p className="text-micro font-medium text-muted dark:text-muted uppercase mt-1">منصة {academyName} التعليمية — {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Student Signature Header */}
                        <div className="flex items-center justify-between p-6 bg-background dark:bg-[#0a0a0c] border-2 border-border dark:border-primary/20 rounded-none">
                            <div className="space-y-1 text-start">
                                <p className="text-micro font-medium text-primary dark:text-primary uppercase">نجمة أكاديمية</p>
                                <h4 className="text-2xl font-medium text-main dark:text-main uppercase tracking-tight">{student.name}</h4>
                            </div>
                            <div className="text-end bg-card dark:bg-card px-4 py-2 border-2 border-border dark:border-primary/20 rounded-none">
                                <p className="text-micro font-medium text-muted dark:text-muted uppercase mb-0.5">المستوى / المادة</p>
                                <p className="text-xs font-medium text-primary dark:text-primary uppercase">{student.grade} - {student.subject}</p>
                            </div>
                        </div>

                        {/* Quantitative Metrics Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'الحضور', value: `${student.attendance}%`, icon: ShieldCheck, color: 'bg-success', onColor: 'text-on-success' },
                                { label: 'إجمالي النقاط', value: student.points, icon: Star, color: 'bg-warning', onColor: 'text-on-warning' },
                                { label: 'الجلسات', value: student.sessionsCompleted, icon: Calendar, color: 'bg-primary', onColor: 'text-on-primary' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-card dark:bg-card p-5 border-2 border-border dark:border-primary/20 rounded-none text-center shadow-md transition-transform hover:translate-y-[-2px]">
                                    <div className={cn("w-10 h-10 rounded-none border-2 border-border flex items-center justify-center mx-auto mb-3", item.onColor, item.color)}>
                                        <item.icon size={20} />
                                    </div>
                                    <p className="text-xl font-medium text-main dark:text-main tabular-nums">{item.value}</p>
                                    <p className="text-micro font-medium text-muted dark:text-muted uppercase mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Qualitative Feedback */}
                        <div className="space-y-4 bg-background dark:bg-[#0a0a0c] p-6 border-2 border-border dark:border-primary/20 rounded-none">
                            <p className="text-micro font-medium text-muted dark:text-muted uppercase flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-primary dark:text-primary" />
                                التوصيات الأكاديمية ومسارات التطوير
                            </p>
                            <div className="space-y-3">
                                {student.lastNotes.map((note, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <div className="w-2 h-2 bg-primary dark:bg-primary rounded-none border border-border mt-1 shrink-0"></div>
                                        <p className="text-sm font-normal text-main dark:text-main leading-tight italic">"{note}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Message */}
                        <div className="p-6 bg-background dark:bg-[#0a0a0c] text-main dark:text-main rounded-none border-2 border-border dark:border-primary/20 text-center shadow-[6px_6px_0px_0px_var(--bg-primary)]">
                            <p className="text-micro font-medium uppercase italic">نحن فخورون بتقدمك المستمر يا بطل! استمر في التألق.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 bg-background dark:bg-[#0a0a0c] border-t-2 border-border dark:border-primary/20 flex gap-4 pt-6">
                    <Button
                        onClick={() => onShare('whatsapp')}
                        className="flex-1 h-14 bg-success text-on-success rounded-none border-2 border-border shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-none"
                    >
                        <Share2 size={18} />
                        إرسال لولي الأمر
                    </Button>
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="flex-1 h-14 rounded-none border-2 border-border shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-none"
                    >
                        <FileDown size={18} />
                        تحميل PDF
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="w-14 h-14 rounded-none border-2 border-border shadow-[4px_4px_0px_0px_black] hover:bg-error hover:text-on-error"
                        aria-label="إغلاق"
                    >
                        <X size={24} />
                    </Button>
                </div>
            </div>
        </div>
    );

};
