import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SectionCard, SectionTitle } from './ClosingUI';

interface SubjectAnalysisProps {
    subjectAnalysis: any[];
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
                            <Bar dataKey="income" name="الإيرادات" fill="#5c59f2" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="payout" name="التكاليف" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjectAnalysis.map((subj, idx) => (
                    <SectionCard key={idx} className="p-5 border-t-4 border-indigo-600">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-3">{subj.name}</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-400">صافي الربح</span>
                                <span className="font-bold text-indigo-600">{subj.profit.toLocaleString()} ج.م</span>
                            </div>
                            <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (subj.profit/subj.income)*100)}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                                <span>النشاط: {subj.sessionsCount} حصة</span>
                            </div>
                        </div>
                    </SectionCard>
                ))}
            </div>
        </div>
    );
};
