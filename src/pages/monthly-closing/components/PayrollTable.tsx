import React from 'react';
import { Receipt, Download } from 'lucide-react';
import { SectionCard, SectionTitle, SecondaryBtn } from './ClosingUI';

interface PayrollItem {
    id: string;
    name: string;
    subject: string;
    sessionsCount: number;
    baseAmount: number;
    totalAmount: number;
}

interface PayrollTableProps {
    payrollData: PayrollItem[];
    teacherAdjustments: Record<string, number>;
    handleTeacherAdjustment: (teacherId: string, amount: number) => void;
    setSelectedTeacherForSlip: (item: PayrollItem) => void;
    startDate: string;
    endDate: string;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({ payrollData, teacherAdjustments, handleTeacherAdjustment, setSelectedTeacherForSlip, startDate, endDate }) => {
    return (
        <SectionCard>
            <div className="p-4 border-b border-border/50 dark:border-border/50 flex justify-between items-center">
                <SectionTitle icon={Receipt} label="مسير رواتب المعلمات" sub={`الفترة من ${startDate} إلى ${endDate}`} />
                <SecondaryBtn className="h-8 text-micro">
                    <Download size={14} /> تصدير PDF
                </SecondaryBtn>
            </div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-start">
                    <thead className="bg-primary">
                        <tr>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary uppercase tracking-wider">المعلمة</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">الحصص</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">الأساسي</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">تعديلات</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">الصافي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border">
                        {payrollData.map((item) => (
                            <tr key={item.id} className="hover:bg-surface/50 dark:hover:bg-primary-active/30 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-micro bg-primary-soft text-primary">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block font-bold text-xs text-main dark:text-main leading-tight">{item.name}</span>
                                            <span className="text-micro text-muted font-medium">{item.subject}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center font-bold text-xs text-main dark:text-dim">{item.sessionsCount}</td>
                                <td className="px-4 py-4 text-center font-bold text-xs text-muted">{item.baseAmount.toLocaleString()}</td>
                                <td className="px-4 py-4 text-center">
                                    <input
                                        type="number"
                                        aria-label="قيمة التعديل"
                                        value={teacherAdjustments[item.id] || ''}
                                        onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
                                        className="w-16 bg-background dark:bg-surface border border-border dark:border-border p-1 text-center font-bold text-micro outline-none focus:border-primary rounded-xl"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className="font-bold text-xs text-success">{item.totalAmount.toLocaleString()} ج.م</span>
                                        <button onClick={() => setSelectedTeacherForSlip(item)} className="text-micro font-bold text-primary hover:underline flex items-center gap-1">
                                            <Receipt size={10} /> القسيمة
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3 p-4">
                {payrollData.map((item) => (
                    <div key={item.id} className="bg-surface dark:bg-card rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm bg-primary-soft text-primary">
                                {item.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="block font-bold text-xs text-main leading-tight truncate">{item.name}</span>
                                <span className="text-micro text-muted font-medium">{item.subject}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-card rounded-lg">
                                <span className="block text-micro text-dim mb-0.5">الحصص</span>
                                <span className="text-xs font-bold text-main">{item.sessionsCount}</span>
                            </div>
                            <div className="text-center p-2 bg-card rounded-lg">
                                <span className="block text-micro text-dim mb-0.5">الأساسي</span>
                                <span className="text-xs font-bold text-muted">{item.baseAmount.toLocaleString()}</span>
                            </div>
                            <div className="text-center p-2 bg-card rounded-lg">
                                <span className="block text-micro text-dim mb-0.5">الصافي</span>
                                <span className="text-xs font-bold text-success">{item.totalAmount.toLocaleString()} ج.م</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                aria-label="قيمة التعديل"
                                value={teacherAdjustments[item.id] || ''}
                                onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
                                className="flex-1 bg-background border border-border p-2 text-center font-bold text-xs outline-none focus:border-primary rounded-xl"
                                placeholder="تعديل"
                            />
                            <button onClick={() => setSelectedTeacherForSlip(item)} className="flex items-center gap-1 px-3 py-2 text-micro font-bold text-primary bg-primary-soft rounded-xl">
                                <Receipt size={10} /> القسيمة
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
};
