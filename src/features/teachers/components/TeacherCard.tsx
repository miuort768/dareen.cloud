import { QRCodeSVG } from 'qrcode.react';
import { GraduationCap, Phone, User, X, Printer, Award } from 'lucide-react';
import { useAcademyName } from '../../../context/AppContext';
import type { Teacher } from '../types';

interface TeacherCardProps {
    teacher: Teacher;
    onClose: () => void;
}

export const TeacherCard = ({ teacher, onClose }: TeacherCardProps) => {
    const academyName = useAcademyName();
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-sm border border-border shadow-elevation-2 rounded-2xl relative overflow-hidden group">
                
                {/* Header Actions - Hidden on Print */}
                <div className="p-3 flex justify-between items-center border-b border-border print:hidden">
                    <h3 className="font-medium text-xs text-muted">Faculty Identity Card</h3>
                    <div className="flex gap-1.5">
                        <button onClick={handlePrint} className="p-1.5 bg-surface text-muted hover:text-info rounded-xl transition-colors" aria-label="طباعة">
                            <Printer size={16} />
                        </button>
                        <button onClick={onClose} className="p-1.5 bg-error-soft text-error hover:bg-error hover:text-on-error rounded-xl transition-colors" aria-label="إغلاق">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* THE CARD CONTENT */}
                <div className="p-4 md:p-8 relative print:p-0">
                    {/* Background Pattern */}
                    <div className="absolute top-0 start-0 w-32 h-32 bg-primary-soft opacity-50 -ms-8 -mt-8 rotate-45 pointer-events-none border border-primary/10"></div>
                    
                    {/* Academy Name Tag */}
                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-info">
                                <Award size={18} />
                                <span className="font-medium text-xs leading-none">{academyName || 'دارين'}</span>
                            </div>
                            <h2 className="text-xl font-heading font-bold text-main leading-none">بطاقة هوية معلم</h2>
                        </div>
                        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl">
                            <GraduationCap size={24} className="text-on-primary" />
                        </div>
                    </div>

                    {/* Main Info Section */}
                    <div className="flex flex-col items-center gap-6 relative z-10">
                        {/* Photo Placeholder */}
                        <div className="w-28 h-32 bg-surface border-2 border-border flex items-center justify-center relative overflow-hidden rounded-xl">
                            <User size={48} className="text-muted" />
                            <div className="absolute bottom-0 end-0 w-full h-1 bg-info"></div>
                        </div>

                        {/* Details */}
                        <div className="w-full space-y-4 text-center" dir="rtl">
                            <div className="space-y-1">
                                <label className="text-xs text-muted block">الاسم الثلاثي المعتمد</label>
                                <p className="text-lg font-heading font-bold text-main leading-none">{teacher.name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted block text-center">التخصص</label>
                                    <p className="text-sm text-info text-center">{teacher.subject}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted block text-center">كود الموظف</label>
                                    <p className="text-sm text-muted text-center">#{teacher.id.slice(0, 6)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-muted pt-4 border-t border-border">
                                <Phone size={14} className="text-success/50" />
                                <span className="text-xs tabular-nums">{teacher.phone1}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / QR Code */}
                    <div className="mt-8 pt-6 border-t-2 border-dashed border-border flex items-center justify-between relative z-10">
                        <div className="space-y-0.5 text-start" dir="rtl">
                            <p className="text-xs text-muted leading-none">القسم الأكاديمي</p>
                            <p className="text-xs text-muted/50 max-w-[100px] leading-tight mt-1">هذه البطاقة تثبت الصفة الوظيفية لحاملها داخل دارين السابعة</p>
                        </div>
                        <div className="p-1.5 bg-surface border border-border rounded-xl">
                            <QRCodeSVG 
                                value={`dareen-teacher://${teacher.id}`}
                                size={40}
                                level="M"
                            />
                        </div>
                    </div>
                </div>

                {/* Print Footer Background */}
                <div className="h-1 bg-info w-full"></div>
            </div>
        </div>
    );
};
