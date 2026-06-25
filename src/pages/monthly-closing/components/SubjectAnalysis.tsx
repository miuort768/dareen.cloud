import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SectionCard, SectionTitle } from './ClosingUI';

interface SubjectData {
    name: string;
    profit: number;
    income: number;
    sessionsCount: number;
}

interface SubjectAnalysisProps {
    subjectAnalysis: SubjectData[];
}

export const SubjectAnalysis: React.FC<SubjectAnalysisProps> = ({ subjectAnalysis }) => {
    return (
        <div className="space-y-6">
            <SectionCard className="p-6">
                <SectionTitle icon={BarChart3} label="تحليل ربحية المواد العلمية" sub="مقارنة الإيرادات مقابل المصاريف" />
                <div className="h-[300px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectAnalysis}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={9} fontStyle="italic" />
                            <YAxis fontSize={9} fontStyle="italic" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                            <Bar dataKey="income" name="الإيرادات" fill="#6C4BFF" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="payout" name="التكاليف" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjectAnalysis.map((subj, idx) => (
                    <SectionCard key={idx} className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6C4BFF12', color: '#6C4BFF' }}>
                            <span className="text-xs font-black">{String(subj.name).charAt(0)}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 dark:text-white">{subj.name}</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-[#64748B] font-bold">صافي الربح</span>
                            <span className="font-black" style={{ color: '#6C4BFF' }}>{subj.profit.toLocaleString()} ج.م</span>
                            </div>
                            <div className="h-1 bg-slate-50 dark:bg-slate-800 overflow-hidden rounded-full">
                                <div className="h-full rounded-full" style={{ backgroundColor: '#6C4BFF', width: `${Math.min(100, (subj.profit/subj.income)*100)}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-[#64748B] mt-1">
                                <span className="font-bold">النشاط: {subj.sessionsCount} حصة</span>
                            </div>
                        </div>
                    </SectionCard>
                ))}
            </div>
        </div>
    );
};
