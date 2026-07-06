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
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)]">
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
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-micro" style={{ backgroundColor: 'rgba(108,75,255,0.07)', color: 'var(--bg-primary)' }}>
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block font-bold text-xs text-main dark:text-on-primary leading-tight">{item.name}</span>
                                            <span className="text-micro text-muted font-medium">{item.subject}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center font-bold text-xs text-main dark:text-dim">{item.sessionsCount}</td>
                                <td className="px-4 py-4 text-center font-bold text-xs text-muted">{item.baseAmount.toLocaleString()}</td>
                                <td className="px-4 py-4 text-center">
                                    <input
                                        type="number"
                                        value={teacherAdjustments[item.id] || ''}
                                        onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
                                        className="w-16 bg-background dark:bg-primary-active border border-border dark:border-border p-1 text-center font-bold text-micro outline-none focus:border-primary rounded-xl"
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
        </SectionCard>
    );
};
