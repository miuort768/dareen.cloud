import { Activity, GraduationCap } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import { cn } from '../../../lib/utils';

interface AttendanceReportProps {
    monthlySessionsData: any[];
    teacherPerformanceData: any[];
}

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 md:p-5',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
            <Icon size={16} className="text-[#5c59f2]" />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

export const AttendanceReport = ({
    monthlySessionsData,
    teacherPerformanceData
}: AttendanceReportProps) => {
    return (
        <div className="space-y-4">
            {/* Monthly Sessions Trend */}
            <SectionCard>
                <SectionTitle icon={Activity} label="اتجاه الحضور الشهري" />
                <div className="h-64" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySessionsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} opacity={0.5} />
                            <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 p-3 rounded-xl shadow-xl dark:bg-slate-900/95 dark:border-slate-700 min-w-[150px]" dir="rtl">
                                            <p className="text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-50 pb-1 dark:border-slate-800">{label}</p>
                                            {payload.map((entry: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between gap-3 text-[10px] mb-1 last:mb-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.stroke }}></div>
                                                        <span className="text-slate-500 dark:text-slate-400 font-bold">{entry.name}</span>
                                                    </div>
                                                    <span className="font-black text-slate-800 dark:text-white">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }} />
                            <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '10px', fontWeight: 'bold' }} />
                            <Line type="monotone" dataKey="total" name="إجمالي" stroke="#94A3B8" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="completed" name="حضور" stroke="#10B981" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="cancelled" name="غياب" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </SectionCard>

            {/* Teacher Performance Table */}
            <SectionCard className="p-0 overflow-hidden">
                <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
                        <GraduationCap size={16} className="text-[#5c59f2]" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">أداء المعلمات</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                <th className="px-4 py-3">اسم المعلمة</th>
                                <th className="px-4 py-3 text-center">المتوقعة</th>
                                <th className="px-4 py-3 text-center">المكتملة</th>
                                <th className="px-4 py-3 text-center">الملغية</th>
                                <th className="px-4 py-3 text-center">النجاح</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {teacherPerformanceData.map((teacher, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#5c59f2]">{teacher.teacher.charAt(0)}</div>
                                            <p className="font-bold text-slate-800 dark:text-white">{teacher.teacher}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">{teacher.total}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">{teacher.completed}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-rose-600">{teacher.cancelled}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden dark:bg-slate-700 max-w-[80px]">
                                                <div className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    teacher.rate >= 80 ? 'bg-emerald-500' : teacher.rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                                )} style={{ width: `${teacher.rate}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 w-8">{teacher.rate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    );
};
