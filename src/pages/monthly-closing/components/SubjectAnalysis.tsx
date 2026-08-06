import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SectionCard, SectionTitle } from './ClosingUI';
import { ProgressBar } from '../../../shared/components/ui';

interface SubjectData {
    name: string;
    profit: number;
    income: number;
    sessionsCount: number;
}

interface SubjectAnalysisProps {
    subjectAnalysis: SubjectData[];
    reportCurrency?: string;
}

export const SubjectAnalysis = React.memo(({ subjectAnalysis, reportCurrency = 'SAR' }: SubjectAnalysisProps) => {
    return (
        <div className="space-y-6">
            <SectionCard className="p-6">
                <SectionTitle icon={BarChart3} label="تحليل ربحية المواد العلمية" sub="مقارنة الإيرادات مقابل المصاريف" />
                <div className="h-[300px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectAnalysis}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="name" fontSize={9} fontStyle="italic" tick={{ fill: 'var(--text-dim)' }} />
                            <YAxis fontSize={9} fontStyle="italic" tick={{ fill: 'var(--text-dim)' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '10px' }} />
                            <Bar dataKey="income" name="الإيرادات" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="payout" name="التكاليف" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjectAnalysis.map((subj, idx) => (
                    <SectionCard key={idx} className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-soft text-primary">
                                <span className="text-xs font-semibold">{String(subj.name).charAt(0)}</span>
                            </div>
                            <h3 className="text-xs font-bold text-main">{subj.name}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-micro">
                                <span className="text-muted font-bold">صافي الربح</span>
                                <span className="font-semibold text-primary">{subj.profit.toLocaleString()} {reportCurrency}</span>
                            </div>
                            <ProgressBar value={Math.min(100, (subj.profit / subj.income) * 100)} variant="primary" size="sm" />
                            <div className="flex justify-between items-center text-micro text-muted mt-1">
                                <span className="font-bold">النشاط: {subj.sessionsCount} حصة</span>
                            </div>
                        </div>
                    </SectionCard>
                ))}
            </div>
        </div>
    );
});
SubjectAnalysis.displayName = 'SubjectAnalysis';
export default SubjectAnalysis;
