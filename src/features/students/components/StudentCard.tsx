import { QRCodeSVG } from 'qrcode.react';
import { GraduationCap, Phone, User, ShieldCheck, X, Printer } from 'lucide-react';
import type { Student } from '../types';

interface StudentCardProps {
    student: Student;
    onClose: () => void;
}

export const StudentCard = ({ student, onClose }: StudentCardProps) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60  animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-950 w-full max-w-md border-4 border-gray-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                
                {/* Header Actions - Hidden on Print */}
                <div className="p-4 flex justify-between items-center border-b-2 border-gray-100 dark:border-gray-800 print:hidden">
                    <h3 className="font-medium text-xs uppercase tracking-[0.3em] text-gray-400 italic">Student ID Card</h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors border-2 border-emerald-100">
                            <Printer size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors border-2 border-rose-100">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* THE CARD CONTENT */}
                <div className="p-8 relative print:p-0">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 dark:bg-gray-900 border-r-8 border-t-8 border-gray-100 dark:border-gray-800 -mr-16 -mt-16 rotate-45 pointer-events-none"></div>
                    
                    {/* Academy Name Tag */}
                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary-600">
                                <ShieldCheck size={20} className="fill-current/10" />
                                <span className="font-medium text-xs uppercase tracking-widest">أكاديمية دارين</span>
                            </div>
                            <h2 className="text-xl font-medium text-gray-900 dark:text-white leading-none">بطاقة تعريف طالب</h2>
                        </div>
                        <div className="w-16 h-16 bg-gray-950 border-4 border-white/20 flex items-center justify-center shadow-sm">
                            <GraduationCap size={32} className="text-white" />
                        </div>
                    </div>

                    {/* Main Info Section */}
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        {/* Student Photo Placeholder / Icon */}
                        <div className="w-32 h-40 bg-gray-100 dark:bg-gray-800 border-4 border-gray-900 flex items-center justify-center relative shadow-inner">
                            <User size={64} className="text-gray-300 dark:text-gray-700" />
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600"></div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-4 text-right" dir="rtl">
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block">الاسم الكامل</label>
                                <p className="text-lg font-medium text-gray-900 dark:text-white tracking-tighter">{student.name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block">الصف الدراسي</label>
                                    <p className="text-sm font-normal text-gray-700 dark:text-gray-300">{student.grade}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block">كود الطالب</label>
                                    <p className="text-sm font-normal text-gray-700 dark:text-gray-300">#{student.id.slice(0, 6).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-end gap-2 text-emerald-600">
                                    <span className="text-xs font-normal tabular-nums">{student.parentPhone}</span>
                                    <Phone size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / QR Code */}
                    <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-between relative z-10">
                        <div className="space-y-1 text-right" dir="rtl">
                            <p className="text-[9px] font-medium text-gray-400 uppercase">نظام إدارة دارين السابعة</p>
                            <p className="text-[8px] text-gray-500 font-normal">يُرجى إبراز هذه البطاقة عند طلبها داخل المعهد</p>
                        </div>
                        <div className="p-2 bg-white border-2 border-gray-900">
                            <QRCodeSVG 
                                value={`dareen-student://${student.id}`}
                                size={48}
                                level="M"
                                includeMargin={false}
                            />
                        </div>
                    </div>

                    {/* Vertical Text Rind */}
                    <div className="absolute left-0 bottom-10 h-32 w-8 -rotate-90 flex items-center gap-2 pointer-events-none opacity-20">
                         <span className="text-[8px] font-medium text-gray-500 uppercase whitespace-nowrap tracking-[1em]">STU-ID-{student.id.slice(0,4)}</span>
                    </div>
                </div>

                {/* Print Footer Background */}
                <div className="h-2 bg-primary-600 w-full"></div>
            </div>
        </div>
    );
};

