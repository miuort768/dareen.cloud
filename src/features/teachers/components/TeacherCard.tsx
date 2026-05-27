import { QRCodeSVG } from 'qrcode.react';
import { GraduationCap, Phone, User, X, Printer, Award } from 'lucide-react';
import type { Teacher } from '../types';

interface TeacherCardProps {
    teacher: Teacher;
    onClose: () => void;
}

export const TeacherCard = ({ teacher, onClose }: TeacherCardProps) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40  animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                
                {/* Header Actions - Hidden on Print */}
                <div className="p-3 flex justify-between items-center border-b border-slate-50 dark:border-slate-800 print:hidden bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-medium text-[10px] uppercase tracking-widest text-slate-400 italic">Faculty Identity Card</h3>
                    <div className="flex gap-1.5">
                        <button onClick={handlePrint} className="p-1.5 bg-white dark:bg-slate-800 text-slate-500 hover:text-[#2563EB] transition-colors shadow-sm">
                            <Printer size={16} />
                        </button>
                        <button onClick={onClose} className="p-1.5 bg-white dark:bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors shadow-sm">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* THE CARD CONTENT */}
                <div className="p-8 relative print:p-0">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 -mr-8 -mt-8 rotate-45 pointer-events-none border border-indigo-500/10"></div>
                    
                    {/* Academy Name Tag */}
                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[#2563EB]">
                                <Award size={18} />
                                <span className="font-medium text-[10px] uppercase tracking-widest leading-none">DAREEN ACADEMY</span>
                            </div>
                            <h2 className="text-xl font-medium text-slate-800 dark:text-white leading-none tracking-tighter">بطاقة هوية معلم</h2>
                        </div>
                        <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 flex items-center justify-center shadow-sm shadow-indigo-100/20 dark:shadow-none">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                    </div>

                    {/* Main Info Section */}
                    <div className="flex flex-col items-center gap-6 relative z-10">
                        {/* Photo Placeholder */}
                        <div className="w-28 h-32 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center relative shadow-inner overflow-hidden">
                            <User size={48} className="text-slate-200 dark:text-slate-700" />
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2563EB]"></div>
                        </div>

                        {/* Details */}
                        <div className="w-full space-y-4 text-center" dir="rtl">
                            <div className="space-y-1">
                                <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest block">الاسم الثلاثي المعتمد</label>
                                <p className="text-lg font-medium text-slate-800 dark:text-white tracking-tighter leading-none">{teacher.name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest block text-center">التخصص</label>
                                    <p className="text-xs font-medium text-[#2563EB] uppercase tracking-tighter text-center">
                                        {teacher.subject}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest block text-center">كود الموظف</label>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center uppercase">#{teacher.id.slice(0, 6)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-slate-400 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <Phone size={14} className="text-emerald-500 opacity-50" />
                                <span className="text-xs font-medium tabular-nums">{teacher.phone1}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / QR Code */}
                    <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                        <div className="space-y-0.5 text-right" dir="rtl">
                            <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest opacity-80 leading-none">القسم الأكاديمي</p>
                            <p className="text-[7px] text-slate-400 font-normal max-w-[100px] leading-tight mt-1 opacity-50">هذه البطاقة تثبت الصفة الوظيفية لحاملها داخل دارين السابعة</p>
                        </div>
                        <div className="p-1.5 bg-white border border-slate-100">
                            <QRCodeSVG 
                                value={`dareen-teacher://${teacher.id}`}
                                size={40}
                                level="M"
                            />
                        </div>
                    </div>
                </div>

                {/* Print Footer Background */}
                <div className="h-1 bg-[#2563EB] w-full"></div>
            </div>
        </div>
    );
};

