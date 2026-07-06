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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-card border border-border shadow-lg w-full max-w-xl overflow-hidden rounded-2xl md:animate-in md:zoom-in-95 md:duration-200">
                <div className="bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary-hover)] text-on-primary p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">قسيمة راتب المعلمة</h2>
                            <p className="text-micro font-medium text-on-primary/70 tracking-wider">سجل مالي معتمد • {month}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/10 transition-colors rounded-xl">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                    <div className="flex justify-between items-start pb-6 border-b border-border">
                        <div>
                            <p className="text-micro font-bold text-muted uppercase mb-1">المعلمة</p>
                            <h3 className="text-lg font-black text-main">{teacher.name}</h3>
                            <span className="text-micro font-bold px-2 py-0.5 inline-block mt-1 rounded-lg bg-primary-soft text-primary">{teacher.subject}</span>
                        </div>
                        <div className="text-left">
                            <p className="text-micro font-bold text-muted uppercase mb-1">التاريخ</p>
                            <p className="text-xs font-black text-main">{new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card p-4 border border-border rounded-xl">
                            <p className="text-micro font-bold text-muted uppercase mb-1">إجمالي الحصص</p>
                            <p className="text-2xl font-black text-main font-mono">{teacher.sessionsCount}</p>
                        </div>
                        <div className="p-4 border border-primary-soft rounded-xl bg-primary-soft/30">
                            <p className="text-micro font-bold uppercase mb-1 text-primary">صافي المستحق</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-black font-mono text-primary">{teacher.totalAmount.toLocaleString()}</p>
                                <span className="text-micro font-bold uppercase text-primary">{CURRENCY_SYMBOL}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionTitle icon={ActivityIcon} label="بيان الحصص التفصيلي" />
                        <div className="border border-border overflow-hidden rounded-xl">
                            <table className="w-full text-right text-xs">
                                <thead className="bg-surface dark:bg-card">
                                    <tr>
                                        <th className="p-2.5 font-bold text-muted">التاريخ</th>
                                        <th className="p-2.5 font-bold text-muted">الطالب</th>
                                        <th className="p-2.5 font-bold text-muted text-center">القيمة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {teacher.sessionsList?.slice(0, 10).map((s: { date: string; studentName: string; teacherPrice?: number }, idx: number) => (
                                        <tr key={idx} className="hover:bg-hover/50 transition-colors">
                                            <td className="p-2.5 font-mono text-muted">{s.date}</td>
                                            <td className="p-2.5 font-bold text-main">{s.studentName}</td>
                                            <td className="p-2.5 font-bold text-center text-success font-mono">{s.teacherPrice || teacher.price} {CURRENCY_SYMBOL}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {teacher.sessionsList?.length > 10 && (
                            <p className="text-micro text-center text-dim mt-2 italic">... و {teacher.sessionsList.length - 10} حصص أخرى في السجل</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2 no-print">
                        <SecondaryBtn onClick={onClose} className="flex-1">إغلاق</SecondaryBtn>
                        <PrimaryBtn onClick={() => window.print()} className="flex-[2] py-3">
                            <Printer size={16} /> طباعة القسيمة الرسمية
                        </PrimaryBtn>
                    </div>
                </div>
            </div>
        </div>
    );
};
