import React from 'react';
import { Receipt, X, Activity as ActivityIcon, Printer } from 'lucide-react';
import { SectionTitle, PrimaryBtn, SecondaryBtn } from './ClosingUI';
import { CURRENCY_SYMBOL } from '../../../config/constants';

interface TeacherSlip {
    name: string;
    subject: string;
    sessionsCount: number;
    totalAmount: number;
    sessionsList?: { date: string; studentName: string; teacherPrice?: number }[];
    price?: number;
}

export const SalarySlipModal = ({ teacher, month, onClose }: { teacher: TeacherSlip | null, month: string, onClose: () => void }) => {
    if (!teacher) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-lg w-full max-w-xl overflow-hidden rounded-2xl md:animate-in md:zoom-in-95 md:duration-200">
                <div className="bg-[#172554] text-white p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ffffff15' }}>
                            <Receipt size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">قسيمة راتب المعلمة</h2>
                            <p className="text-[10px] font-medium text-white/70 tracking-wider">سجل مالي معتمد • {month}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-xl">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                    <div className="flex justify-between items-start pb-6 border-b border-slate-100/50 dark:border-slate-800/50">
                        <div>
                            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">المعلمة</p>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white">{teacher.name}</h3>
                            <p className="text-[10px] font-bold px-2 py-0.5 inline-block mt-1 rounded-lg" style={{ backgroundColor: '#2563EB12', color: '#2563EB' }}>{teacher.subject}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">التاريخ</p>
                            <p className="text-xs font-black text-slate-800 dark:text-white">{new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100/50 dark:border-slate-800/50 rounded-xl">
                            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-1">إجمالي الحصص</p>
                            <p className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">{teacher.sessionsCount}</p>
                        </div>
                        <div className="p-4 border rounded-xl" style={{ backgroundColor: '#2563EB08', borderColor: '#2563EB20' }}>
                            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: '#2563EB' }}>صافي المستحق</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-black font-mono" style={{ color: '#2563EB' }}>{teacher.totalAmount.toLocaleString()}</p>
                                <span className="text-[10px] font-bold uppercase" style={{ color: '#2563EB' }}>{CURRENCY_SYMBOL}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionTitle icon={ActivityIcon} label="بيان الحصص التفصيلي" color="#2563EB" />
                        <div className="border border-slate-100/50 dark:border-slate-800/50 overflow-hidden rounded-xl">
                            <table className="w-full text-right text-[11px]">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="p-2.5 font-bold text-slate-500">التاريخ</th>
                                        <th className="p-2.5 font-bold text-slate-500">الطالب</th>
                                        <th className="p-2.5 font-bold text-slate-500 text-center">القيمة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {teacher.sessionsList?.slice(0, 10).map((s: { date: string; studentName: string; teacherPrice?: number }, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{s.date}</td>
                                            <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">{s.studentName}</td>
                                            <td className="p-2.5 font-bold text-center text-emerald-600 font-mono">{s.teacherPrice || teacher.price} {CURRENCY_SYMBOL}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {teacher.sessionsList?.length > 10 && (
                            <p className="text-[10px] text-center text-slate-400 mt-2 italic">... و {teacher.sessionsList.length - 10} حصص أخرى في السجل</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2 no-print">
                        <SecondaryBtn onClick={onClose} className="flex-1">إغلاق</SecondaryBtn>
                        <PrimaryBtn onClick={() => window.print()} className="flex-[2] py-3 shadow-blue-500/10">
                            <Printer size={16} /> طباعة القسيمة الرسمية
                        </PrimaryBtn>
                    </div>
                </div>
            </div>
        </div>
    );
};
