import React from 'react';
import { Receipt, Download } from 'lucide-react';
import { SectionCard, SectionTitle, SecondaryBtn } from './ClosingUI';

interface PayrollTableProps {
    payrollData: any[];
    teacherAdjustments: Record<string, number>;
    handleTeacherAdjustment: (teacherId: string, amount: number) => void;
    setSelectedTeacherForSlip: (item: any) => void;
    startDate: string;
    endDate: string;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({ payrollData, teacherAdjustments, handleTeacherAdjustment, setSelectedTeacherForSlip, startDate, endDate }) => {
    return (
        <SectionCard>
            <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <SectionTitle icon={Receipt} label="مسير رواتب المعلمات" sub={`الفترة من ${startDate} إلى ${endDate}`} />
                <SecondaryBtn className="h-8 text-[10px]">
                    <Download size={14} /> تصدير PDF
                </SecondaryBtn>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500 uppercase tracking-wider">المعلمة</th>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الحصص</th>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الأساسي</th>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">تعديلات</th>
                            <th className="px-4 py-3 font-bold text-[10px] text-slate-500 text-center">الصافي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {payrollData.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-bold text-[10px] rounded-lg">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block font-bold text-xs text-slate-800 dark:text-white leading-tight">{item.name}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">{item.subject}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center font-bold text-xs text-slate-700 dark:text-slate-300">{item.sessionsCount}</td>
                                <td className="px-4 py-4 text-center font-bold text-xs text-slate-400">{item.baseAmount.toLocaleString()}</td>
                                <td className="px-4 py-4 text-center">
                                    <input
                                        type="number"
                                        value={teacherAdjustments[item.id] || ''}
                                        onChange={(e) => handleTeacherAdjustment(item.id, parseFloat(e.target.value) || 0)}
                                        className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center font-bold text-[10px] outline-none focus:border-[#5c59f2]"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className="font-bold text-xs text-emerald-600">{item.totalAmount.toLocaleString()} ج.م</span>
                                        <button onClick={() => setSelectedTeacherForSlip(item)} className="text-[9px] font-bold text-[#5c59f2] hover:underline flex items-center gap-1">
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
