import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LayoutGrid } from 'lucide-react';

interface AnalyticsDashboardProps {
    sessions: any[];
}

const COLORS = ['#5c59f2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AnalyticsDashboard = ({ sessions }: AnalyticsDashboardProps) => {
    
    const distributionData = useMemo(() => {
        const map: Record<string, number> = {};
        (sessions || []).forEach(s => {
            const sub = s?.subject || 'أخرى';
            map[sub] = (map[sub] || 0) + 1;
        });
        
        const total = (sessions || []).length || 1;
        
        return Object.entries(map)
            .map(([name, value]) => ({
                name,
                value,
                percentage: Math.round((value / total) * 100)
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [sessions]);

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex flex-col h-full border border-slate-50 dark:border-slate-800" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <LayoutGrid size={20} className="text-[#5c59f2]" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">توزيع الطلاب</h3>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/2 h-[200px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                cornerRadius={10}
                            >
                                {distributionData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-xl border border-white/10">
                                                {payload[0].name}: {payload[0].value}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Custom Legend */}
                <div className="w-full md:w-1/2 space-y-3">
                    {distributionData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[80px]">{item.name}</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-900 dark:text-white">{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الحصص: {sessions.length}</p>
            </div>
        </div>
    );
};
